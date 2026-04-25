// src/app/components/create-item/create-item.component.ts
import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';

import { ItemService } from '../../services/item.service';
import { Item, ItemCreateRequest } from '../../models/item.model';
import { AuthService } from '../auth.service';

@Component({
  standalone: true,
  selector: 'app-create-item',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent implements OnInit, OnChanges {

  @Output() itemCreated = new EventEmitter<void>();
  @Input() prefillData: any;

  items: Item[] = [];
  loading = false;
  error?: string;

  form!: FormGroup;
  showForm = false;
  isSubmitting = false;

  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private location: Location,
    private auth: AuthService
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

      this.showForm = true; // auto-open form
    }
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      category: [''],
      itemTitle: ['', [Validators.required, Validators.minLength(2)]],
      itemDate: ['', Validators.required],
      itemDescription: ['', [Validators.required, Validators.minLength(1)]],
      userEmail: ['', [Validators.required, Validators.email]],
    });

    this.fetchItems();
  }

  openForm(): void {
    this.showForm = true;
  }

  fetchItems(): void {
    this.loading = true;

    const email = this.auth.getUserEmail();

    this.itemService.getItems(email!).subscribe({
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
      itemDate: item.itemDate,
      itemDescription: item.itemDescription,
      userEmail: item.userEmail,
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    console.log("FILE SELECTED:", file);
    this.selectedFile = file;
  }

  save(): void {
    if (this.form.invalid) return;

    const payload = this.form.getRawValue();

    const newItem = {
      ...payload,
      fileName: this.selectedFile?.name || null,
      fileType: this.selectedFile?.type || null
    };

    this.itemService.createItem(newItem).subscribe({
      next: () => {
        this.form.reset();
        this.selectedFile = null;
        this.itemCreated.emit();
      },
      error: (err) => {
        this.error = err?.message ?? 'Failed to save item';
      }
    });
  }

  remove(id: string): void {
    this.itemService.deleteItem(id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i._id !== id);
      },
      error: (err) => {
        this.error = err?.message ?? 'Delete failed';
      },
    });
  }
}