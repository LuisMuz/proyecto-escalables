import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import {MenuItem} from "primeng/api";
import { MenubarModule } from 'primeng/menubar';

interface ImageItem {
  src: string;
  name: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-edit-image',
  standalone: true,
  imports: [
    CardModule, ButtonModule, MenubarModule
  ],
  templateUrl: './edit-image.component.html',
  styleUrl: './edit-image.component.css'
})

export class EditImageComponent {
  selectedImage: ImageItem | null = null;
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      {
        label: 'Original Image',
        icon: 'pi pi-home'
      },
      {
        label: 'Enhance',
        icon: 'pi pi-star',
        items:[
          {
            label: 'Sharpening',
            icon: 'pi pi-palette',
          },
          {
            label: 'Brightness and Contrast',
            icon: 'pi pi-palette',
          }
        ]
      }
    ];
  }

  constructor(){
    this.selectedImage = {
      src: 'images/anders-jilden-uwbajDCODj4-unsplash.jpg',
      name: 'Image',
      isPublic: false
    }
  }

  saveAndPublish() {
    console.log('Saving and publishing image:', this.selectedImage?.name);
  }

  cancelEdit() {
    this.selectedImage = null;
  }

  saveImage() {
    console.log('Saving image:', this.selectedImage?.name);
  }

}
