// src/app/services/helper.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Helper } from '../models/helper.model';

export interface FilterOptions {
  serviceTypes?: string[];
  organizations?: string[];
}

export interface SortOptions {
  key: string;
  order: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private baseURL = 'http://localhost:3001/api/helpers';
  
  // Signals for state management
  private helpersSignal = signal<Helper[]>([]);
  private selectedHelperIdSignal = signal<string | null >(null);
  private filterOptionsSignal = signal<FilterOptions>({});
  private sortOptionsSignal = signal<SortOptions>({ key: 'fullName', order: 'asc' });
  private searchTermSignal = signal<string>('');
  
  // Computed signals
  public helpers = this.helpersSignal.asReadonly();
  public selectedHelperId = this.selectedHelperIdSignal;
  public filterOptions = this.filterOptionsSignal.asReadonly();
  public sortOptions = this.sortOptionsSignal.asReadonly();
  public searchTerm = this.searchTermSignal.asReadonly();
  
  // Computed filtered and sorted helpers
  public filteredHelpers = computed(() => {
    return this.applyFiltersAndSort(
      this.helpersSignal(),
      this.filterOptionsSignal(),
      this.sortOptionsSignal(),
      this.searchTermSignal()
    );
  });
  
  // Computed selected helper
  public selectedHelper = computed(() => {
    const helpers = this.helpersSignal();
    const selectedId = this.selectedHelperIdSignal();
    if (!selectedId || helpers.length === 0) {
      return helpers.length > 0 ? helpers[0] : null;
    }
    return helpers.find(helper => helper._id === selectedId) || helpers[0] || null;
  });

  // BehaviorSubjects for backward compatibility
  private filterSubject = new BehaviorSubject<FilterOptions>({});
  private sortSubject = new BehaviorSubject<SortOptions>({ key: 'fullName', order: 'asc' });
  private searchSubject = new BehaviorSubject<string>('');
  
  // Observable streams
  public filterOptions$ = this.filterSubject.asObservable();
  public sortOptions$ = this.sortSubject.asObservable();
  public searchTerm$ = this.searchSubject.asObservable();

  constructor(private http: HttpClient) { }

  getHelpers(): Observable<Helper[]> {
    return this.http.get<Helper[]>(this.baseURL);
  }

  getHelperById(id: string): Observable<Helper> {
    return this.http.get<Helper>(`${this.baseURL}/${id}`);
  }

  

  // Get the first helper (for default display)
  getFirstHelper(): Observable<Helper | null>{
    return new Observable(observer => {
      this.getHelpers().subscribe({
        next: (helpers) => {
          if (helpers && helpers.length > 0) {
            observer.next(helpers[0]);
          } else {
            observer.next(null);
          }
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  setFirstHelper(): void {
    this.getFirstHelper().subscribe({
      next: (helper) => {
        console.log("in setFIrstHelpers");
        if (helper && helper._id) {
          this.selectedHelperIdSignal.set(helper._id);
          console.log(helper._id);
        } else {
          this.selectedHelperIdSignal.set(null);
        }
      },
      error: (error) => {
        // Optionally handle error, e.g. set selectedHelperIdSignal to null
        this.selectedHelperIdSignal.set(null);
      }
    });
  }

  createHelper(helper: Helper, selectedPhotoFile: File | null, selectedKycFile: File | null): Observable<Helper> {
    const formData = new FormData();
  
    // Append all primitive fields from helper object
    formData.append('serviceType', helper.serviceType);
    formData.append('organization', helper.organization);
    formData.append('fullName', helper.fullName);
    formData.append('gender', helper.gender);
    formData.append('phno', helper.phno.toString());
    formData.append('docType', helper.docType);
  
    if (helper.email) formData.append('email', helper.email);
    if (helper.vehicleType) formData.append('vehicleType', helper.vehicleType);
    if (helper.vehicleNumber) formData.append('vehicleNumber', helper.vehicleNumber);
    if (helper.employeeCode) formData.append('employeeCode', helper.employeeCode);
    if (helper.joinedOn) formData.append('joinedOn', new Date(helper.joinedOn).toISOString());
  
    // If languages is an array, stringify it
    if (helper.languages && Array.isArray(helper.languages)) {
      formData.append('languages', JSON.stringify(helper.languages));
    }
  
    // Append files
    if (selectedPhotoFile) {
      formData.append('photoURL', selectedPhotoFile);
    }
  
    if (selectedKycFile) {
      formData.append('kycdoc', selectedKycFile);
    }
  
    // Send the multipart/form-data request
    return this.http.post<Helper>(this.baseURL, formData);
  }
  

  updateHelper(
    id: string,
    helper: Helper,
    selectedPhotoFile: File | null,
    selectedKycFile: File | null
  ): Observable<Helper> {
    const formData = new FormData();
  
    // Append regular fields
    formData.append('serviceType', helper.serviceType);
    formData.append('organization', helper.organization);
    formData.append('fullName', helper.fullName);
    formData.append('gender', helper.gender);
    formData.append('phno', helper.phno.toString());
    formData.append('docType', helper.docType);
  
    if (helper.email) formData.append('email', helper.email);
    if (helper.vehicleType) formData.append('vehicleType', helper.vehicleType);
    if (helper.vehicleNumber) formData.append('vehicleNumber', helper.vehicleNumber);
    if (helper.employeeCode) formData.append('employeeCode', helper.employeeCode);
    if (helper.joinedOn) formData.append('joinedOn', new Date(helper.joinedOn).toISOString());
  
    // Append languages
    if (helper.languages && Array.isArray(helper.languages)) {
      formData.append('languages', JSON.stringify(helper.languages));
    }
  
    // Append files only if selected (optional updates)
    if (selectedPhotoFile) {
      formData.append('photoURL', selectedPhotoFile);
    }
  
    if (selectedKycFile) {
      formData.append('kycdoc', selectedKycFile);
    }
  
    // Send PUT request with FormData
    return this.http.patch<Helper>(`${this.baseURL}/${id}`, formData);
  }
  

  deleteHelper(id: string): Observable<void> {
    this.helpersSignal.set(
      this.helpersSignal().filter((helper) => helper._id != id)
    );
    return this.http.delete<void>(`${this.baseURL}/${id}`);
  }

  getNextEmployeeCode(): Observable<string> {
    const min = 10000;
    const max = 20000;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Observable<string>(observer => {
      observer.next(randomNumber.toString());
      observer.complete();
    });
  }

  // Signal-based methods
  setHelpers(helpers: Helper[]): void {
    this.helpersSignal.set(helpers);
  }

  setSelectedHelperId(id: string | null): void {
    console.log("in setSelectedHelperId");
    console.log(id);
    this.selectedHelperIdSignal.set(id);
  }

  // Filter methods
  setFilterOptions(filters: FilterOptions): void {
    this.filterOptionsSignal.set(filters);
    this.filterSubject.next(filters);
  }

  resetFilters(): void {
    this.filterOptionsSignal.set({});
    this.filterSubject.next({});
  }

  // Sort methods
  setSortOptions(sort: SortOptions): void {
    this.sortOptionsSignal.set(sort);
    this.sortSubject.next(sort);
  }

  // Search methods
  setSearchTerm(term: string): void {
    this.searchTermSignal.set(term);
    this.searchSubject.next(term);
  }

  resetSearch(): void {
    this.searchTermSignal.set('');
    this.searchSubject.next('');
  }

  // Generate profile image URL
  generateProfileImageUrl(name: string): string {
    const formatted = encodeURIComponent(name.trim());
    return `https://ui-avatars.com/api/?name=${formatted}&background=random&color=fff&rounded=true&len`;
  }

  // Apply filters and sorting to helpers
  applyFiltersAndSort(helpers: Helper[], filters: FilterOptions, sort: SortOptions, searchTerm: string): Helper[] {
    let filteredHelpers = [...helpers];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredHelpers = filteredHelpers.filter(helper =>
        helper.fullName.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.serviceType.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.organization.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper.employeeCode?.toLowerCase().includes(lowerCaseSearchTerm) ||
        helper._id?.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Apply service type filter (multiselect)
    if (filters.serviceTypes && filters.serviceTypes.length > 0) {
      filteredHelpers = filteredHelpers.filter(helper =>
        filters.serviceTypes!.includes(helper.serviceType)
      );
    }

    // Apply organization filter (multiselect)
    if (filters.organizations && filters.organizations.length > 0) {
      filteredHelpers = filteredHelpers.filter(helper =>
        filters.organizations!.includes(helper.organization)
      );
    }

    // Apply sorting
    filteredHelpers.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sort.key) {
        case 'fullName':
          valA = a.fullName.toLowerCase();
          valB = b.fullName.toLowerCase();
          break;
        case 'serviceType':
          valA = a.serviceType.toLowerCase();
          valB = b.serviceType.toLowerCase();
          break;
        case 'employeeCode':
          valA = a.employeeCode ? parseInt(a.employeeCode, 10) : 0;
          valB = b.employeeCode ? parseInt(b.employeeCode, 10) : 0;
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
        return sort.order === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sort.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
    return filteredHelpers;
  }
}
