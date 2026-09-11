import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Item } from '../../models/item.model';
import { CommonModule } from '@angular/common';
import { ItemDatePipe } from '../../pipes/item-date.pipe';

@Component({
  standalone: true,
  imports: [CommonModule, ItemDatePipe],
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent {

  @Input() items: Item[] = [];

  @Output() createClicked = new EventEmitter<void>();
  @Output() prefillClicked = new EventEmitter<any>();
  @Output() viewClicked = new EventEmitter<void>();

currentPage = 1;
itemsPerPage = 5;

get paginatedItems() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.items.slice(start, start + this.itemsPerPage);
}

get totalPages() {
  return Math.ceil(this.items.length / this.itemsPerPage);
}

nextPage() {
  if (this.currentPage < this.totalPages) {
    this.currentPage++;
  }
}

prevPage() {
  if (this.currentPage > 1) {
    this.currentPage--;
  }
}
  onCreateClick() {
    this.createClicked.emit();
  }

  onPrefillClick(item: any) {
    this.prefillClicked.emit(item);
  }

  onViewClick() {
    this.viewClicked.emit();
  }

  deleteItem(id: string) {
    // optional: implement later
  }
}
