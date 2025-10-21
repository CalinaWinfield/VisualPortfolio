import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './src/index.html',
  styleUrl: './src/assests/global.css',

  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}