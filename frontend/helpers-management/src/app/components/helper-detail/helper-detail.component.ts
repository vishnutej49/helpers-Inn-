import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-helper-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './helper-detail.component.html',
  styleUrls: ['./helper-detail.component.scss']
})
export class HelperDetailComponent implements OnInit, OnDestroy {
  helper: Helper | undefined;
  showDeleteConfirm: boolean = false; 
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadHelperDetails(id);
      } else {
        this.router.navigate(['/helpers']);
      }
    });
  }


  loadHelperDetails(id: string): void {
    this.helperService.getHelperById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (helper: Helper) => {
        this.helper = helper;
      },
      error: (err) => {
        console.error('Error fetching helper details:', err);
        this.helper = undefined;
        this.router.navigate(['/helpers']);
      }
    });
  }


  editHelper(): void {
    if (this.helper?._id) {
      this.router.navigate(['/helpers/edit', this.helper._id]);
    }
  }

  confirmDelete(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  executeDelete(): void {
    if (this.helper?._id) {
      this.helperService.deleteHelper(this.helper._id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
