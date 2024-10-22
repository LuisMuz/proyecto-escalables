import { Component } from '@angular/core';
import { LogInComponent } from "../../components/log-in/log-in.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LogInComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
