import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';
import { MegaMenuItem } from 'primeng/api';
import { MegaMenuModule } from 'primeng/megamenu';

interface ImageItem {
  src: string;
  name: string;
  isPublic: boolean;
}

@Component({
  selector: 'app-my-images',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputSwitchModule,
    FormsModule,
    ConfirmDialogModule,
    MenuModule,
    CardModule,
    MegaMenuModule
  ],
  templateUrl: './my-images.component.html',
  styleUrls: ['./my-images.component.css'],
  providers: [ConfirmationService]
})
export class MyImagesComponent implements OnInit {
  images: ImageItem[] = [];
  imagePublic: boolean = false;
  // selectedImage: ImageItem | null = {
  //   src: 'images/anders-jilden-uwbajDCODj4-unsplash.jpg',
  //   name: 'Image',
  //   isPublic: false
  // }
  selectedImage: ImageItem | null = null;
  items: MegaMenuItem[] | undefined;

  menuActions = [
    { label: 'Brightness', icon: 'pi pi-sun', command: () => this.applyFilter('brightness') },
    { label: 'Contrast', icon: 'pi pi-percentage', command: () => this.applyFilter('contrast') },
    { label: 'Saturation', icon: 'pi pi-palette', command: () => this.applyFilter('saturation') },
  ];

  constructor(private confirmationService: ConfirmationService) { }

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
      'images/robert-lukeman-zNN6ubHmruI-unsplash.jpg'
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
    this.selectedImage = image;
    console.log('Edit image:', image.name);
  }

  deleteImage(image: ImageItem) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la imagen "${image.name}"?`,
      accept: () => {
        this.images = this.images.filter(img => img.src !== image.src);
        console.log('Image deleted:', image.name);
      }
    });
  }

  backToGrid() {
    this.selectedImage = null;
  }

  saveImage() {
    console.log('Saving image:', this.selectedImage?.name);

  }

  saveAndPublish() {
    console.log('Saving and publishing image:', this.selectedImage?.name);
  }

  cancelEdit() {
    this.selectedImage = null;
  }

  applyFilter(filter: string) {
    console.log(`Applying ${filter} filter`);
  }

}