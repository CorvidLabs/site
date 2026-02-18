import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, OnInit, signal, ViewChild, input } from '@angular/core';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { CorvidNft } from '../../../interfaces/corvid-nft.interface';
import { AssetService } from '../../../services/asset.service';
import { NftCardComponent } from "../../nft-card/nft-card.component";
import { SkeletonCardComponent } from "../../skeleton-card/skeleton-card.component";
import { FloatWindow } from '../float-window/float-window.component';
import { UtilsService } from '../../../services/general/utils.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

export interface GalleryStorageObj {
  scrollPosition: number;
  corvidNfts: CorvidNft[] | null;
  isLastPage: boolean;
  nextToken: string | null;
}

@Component({
  selector: 'app-gallery-window',
  imports: [DraggableDirective, ResizableDirective, NftCardComponent, SkeletonCardComponent, MatTooltipModule, PixelIconComponent],
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

    this.initializeGallery();
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

  requestItems(fallback: boolean = false): void {
    if (this.isLastPage() || (this.isLoading() || this.isLoadingMore()) && this.corvidNfts().length > 0) return;

    const isInitialLoad = this.corvidNfts().length === 0;

    if (isInitialLoad) {
      this.isLoading.set(true);
      this.hasError.set(false);
    } else {
      this.isLoadingMore.set(true);
    }

    this.assetService.listCreatedAssets(this.defaultPageSize, this.nextToken, fallback).subscribe({
      next: (response) => {
        this.isLastPage.set(response.assets.length < this.defaultPageSize || !response.nextToken);
        this.nextToken = response.nextToken;

        const nfts = this.assetService.listCorvidNftsFromCreatedAssets(response);
        nfts.subscribe({
          next: (nfts) => {
            this.corvidNfts.update(current => [...current, ...nfts]);
            this.isLoading.set(false);
            this.isLoadingMore.set(false);

            this.saveToLocalStorage();
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

  /**
   * Get cached gallery window data from local storage
   * @returns True if cache was loaded successfully, false otherwise
   */
  loadFromLocalStorage(): boolean {
    const storedData = UtilsService.recoverObjFromLocalStorage<GalleryStorageObj>('galleryWindowData');

    if (storedData?.corvidNfts && storedData.corvidNfts.length > 0) {
      this.corvidNfts.set(storedData.corvidNfts);
      this.isLastPage.set(storedData.isLastPage);
      this.nextToken = storedData.nextToken;
      this.isLoading.set(false);
      return true;
    }
    return false;
  }

  /**
   * Save gallery window data to local storage
   */
  saveToLocalStorage() {
    const data: GalleryStorageObj = {
      scrollPosition: 0,
      corvidNfts: this.corvidNfts(),
      isLastPage: this.isLastPage(),
      nextToken: this.nextToken
    };

    UtilsService.saveObjToLocalStorage('galleryWindowData', data);
  }

  /**
   * Clear local storage
   */
  clearLocalStorage() {
    UtilsService.clearGalleryCache();
  }

  retry(): void {
    this.hasError.set(false);
    this.nextToken = null;
    this.isLastPage.set(false);

    this.clearLocalStorage();
    this.corvidNfts.set([]);

    if (this.scrollableElement) {
      this.scrollableElement.nativeElement.scrollTop = 0;
    }

    this.requestItems(true);
  }

  /**
   * Initialize gallery - uses cache if available, otherwise fetches from API
   */
  initializeGallery(): void {
    const hasCachedData = this.loadFromLocalStorage();

    if (!hasCachedData) {
      this.requestItems();
    }
  }

  /**
   * Force refresh - clears cache and fetches fresh data
   */
  refreshGallery(): void {
    UtilsService.clearGalleryCache();
    this.corvidNfts.set([]);
    this.nextToken = null;
    this.isLastPage.set(false);
    this.hasError.set(false);
    this.requestItems();
  }
}
