// frontend/src/app/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private apiUrl = 'http://localhost:5001/api/documents';

  constructor(private http: HttpClient) {}

  getDocuments(userEmail: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?userEmail=${encodeURIComponent(userEmail)}`);
  }

  createDocument(doc: { title: string; userEmail: string; formData: any }): Observable<any> {
    return this.http.post<any>(this.apiUrl, doc);
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}