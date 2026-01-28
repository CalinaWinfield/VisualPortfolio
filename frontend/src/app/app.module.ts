// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';



@NgModule({
  imports: [
      BrowserModule,
      HttpClientModule,
      AppRoutingModule,
      AppComponent // 👈 standalone component imported here
    ],
     bootstrap: [AppComponent]
    })
export class AppModule {}
