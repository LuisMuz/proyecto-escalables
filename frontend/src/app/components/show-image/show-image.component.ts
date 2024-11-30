import { Component, OnInit } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { GalleryService } from '../../services/gallery.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-show-image',
  standalone: true,
  imports: [ImageModule],
  templateUrl: './show-image.component.html',
  styleUrl: './show-image.component.css'
})
export class ShowImageComponent {
  image: ImageData | any;
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private galleryService: GalleryService
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('idToken') || '';
    const imageId = this.route.snapshot.paramMap.get('id');
    if (imageId && this.token) {
      this.fetchImageDetails(imageId);
    }
  }

  fetchImageDetails(imageId: string): void {
    this.galleryService.getImageDetails(imageId, this.token).subscribe({
      next: (response) => {
        this.image = response;
      },
      error: (error) => {
        console.log("Error al mostrar los detalles de la imagen:", error);
      },
    });
  }
}
