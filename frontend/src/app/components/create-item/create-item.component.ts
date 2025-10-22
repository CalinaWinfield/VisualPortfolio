import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ItemService } from '../../services/item.service';
import { ItemCreateRequest } from '../../models/item.model';

@Component({
  selector: 'app-create-item',
  templateUrl: './create-item.component.html',
  styleUrls: ['./create-item.component.css']
})
export class CreateItemComponent {
  showForm = false;
  model: ItemCreateRequest = {
    folder: '',
    itemTitle: '',
    itemDate: '',
    itemDescription: '',
    userEmail: null
  };

  isSubmitting = false;

  constructor(private itemService: ItemService, private router: Router, private location: Location) {}
  goBack(): void {
    this.location.back();
  }

  openForm() {
    this.showForm = true;
  }

  async submit() {
    this.isSubmitting = true;
    // attach session value if present
    this.model.userEmail = sessionStorage.getItem('userEmail');
    try {
      await this.itemService.createItem(this.model).toPromise();
      alert('Item created successfully!');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error(err);
      alert('Item creation failed: ' + (err?.error?.message || err?.message || 'Unknown'));
    } finally {
      this.isSubmitting = false;
    }
  }
}