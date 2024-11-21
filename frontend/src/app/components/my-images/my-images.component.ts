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
    this.loadImages();
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

  loadImages() {
    this.images = [
      "images/anders-jilden-uwbajDCODj4-unsplash.jpg",
      'images/bob-brewer-zJF1lRdUdAw-unsplash.jpg',
      'images/buzz-andersen-E4944K_4SvI-unsplash.jpg',
      'images/christian-joudrey-u_nsiSvPEak-unsplash.jpg',
      'images/geranimo-qzgN45hseN0-unsplash.jpg',
      'images/johannes-plenio-DKix6Un55mw-unsplash.jpg',
      'images/josh-rakower-zBsXaPEBSeI-unsplash.jpg',
      'images/kimon-maritz-1-ISIwuBMiw-unsplash.jpg',
      'images/morais-G-bQlVMt1H8-unsplash.jpg',
      'images/nasa--hI5dX2ObAs-unsplash.jpg',
      'images/patrick-hendry-jd0hS7Vhn_A-unsplash.jpg',
      'images/pawan-sharma-n1jB9kcXbpg-unsplash.jpg',
      'images/robert-lukeman-zNN6ubHmruI-unsplash.jpg',
      'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3cyejF3bGpvdmpiMGtqYTVzZGozamhldW0zNWdhZWZreHQ3eXluZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2rAKTgJIQe1buYU1R5/giphy.webp'
    ].map(src => ({
      src,
      name: this.getImageName(src),
      isPublic: false
    }));
  }

  getImageName(src: string): string {
    return src.split('_').pop()?.split('.')[0] || '';
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
