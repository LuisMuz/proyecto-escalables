import { Component } from '@angular/core';
import { ProfileComponent } from '../../components/profile/profile.component';
import { MyImagesComponent } from '../../components/my-images/my-images.component';


@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ProfileComponent, MyImagesComponent],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent {

}
