import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

interface ImageItem {
  src: string;
  name: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-edit-image',
  standalone: true,
  imports: [
    CardModule, ButtonModule
  ],
  templateUrl: './edit-image.component.html',
  styleUrl: './edit-image.component.css'
})

export class EditImageComponent {
  selectedImage: ImageItem | null = null;

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
