import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon'; 
import { DomSanitizer } from '@angular/platform-browser'; 

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
    MatIconModule
  ],
  templateUrl: './helper-list.component.html',
  styleUrls: ['./helper-list.component.scss']
})
export class HelperListComponent implements OnInit, OnDestroy {
  helpers: Helper[] = [];
  filteredHelpers: Helper[] = [];
  selectedHelperId: string | null = null;

  searchTerm: string = '';
  sortKey: string = 'fullName';
  sortOrder: 'asc' | 'desc' = 'asc';

  selectedServiceTypeFilter: string = '';
  selectedOrganizationFilter: string = '';

  serviceTypes: string[] = ['Cook', 'Driver', 'Cleaner'];
  organizations: string[] = ['ASBL', 'Inncircles'];

  private destroy$ = new Subject<void>();

  constructor(
    private helperService: HelperService,
    private router: Router,
    private route: ActivatedRoute,
    private matIconRegistry: MatIconRegistry, 
    private domSanitizer: DomSanitizer 
  ) {
    
    this.matIconRegistry.addSvgIcon(
      'add-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/add-icon.svg') 
    );
    this.matIconRegistry.addSvgIcon(
      'arrow-up-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow-up-icon.svg') 
    );
    this.matIconRegistry.addSvgIcon(
      'arrow-down-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/arrow-down-icon.svg')
    );
  }

  ngOnInit(): void {
    this.loadHelpers();

    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      let currentRoute = this.route;
      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
      }
      this.selectedHelperId = currentRoute.snapshot.paramMap.get('id');

      if (event.url.startsWith('/helpers')) {
        this.loadHelpers();
      }
    });
  }

  loadHelpers(): void {
    this.helperService.getHelpers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Helper[]) => {
        this.helpers = data;
        this.applyFiltersAndSort();
      },
      error: (err) => {
        console.error('Error fetching helpers:', err);
      }
    });
  }

  applyFiltersAndSort(): void {
    let tempHelpers = [...this.helpers];

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempHelpers = tempHelpers.filter(helper =>
        helper.fullName.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.serviceType.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.organization.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.employeeCode?.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper._id?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    if (this.selectedServiceTypeFilter) {
      tempHelpers = tempHelpers.filter(helper =>
        helper.serviceType === this.selectedServiceTypeFilter
      );
    }

    if (this.selectedOrganizationFilter) {
      tempHelpers = tempHelpers.filter(helper =>
        helper.organization === this.selectedOrganizationFilter
      );
    }

    tempHelpers.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (this.sortKey) {
        case 'fullName':
          valA = a.fullName.toLowerCase();
          valB = b.fullName.toLowerCase();
          break;
        case 'serviceType':
          valA = a.serviceType.toLowerCase();
          valB = b.serviceType.toLowerCase();
          break;
        case 'organization':
          valA = a.organization.toLowerCase();
          valB = b.organization.toLowerCase();
          break;
        case 'employeeCode':
          valA = a.employeeCode ? parseInt(a.employeeCode, 10) : 0;
          valB = b.employeeCode ? parseInt(b.employeeCode, 10) : 0;
          break;
        case 'phno':
          valA = a.phno;
          valB = b.phno;
          break;
        case 'id':
          valA = a._id ? a._id.toLowerCase() : '';
          valB = b._id ? b._id.toLowerCase() : '';
          break;
        default:
          valA = a.fullName.toLowerCase();
          valB = b.fullName.toLowerCase();
          break;
      }

      if (valA < valB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.filteredHelpers = tempHelpers;
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFiltersAndSort();
  }

  addNewHelper(): void {
    this.router.navigate(['/helpers/new']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
