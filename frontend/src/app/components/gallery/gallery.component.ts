import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { GalleryService } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [ImageModule, RouterLink, RouterLinkActive, NgFor, NgIf],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent implements OnInit {
  public currentPage: string = '';
  public id_select: string = '';
  images: any[] = [];
  token: string = '';

  constructor(
    private galleryService: GalleryService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('idToken') || '';
    if (this.token) {
      this.fetchImages();
    }

    this.id_select = localStorage.getItem('id_select') ?? '';

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/gallery' || event.url === '/profile') {
          this.id_select = '';
          localStorage.removeItem('id_select');
        }
      }
    });
  }

  fetchImages(): void {
    this.galleryService.getPublicImages(this.token).subscribe({
      next: (response) => {
        this.images = response.images;
      },
      error: (error) => {
        console.log('Error fetching images:', error);
      },
    });
  }

  nextPage(id: string) {
    localStorage.setItem('id_select', id.toString());
    this.router.navigate(['/images', id]).then(() => {
      window.location.reload();
    });
  }
}
