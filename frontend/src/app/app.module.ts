// src/app/app.module.ts
import { NgModule,injector } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component'; // standalone component
import { AuthInterceptor } from './auth.interceptor';
import { FormBuilderComponent } from '../form-builder/form-builder-component';

@NgModule({
  declarations:[
    FormBuilderComponent
    ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    AppComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor (private injector: Injector){}

ngOnInit(){
  const el = createCustomElement(FormBuilderComponent,{
    injector:this.injector
    });
  if(!customeElements.get('formeo-angular-builder')){
    customeElements.define('formeo-angular-builder')
    }
  }
  }
