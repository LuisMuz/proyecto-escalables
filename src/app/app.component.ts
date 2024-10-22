import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LogInComponent } from "./components/log-in/log-in.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
import { GalleryComponent } from './components/gallery/gallery.component';
import { ShowImageComponent } from './components/show-image/show-image.component';
import { TopBarComponent } from "./components/top-bar/top-bar.component";


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LogInComponent, SignUpComponent, GalleryComponent, ShowImageComponent, TopBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'pixel-art';
}
