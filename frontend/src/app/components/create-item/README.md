Component: CreateItemComponent

Files:
- create-item.component.ts: Component logic
- create-item.component.html: Template (uses ngModel)
- create-item.component.css: Styles (uses design tokens from global.css)

Usage:
- Route will be registered at `/items` (if routing updated)
- Requires FormsModule and HttpClientModule in AppModule

Notes:
- Service `ItemService` posts to `http://localhost:5001/api/items/create-item` by default
- Uses `sessionStorage.getItem('userEmail')` to attach userEmail

To test quickly:
- Ensure backend is running on port 5001
- Start Angular dev server: `ng serve`
- Visit `http://localhost:4200/items`