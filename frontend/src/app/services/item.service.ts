import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemCreateRequest } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private baseUrl = 'http://localhost:5001/api/items';

  constructor(private http: HttpClient) {}

  createItem(payload: ItemCreateRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/create-item`, payload);
  }

  getItems(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}