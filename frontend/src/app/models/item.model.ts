// src/app/models/item.model.ts
export interface ItemCreateRequest {
  category?: string;             // optional if you allow empty
  itemTitle: string;
  itemDate: string;              // keep as string for now (yyyy-MM-dd)
  itemDescription: string;
  userEmail: string;             // required to match backend schema
}

// Optional: read shape returned from the API
export interface Item extends ItemCreateRequest {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}