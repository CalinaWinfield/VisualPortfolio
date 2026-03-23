import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemCreateRequest } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {

  private apiUrl = 'http://localhost:5001/api/items';

  constructor(private http: HttpClient) {}

  getItems(userEmail: string) {
  return this.http.get<Item[]>(`${this.apiUrl}?userEmail=${encodeURIComponent(userEmail)}`);
}

  createItem(item: ItemCreateRequest): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/create-item`, item);
  }

  deleteItem(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}