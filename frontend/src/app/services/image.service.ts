import { Injectable } from '@angular/core';
import { ImageItem } from '../model/image-item';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private _selectedImage : ImageItem | undefined;

  constructor(private http: HttpClient) {}

  getImage() {
    return this._selectedImage;
  }

  setImage(image: ImageItem) {
    this._selectedImage = image;
  }

  private apiUrl = 'http://localhost:5000/api'; // URL base de tu API

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // Llama al endpoint de subida de imágenes
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getUserImages(): Observable<any>{
    const userId = localStorage.getItem('userId');
    return this.http.get(`${this.apiUrl}/users/${userId}/images`);
  }
}
