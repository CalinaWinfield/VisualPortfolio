import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'

import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  standalone: true,
  selector: 'app-items-list',
  imports: [CommonModule, RouterModule],
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
      next: (data) => {
        this.items = data;
        this.loading = false;
         },
      error: (err) => {
        this.error = err?.message ?? 'Failed to load items'; this.loading = false;
        },
    });
  }

  deleteItem(id: string): void {
    // no-op placeholder for template click in tests; use ItemService in production
  }

}
