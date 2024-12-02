import { Component, OnInit } from '@angular/core';
import { GalleryService } from '../../services/gallery.service';
import { NgFor, NgIf } from '@angular/common';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-guest-page',
  standalone: true,
  imports: [NgFor, NgIf, ImageModule],
  templateUrl: './guest-page.component.html',
  styleUrl: './guest-page.component.css'
})
export class GuestPageComponent implements OnInit{
  public currentPage: string = '';
  public id_select: string = '';
  images: any[] = [];
  token: string = '';

  constructor(
    private galleryService: GalleryService,
  ) {}

  ngOnInit(): void {
    this.fetchImages();
  }

  fetchImages(): void {
    this.galleryService.getPublicImagesGuest().subscribe({
      next: (response) => {
        this.images = response.images;
      },
      error: (error) => {
        console.log('Error fetching images:', error);
      },
    });
  }
}
