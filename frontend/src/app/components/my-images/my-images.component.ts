import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { MegaMenuItem } from 'primeng/api';
import { MegaMenuModule } from 'primeng/megamenu';
import { DialogModule } from 'primeng/dialog';
import {ImageData, ImageItem} from '../../model/image-item';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-my-images',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputSwitchModule,
    FormsModule,
    MenuModule,
    CardModule,
    MegaMenuModule,
    DialogModule
  ],
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.css'],
  providers: []
})
export class MyImagesComponent implements OnInit {
  images: ImageItem[] = [];
  items: MegaMenuItem[] | undefined;
  visible: boolean = false;
  imageService = inject(ImageService);
  userImages: ImageData[] | null = null;

  menuActions = [
    { label: 'Brightness', icon: 'pi pi-sun', command: () => this.applyFilter('brightness') },
    { label: 'Contrast', icon: 'pi pi-percentage', command: () => this.applyFilter('contrast') },
    { label: 'Saturation', icon: 'pi pi-palette', command: () => this.applyFilter('saturation') },
  ];

  constructor() { }

  ngOnInit() {
    this.loadImages();

    this.items = [
      {
        label: 'Filters',
        icon: 'pi pi-box',
        items: [
          [
            {
              label: 'Living Room',
              items: [{ label: 'Accessories' }, { label: 'Armchair' }, { label: 'Coffee Table' }, { label: 'Couch' }, { label: 'TV Stand' }]
            }
          ],
          [
            {
              label: 'Kitchen',
              items: [{ label: 'Bar stool' }, { label: 'Chair' }, { label: 'Table' }]
            },
            {
              label: 'Bathroom',
              items: [{ label: 'Accessories' }]
            }
          ],
          [
            {
              label: 'Bedroom',
              items: [{ label: 'Bed' }, { label: 'Chaise lounge' }, { label: 'Cupboard' }, { label: 'Dresser' }, { label: 'Wardrobe' }]
            }
          ],
          [
            {
              label: 'Office',
              items: [{ label: 'Bookcase' }, { label: 'Cabinet' }, { label: 'Chair' }, { label: 'Desk' }, { label: 'Executive Chair' }]
            }
          ]
        ]
      },
      {
        label: 'Electronics',
        icon: 'pi pi-mobile',
        items: [
          [
            {
              label: 'Computer',
              items: [{ label: 'Monitor' }, { label: 'Mouse' }, { label: 'Notebook' }, { label: 'Keyboard' }, { label: 'Printer' }, { label: 'Storage' }]
            }
          ],
          [
            {
              label: 'Home Theather',
              items: [{ label: 'Projector' }, { label: 'Speakers' }, { label: 'TVs' }]
            }
          ],
          [
            {
              label: 'Gaming',
              items: [{ label: 'Accessories' }, { label: 'Console' }, { label: 'PC' }, { label: 'Video Games' }]
            }
          ],
          [
            {
              label: 'Appliances',
              items: [{ label: 'Coffee Machine' }, { label: 'Fridge' }, { label: 'Oven' }, { label: 'Vaccum Cleaner' }, { label: 'Washing Machine' }]
            }
          ]
        ]
      },
      {
        label: 'Sports',
        icon: 'pi pi-clock',
        items: [
          [
            {
              label: 'Football',
              items: [{ label: 'Kits' }, { label: 'Shoes' }, { label: 'Shorts' }, { label: 'Training' }]
            }
          ],
          [
            {
              label: 'Running',
              items: [{ label: 'Accessories' }, { label: 'Shoes' }, { label: 'T-Shirts' }, { label: 'Shorts' }]
            }
          ],
          [
            {
              label: 'Swimming',
              items: [{ label: 'Kickboard' }, { label: 'Nose Clip' }, { label: 'Swimsuits' }, { label: 'Paddles' }]
            }
          ],
          [
            {
              label: 'Tennis',
              items: [{ label: 'Balls' }, { label: 'Rackets' }, { label: 'Shoes' }, { label: 'Training' }]
            }
          ]
        ]
      }
    ]

    this.imageService.getUserImages().subscribe({
      next: (response) => {
        this.userImages = response.images;
        console.log(response);
      },
      error: (error) => {
        console.log(`Error: ${error}`);
      }
    });
  }

  loadImages() {
    this.images = [
      "images/anders-jilden-uwbajDCODj4-unsplash.jpg",
      'images/bob-brewer-zJF1lRdUdAw-unsplash.jpg',
      'images/buzz-andersen-E4944K_4SvI-unsplash.jpg',
      'images/christian-joudrey-u_nsiSvPEak-unsplash.jpg',
      'images/geranimo-qzgN45hseN0-unsplash.jpg',
      'images/johannes-plenio-DKix6Un55mw-unsplash.jpg',
      'images/josh-rakower-zBsXaPEBSeI-unsplash.jpg',
      'images/kimon-maritz-1-ISIwuBMiw-unsplash.jpg',
      'images/morais-G-bQlVMt1H8-unsplash.jpg',
      'images/nasa--hI5dX2ObAs-unsplash.jpg',
      'images/patrick-hendry-jd0hS7Vhn_A-unsplash.jpg',
      'images/pawan-sharma-n1jB9kcXbpg-unsplash.jpg',
      'images/robert-lukeman-zNN6ubHmruI-unsplash.jpg',
      'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3cyejF3bGpvdmpiMGtqYTVzZGozamhldW0zNWdhZWZreHQ3eXluZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2rAKTgJIQe1buYU1R5/giphy.webp'
    ].map(src => ({
      src,
      name: this.getImageName(src),
      isPublic: false
    }));
  }

  getImageName(src: string): string {
    return src.split('/').pop()?.split('.')[0] || '';
  }

  editImage(image: ImageItem) {
    console.log('Edit image:', image.name);
    this.imageService.setImage(image);
  }

  toggleDelete(image: ImageItem | null) {
    console.log(this.imageService.getImage()?.name);
    this.visible = this.visible? false : true;
    if (image) {
      console.log('Delete image:', image.name);
    }
  }

  applyFilter(filter: string) {
    console.log(`Applying ${filter} filter`);
  }

}
