import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Helper } from '../../models/helper.model';
import { Subject, combineLatest } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { HelperService, FilterOptions, SortOptions } from '../../services/helper.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent implements OnInit, OnDestroy {
  // Use signals from service
  helpers = this.helperService.helpers;
  filteredHelpers = this.helperService.filteredHelpers;
  selectedHelperId = this.helperService.selectedHelperId;

  searchTerm: string = '';
  sortKey: string = 'fullName';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Multiselect filter options
  selectedServiceTypes: string[] = [];
  selectedOrganizations: string[] = [];

  serviceTypes: string[] = ['Cook', 'Driver', 'Cleaner'];
  organizations: string[] = ['ASBL', 'Inncircles'];

  // UI state
  showFilterOptions: boolean = false;
  showSortOptions: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private helperService: HelperService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Icons will be handled by Material Design icons
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

    // Subscribe to filter, sort, and search changes
    combineLatest([
      this.helperService.filterOptions$,
      this.helperService.sortOptions$,
      this.helperService.searchTerm$
    ]).pipe(takeUntil(this.destroy$)).subscribe(([filters, sort, searchTerm]) => {
      this.selectedServiceTypes = filters.serviceTypes || [];
      this.selectedOrganizations = filters.organizations || [];
      this.sortKey = sort.key;
      this.sortOrder = sort.order;
      this.searchTerm = searchTerm;
    });
  }

  // Filter methods
  toggleFilterOptions(): void {
    this.showFilterOptions = !this.showFilterOptions;
    if (this.showFilterOptions) {
      this.showSortOptions = false;
    }
  }

  onServiceTypeChange(serviceType: string, checked: boolean): void {
    if (checked) {
      this.selectedServiceTypes.push(serviceType);
    } else {
      this.selectedServiceTypes = this.selectedServiceTypes.filter(type => type !== serviceType);
    }
  }

  onOrganizationChange(organization: string, checked: boolean): void {
    if (checked) {
      this.selectedOrganizations.push(organization);
    } else {
      this.selectedOrganizations = this.selectedOrganizations.filter(org => org !== organization);
    }
  }

  applyFilters(): void {
    const filters: FilterOptions = {
      serviceTypes: this.selectedServiceTypes.length > 0 ? this.selectedServiceTypes : undefined,
      organizations: this.selectedOrganizations.length > 0 ? this.selectedOrganizations : undefined
    };
    this.helperService.setFilterOptions(filters);
    this.showFilterOptions = false;
    const helpers = this.filteredHelpers();
    if(helpers && helpers.length > 0 && helpers[0]._id !== undefined){
      // this.selectedHelperId.set(helpers[0]._id);
      this.helperService.setSelectedHelperId(helpers[0]._id) ;
    }

  }

  resetFilters(): void {
    this.selectedServiceTypes = [];
    this.selectedOrganizations = [];
    this.helperService.resetFilters();
    this.showFilterOptions = false;
    const helpers = this.filteredHelpers();
    if(helpers && helpers.length > 0 && helpers[0]._id !== undefined){
      // this.selectedHelperId.set(helpers[0]._id);
      this.helperService.setSelectedHelperId(helpers[0]._id) ;
    }
  }

  // Sort methods
  toggleSortOptions(): void {
    this.showSortOptions = !this.showSortOptions;
    if (this.showSortOptions) {
      this.showFilterOptions = false;
    }
  }

  applySort(): void {
    const sort: SortOptions = {
      key: this.sortKey,
      order: this.sortOrder
    };
    this.helperService.setSortOptions(sort);
    this.showSortOptions = false;
    const helpers = this.filteredHelpers();
    console.log(helpers[0].fullName);
    if(helpers && helpers.length > 0 && helpers[0]._id !== undefined){
      // this.selectedHelperId.set(helpers[0]._id);
      this.helperService.setSelectedHelperId(helpers[0]._id) ;
    }
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applySort();
  }

  // Search methods
  onSearchChange(): void {
    this.helperService.setSearchTerm(this.searchTerm);
    const helpers = this.filteredHelpers();
    if(helpers && helpers.length > 0 && helpers[0]._id !== undefined){
      // this.selectedHelperId.set(helpers[0]._id);
      this.helperService.setSelectedHelperId(helpers[0]._id) ;
    }
  }

  resetSearch(): void {
    this.searchTerm = '';
    this.helperService.resetSearch();
    const helpers = this.filteredHelpers();
    if(helpers && helpers.length > 0 && helpers[0]._id !== undefined){
      // this.selectedHelperId.set(helpers[0]._id);
      this.helperService.setSelectedHelperId(helpers[0]._id) ;
    }
  }

  loadHelpers(): void {
    this.helperService.getHelpers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Helper[]) => {
        this.helperService.setHelpers(data);
      },
      error: (err) => {
        console.error('Error fetching helpers:', err);
      }
    });
  }

  addNewHelper(): void {
    this.router.navigate(['/helpers/new']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

