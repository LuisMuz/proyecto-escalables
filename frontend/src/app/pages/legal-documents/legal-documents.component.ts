import { Component } from '@angular/core';

import { RouterLink, RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-legal-documents',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './legal-documents.component.html',
  styleUrl: './legal-documents.component.css'
})
export class LegalDocumentsComponent {

}
