import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TopBarComponent } from "./components/top-bar/top-bar.component";
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopBarComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pixel-art';

  constructor(public router: Router) {}


  public showMenu(): boolean {
    const routes = ['/login', '/signup', '/privacy-policy', '/terms-of-service', '/information-collection-notice'];
    return !routes.includes(this.router.url);
  }
}