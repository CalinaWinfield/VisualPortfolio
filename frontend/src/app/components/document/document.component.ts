// frontend/src/app/components/document/document.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ItemService } from '../../services/item.service';
import { FormBuilderComponent } from '../form-builder/form-builder.component';
import { AuthService } from '../auth.service';

import { DocumentService } from '../../services/document.service';

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
  existingFormData: any = null;   // ✅ passed to form builder
  initialMode: string | null = null;
  initialTemplate: string | null = null;

  constructor(
    private itemService: ItemService,
    private documentService: DocumentService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadItems();

    // Support both /documents/:id and /documents?id=..., plus ?mode=template and ?template=...
    this.route.paramMap.subscribe(params => {
      const routeId = params.get('id');
      if (routeId) {
        this.loadDocument(routeId);
      }
    });

    this.route.queryParamMap.subscribe(queryParams => {
      const queryId = queryParams.get('id');
      this.initialMode = queryParams.get('mode');
      this.initialTemplate = queryParams.get('template');

      if (queryId && !this.route.snapshot.paramMap.get('id')) {
        this.loadDocument(queryId);
      }
    });
  }

  loadDocument(id: string): void {
    this.documentService.getDocumentById(id).subscribe({
      next: (doc) => {
        this.existingFormData = doc;
      },
      error: (err) => console.error('Failed to load document', err)
    });
  }

  async loadItems(): Promise<void> {
    const userEmail = this.auth.getUserEmail(); //
    if (!userEmail) return;

    try {
      const items = await firstValueFrom(this.itemService.getItems(userEmail));
      this.items = items ?? [];
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