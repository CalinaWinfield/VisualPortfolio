import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IndexPageComponent } from './components/home/index-page.component';
import { AboutComponent } from './components/about/about.component';
import { CoverLetterComponent } from './components/cover-letter/cover-letter.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateItemComponent } from './components/create-item/create-item.component';
import { DocumentComponent } from './components/document/document.component';
import { GuideComponent } from './components/guide/guide.component';

@NgModule({
  declarations: [
    AppComponent,
    IndexPageComponent,
    AboutComponent,
    CoverLetterComponent,
    DashboardComponent,
    CreateItemComponent,
    DocumentComponent,
    GuideComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [provideHttpClient()],
  bootstrap: [AppComponent]
})
export class AppModule { }
  `]
})
export class IndexPageComponent {}
>>>>>>> 215b6281ec9f0b9e36ad7d99ca56a0ce8b3b4b63
