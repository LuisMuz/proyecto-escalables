import { Component } from '@angular/core';
import { GalleryComponent } from "../../components/gallery/gallery.component";

@Component({
  selector: 'app-gallery-page',
  standalone: true,
  imports: [GalleryComponent],
  templateUrl: './gallery-page.component.html',
  styleUrl: './gallery-page.component.css'
})
export class GalleryPageComponent {

}
