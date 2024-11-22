import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { GalleryService } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [ImageModule, RouterLink, RouterLinkActive, NgFor],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.css'
})
export class GalleryComponent {
  public currentPage: string = "";

  public selectCard(imagePage: string) {
    this.currentPage = imagePage;
  }

  // images: string[] = [
  //   "images/anders-jilden-uwbajDCODj4-unsplash.jpg",
  //   'images/bob-brewer-zJF1lRdUdAw-unsplash.jpg',
  //   'images/buzz-andersen-E4944K_4SvI-unsplash.jpg',
  //   'images/christian-joudrey-u_nsiSvPEak-unsplash.jpg',
  //   'images/geranimo-qzgN45hseN0-unsplash.jpg',
  //   'images/johannes-plenio-DKix6Un55mw-unsplash.jpg',

  // ];

  images: any[] = []; // Almacena imágenes con datos adicionales
  token: string = ''; // Aquí debes guardar el token

  constructor(private galleryService: GalleryService) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('idToken') || ''; // Recupera el token del almacenamiento local
    if (this.token) {
      this.fetchImages();
    }
  }

  fetchImages(): void {
    this.galleryService.getPublicImages(this.token).subscribe({
      next: (response) => {
        this.images = response.images;
      },
      error: (err) => {
        console.error('Error fetching images:', err);
      },
    });
  }
}
