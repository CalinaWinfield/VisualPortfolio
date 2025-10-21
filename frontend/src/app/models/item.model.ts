export interface ItemCreateRequest {
  folder: string;
  itemTitle: string;
  itemDate: string; // ISO date
  itemDescription: string;
  userEmail?: string | null;
}