import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ItemService } from '../../services/item.service';
import { FormBuilderComponent } from '../form-builder/form-builder.component';

@Component({
  standalone: true,
  selector: 'app-document',
  imports: [CommonModule, RouterModule, FormBuilderComponent],
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {

  items: any[] = [];
  currentYear = new Date().getFullYear();

  constructor(
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  async loadItems(): Promise<void> {
    const sessionUserEmail = sessionStorage.getItem('userEmail');
    if (!sessionUserEmail) return;

    try {
      const items = await firstValueFrom(this.itemService.getItems());
      const safeItems = items ?? [];

      this.items = safeItems.filter(
        (i: any) => i.userEmail === sessionUserEmail
      );

    } catch (err) {
      console.error('Error loading items', err);
    }
  }

  deleteItem(itemId: string): void {
    if (!confirm('Are you sure you want to delete this item?')) return;

    this.itemService.deleteItem(itemId).subscribe({
      next: () => this.loadItems(),
      error: () => alert('Failed to delete item.')
    });
  }

  allowDrop(e: DragEvent): void {
    e.preventDefault();
  }

  drop(e: DragEvent): void {
    e.preventDefault();

    const target = e.currentTarget as HTMLElement | null;
    if (!target) return;

    const id = e.dataTransfer?.getData('text/plain');
    if (!id) return;

    const dragged = document.getElementById(id);
    if (!dragged) return;

    target.appendChild(dragged);
    dragged.classList.remove('dragging');
  }

  format(): void {
    const right = document.getElementById('right');
    if (!right) return;

    const lists = Array.from(
      right.querySelectorAll('.list')
    ) as HTMLElement[];

    let output = '<div class="resume-output">';

    lists.forEach(l => {
      const title = l.dataset['title'] ?? '';
      const description = l.dataset['description'] ?? '';
      output += `<h5>${title}</h5><p>${description}</p>`;
    });

    output += '</div>';
    right.innerHTML = output;
  }
}
