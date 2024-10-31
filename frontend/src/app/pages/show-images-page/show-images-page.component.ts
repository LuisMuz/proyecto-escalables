import { Component } from '@angular/core';
import { ShowImageComponent } from '../../components/show-image/show-image.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';

@Component({
  selector: 'app-show-images-page',
  standalone: true,
  imports: [ShowImageComponent, GalleryComponent],
  templateUrl: './show-images-page.component.html',
  styleUrl: './show-images-page.component.css'
})
export class ShowImagesPageComponent {

}
