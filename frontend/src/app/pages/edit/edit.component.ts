import { Component } from '@angular/core';
import { MyImagesComponent } from "../../components/my-images/my-images.component";
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [MyImagesComponent, CommonModule, FileUploadModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.css'
})
export class EditComponent {

  onUpload(event:any){
    console.log(event);
  }


}
