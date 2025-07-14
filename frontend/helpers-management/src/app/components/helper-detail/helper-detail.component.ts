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
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private helperService: HelperService
  ) { }

  ngOnInit(): void {
    // get the helper ID
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadHelperDetails(id);
      } else {
        //no ID is provided
        this.router.navigate(['/helpers']);
      }
    });
  }

  
  // Loads the details of a specific helper.
  // @param id The ID of the helper to load.
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

  // Navigates to the edit page for the current helper.
  editHelper(): void {
    if (this.helper?._id) {
      this.router.navigate(['/helpers/edit', this.helper._id]);
    }
  }

  // Navigates back to the main helper list.
  goBack(): void {
    this.router.navigate(['/helpers']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
