import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, Router, ActivatedRoute } from '@angular/router';
import { HelperService } from '../../services/helper.service';
import { Helper } from '../../models/helper.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-helper-list',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule], 
  templateUrl: './helper-list.component.html',
  styleUrls: ['./helper-list.component.scss']
})
export class HelperListComponent implements OnInit, OnDestroy {
  helpers: Helper[] = []; 
  filteredHelpers: Helper[] = [];
  selectedHelperId: string | null = null;

  searchTerm: string = ''; 
  sortKey: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  private destroy$ = new Subject<void>();

  constructor(
    private helperService: HelperService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadHelpers();

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      let currentRoute = this.route;
      while (currentRoute.firstChild) {
        currentRoute = currentRoute.firstChild;
      }
      this.selectedHelperId = currentRoute.snapshot.paramMap.get('id');
    });
  }

  
  loadHelpers(): void {
    this.helperService.getHelpers().pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: Helper[]) => {
        this.helpers = data;
        this.applyFiltersAndSort(); // Apply filters and sort after loading
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
        helper.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.serviceType.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.organization.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper._id?.toLowerCase().includes(lowerCaseSearchTerm) // Allow searching by ID
      );
    }

    tempHelpers.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (this.sortKey) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'serviceType':
          valA = a.serviceType.toLowerCase();
          valB = b.serviceType.toLowerCase();
          break;
        case 'organization':
          valA = a.organization.toLowerCase();
          valB = b.organization.toLowerCase();
          break;
        case 'id':
          valA = a._id ? a._id.toLowerCase() : '';
          valB = b._id ? b._id.toLowerCase() : '';
          break;
        case 'phone':
          valA = a.phone;
          valB = b.phone;
          break;
        default:
          valA = a.name.toLowerCase(); 
          valB = b.name.toLowerCase();
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
