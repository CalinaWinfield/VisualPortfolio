import { Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
  items: any[] = [];
  droppedHtml = '';

  constructor(private itemService: ItemService) { }

  ngOnInit(): void {
    this.loadItems();
  }

  async loadItems() {
    const sessionUserEmail = sessionStorage.getItem('userEmail');
    if (!sessionUserEmail) {
      console.warn('No user email in sessionStorage');
      return;
    }

    try {
      const items: any = await this.itemService.getItems().toPromise();
      this.items = items.filter((i: any) => i.userEmail === sessionUserEmail);
    } catch (err) {
      console.error('Error loading items', err);
    }
  }

  deleteItem(itemId: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    this.itemService.deleteItem(itemId).subscribe({
      next: () => {
        alert('Item deleted successfully!');
        this.loadItems();
      },
      error: (err: any) => {
        console.error('Delete failed', err);
        alert('Failed to delete item.');
      }
    });
  }

  addDragEvents(el: HTMLElement, id: string) {
    el.setAttribute('draggable', 'true');
    el.addEventListener('dragstart', (e: DragEvent) => {
      e.dataTransfer?.setData('text/plain', id);
      setTimeout(() => el.classList.add('dragging'), 0);
    });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
  }

  allowDrop(e: DragEvent) {
    e.preventDefault();
  }

  drop(e: DragEvent, target: HTMLElement) {
    e.preventDefault();
    const id = e.dataTransfer?.getData('text/plain');
    if (!id) return;
    const dragged = document.getElementById(id);
    if (dragged) {
      target.appendChild(dragged);
      dragged.classList.remove('dragging');
    }
  }

  format() {
    const right = document.getElementById('right');
    if (!right) return;

    const lists = Array.from(right.querySelectorAll('.list')) as HTMLElement[];
    let output = '<div class="resume-output">';
    lists.forEach(l => {
      const title = l.dataset['title'];
      const description = l.dataset['description'];
      output += `<h5>${title}</h5><p>${description}</p>`;
    });
    output += '</div>';
    right.innerHTML = output;
  }
}