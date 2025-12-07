import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { CorvidNft } from '../../../interfaces/corvid-nft.interface';
import { AccountInfo, NodelyService } from '../../../services/nodely.service';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { FloatWindow } from '../float-window/float-window.component';

interface OwnedNft {
  assetId: number;
  name: string;
  imageUrl: string;
}

@Component({
  selector: 'app-wallet-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective, PixelIconComponent],
  templateUrl: 'wallet-window.component.html',
  styleUrls: ['wallet-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletWindowComponent extends FloatWindow implements OnInit {
  walletAddress = input<string | null>(null);

  isLoading = signal(false);
  error = signal<string | null>(null);
  accountInfo = signal<AccountInfo | null>(null);
  ownedCorvidNfts = signal<OwnedNft[]>([]);
  copiedToClipboard = signal(false);

  algoBalance = computed(() => {
    const info = this.accountInfo();
    if (!info) return '0.00';
    return (info.amount / 1_000_000).toFixed(2);
  });

  truncatedAddress = computed(() => {
    const address = this.walletAddress();
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  });

  constructor(private nodelyService: NodelyService) {
    super();
    this.title = 'Wallet';
    this.width.set(400);
    this.height.set(500);
  }

  ngOnInit(): void {
    const address = this.walletAddress();
    if (address) {
      this.loadWalletData(address);
    }
  }

  loadWalletData(address: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.nodelyService.getAccountInfo(address).subscribe({
      next: (info) => {
        this.accountInfo.set(info);
        this.loadCorvidNfts(info);
      },
      error: (err) => {
        console.error('Error fetching account info:', err);
        this.error.set('Failed to load wallet data');
        this.isLoading.set(false);
      }
    });
  }

  private loadCorvidNfts(accountInfo: AccountInfo): void {
    const corvidWallet = this.nodelyService.getCorvidWallet();

    // Filter assets that might be Corvid NFTs (we'll verify by checking creator)
    const assetIds = accountInfo.assets
      .filter(a => a.amount > 0)
      .map(a => a.assetId);

    if (assetIds.length === 0) {
      this.isLoading.set(false);
      return;
    }

    // Fetch asset info for each asset to check if it's from Corvid
    const assetRequests = assetIds.slice(0, 50).map(id =>
      this.nodelyService.getAssetInfo(id)
    );

    forkJoin(assetRequests).subscribe({
      next: (assets) => {
        const corvidAssets = assets.filter(
          asset => asset && asset.params.creator === corvidWallet
        );

        if (corvidAssets.length === 0) {
          this.isLoading.set(false);
          return;
        }

        // Fetch NFT metadata for Corvid assets
        const metadataRequests = corvidAssets.map(asset =>
          this.nodelyService.listCorvidNftsFromCreatedAssets({
            assets: [asset!],
            currentRound: 0,
            nextToken: ''
          })
        );

        forkJoin(metadataRequests).subscribe({
          next: (nftArrays) => {
            const nfts: OwnedNft[] = nftArrays
              .flat()
              .filter((nft): nft is CorvidNft => nft !== null)
              .map((nft, index) => ({
                assetId: corvidAssets[index]?.index ?? 0,
                name: nft.name,
                imageUrl: nft.imageIpfsUrl ?? ''
              }));

            this.ownedCorvidNfts.set(nfts);
            this.isLoading.set(false);
          },
          error: () => {
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error fetching asset info:', err);
        this.isLoading.set(false);
      }
    });
  }

  copyAddress(): void {
    const address = this.walletAddress();
    if (!address) return;

    navigator.clipboard.writeText(address).then(() => {
      this.copiedToClipboard.set(true);
      setTimeout(() => this.copiedToClipboard.set(false), 2000);
    });
  }

  openExplorer(): void {
    const address = this.walletAddress();
    if (!address) return;
    window.open(`https://allo.info/account/${address}`, '_blank');
  }

  refreshData(): void {
    const address = this.walletAddress();
    if (address) {
      this.loadWalletData(address);
    }
  }
}
