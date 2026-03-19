// src/app/components/create-item/create-item.component.ts
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

import { ItemService } from '../../services/item.service';
import { Item, ItemCreateRequest } from '../../models/item.model';
import { Output, EventEmitter } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-create-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})

export class CreateItemComponent implements OnInit {

@Output() itemCreated = new EventEmitter<void>();
@Input() prefillData: any;

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

ngOnChanges(): void {
  if (this.prefillData && this.form) {
    this.form.patchValue({
      category: this.prefillData.category ?? '',
      itemTitle: this.prefillData.itemTitle,
      itemDate: this.prefillData.itemDate,
      itemDescription: this.prefillData.itemDescription,
      userEmail: this.prefillData.userEmail,
    });

    this.showForm = true; // 🔥 auto-open form
  }
}
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

  openForm(): void {
    this.showForm = true;
  }


 fetchItems(): void {
    this.loading = true;

this.itemService.getItems().subscribe({
  next: (data) => {
    this.items = data;
     this.loading = false;
     },

  error: (err) => {
    this.error = err?.message ?? 'Failed to load items';
  this.loading = false;
    },
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

    console.log("SENDING TO API:", payload);


this.itemService.createItem(payload).subscribe({
  next: (res) => {
    console.log("SUCCESS:", res);
    this.isSubmitting = false;
     this.form.reset();

    this.itemCreated.emit();
  },
  error: (err) => {
    console.error("ERROR:", err);
    this.isSubmitting = false;
  },
});
  }

  remove(id: string): void {

this.itemService.deleteItem(id).subscribe({
  next: () => {
    this.items = this.items.filter(i => i._id !== id);
    },
  error: (err) =>
  {this.error = err?.message ?? 'Delete failed';
     },
   });
  }
}
