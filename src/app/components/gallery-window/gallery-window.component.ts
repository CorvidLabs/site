import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DraggableDirective } from '../../directives/draggable.directive';
import { CorvidNft } from '../../interfaces/corvid-nft.interface';
import { NodelyService } from '../../services/nodely.service';
import { FloatWindow } from '../float-window/float-window.component';
import { NftCardComponent } from "../nft-card/nft-card.component";

@Component({
  selector: 'app-gallery-window',
  imports: [CommonModule, DraggableDirective, NftCardComponent], // HttpClientModule should be removed if it's here
  templateUrl: 'gallery-window.component.html',
  styleUrls: ['gallery-window.component.scss']
})
export class GalleryWindowComponent extends FloatWindow implements OnInit {

  corvidNfts: CorvidNft[] = [];

  constructor(
    private nodelyService: NodelyService
  ) {
    super();

    this.title = 'Gallery';

    if (window.innerWidth >= 1920) { // Assuming 1920px is a common "bigger" screen width
      this.width = 1000;
      this.height = 700;
    } else {
      this.width = 600;
      this.height = 400;
    }

    // TODO: Implement a cache service/interceptor to avoid fetching every time
    this.nodelyService.listAssetsMetadata().subscribe({
      next: (nfts) => {
        console.log('Fetched NFTs:', nfts);
        this.corvidNfts = nfts;
      },
      error: err => {
        console.error('Error fetching assets:', err);
      }
    });
  }

  ngOnInit() { }
}