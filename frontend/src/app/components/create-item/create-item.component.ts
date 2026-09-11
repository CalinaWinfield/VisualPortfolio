// src/app/components/create-item/create-item.component.ts
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, Optional } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ItemService } from '../../services/item.service';
import { Item } from '../../models/item.model';
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

  form!: FormGroup;
  showForm = true;
  isSubmitting = false;

  selectedItem: any = null;
  selectedFile: File | null = null;
  error: string | null = null;

  defaultCategories: string[] = [
    'Education',
    'Work History',
    'Projects',
    'Skills',
    'Certificates',
    'Other'
  ];

  get categoryOptions(): string[] {
    const current = this.form?.get('category')?.value;
    if (current && !this.defaultCategories.some(c => c.toLowerCase() === current.toLowerCase())) {
      return [...this.defaultCategories, current];
    }
    return this.defaultCategories;
  }

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private location: Location,
    private auth: AuthService,
    @Optional() private route?: ActivatedRoute
  ) {
    this.initForm();
  }

  initForm(): void {
    const defaultEmail = this.auth?.getUserEmail ? (this.auth.getUserEmail() || '') : '';
    this.form = this.fb.group({
      category: ['', [Validators.required]],
      itemTitle: ['', [Validators.required, Validators.minLength(2)]],
      itemDate: ['', Validators.required],
      itemDescription: ['', [Validators.required, Validators.minLength(1)]],
      userEmail: [defaultEmail, [Validators.required, Validators.email]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prefillData']) {
      if (!this.form) {
        this.initForm();
      }
      if (this.prefillData) {
        this.populateForm(this.prefillData);
      } else {
        this.resetForm();
      }
    }
  }

  ngOnInit(): void {
    if (!this.form) {
      this.initForm();
    }

    if (this.prefillData) {
      this.populateForm(this.prefillData);
    } else {
      this.populateDefaultEmail();
    }

    if (this.route) {
      this.route.queryParams.subscribe(params => {
        const id = params['id'];
        if (id && !this.prefillData) {
          this.itemService.getItem(id).subscribe({
            next: (item) => this.populateForm(item),
            error: (err) => console.error('Failed to load item by id:', err)
          });
        }
      });
    }

    this.fetchItems();
  }

  populateForm(data: any): void {
    if (!data) return;
    this.selectedItem = data;

    let categoryVal = (data.category || '').trim();
    if (categoryVal) {
      const match = this.defaultCategories.find(
        c => c.toLowerCase() === categoryVal.toLowerCase()
      );
      if (match) {
        categoryVal = match;
      }
    }

    const formattedDate = this.formatDateForInput(data.itemDate);
    const currentUserEmail = this.auth?.getUserEmail ? (this.auth.getUserEmail() || '') : '';
    const emailVal = data.userEmail || currentUserEmail;

    this.form.patchValue({
      category: categoryVal,
      itemTitle: data.itemTitle ?? '',
      itemDate: formattedDate,
      itemDescription: data.itemDescription ?? '',
      userEmail: emailVal
    });

    this.showForm = true;
  }

  populateDefaultEmail(): void {
    const email = this.auth?.getUserEmail ? (this.auth.getUserEmail() || '') : '';
    if (email && this.form && !this.form.get('userEmail')?.value) {
      this.form.patchValue({ userEmail: email });
    }
  }

  resetForm(): void {
    this.selectedItem = null;
    const email = this.auth?.getUserEmail ? (this.auth.getUserEmail() || '') : '';
    if (this.form) {
      this.form.reset({
        category: '',
        itemTitle: '',
        itemDate: '',
        itemDescription: '',
        userEmail: email
      });
    }
  }

  formatDateForInput(val: any): string {
    if (!val) return '';
    const str = String(val).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return str;
    }
    if (str.includes('T')) {
      const part = str.split('T')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return part;
    }
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
      const parts = str.split('/');
      const m = parts[0].padStart(2, '0');
      const d = parts[1].padStart(2, '0');
      const y = parts[2];
      return `${y}-${m}-${d}`;
    }
    if (/^\d{4}$/.test(str)) {
      return `${str}-01-01`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return '';
  }

  openForm(): void {
    this.showForm = true;
  }

  fetchItems(): void {
    this.loading = true;

    const email = this.auth?.getUserEmail ? (this.auth.getUserEmail() || '') : '';
    if (!email) {
      this.loading = false;
      return;
    }

    this.itemService.getItems(email).subscribe({
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
    this.populateForm(item);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    console.log("FILE SELECTED:", file);
    this.selectedFile = file;
  }

  save(): void {
    if (this.form.invalid) return;
    this.isSubmitting = true;

    const payload = this.form.getRawValue();

    const itemData: any = {
      category: payload.category,
      itemTitle: payload.itemTitle,
      itemDate: payload.itemDate,
      itemDescription: payload.itemDescription,
      userEmail: payload.userEmail,
      fileName: this.selectedFile?.name || this.selectedItem?.fileName || payload.fileName || null,
      fileType: this.selectedFile?.type || this.selectedItem?.fileType || payload.fileType || null
    };

    if (this.selectedItem && this.selectedItem._id) {
      // UPDATE PATH
      this.itemService.updateItem(this.selectedItem._id, itemData).subscribe({
        next: () => this.handleSuccess(),
        error: (err: any) => {
          this.error = err?.message ?? 'Failed to update item';
          this.isSubmitting = false;
        }
      });
    } else {
      // CREATE PATH
      this.itemService.createItem(itemData).subscribe({
        next: () => this.handleSuccess(),
        error: (err: any) => {
          this.error = err?.message ?? 'Failed to save item';
          this.isSubmitting = false;
        }
      });
    }
  }

  private handleSuccess(): void {
    this.resetForm();
    this.selectedFile = null;
    this.isSubmitting = false;
    this.showForm = false;
    this.itemCreated.emit();
  }

  remove(id: string): void {
    this.itemService.deleteItem(id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i._id !== id);
      },
      error: (err: any) => {
        this.error = err?.message ?? 'Delete failed';
      },
    });
  }
}