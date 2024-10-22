import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [
    MenubarModule, CommonModule, RouterLink
  ],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css'
})
export class TopBarComponent {
  currentUrl: string = '';
  appearance: number = 1;

  constructor(private router: Router) {}

  publicRoutes = [
    "/",
    "/login",
    "/signup"
  ]

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.url;
      if(this.publicRoutes.includes(this.currentUrl)){
        this.appearance = 1;
      }else{
        this.appearance = 2;
      }
    });
  }

  toggleAppearance() {
    this.appearance = this.appearance === 1 ? 2 : 1;
  }

}
