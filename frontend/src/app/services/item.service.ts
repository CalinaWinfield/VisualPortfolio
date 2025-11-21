// src/app/services/item.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemCreateRequest } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {
  private baseUrl = 'http://localhost:5001/api/items';

  constructor(private http: HttpClient) {}

  createItem(payload: ItemCreateRequest): Observable<Item> {
    return this.http.post<Item>(`${this.baseUrl}/create-item`, payload);
  }

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.baseUrl}`);
  }

  deleteItem(id: string): Observable<{ ok: boolean } | { message: string }> {
    return this.http.delete<{ ok: boolean } | { message: string }>(`${this.baseUrl}/${id}`);
  }
}