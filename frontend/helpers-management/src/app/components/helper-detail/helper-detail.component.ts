import { Component, OnInit, OnDestroy, signal, Signal, effect } from '@angular/core';
import { Router } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-helper-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './helper-detail.component.html',
  styleUrls: ['./helper-detail.component.scss']
})
export class HelperDetailComponent implements OnInit, OnDestroy {
  selectedHelper = this.helperService.selectedHelper;
  
  showDeleteConfirm: boolean = false;
  private destroy$ = new Subject<void>();

  get currentHelper() {
    return this.selectedHelper();
  }

  helper = this.selectedHelper();

  constructor(
    private router: Router,
    private helperService: HelperService
  ) {
    effect(() => {
      this.helper = this.selectedHelper();
    });
  }

  ngOnInit(): void {
    console.log('HelperDetailComponent initialized');
    console.log('Selected helper signal:', this.currentHelper);
  }

  editHelper(): void {
    const helper = this.helper;
    if (helper?._id) {
      this.router.navigate(['/helpers/edit', helper._id]);
    }
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  executeDelete(): void {

    const helper = this.helper;
    if (helper?._id) {
      this.helperService.deleteHelper(helper._id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          
          // this.helper = this.helperService.selectedHelper;
          // this.helperService.setSelectedHelperId(helper?._id || null);
          this.helperService.setFirstHelper();
          console.log('Helper deleted successfully!');
          this.showDeleteConfirm = false;
          this.router.navigate(['/helpers']);
        },
        error: (err) => {
          console.error('Error deleting helper:', err);
          this.showDeleteConfirm = false;
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/helpers']);
  }

  getProfileImageUrl(helper: Helper): string {
    if (helper.photoURL) {
      return helper.photoURL;
    }
    return this.helperService.generateProfileImageUrl(helper.fullName);
  }
  getkycdoc(helper: Helper): string{
    if (helper.kycdoc) {
      return helper.kycdoc;
    }
    return "";
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
