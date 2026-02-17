// src/app/components/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  currentYear = new Date().getFullYear();

  sections = {
    documents: false,
    todo: false,
    activeForms: false,
  };

  // Preview state
  itemsPreview: Item[] = [];
  loadingItems = false;
  itemsError?: string;

  constructor(
    private location: Location,
    private itemService: ItemService
    ) {}

  ngOnInit(): void {
    this.loadItemsPreview();
  }

  goBack(): void {
    this.location.back();
  }

  toggleSection(section: 'documents' | 'todo' | 'activeForms'): void {
    this.sections[section] = !this.sections[section];
  }

  loadItemsPreview(): void {
    this.loadingItems = true;

    this.itemService.getItems().subscribe({
      next: (data) => {
        // Show the latest 5 (change as you wish)
        this.itemsPreview = data.slice(0, 5);
        this.loadingItems = false;
      },
      error: (err) => {
        this.itemsError = err?.message ?? 'Failed to load items';
        this.loadingItems = false;
      },
    });
  }
}
