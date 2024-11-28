import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ImageService } from '../../services/image.service';
import { Image } from 'primeng/image';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  userService = inject(UserService);
  authService = inject(AuthService);
  router = inject(Router);

  @Output() sendImage = new EventEmitter<any>();

  constructor() {}

  name = this.userService.getName();
  email = this.userService.getEmail();
  username = this.userService.getUserName();
  birth = this.userService.getUserBirth();

  logout() {
    console.log("Logging out");
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onUploadImage() {
    this.sendImage.emit();
  }


  imageService = inject(ImageService);
  userImages: ImageData[] | undefined;
  publicImages: number = 0;
  privateImages: number = 0;

  ngOnInit() {
    const test: boolean = false;

    this.imageService.getUserImages().subscribe({
      next: (response) => {
        this.publicImages = response.counts.publicImages;
        this.privateImages = response.counts.privateImages;
        this.userImages = response.images.map((image: ImageData) => {
          // @ts-ignore
          return ({
            ...image
          });
        });
        console.log(this.userImages);
      },
      error: (error) => {
        console.error('Error al cargar imágenes:', error);
      }
    });
  }
}
