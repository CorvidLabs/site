import { Component, signal } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { FormsModule } from '@angular/forms';

interface RarityResult {
  assetId: number;
  rarityScore: number;
  rarityRank: number;
  totalInCollection: number;
  rarityTier: string;
  assetName?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-rarity-checker-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent, FormsModule],
  templateUrl: 'rarity-checker-window.component.html',
  styleUrls: ['rarity-checker-window.component.scss']
})
export class RarityCheckerWindowComponent extends FloatWindow {
  // State
  assetIdInput = signal('');
  result = signal<RarityResult | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  recentChecks = signal<RarityResult[]>([]);

  constructor() {
    super();
    this.title = 'Rarity Checker';
    this.width.set(450);
    this.height.set(500);
  }

  async checkRarity(): Promise<void> {
    const assetId = this.assetIdInput().trim();

    if (!assetId) {
      this.error.set('Please enter an asset ID');
      return;
    }

    if (!/^\d+$/.test(assetId)) {
      this.error.set('Asset ID must be a number');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.result.set(null);

    try {
      const response = await fetch(`/api/v1/nft/rarity/${assetId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch rarity data');
      }

      const data: RarityResult = await response.json();

      // Try to get asset details for the image
      try {
        const assetResponse = await fetch(`/api/v1/nft/asset/${assetId}`);
        if (assetResponse.ok) {
          const assetData = await assetResponse.json();
          data.assetName = assetData.name;
          data.imageUrl = this.getIPFSImageUrl(assetData.url);
        }
      } catch {
        // Ignore asset detail errors
      }

      this.result.set(data);

      // Add to recent checks
      const recent = this.recentChecks();
      const exists = recent.findIndex(r => r.assetId === data.assetId);
      if (exists >= 0) {
        recent.splice(exists, 1);
      }
      recent.unshift(data);
      if (recent.length > 5) recent.pop();
      this.recentChecks.set([...recent]);

    } catch (err) {
      this.error.set('Failed to check rarity. Showing demo data.');
      this.loadDemoResult(parseInt(assetId));
    } finally {
      this.isLoading.set(false);
    }
  }

  private getIPFSImageUrl(url: string | null): string {
    if (!url) return this.getPlaceholderImage();

    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }

    return url;
  }

  private getPlaceholderImage(): string {
    return 'data:image/svg+xml,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect fill="#1a1a2e" width="200" height="200"/>
        <text x="100" y="100" fill="#6c63ff" font-family="Arial" font-size="40" text-anchor="middle" dominant-baseline="middle">🐦‍⬛</text>
      </svg>
    `);
  }

  private loadDemoResult(assetId: number): void {
    // Generate deterministic demo data based on asset ID
    const scoreBase = (assetId * 17) % 100;
    const score = Math.max(5, Math.min(99, scoreBase));

    let tier: string;
    if (score >= 90) tier = 'Legendary';
    else if (score >= 75) tier = 'Epic';
    else if (score >= 50) tier = 'Rare';
    else if (score >= 25) tier = 'Uncommon';
    else tier = 'Common';

    const totalCollection = 1000;
    const rank = Math.floor((100 - score) * totalCollection / 100);

    const result: RarityResult = {
      assetId,
      rarityScore: score,
      rarityRank: rank,
      totalInCollection: totalCollection,
      rarityTier: tier,
      assetName: `Nevermore #${assetId}`,
      imageUrl: this.generateRavenSvg(this.getTierColor(tier))
    };

    this.result.set(result);

    // Add to recent
    const recent = this.recentChecks();
    const exists = recent.findIndex(r => r.assetId === assetId);
    if (exists >= 0) recent.splice(exists, 1);
    recent.unshift(result);
    if (recent.length > 5) recent.pop();
    this.recentChecks.set([...recent]);
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
        <text x="100" y="170" fill="${accentColor}" font-family="Arial" font-size="12" text-anchor="middle" font-weight="bold">NEVERMORE</text>
      </svg>
    `);
  }

  getTierColor(tier: string): string {
    switch (tier) {
      case 'Legendary': return '#FFD700';
      case 'Epic': return '#A855F7';
      case 'Rare': return '#3B82F6';
      case 'Uncommon': return '#22C55E';
      default: return '#9CA3AF';
    }
  }

  getTierIcon(tier: string): string {
    switch (tier) {
      case 'Legendary': return 'auto_awesome';
      case 'Epic': return 'diamond';
      case 'Rare': return 'stars';
      case 'Uncommon': return 'star';
      default: return 'star_outline';
    }
  }

  selectRecentCheck(result: RarityResult): void {
    this.assetIdInput.set(result.assetId.toString());
    this.result.set(result);
    this.error.set(null);
  }

  clearInput(): void {
    this.assetIdInput.set('');
    this.result.set(null);
    this.error.set(null);
  }
}
