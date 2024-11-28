import { Component } from '@angular/core';
import { AdministrationComponent } from "../../components/administration/administration.component";
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdministrationComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
