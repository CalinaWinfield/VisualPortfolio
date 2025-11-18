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
import { LoginComponent } from '';
import { SignupComponent } from '';

const routes: Routes = [
  // Default route
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Main routes
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'documents', component: DocumentComponent },
  { path: 'cover-letter', component: CoverLetterComponent },
  { path: 'create-item', component: CreateItemComponent },
  { path: 'guide', component: GuideComponent },
  
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