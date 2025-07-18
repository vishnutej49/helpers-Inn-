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

  // Fetches all helpers from the backend.
  // @returns An Observable of an array of Helper objects.
  getHelpers(): Observable<Helper[]> {
    
    return this.http.get<Helper[]>(this.baseURL);
  }

  //  * Fetches a single helper by their ID.
  //  * @param id The ID of the helper to fetch.
  //  * @returns An Observable of a Helper object.
  getHelperById(id: string): Observable<Helper> {
    
    return this.http.get<Helper>(`${this.baseURL}/${id}`);
  }

  // Creates a new helper.
  // @param helper The Helper object to create.
  // @returns An Observable of the created Helper object.
  createHelper(helper: Helper): Observable<Helper> {
    return this.http.post<Helper>(this.baseURL, helper);
  }
  
  //  Updates an existing helper.
  //  @param id The ID of the helper to update.
  //  @param helper The updated Helper object.
  //  @returns An Observable of the updated Helper object.
  updateHelper(id: string, helper: Helper): Observable<Helper> {
    return this.http.put<Helper>(`${this.baseURL}/${id}`, helper);
  }

  //delete an existing helper
  deleteHelper(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}/${id}`);
  }
}
