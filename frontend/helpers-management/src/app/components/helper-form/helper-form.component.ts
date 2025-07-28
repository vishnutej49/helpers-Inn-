import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { filter, takeUntil, finalize } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-helper-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule, 
    MatInputModule,      
    MatSelectModule,     
    MatRadioModule,      
    MatCheckboxModule,   
    MatButtonModule,     
    MatIconModule        
  ],
  templateUrl: './helper-form.component.html',
  styleUrls: ['./helper-form.component.scss']
})
export class HelperFormComponent implements OnInit, OnDestroy {
  helperForm!: FormGroup;
  isEditMode: boolean = false;
  helperId: string | null = null;
  isSubmitted: boolean = false;
  isLoading: boolean = false;

  showPreviewModal: boolean = false;
  previewData: Helper | null = null;

  selectedPhotoFile: File | null = null;
  selectedKycFile: File | null = null;
  photoPreviewUrl: string | ArrayBuffer | null = null;
  kycPreviewUrl: string | ArrayBuffer | null = null;

  serviceTypes: string[] = ['Cook', 'Driver', 'Cleaner'];
  organizations: string[] = ['ASBL', 'Inncircles'];
  availableLanguages: string[] = ['Telugu', 'Hindi', 'English'];
  genders: string[] = ['Male', 'Female', 'Others'];
  vehicleTypes: string[] = ['Bike', 'Car', 'Scooter', 'Van', 'None'];
  docTypes: string[] = ['Aadhar', 'Passport', 'Driving License', 'Voter ID'];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();

    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      this.helperId = params.get('id');

      if (this.helperId) {
        this.isEditMode = true;
        this.loadHelperData(this.helperId);
      } else {
        this.isEditMode = false;
        this.helperForm.reset();
        this.allLanguages.clear();
        this.photoPreviewUrl = null;
        this.kycPreviewUrl = null;
        this.selectedPhotoFile = null;
        this.selectedKycFile = null;
        this.helperForm.get('employeeCode')?.setValue('');
        this.helperForm.get('vehicleType')?.setValue('None');
      }
    });


    this.helperForm.get('vehicleType')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      const vehicleNumberControl = this.helperForm.get('vehicleNumber');
      if (value && value !== 'None' && vehicleNumberControl) {
        vehicleNumberControl.setValidators(Validators.required);
      } else if (vehicleNumberControl) {
        vehicleNumberControl.clearValidators();
      }
      vehicleNumberControl?.updateValueAndValidity();
    });
  }

  initForm(): void {
    this.helperForm = this.fb.group({
      employeeCode: [{ value: '', disabled: true }],
      serviceType: ['', Validators.required],
      organization: ['', Validators.required],
      fullName: ['', Validators.required],
      languages: this.fb.array([], Validators.minLength(2)),
      gender: ['', Validators.required],
      email: ['', [Validators.email]],
      phno: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      vehicleType: ['None'],
      vehicleNumber: [''],
      docType: ['', Validators.required],
      kycdoc: [null, Validators.required],
      photoURL: [null]
    });
  }

  loadHelperData(id: string): void {
    this.isLoading = true;
    this.helperService.getHelperById(id).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (helper: Helper) => {
        this.helperForm.patchValue({
          employeeCode: helper.employeeCode,
          serviceType: helper.serviceType,
          organization: helper.organization,
          fullName: helper.fullName,
          gender: helper.gender,
          phno: helper.phno,
          email: helper.email,
          vehicleType: helper.vehicleType,
          vehicleNumber: helper.vehicleNumber,
          docType: helper.docType,
        });
        this.setLanguages(helper.languages);
        this.photoPreviewUrl = helper.photoURL || null;
        this.kycPreviewUrl = helper.kycdoc || null;
        if (helper.kycdoc) {
          this.helperForm.get('kycdoc')?.setErrors(null);
        }
      },
      error: (err) => {
        console.error('Error loading helper:', err);
        this.router.navigate(['/helpers']);
      }
    });
  }

  get allLanguages(): FormArray {
    return this.helperForm.get('languages') as FormArray;
  }

  onChangeLanguage(event: any): void {
    const checked = event.checked; 
    const value = event.source.value;

    if (checked) {
      this.allLanguages.push(new FormControl(value));
    } else {
      const inx = this.allLanguages.controls.findIndex(x => x.value === value);
      if (inx >= 0) {
        this.allLanguages.removeAt(inx);
      }
    }
  }

  setLanguages(languages: string[]): void {
    this.allLanguages.clear();
    languages.forEach(lang => {
      this.allLanguages.push(new FormControl(lang));
    });
  }

  isLanguageSelected(language: string): boolean {
    return this.allLanguages.controls.some(control => control.value === language);
  }

  isValid(field: string): boolean {
    const control = this.helperForm.get(field);
    if (!control) {
      return false;
    }
    if (field === 'languages') {
      return (control.invalid && (this.isSubmitted || control.touched || control.dirty));
    }
    return (control.invalid && (this.isSubmitted || control.touched));
  }

  isImageFile(url: string | ArrayBuffer | null): boolean {
    if (typeof url !== 'string' || !url) {
      return false;
    }
    return url.startsWith('data:image/') || /\.(jpeg|jpg|gif|png|webp)$/i.test(url);
  }

  isDataUrlFile(url: string | ArrayBuffer | null): boolean {
    if (typeof url !== 'string' || !url) {
      return false;
    }
    return url.startsWith('data:');
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/png') {
        this.selectedPhotoFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.photoPreviewUrl = reader.result;
        };
        reader.readAsDataURL(this.selectedPhotoFile);
        this.helperForm.get('photoURL')?.setErrors(null);
      } else {
        this.selectedPhotoFile = null;
        this.photoPreviewUrl = null;
        this.helperForm.get('photoURL')?.setErrors({ invalidFileType: true });
      }
    } else {
      this.selectedPhotoFile = null;
      this.photoPreviewUrl = null;
      const photoControl = this.helperForm.get('photoURL');
      if (photoControl && photoControl.hasError('required')) {
         photoControl.setErrors({ required: true });
      }
    }
    this.helperForm.get('photoURL')?.markAsTouched();
    this.helperForm.get('photoURL')?.markAsDirty();
  }

  onKycSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedKycFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.kycPreviewUrl = reader.result;
        };
        reader.readAsDataURL(this.selectedKycFile);
        this.helperForm.get('kycdoc')?.setErrors(null);
      } else {
        this.selectedKycFile = null;
        this.kycPreviewUrl = null;
        this.helperForm.get('kycdoc')?.setErrors({ invalidFileType: true });
      }
    } else {
      this.selectedKycFile = null;
      this.kycPreviewUrl = null;
      const kycControl = this.helperForm.get('kycdoc');
      if (kycControl) {
        kycControl.updateValueAndValidity();
        if (kycControl.hasError('required')) {
          kycControl.markAsTouched();
        }
      }
    }
    this.helperForm.get('kycdoc')?.markAsTouched();
    this.helperForm.get('kycdoc')?.markAsDirty();
  }

  showPreview(): void {
    this.isSubmitted = true;
    if (this.helperForm.invalid) {
      console.error('Form is invalid. Please check the fields.');
      this.helperForm.markAllAsTouched();
      return;
    }

    this.previewData = { ...this.helperForm.getRawValue() };
    if (this.selectedPhotoFile && this.photoPreviewUrl) {
      this.previewData!.photoURL = this.photoPreviewUrl as string;
    } else if (this.isEditMode && this.helperForm.get('photoURL')?.value) {
      this.previewData!.photoURL = this.helperForm.get('photoURL')?.value;
    } else {
      this.previewData!.photoURL = undefined;
    }

    if (this.selectedKycFile && this.kycPreviewUrl) {
      this.previewData!.kycdoc = this.kycPreviewUrl as string;
    } else if (this.isEditMode && this.helperForm.get('kycdoc')?.value) {
      this.previewData!.kycdoc = this.helperForm.get('kycdoc')?.value;
    } else {
      this.previewData!.kycdoc = '';
    }

    this.showPreviewModal = true;
  }

  confirmSubmit(): void {
    this.showPreviewModal = false;
    this.onSubmit();
  }

  cancelPreview(): void {
    this.showPreviewModal = false;
    this.previewData = null;
  }

  onSubmit(): void {
    if (this.helperForm.invalid) {
      console.error('Form is invalid during final submission.');
      this.isSubmitted = true;
      this.helperForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const helperData: Helper = this.helperForm.getRawValue();

    let operation: Observable<Helper>;
    if (this.isEditMode && this.helperId) {
      operation = this.helperService.updateHelper(this.helperId, helperData, this.selectedPhotoFile, this.selectedKycFile);
    } else {
      operation = this.helperService.createHelper(helperData, this.selectedPhotoFile, this.selectedKycFile);
    }

    operation.pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (res) => {
        console.log('Helper operation successful!', res);
        this.router.navigate(['/helpers', res._id]);
      },
      error: (err) => {
        console.error('Error during helper operation:', err);
      }
    });
  }

  onCancel(): void {
    if (this.isEditMode && this.helperId) {
      this.router.navigate(['/helpers', this.helperId]);
    } else {
      this.router.navigate(['/helpers']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
