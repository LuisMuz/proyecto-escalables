import {Component, inject, OnInit, ViewEncapsulation} from '@angular/core';
import { ImageModule } from 'primeng/image';
import { GalleryService } from '../../services/gallery.service';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {CommonModule} from "@angular/common";
import {ImageService} from "../../services/image.service";

@Component({
  selector: 'app-show-image',
  standalone: true,
  imports: [ImageModule, ButtonModule, CommonModule],
  templateUrl: './show-image.component.html',
  styleUrl: './show-image.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ShowImageComponent {
  image: any;
  token: string = '';
  liked: boolean = false;
  imageId: string | null = null;
  imageService = inject(ImageService)

  constructor(
    private route: ActivatedRoute,
    private galleryService: GalleryService
  ) {}

  ngOnInit(): void {
    this.token = localStorage.getItem('idToken') || '';
    this.imageId = this.route.snapshot.paramMap.get('id');
    if (this.imageId && this.token) {
      this.fetchImageDetails(this.imageId);
    }
  }

  fetchImageDetails(imageId: string): void {
    this.galleryService.getImageDetails(imageId, this.token).subscribe({
      next: (response) => {
        this.image = response;
        this.liked = this.image.likedByUser
      },
      error: (error) => {
        console.log("Error al mostrar los detalles de la imagen:", error);
      },
    });
  }

  toggleLike(): void {
    if(this.imageId){
      this.imageService.likeImage(this.imageId, this.token).subscribe({
        next: (response) => {
          console.log(response.message);
          this.liked = !this.liked;
          this.image.likes += this.liked ? 1 : -1;
        },
        error: (error) => {
          console.log('Error al cambiar el estado de like:', error);
        },
      });
    }
  }

  downloadImage(): void {
    if (this.image?.url) {
      const link = document.createElement('a');
      link.href = this.image.url;
      link.download = `${this.image.short_name}.${this.image.image_type}`;
      link.click();
    } else {
      console.error('Image URL not available');
    }
  }

}
