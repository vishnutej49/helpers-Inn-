import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-helper-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './helper-form.component.html',
  styleUrls: ['./helper-form.component.scss']
})
export class HelperFormComponent implements OnInit, OnDestroy {
  helperForm!: FormGroup;
  isEditMode: boolean = false;
  helperId: string | null = null;
  availableLanguages: string[] = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private helperService: HelperService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.helperId = params.get('id');
      if (this.helperId) {
        this.isEditMode = true;
        this.loadHelperData(this.helperId);
      } else {
        this.isEditMode = false;
        this.helperForm.reset();
        this.setLanguages([]); 
      }
    });
  }

  initForm(): void {
    this.helperForm = this.fb.group({
      serviceType: ['', Validators.required],
      organization: ['', Validators.required],
      name: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], 
      email: ['', [Validators.email]],
      vehicleType: [''],
      documentType: ['', Validators.required],
      kycDocURL: ['', [Validators.required, Validators.pattern(/^(http|https):\/\/[^ "]+$/)]],
      photoURL: ['', [Validators.pattern(/^(http|https):\/\/[^ "]+$/)]], 
      languages: this.fb.array([], Validators.required) 
    });
  }
  
  // Loads helper data into the form when in edit mode.
  // @param id The ID of the helper to load.
  loadHelperData(id: string): void {
    this.helperService.getHelperById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (helper: Helper) => {
        this.helperForm.patchValue(helper);
        this.setLanguages(helper.languages);
      },
      error: (err) => {
        console.error('Error loading helper:', err);
        this.router.navigate(['/helpers']); 
      }
    });
  }

  get languagesFormArray(): FormArray {
    return this.helperForm.get('languages') as FormArray;
  }

  // Adds or removes a language from the FormArray based on checkbox state.
  // @param event The change event from the checkbox.
  onLanguageChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const language = checkbox.value;

    if (checkbox.checked) {
      this.languagesFormArray.push(new FormControl(language));
    } else {
      const index = this.languagesFormArray.controls.findIndex(control => control.value === language);
      if (index >= 0) {
        this.languagesFormArray.removeAt(index);
      }
    }
  }


  setLanguages(languages: string[]): void {
    this.languagesFormArray.clear();
    languages.forEach(lang => {
      this.languagesFormArray.push(new FormControl(lang));
    });
  }

  isLanguageSelected(language: string): boolean {
    return this.languagesFormArray.controls.some(control => control.value === language);
  }

  //Same for both creat and update
  onSubmit(): void {
    if (this.helperForm.invalid) {
      this.helperForm.markAllAsTouched(); 
      console.error('Form is invalid. Please check the fields.');
      return;
    }

    const helperData: Helper = this.helperForm.value;

    if (this.isEditMode && this.helperId) {
      this.helperService.updateHelper(this.helperId, helperData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log('Helper updated successfully!', res);
          this.router.navigate(['/helpers', this.helperId]); 
        },
        error: (err) => {
          console.error('Error updating helper:', err);
        }
      });
    } else {
      this.helperService.createHelper(helperData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res) => {
          console.log('Helper created successfully!', res);
          this.router.navigate(['/helpers', res._id]); 
        },
        error: (err) => {
          console.error('Error creating helper:', err);
        }
      });
    }
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

