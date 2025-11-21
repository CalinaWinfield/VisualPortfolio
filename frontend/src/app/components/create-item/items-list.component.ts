import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent implements OnInit {
  items: Item[] = [];
  loading = false;
  error?: string;

  constructor(private itemService: ItemService) {}

  ngOnInit(): void {
    this.fetchItems();
  }

  fetchItems(): void {
    this.loading = true;
    this.itemService.getItems().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: (err) => { this.error = err?.message ?? 'Failed to load items'; this.loading = false; },
    });
  }

  // Optional: navigate to create-item page or edit a specific item
}