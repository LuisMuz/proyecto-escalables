import { Injectable } from '@angular/core';
import { ImageItem } from '../model/image-item';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  private _selectedImage : ImageItem | undefined;

  constructor() { }

  getImage() {
    return this._selectedImage;
  }

  setImage(image: ImageItem) {
    this._selectedImage = image;
  }
}
