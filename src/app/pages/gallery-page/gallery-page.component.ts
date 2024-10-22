import { Component } from '@angular/core';
import { GalleryComponent } from "../../components/gallery/gallery.component";
import { ShowImageComponent } from "../../components/show-image/show-image.component";

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [GalleryComponent, ShowImageComponent],
  templateUrl: './gallery-page.component.html',
  styleUrl: './gallery-page.component.css'
})
export class GalleryPageComponent {

}
