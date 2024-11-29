import {Component, inject, ViewEncapsulation} from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import {MenuItem} from "primeng/api";
import { MenubarModule } from 'primeng/menubar';
import {ImageData} from "../../model/image-item";
import {ImageService} from "../../services/image.service";

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
  styleUrl: './edit-image.component.css',
  encapsulation: ViewEncapsulation.None
})

export class EditImageComponent {
  selectedImage: ImageData | undefined;
  originalImage: ImageData | undefined;
  items: MenuItem[] | undefined;
  imageService = inject(ImageService);

  ngOnInit() {
    this.items = [
      {
        label: 'Original Image',
        icon: 'pi pi-home',
        command: () => {
          this.selectedImage = this.originalImage ? this.originalImage : this.selectedImage;
        }
      },
      {
        label: 'Enhance',
        icon: 'pi pi-star',
        items:[
          {
            label: 'Sharpening',
            icon: 'pi pi-palette',
            command: () => {
              this.applyFilter("sharp");
            }
          },
          {
            label: 'Brightness and Contrast',
            icon: 'pi pi-palette',
            command: () => {
              this.applyFilter("b-c");
            }
          },
          {
            label: 'Blur',
            icon: 'pi pi-palette',
            command: () => {
              this.applyFilter("blur");
            }
          }
        ]
      }
    ];
  }

  constructor(){
    this.selectedImage = this.imageService.getImage();
  }

  applyFilter(filter: string) {
    if(this.selectedImage) {
      this.imageService.editImage(this.selectedImage.id, filter).subscribe({
        next: (response) => {
          const imageId = response.imageId;
          this.obtainNewImage(imageId);
        },
        error: (error) => {
          console.log("Error al aplicar filtro", error);
        }
      });
    }
  }

  cancelEdit() {
    this.selectedImage = undefined;
  }

  obtainNewImage(id : string) {
    this.imageService.getImageById(id).subscribe({
      next: (response) => {
        this.originalImage = this.selectedImage;
        this.selectedImage = response.image;
      },
      error: (error) => {
        console.log("Error al obtener nueva image", error);
      }
    })
  }
}
