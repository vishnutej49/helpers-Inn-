import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { HelperService, FilterOptions, SortOptions } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { HelperDetailComponent } from '../helper-detail/helper-detail.component'; 

@Component({
  selector: 'app-helper-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    HelperDetailComponent
],
  templateUrl: './helper-list.component.html',
  styleUrls: ['./helper-list.component.scss']
})
export class HelperListComponent implements OnInit, OnDestroy {
  // Use signals from service
  helpers = this.helperService.helpers;
  filteredHelpers = this.helperService.filteredHelpers;
  selectedHelperId = this.helperService.selectedHelperId;
  selectedHelper = this.helperService.selectedHelper;

  private destroy$ = new Subject<void>();

  constructor(
    private helperService: HelperService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Icons will be handled by Material Design icons
    effect(()=>{
      // this.helperService.helpers();
      this.loadHelpers();
    })
  }

  ngOnInit(): void {
    this.loadHelpers();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      if (event.url.startsWith('/helpers')) {
        this.loadHelpers();
      }
    });
  }

  loadHelpers(): void {
    this.helperService.getHelpers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Helper[]) => {
        console.log('Helpers loaded:', data);
        this.helperService.setHelpers(data);
        // Auto-select the first helper if no helper is currently selected
        if (data.length > 0 && !this.selectedHelperId()) {
          console.log('Auto-selecting first helper:', data[0]);
          this.helperService.setSelectedHelperId(data[0]._id || null);
        }
      },
      error: (err) => {
        console.error('Error fetching helpers:', err);
      }
    });
  }

  selectHelper(helper: Helper): void {
    console.log('Selecting helper:', helper);
    this.helperService.setSelectedHelperId(helper._id || null);
  }

  getProfileImageUrl(helper: Helper): string {
    if (helper.photoURL) {
      return helper.photoURL;
    }
    return this.helperService.generateProfileImageUrl(helper.fullName);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
