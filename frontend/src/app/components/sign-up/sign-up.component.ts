import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordModule, RouterLink, RouterLinkActive],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  form: FormGroup;
  
  constructor() {
    this.form = new FormGroup({
      fullName: new FormControl("", Validators.required),
      username: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      dob: new FormControl("", Validators.required)
    })
  }
}

