import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  ngOnInit(): void {
    document.body.classList.add('index-page');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('index-page');
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
