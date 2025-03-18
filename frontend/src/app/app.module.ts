import { provideHttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';

@NgModule({
  providers: [provideHttpClient()],
})
export class AppModule {}
