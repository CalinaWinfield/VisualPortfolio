// src/app/components/create-item/create-item.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ItemService } from '../../services/item.service';
import { Item, ItemCreateRequest } from '../../models/item.model';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent implements OnInit {
  items: Item[] = [];
  loading = false;
  error?: string;
  form!: FormGroup;
  showForm = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private location: Location
  ) {}

  openForm() { this.showForm = true; }
  goBack() { this.location.back(); }

  ngOnInit(): void {
    this.form = this.fb.group({
      category: [''],
      itemTitle: ['', [Validators.required, Validators.minLength(2)]],
      itemDate: ['', Validators.required],
      itemDescription: ['', [Validators.required, Validators.minLength(5)]],
      userEmail: ['', [Validators.required, Validators.email]],
    });

    this.fetchItems();
  }

  fetchItems(): void {
    this.loading = true;
    
this.itemService.getItems().subscribe({
  next: (data) => { this.items = data; this.loading = false; },
  error: (err) => { this.error = err?.message ?? 'Failed to load items'; this.loading = false; },
});
  }

  prefillFrom(item: Item): void {
    this.form.patchValue({
      category: item.category ?? '',
      itemTitle: item.itemTitle,
      itemDate: item.itemDate, // ensure format yyyy-MM-dd or ISO
      itemDescription: item.itemDescription,
      userEmail: item.userEmail,
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;
    const payload = this.form.getRawValue() as ItemCreateRequest;

    
this.itemService.createItem(payload).subscribe({
  next: (created) => {
    this.items.unshift(created);
    this.form.reset();
    this.isSubmitting = false;
    this.showForm = false;
  },
  error: (err) => {
    this.error = err?.message ?? 'Save failed';
    this.isSubmitting = false;
  },
});
  }

  remove(id: string): void {
    
this.itemService.deleteItem(id).subscribe({
  next: () => this.items = this.items.filter(i => i._id !== id),
  error: (err) => this.error = err?.message ?? 'Delete failed',
});
  }
}