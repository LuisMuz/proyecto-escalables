import { Component } from '@angular/core';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-show-image',
  standalone: true,
  imports: [ImageModule],
  templateUrl: './show-image.component.html',
  styleUrl: './show-image.component.css'
})
export class ShowImageComponent {

}
