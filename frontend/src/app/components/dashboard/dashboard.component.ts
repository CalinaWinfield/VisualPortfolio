import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
import { ItemsListComponent } from '../create-item/items-list.component';
import { CreateItemComponent } from '../create-item/create-item.component';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    ItemsListComponent,
    CreateItemComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  sections = {
    documents: false,
    todo: false,
    activeForms: false,
  };

  itemsPreview: Item[] = [];
  loadingItems = false;
  itemsError?: string;

  categories: string[] = [];

  activeCard: string | null = null;
  showForm = false;
  selectedItem: any = null;

  // ✅ ADD VIEW STATE HERE
  viewItemsMode = false;
  pagedItems: Item[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private location: Location,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadItemsPreview();
  }

  toggleSection(section: 'documents' | 'todo' | 'activeForms'): void {
    this.sections[section] = !this.sections[section];
  }

  onItemCreated() {
    this.showForm = false;
    this.selectedItem = null;
    this.loadItemsPreview();
    this.loadPagedItems(); // 🔥 keep view updated
  }

  toggleForm() {
    this.showForm = !this.showForm;

    if (!this.showForm) {
      this.selectedItem = null;
    }

    this.viewItemsMode = false; // 🔥 hide view when opening form
  }

  closeForm() {
    this.showForm = false;
    this.selectedItem = null;
  }

  loadItemsPreview(): void {
    this.loadingItems = true;

    this.itemService.getItems().subscribe({
      next: (data) => {
        this.itemsPreview = data.slice(0, 5);

        const uniqueCategories = new Set(
          data
            .map(item => item.category)
            .filter((cat): cat is string => !!cat)
        );

        this.categories = Array.from(uniqueCategories);

        this.loadingItems = false;
      },
      error: (err) => {
        this.itemsError = err?.message ?? 'Failed to load items';
        this.loadingItems = false;
      },
    });
  }

  toggleCard(card: string) {
    this.activeCard = this.activeCard === card ? null : card;
  }

  prefillItem(item: any) {
    this.selectedItem = item;
    this.showForm = true;
    this.viewItemsMode = false; // 🔥 hide view when editing
  }

  // ✅ VIEW ITEMS LOGIC

  openViewItems() {
    this.viewItemsMode = true;
    this.showForm = false;
    this.currentPage = 1; // reset page
    this.loadPagedItems();
  }

  loadPagedItems() {
    this.itemService.getItems().subscribe(data => {
      this.totalPages = Math.ceil(data.length / this.itemsPerPage);

      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;

      this.pagedItems = data.slice(start, end);
    });
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPagedItems();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPagedItems();
    }
  }

  deleteItem(id: string) {
    this.itemService.deleteItem(id).subscribe(() => {
      this.loadPagedItems();
      this.loadItemsPreview();
    });
  }

}
