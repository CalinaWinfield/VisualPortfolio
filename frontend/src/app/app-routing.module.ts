import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { CoverLetterComponent } from './components/cover-letter/cover-letter.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateItemComponent } from './components/create-item/create-item.component';
import { DocumentComponent } from './components/document/document.component';
import { GuideComponent } from './components/guide/guide.component';

const routes: Routes = [
  { path: 'about', component: AboutComponent },
  { path: 'cover-letter', component: CoverLetterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'items', component: CreateItemComponent },
  { path: 'documents', component: DocumentComponent },
  { path: 'guide', component: GuideComponent },
  // Add other routes here
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
