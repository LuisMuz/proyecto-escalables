import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  form: FormGroup;
  
  constructor() {
    this.form = new FormGroup({
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      dob: new FormControl("", Validators.required)
    })
  }
}

