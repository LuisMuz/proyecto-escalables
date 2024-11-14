import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import {ImageModule} from 'primeng/image';

@Component({
  selector: 'app-images-moving',
  standalone: true,
  imports: [
    CommonModule, CarouselModule,
    ImageModule
  ],
  templateUrl: './images-moving.component.html',
  styleUrl: './images-moving.component.css'
})

export class ImagesMovingComponent {

  images: string[] = [
    "images/anders-jilden-uwbajDCODj4-unsplash.jpg",
    'images/bob-brewer-zJF1lRdUdAw-unsplash.jpg',
    'images/buzz-andersen-E4944K_4SvI-unsplash.jpg',
    'images/christian-joudrey-u_nsiSvPEak-unsplash.jpg',
    'images/geranimo-qzgN45hseN0-unsplash.jpg',
    'images/johannes-plenio-DKix6Un55mw-unsplash.jpg',

  ];

  images2: string[] = [
    "images/anders-jilden-uwbajDCODj4-unsplash.jpg",
    'images/bob-brewer-zJF1lRdUdAw-unsplash.jpg',
    'images/josh-rakower-zBsXaPEBSeI-unsplash.jpg',
    'images/kimon-maritz-1-ISIwuBMiw-unsplash.jpg',
    'images/geranimo-qzgN45hseN0-unsplash.jpg',
    'images/johannes-plenio-DKix6Un55mw-unsplash.jpg',

  ];

  images3: string[] = [
    'images/josh-rakower-zBsXaPEBSeI-unsplash.jpg',
    'images/kimon-maritz-1-ISIwuBMiw-unsplash.jpg',
    'images/morais-G-bQlVMt1H8-unsplash.jpg',
    'images/nasa--hI5dX2ObAs-unsplash.jpg',
    'images/patrick-hendry-jd0hS7Vhn_A-unsplash.jpg',
    'images/pawan-sharma-n1jB9kcXbpg-unsplash.jpg',
    // 'images/robert-lukeman-zNN6ubHmruI-unsplash.jpg'
  ];

  test_images: string[] = [
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300',
  'https://via.placeholder.com/400x300'
  ];
  
}
