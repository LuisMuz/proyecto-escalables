import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, CommonModule
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  form: FormGroup;
  _errorMessage : string | undefined;

  constructor(private authService: AuthService, private router: Router) {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  onSubmit() {
    console.log(this.form.value)
    if (this.form.valid) {
      const {email, password} = this.form.value;
      this.authService.login(email, password).subscribe({
        next: (response) => {
          this.router.navigate(['/gallery']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {
          console.error('Login failed', error);
          this._errorMessage = error.error.error;
        }
      });
    }else{
      this._errorMessage = 'Check your email and password';
      this.form.markAllAsTouched();
    }
  }
}
