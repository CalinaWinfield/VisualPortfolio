import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Item, ItemCreateRequest } from '../models/item.model';

@Injectable({ providedIn: 'root' })
export class ItemService {

  private items: Item[] = [];

  getItems() {
    return of(this.items);
  }

  createItem(item: ItemCreateRequest) {
    const newItem = { ...item, _id: Date.now().toString() };
    this.items.push(newItem);
    return of(newItem);
  }

  deleteItem(id: string) {
    this.items = this.items.filter(i => i._id !== id);
    return of(true);
  }
}
