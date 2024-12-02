import { Injectable } from '@angular/core';
import {ImageData, ImageItem} from '../model/image-item';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private _selectedImage : ImageData | undefined;

  constructor(private http: HttpClient) {}

  getImage() {
    return this._selectedImage;
  }

  setImage(image: ImageData) {
    this._selectedImage = image;
  }

  private apiUrl = 'http://localhost:5000/api';

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

  toggleImagePrivacy(imageId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/images/${imageId}/toggle-privacy`, {});
  }

  deleteImage(imageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/images/${imageId}/delete`);
  }

  // deleteImageAdmin(imageId: string): Observable<any> {
  //   return this.http.delete(`${this.apiUrl}/images/${imageId}/delete/admin`);
  // }

  deleteImageAdmin(imageId: string) {
    const url = `${this.apiUrl}/api/images/${imageId}/delete/admin`;
    console.log('URL de eliminación:', url);
    return this.http.delete(url);
  }

  editImage(imageId: string, action: string): Observable<any> {
    console.log({
      imageId: imageId,
      action: action,
    });
    return this.http.post(`${this.apiUrl}/images/${imageId}/edit`, {action});
  }

  getImageById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/images/${id}`);
  }

  getPublicImages(): Observable<any>{
    return this.http.get(`${this.apiUrl}/admin/public-images`);
  }

  likeImage(imageId: string, token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/images/${imageId}/like`,{});
  }
}
