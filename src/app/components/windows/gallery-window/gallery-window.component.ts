import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, input } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { CorvidNft } from '../../../interfaces/corvid-nft.interface';
import { NodelyService } from '../../../services/nodely.service';
import { NftCardComponent } from "../../nft-card/nft-card.component";
import { FloatWindow } from '../float-window/float-window.component';

@Component({
  selector: 'app-gallery-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective, NftCardComponent], // HttpClientModule should be removed if it's here
  templateUrl: 'gallery-window.component.html',
  styleUrls: ['gallery-window.component.scss']
})
export class GalleryWindowComponent extends FloatWindow implements OnInit, OnDestroy {
  override title = input<string>('Gallery');
  @ViewChild('scrollableElement') scrollableElement!: ElementRef<HTMLDivElement>;

  private scrollSubject = new Subject<void>();
  private scrollSubscription !: Subscription;

  corvidNfts: CorvidNft[] = [];
  defaultPageSize = 20;
  nextToken: string | null = null;
  isLastPage: boolean = false;

  constructor(
    private nodelyService: NodelyService
  ) {
    super();

    if (window.innerWidth >= 1920) { // Assuming 1920px is a common "bigger" screen width
      this.width.set(1000);
      this.height.set(700);
    } else {
      this.width.set(600);
      this.height.set(400);
    }

    this.requestItems();
  }

  ngOnInit() {
    // Create a subscription on the scrollEvent with debounce to avoid multiple rapid calls
    this.scrollSubscription = this.scrollSubject.pipe(
      debounceTime(300) // Time in milliseconds that must pass without new events to trigger the call
    ).subscribe(() => {
      this.requestItems();
    });
  }

  ngOnDestroy(): void {
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  onNearScrollEnd(): void {
    if (!this.scrollableElement) return;

    const element = this.scrollableElement.nativeElement;
    const scrollOffset = element.scrollHeight - 10; // 10px from the bottom we make the request

    if (element.scrollTop + element.clientHeight >= scrollOffset) {
      this.scrollSubject.next();  // Instead of doing a method call, we fire the subscription (line: 46)
    }
  }

  requestItems(): void {
    if (this.isLastPage) return;

    this.nodelyService.listCreatedAssets(this.defaultPageSize, this.nextToken).subscribe({
      next: (response) => {
        const nfts = this.nodelyService.listCorvidNftsFromCreatedAssets(response);
        nfts.subscribe({
          next: (nfts) => {
            this.corvidNfts = [...this.corvidNfts, ...nfts];
          },
          error: err => {
            console.error('Error fetching NFT metadata:', err);
          }
        });

        this.isLastPage = response.assets.length < this.defaultPageSize || !response.nextToken;
        this.nextToken = response.nextToken;
      },
      error: err => {
        console.error('Error fetching assets:', err);
        this.nextToken = null;
      }
    });
  }
}