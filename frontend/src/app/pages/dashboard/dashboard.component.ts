import { Component } from '@angular/core';
import { AdministrationComponent } from "../../components/administration/administration.component";
import { AdministrationImgComponent } from "../../components/administration-img/administration-img.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdministrationComponent, AdministrationImgComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
