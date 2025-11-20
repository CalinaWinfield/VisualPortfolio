import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <header class="site-header navbar navbar-piped">
    <div class="navbar">
      <div class="logo">
        assets/img/logo.png
        <span>VISUAL PORTFOLIO</span>
      </div>
      <ul class="nav-links">
        <li><a routerLink="/login" class="nav-link">Log In</a></li>
        <li><a routerLink="/dashboard" class="nav-link">Dashboard</a></li>
        <li><a routerLink="/guide" class="nav-link">Guide</a></li>
        <li><a routerLink="/about" class="nav-link">About</a></li>
      </ul>
    </div>
  </header>

  <main class="hero">
    <h2>Work Smarter, Feel Effortless</h2>
    <p>Simplify Document Management with the Visual Portfolio App.</p>
    <button class="cta-button">Sign Up For Free</button>
  </main>

  <footer class="footer">
    <p>&copy; Visual Portfolio. All rights reserved.</p>
  </footer>
`,
  styles: [`
    :host {
      display: block;
      font-family: 'Playfair Display', serif;
      background-color: var(--navy);
      color: white;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .site-header {
      background-color: var(--cream);
      padding: 5px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      z-index: 1000;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 30px;
      background-color: var(--pink);
      border-top: 5px solid #ffffff;
      border-bottom: 5px solid #ffffff;
    }

    .logo {
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
    }

    .logo img {
      height: 28px;
      margin-right: 10px;
      object-fit: contain;
    }

    .nav-links {
      display: flex;
      gap: 20px;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-link {
      position: relative;
      color: white !important;
      font-weight: 500;
      font-size: 20px;
      font-family: 'Playfair Display', serif;
      text-decoration: none;
    }

    .nav-link::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -4px;
      width: 0;
      height: 2px;
      background-color: white;
      transition: width 0.3s ease;
    }

    .nav-link:hover::after {
      width: 100%;
    }

    .hero {
      text-align: center;
      padding: 120px 20px;
      background: radial-gradient(circle, var(--blue) 10%, transparent 50%);
      flex: 1;
    }

    .hero h2 {
      font-size: var(--fs-h1);
      margin-bottom: 10px;
    }

    .hero p {
      font-size: 1.1rem;
      margin-bottom: 20px;
    }

    .cta-button {
      position: relative;
      background-color: #ffa8b2;
      color: white;
      padding: 10px 20px;
      border: none;
      font-size: 1.1rem;
      font-weight: 500;
      border-radius: 2px;
      cursor: pointer;
      font-family: 'Playfair Display', sans-serif;
      overflow: hidden;
      transition: letter-spacing 0.3s ease;
    }

    .cta-button::before,
    .cta-button::after {
      content: "";
      position: absolute;
      height: 2px;
      background-color: white;
      width: 20%;
      left: 50%;
      transform: translateX(-50%);
      transition: width 0.3s ease;
    }

    .cta-button::before { top: 0; }
    .cta-button::after { bottom: 0; }

    .cta-button:hover {
      letter-spacing: 0.2rem;
    }

    .cta-button:hover::before,
    .cta-button:hover::after {
      width: 100%;
    }

    .footer {
      background-color: var(--pink);
      color: white;
      font-size: 18px;
      padding: 20px 0;
      text-align: center;
      border-top: 2px solid var(--cream);
      margin-top: auto;
      width: 100%;
    }
  `]
})
export class IndexPageComponent {}