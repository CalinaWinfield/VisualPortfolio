// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { CoverLetterComponent } from './components/cover-letter/cover-letter.component';
import { CreateItemComponent } from './components/create-item/create-item.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DocumentComponent } from './components/document/document.component';
import { GuideComponent } from './components/guide/guide.component';
import { HomeComponent } from './components/home/home.component';
// import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signUp/signUp.component';
import { ItemsListComponent } from './components/create-item/items-list.component';


const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Main routes
  { path: 'home', component: HomeComponent, title: 'Home' },
  { path: 'about', component: AboutComponent, title: 'About' },
  { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
  { path: 'documents', component: DocumentComponent, title: 'Documents' },
  { path: 'cover-letter', component: CoverLetterComponent, title: 'Cover Letter' },
  { path: 'create-item', component: CreateItemComponent, title: 'Create Item' },
  { path: 'guide', component: GuideComponent, title: 'Guide' },
  { path: 'items', component: ItemsListComponent, title: 'Items' },
  
  // Dynamic routes
  { path: 'documents/:id', component: DocumentComponent },
  { path: 'cover-letter/:id', component: CoverLetterComponent },
  
  // Wildcard route for 404
  { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled', // Restore scroll position on navigation
    anchorScrolling: 'enabled', // Enable anchor scrolling
    onSameUrlNavigation: 'reload', // Allow reloading same route
    RouterModule.forRoot(routes),
  })],
  exports: [RouterModule], 
})
export class AppRoutingModule {}