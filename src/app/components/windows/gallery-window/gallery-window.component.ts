import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, input } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { CorvidNft } from '../../../interfaces/corvid-nft.interface';
import { AssetService } from '../../../services/asset.service';
import { NftCardComponent } from "../../nft-card/nft-card.component";
import { SkeletonCardComponent } from "../../skeleton-card/skeleton-card.component";
import { FloatWindow } from '../float-window/float-window.component';

@Component({
  selector: 'app-gallery-window',
  imports: [DraggableDirective, ResizableDirective, NftCardComponent, SkeletonCardComponent],
  templateUrl: 'gallery-window.component.html',
  styleUrls: ['gallery-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GalleryWindowComponent extends FloatWindow implements OnInit, OnDestroy {
  @ViewChild('scrollableElement') scrollableElement!: ElementRef<HTMLDivElement>;

  override title = input<string>('Gallery');

  private assetService = inject(AssetService);
  private scrollSubject = new Subject<void>();
  private scrollSubscription!: Subscription;

  corvidNfts = signal<CorvidNft[]>([]);
  isLastPage = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  isLoadingMore = signal<boolean>(false);
  hasError = signal<boolean>(false);

  defaultPageSize = 20;
  nextToken: string | null = null;

  constructor() {
    super();

    if (window.innerWidth >= 1920) {
      this.width.set(1000);
      this.height.set(700);
    } else {
      this.width.set(600);
      this.height.set(400);
    }

    this.requestItems();
  }

  ngOnInit() {
    this.scrollSubscription = this.scrollSubject.pipe(
      debounceTime(300)
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
    const scrollOffset = element.scrollHeight - 10;

    if (element.scrollTop + element.clientHeight >= scrollOffset) {
      this.scrollSubject.next();
    }
  }

  requestItems(): void {
    if (this.isLastPage() || this.isLoading() && this.corvidNfts().length > 0 || this.isLoadingMore()) return;

    const isInitialLoad = this.corvidNfts().length === 0;

    if (isInitialLoad) {
      this.isLoading.set(true);
      this.hasError.set(false);
    } else {
      this.isLoadingMore.set(true);
    }

    this.assetService.listCreatedAssets(this.defaultPageSize, this.nextToken).subscribe({
      next: (response) => {
        const nfts = this.assetService.listCorvidNftsFromCreatedAssets(response);
        nfts.subscribe({
          next: (nfts) => {
            this.corvidNfts.update(current => [...current, ...nfts]);
            this.isLoading.set(false);
            this.isLoadingMore.set(false);
          },
          error: err => {
            console.error('Error fetching NFT metadata:', err);
            this.isLoading.set(false);
            this.isLoadingMore.set(false);
            if (this.corvidNfts().length === 0) {
              this.hasError.set(true);
            }
          }
        });

        this.isLastPage.set(response.assets.length < this.defaultPageSize || !response.nextToken);
        this.nextToken = response.nextToken;
      },
      error: err => {
        console.error('Error fetching assets:', err);
        this.nextToken = null;
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
        if (this.corvidNfts().length === 0) {
          this.hasError.set(true);
        }
      }
    });
  }

  retry(): void {
    this.hasError.set(false);
    this.nextToken = null;
    this.isLastPage.set(false);
    this.requestItems();
  }
}
