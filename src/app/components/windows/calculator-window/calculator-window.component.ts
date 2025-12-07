import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { FloatWindow } from '../float-window/float-window.component';

interface PriceData {
  algorand: {
    usd: number;
    usd_24h_change: number;
  };
}

@Component({
  selector: 'app-calculator-window',
  imports: [CommonModule, DraggableDirective, ResizableDirective, PixelIconComponent, FormsModule],
  templateUrl: 'calculator-window.component.html',
  styleUrls: ['calculator-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalculatorWindowComponent extends FloatWindow implements OnInit, OnDestroy {
  private priceRefreshSub?: Subscription;

  algoPrice = signal<number | null>(null);
  priceChange24h = signal<number | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  lastUpdated = signal<Date | null>(null);

  algoAmount = signal(1);
  usdAmount = signal(0);
  conversionMode = signal<'algoToUsd' | 'usdToAlgo'>('algoToUsd');

  // Transaction fee constants (in microAlgos)
  readonly MIN_TXN_FEE = 0.001; // 1000 microAlgos = 0.001 ALGO

  priceChangeClass = computed(() => {
    const change = this.priceChange24h();
    if (change === null) return '';
    return change >= 0 ? 'positive' : 'negative';
  });

  priceChangeFormatted = computed(() => {
    const change = this.priceChange24h();
    if (change === null) return '--';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  });

  calculatedUsd = computed(() => {
    const price = this.algoPrice();
    const algo = this.algoAmount();
    if (!price) return 0;
    return algo * price;
  });

  calculatedAlgo = computed(() => {
    const price = this.algoPrice();
    const usd = this.usdAmount();
    if (!price || price === 0) return 0;
    return usd / price;
  });

  txnFeeUsd = computed(() => {
    const price = this.algoPrice();
    if (!price) return 0;
    return this.MIN_TXN_FEE * price;
  });

  constructor(private http: HttpClient) {
    super();
    this.title = 'ALGO Calculator';
    this.width.set(380);
    this.height.set(450);
  }

  ngOnInit(): void {
    this.fetchPrice();
    // Refresh price every 60 seconds
    this.priceRefreshSub = interval(60000).subscribe(() => this.fetchPrice());
  }

  ngOnDestroy(): void {
    this.priceRefreshSub?.unsubscribe();
  }

  fetchPrice(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<PriceData>('https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd&include_24hr_change=true')
      .subscribe({
        next: (data) => {
          this.algoPrice.set(data.algorand.usd);
          this.priceChange24h.set(data.algorand.usd_24h_change);
          this.lastUpdated.set(new Date());
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error fetching ALGO price:', err);
          this.error.set('Failed to fetch price');
          this.isLoading.set(false);
        }
      });
  }

  toggleMode(): void {
    if (this.conversionMode() === 'algoToUsd') {
      this.conversionMode.set('usdToAlgo');
      this.usdAmount.set(this.calculatedUsd());
    } else {
      this.conversionMode.set('algoToUsd');
      this.algoAmount.set(this.calculatedAlgo());
    }
  }

  onAlgoInput(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.algoAmount.set(value);
  }

  onUsdInput(event: Event): void {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.usdAmount.set(value);
  }

  setPresetAlgo(amount: number): void {
    this.conversionMode.set('algoToUsd');
    this.algoAmount.set(amount);
  }
}
