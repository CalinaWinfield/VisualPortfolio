import { Component, Output, EventEmitter, Input } from '@angular/core';
import { Item } from '../../models/item.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css']
})
export class ItemsListComponent {

  @Input() items: Item[] = [];

  @Output() createClicked = new EventEmitter<void>();
  @Output() prefillClicked = new EventEmitter<any>();
  @Output() viewClicked = new EventEmitter<void>();

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
