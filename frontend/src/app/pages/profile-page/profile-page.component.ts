import { Component } from '@angular/core';
import { ProfileComponent } from '../../components/profile/profile.component';
import { GalleryComponent } from '../../components/gallery/gallery.component';
import { MyImagesComponent } from '../../components/my-images/my-images.component';
import { EditImageComponent } from '../../components/edit-image/edit-image.component';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ProfileComponent, GalleryComponent, MyImagesComponent, EditImageComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

}
