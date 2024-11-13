import { CommonModule } from '@angular/common';
import {ChangeDetectorRef, Component, inject} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import { PasswordModule } from 'primeng/password';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, PasswordModule, RouterLink, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {

  form: FormGroup;
  authService = inject(AuthService);
  errorMessage: string | null = null;
  usernameAvailable: boolean | null = null;


  constructor(private cdr: ChangeDetectorRef, private router: Router) {
    this.form = new FormGroup({
      fullName: new FormControl("", Validators.required),
      username: new FormControl("", Validators.required),
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required),
      dob: new FormControl("", Validators.required)
    });
  }

  async onUsernameInput() {
    const username:string = this.form.get('username')?.value;
    this.usernameAvailable = false;
    // console.log(username);

    if (username) {
      try {
        const response = await this.authService.checkUsername(username);
        console.log(response);
        this.usernameAvailable = !response.exists;
      } catch (error) {
        console.error('Error checking username', error);
        this.usernameAvailable = null;
      }
    }
  }

  createUserData(){
    console.log("Username Checked, is available:");
    console.log(this.usernameAvailable);
    if (this.form.valid && this.usernameAvailable) {
      const { fullName, username, email, password, dob } = this.form.value;
      this.authService.signup(email, password, fullName, username, dob).subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error: any) => {
          console.error('Signup failed', error);
          this.errorMessage = error.error.message;
        }
      });
    } else {
      alert('Check the form for errors');
    }
  }

  onSubmit() {
    console.log(this.form.value);
    this.onUsernameInput().then(r => this.createUserData());
  }
}

