import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  form: FormGroup;

  constructor() {
    this.form = new FormGroup ({
      email: new FormControl("", Validators.required),
      password: new FormControl("", Validators.required)
    })
  }
}
