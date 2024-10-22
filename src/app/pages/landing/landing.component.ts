import { Component } from '@angular/core';
import { TopBarComponent } from "../../components/top-bar/top-bar.component";
import { ImagesMovingComponent } from "../../components/images-moving/images-moving.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [TopBarComponent, ImagesMovingComponent, CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent {
  steps: string[] = [
    'Create an account',
    'Upload your images',
    'Edit & Enhance',
    'Share with the world'
  ];

  title: string = 'Easy image sharing';
  description: string = 'Share your images effortlessly';
  featureTitle: string = 'Editing tools';
  featureDescription: string = 'Edit your images with ease';
}
