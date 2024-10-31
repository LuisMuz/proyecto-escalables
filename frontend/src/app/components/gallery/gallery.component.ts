import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [ImageModule, RouterLink, RouterLinkActive],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  public currentPage: string = "";

  public selectCard(imagePage: string) {
    this.currentPage = imagePage;
  }
}
