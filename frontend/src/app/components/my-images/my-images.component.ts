import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { MegaMenuItem } from 'primeng/api';
import { MegaMenuModule } from 'primeng/megamenu';
import { DialogModule } from 'primeng/dialog';
import {ImageData, ImageItem} from '../../model/image-item';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-my-images',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputSwitchModule,
    FormsModule,
    MenuModule,
    CardModule,
    MegaMenuModule,
    DialogModule
  ],
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.css'],
  providers: []
})
export class MyImagesComponent implements OnInit {
  images: ImageItem[] = [];
  visible: boolean = false;
  imageService = inject(ImageService);
  userImages: ImageData[] | undefined;
  imageToDelete: ImageData | null = null;

  constructor() { }

  ngOnInit() {
    const test: boolean = false;

    this.imageService.getUserImages().subscribe({
      next: (response) => {
        this.userImages = response.images.map((image: ImageData) => {
          // @ts-ignore
          return ({
            ...image,
            filename: this.getImageName(image.filename),
            public: this.checkPrivacy(image),
          });
        });
        console.log(this.userImages);
      },
      error: (error) => {
        console.error('Error al cargar imágenes:', error);
      }
    });
  }



  getImageName(src: string): string {
    // Find the first '_'
    const parts = src.split('_');
    if (parts.length < 2) {
      return src;
    }

    const nameWithExtension = parts.slice(1).join('_'); 

    // Find the last '.'
    const lastDotIndex = nameWithExtension.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return nameWithExtension;
    }

    const shortName = nameWithExtension.substring(0, lastDotIndex);

    return shortName;
  }

  checkPrivacy(image: ImageData):boolean {
    return image.public.toString() == "true";
  }

  editImage(image: ImageItem) {
    console.log('Edit image:', image.name);
    this.imageService.setImage(image);
  }

  toggleDelete(image: ImageData | null) {
    this.imageToDelete = image;
    this.visible = this.visible? false : true;
    if (image) {
      console.log('Delete image:', image.filename);
    }
  }

  applyFilter(filter: string) {
    console.log(`Applying ${filter} filter`);
  }

  togglePrivacy(image: ImageData) {
    this.imageService.toggleImagePrivacy(image.id).subscribe({
      next: (response) => {
        console.log(`Privacy toggled: ${response.message}`);
        image.public = response.public === 'true'; // Actualiza localmente
        window.location.reload();
      },
      error: (error) => {
        console.error('Error al cambiar privacidad:', error);
      }
    });
  }

  deleteImage(image: ImageData | null) {
    if(image){
      this.imageService.deleteImage(image.id).subscribe({
        next: (response) => {
          console.log('Image deleted:', response);
          this.userImages = this.userImages?.filter(img => img.id !== image.id); // Update UI
        },
        error: (error) => {
          console.error('Error deleting image:', error);
        }
      });
    }
  }


}
