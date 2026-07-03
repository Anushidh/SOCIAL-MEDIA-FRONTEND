import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  // withCredentials: true — required so the browser sends the HttpOnly refresh token cookie
  private readonly options = { withCredentials: true };

  constructor(private http: HttpClient) {}

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, this.options);
  }

  post<T>(path: string, body: object): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, this.options);
  }

  put<T>(path: string, body: object): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, this.options);
  }

  patch<T>(path: string, body: object): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, this.options);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, this.options);
  }

  postFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, formData, this.options);
  }

  patchFormData<T>(path: string, formData: FormData): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, formData, this.options);
  }
}
