import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { CorvidNft } from '../../../interfaces/corvid-nft.interface';
import { NodelyService } from '../../../services/nodely.service';
import { FloatWindow } from '../float-window/float-window.component';

interface Marketplace {
  name: string;
  url: string;
  icon: string;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-mint-cta-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective, PixelIconComponent],
  templateUrl: 'mint-cta-window.component.html',
  styleUrls: ['mint-cta-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MintCtaWindowComponent extends FloatWindow implements OnInit {
  isLoading = signal(true);
  featuredNfts = signal<CorvidNft[]>([]);
  currentSlide = signal(0);

  marketplaces: Marketplace[] = [
    {
      name: 'NFD',
      url: 'https://app.nf.domains/name/nevermore.algo',
      icon: 'storefront'
    },
    {
      name: 'Rand Gallery',
      url: 'https://www.randgallery.com/collection/nevermore/',
      icon: 'collections'
    },
    {
      name: 'Allo.info',
      url: 'https://allo.info/account/WGSHC4TYKYBS6EX5V5E377BQDLKWIIPBCFOLZQZIXCKHFIEKRPBFOMW25A',
      icon: 'explore'
    }
  ];

  benefits: Benefit[] = [
    {
      icon: 'all_inclusive',
      title: 'Lifetime Access',
      description: 'Pro access to all Corvid Labs iOS apps forever'
    },
    {
      icon: 'how_to_vote',
      title: 'Community Voice',
      description: 'Vote on features and shape development priorities'
    },
    {
      icon: 'groups',
      title: 'Exclusive Community',
      description: 'Join a community of builders and creators'
    },
    {
      icon: 'rocket_launch',
      title: 'Early Access',
      description: 'Be first to try new apps and features'
    }
  ];

  constructor(private nodelyService: NodelyService) {
    super();
    this.title = 'Get Nevermore';
    this.width.set(450);
    this.height.set(550);
  }

  ngOnInit(): void {
    this.loadFeaturedNfts();
  }

  private loadFeaturedNfts(): void {
    this.nodelyService.listCreatedAssets(6, null).subscribe({
      next: (response) => {
        this.nodelyService.listCorvidNftsFromCreatedAssets(response).subscribe({
          next: (nfts) => {
            this.featuredNfts.set(nfts);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false)
        });
      },
      error: () => this.isLoading.set(false)
    });
  }

  nextSlide(): void {
    const total = this.featuredNfts().length;
    if (total > 0) {
      this.currentSlide.set((this.currentSlide() + 1) % total);
    }
  }

  prevSlide(): void {
    const total = this.featuredNfts().length;
    if (total > 0) {
      this.currentSlide.set((this.currentSlide() - 1 + total) % total);
    }
  }

  openMarketplace(marketplace: Marketplace): void {
    window.open(marketplace.url, '_blank');
  }
}
