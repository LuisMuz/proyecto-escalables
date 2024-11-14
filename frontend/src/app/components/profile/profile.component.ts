import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
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


}
