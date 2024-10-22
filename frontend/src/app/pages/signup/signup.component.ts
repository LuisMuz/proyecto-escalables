import { Component } from '@angular/core';
import { SignUpComponent } from "../../components/sign-up/sign-up.component";

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [SignUpComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {

}
