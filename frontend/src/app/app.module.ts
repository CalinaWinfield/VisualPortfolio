import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';  // Import FormsModule for ngModel binding
import { AppComponent } from './app.component';
import { ItemFormComponent } from './components/item-form/item-form.component'; // Import your new form component
import { provideHttpClient } from '@angular/common/http';  // Use provideHttpClient for HTTP requests

@NgModule({
  declarations: [
    AppComponent,
    ItemFormComponent  // Declare the ItemFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule  // Add FormsModule to your imports
  ],
  providers: [
    provideHttpClient()  // Use provideHttpClient for HTTP requests
  ],
})
export class AppModule { }
