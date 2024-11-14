import {Component, inject, ViewEncapsulation} from '@angular/core';
import { ProfileComponent } from '../../components/profile/profile.component';
import { MyImagesComponent } from '../../components/my-images/my-images.component';
import { DialogModule } from 'primeng/dialog';
import {FileUploadEvent, FileUploadModule} from 'primeng/fileupload';
import {ImageService} from "../../services/image.service";

interface UploadEvent {
  originalEvent: Event;
  file: File;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ProfileComponent, MyImagesComponent, DialogModule, FileUploadModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProfilePageComponent {

  visible = false; // Controla la visibilidad del modal
  selectedFile: File | null = null; // Variable para almacenar el archivo seleccionado
  imageService = inject(ImageService);

  constructor() {}

  showImageUploadDialog() {
    this.visible = true;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.files[0]; // Guarda el archivo seleccionado
    console.log("Archivo seleccionado:", this.selectedFile);
  }

  onUpload() {
    if (!this.selectedFile) {
      alert("Please select a file before uploading.");
      return;
    }

    // Usa el ImageService para subir la imagen
    this.imageService.uploadImage(this.selectedFile).subscribe({
      next: (response) => {
        console.log("Imagen subida con éxito:", response);
        alert("Image uploaded successfully!");
        this.visible = false; // Cierra el modal después de la carga exitosa
      },
      error: (error) => {
        console.error("Error al subir la imagen:", error);
        alert("Error uploading image.");
      }
    });
  }
}
