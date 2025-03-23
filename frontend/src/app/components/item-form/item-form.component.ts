import { Component } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service'; // Import the Supabase service

@Component({
  selector: 'app-item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent {
  formData = {
    txtItem: '',
    itemType: '',
    itemDate: '',
    itemDescription: ''
  };

  constructor(private supabaseService: SupabaseService) {}


  // Method to handle form submission
  async onSubmit() {
    try {
      // Call the insertData method from SupabaseService to insert form data
      const result = await this.supabaseService.insertData(this.formData);
      console.log('Item inserted successfully:', result);
      alert('Item inserted successfully!');
      this.resetForm();
    } catch (error) {
      console.error('Error inserting item:', error);
      alert('There was an error submitting your data.');
    }
  }

  // Reset the form data
  resetForm() {
    this.formData = {
      txtItem: '',
      itemType: '',
      itemDate: '',
      itemDescription: ''
    };
  }
}
