import { Component, OnInit, signal, computed, input } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { FormsModule } from '@angular/forms';

interface NFTAsset {
  assetId: number;
  name: string | null;
  unitName: string | null;
  creator: string | null;
  url: string | null;
  total: number;
  imageUrl?: string;
}

@Component({
  selector: 'app-nft-showcase-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent, FormsModule],
  templateUrl: 'nft-showcase-window.component.html',
  styleUrls: ['nft-showcase-window.component.scss']
})
export class NftShowcaseWindowComponent extends FloatWindow implements OnInit {
  // Input from parent if wallet is connected
  walletAddress = input<string | null>(null);

  // State
  assets = signal<NFTAsset[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  selectedAsset = signal<NFTAsset | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');
  searchAddress = signal('');

  // Creator address for the Nevermore collection - placeholder
  readonly NEVERMORE_CREATOR = 'NEVERMORE_CREATOR_ADDRESS_PLACEHOLDER';

  // Display filtered assets
  displayAssets = computed(() => {
    return this.assets();
  });

  constructor() {
    super();
    this.title = 'NFT Showcase';
    this.width.set(600);
    this.height.set(500);
  }

  ngOnInit(): void {
    // If wallet address is provided, load their NFTs
    const address = this.walletAddress();
    if (address) {
      this.searchAddress.set(address);
      this.loadWalletNFTs(address);
    } else {
      // Load sample/demo NFTs
      this.loadDemoNFTs();
    }
  }

  async loadWalletNFTs(address: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await fetch(`/api/v1/nft/assets/${address}`);

      if (!response.ok) {
        throw new Error('Failed to fetch NFTs');
      }

      const data = await response.json();
      const assetsWithImages = await this.enrichAssetsWithImages(data.assets);
      this.assets.set(assetsWithImages);
    } catch (err) {
      this.error.set('Failed to load NFTs. Using demo data.');
      this.loadDemoNFTs();
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadCollectionNFTs(creatorAddress: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const response = await fetch(`/api/v1/nft/collection/${creatorAddress}`);

      if (!response.ok) {
        throw new Error('Failed to fetch collection');
      }

      const data = await response.json();
      const assetsWithImages = await this.enrichAssetsWithImages(data.assets);
      this.assets.set(assetsWithImages);
    } catch (err) {
      this.error.set('Failed to load collection. Using demo data.');
      this.loadDemoNFTs();
    } finally {
      this.isLoading.set(false);
    }
  }

  private async enrichAssetsWithImages(assets: NFTAsset[]): Promise<NFTAsset[]> {
    return assets.map(asset => ({
      ...asset,
      imageUrl: this.getIPFSImageUrl(asset.url)
    }));
  }

  private getIPFSImageUrl(url: string | null): string {
    if (!url) return this.getPlaceholderImage();

    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    if (url.startsWith('https://') || url.startsWith('http://')) {
      return url;
    }

    return this.getPlaceholderImage();
  }

  private getPlaceholderImage(): string {
    return 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect fill="#1a1a2e" width="200" height="200"/>
        <text x="100" y="100" fill="#6c63ff" font-family="Arial" font-size="40" text-anchor="middle" dominant-baseline="middle">🐦‍⬛</text>
      </svg>
    `);
  }

  loadDemoNFTs(): void {
    // Demo NFTs for when API is unavailable
    const demoAssets: NFTAsset[] = [
      {
        assetId: 1001,
        name: 'Nevermore #001',
        unitName: 'NVM',
        creator: 'DEMO_CREATOR',
        url: null,
        total: 1,
        imageUrl: this.generateRavenSvg('#FF6B6B')
      },
      {
        assetId: 1002,
        name: 'Nevermore #002',
        unitName: 'NVM',
        creator: 'DEMO_CREATOR',
        url: null,
        total: 1,
        imageUrl: this.generateRavenSvg('#4ECDC4')
      },
      {
        assetId: 1003,
        name: 'Nevermore #003',
        unitName: 'NVM',
        creator: 'DEMO_CREATOR',
        url: null,
        total: 1,
        imageUrl: this.generateRavenSvg('#FFE66D')
      },
      {
        assetId: 1004,
        name: 'Nevermore #004',
        unitName: 'NVM',
        creator: 'DEMO_CREATOR',
        url: null,
        total: 1,
        imageUrl: this.generateRavenSvg('#95E1D3')
      },
      {
        assetId: 1005,
        name: 'Nevermore #005',
        unitName: 'NVM',
        creator: 'DEMO_CREATOR',
        url: null,
        total: 1,
        imageUrl: this.generateRavenSvg('#6C63FF')
      },
      {
        assetId: 1006,
        name: 'Nevermore #006',
        unitName: 'NVM',
        creator: 'DEMO_CREATOR',
        url: null,
        total: 1,
        imageUrl: this.generateRavenSvg('#F38181')
      }
    ];

    this.assets.set(demoAssets);
  }

  private generateRavenSvg(accentColor: string): string {
    return 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1a1a2e"/>
            <stop offset="100%" style="stop-color:#16213e"/>
          </linearGradient>
        </defs>
        <rect fill="url(#bg)" width="200" height="200"/>
        <circle cx="100" cy="90" r="50" fill="#2d2d44"/>
        <ellipse cx="85" cy="80" rx="8" ry="10" fill="${accentColor}"/>
        <ellipse cx="115" cy="80" rx="8" ry="10" fill="${accentColor}"/>
        <path d="M90 100 L100 115 L110 100" fill="#ff9f43" stroke="#ff9f43" stroke-width="2"/>
        <path d="M60 70 Q40 50 55 40 Q70 45 75 60" fill="#2d2d44"/>
        <path d="M140 70 Q160 50 145 40 Q130 45 125 60" fill="#2d2d44"/>
        <text x="100" y="170" fill="${accentColor}" font-family="Arial" font-size="12" text-anchor="middle" font-weight="bold">NEVERMORE</text>
      </svg>
    `);
  }

  onSearch(): void {
    const address = this.searchAddress().trim();
    if (address) {
      this.loadWalletNFTs(address);
    }
  }

  selectAsset(asset: NFTAsset): void {
    this.selectedAsset.set(asset);
  }

  closeDetail(): void {
    this.selectedAsset.set(null);
  }

  toggleViewMode(): void {
    this.viewMode.update(mode => mode === 'grid' ? 'list' : 'grid');
  }

  refresh(): void {
    const address = this.searchAddress().trim();
    if (address) {
      this.loadWalletNFTs(address);
    } else {
      this.loadDemoNFTs();
    }
  }

  formatAddress(address: string | null): string {
    if (!address) return 'Unknown';
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}
