// src/app/services/helper.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Helper } from '../models/helper.model';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  private baseURL = 'http://localhost:5000/api/helpers';

  constructor(private http: HttpClient) { }

  getHelpers(): Observable<Helper[]> {
    return this.http.get<Helper[]>(this.baseURL);
  }

  getHelperById(id: string): Observable<Helper> {
    return this.http.get<Helper>(`${this.baseURL}/${id}`);
  }

  createHelper(helper: Helper, selectedPhotoFile: File | null, selectedKycFile: File | null): Observable<Helper> {
    return this.http.post<Helper>(this.baseURL, helper);
  }

  updateHelper(id: string, helper: Helper, selectedPhotoFile: File | null, selectedKycFile: File | null): Observable<Helper> {
    return this.http.put<Helper>(`${this.baseURL}/${id}`, helper);
  }

  deleteHelper(id: string): Observable<void> {
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
}
