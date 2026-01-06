import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, ElementRef, inject, input, OnInit, viewChild } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { NftCardComponent } from '../../nft-card/nft-card.component';
import { FloatWindow } from '../float-window/float-window.component';
import { ThemeService } from '../../../services/general/theme.service';
import { NavbarComponent } from '../../navbar/navbar.component';

declare const Chart: any;

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'cvd-about-window',
  templateUrl: 'about-window.component.html',
  styleUrls: ['about-window.component.scss'],
  imports: [
    CommonModule, DraggableDirective, ResizableDirective, NavbarComponent
  ]
})
export class AboutWindowComponent extends FloatWindow implements OnInit, AfterViewInit {
  tokenomicsChart = viewChild<ElementRef<HTMLCanvasElement>>('tokenomicsChart');
  faqContainer = viewChild<ElementRef<HTMLDivElement>>('faqContainer');

  override title = input<string>('About Corvid Labs');

  navbarItems = [
    {
      label: 'The Project',
      link: '#nevermore-nft'
    },
    {
      label: 'Utility',
      link: '#reimagining-subscriptions'
    },
    {
      label: 'Tokenomics',
      link: '#core-utility-benefits'
    },
    {
      label: 'Team',
      link: '#team'
    },
    {
      label: 'FAQ',
      link: '#faq'
    },
    {
      label: 'Join Discord',
      link: 'https://discord.gg/mQGPQy5fnd',
      styling: 'bg-accent text-primary-bg !font-bold py-2 px-5 hover:bg-opacity-90 transition-colors ml-4'
    }
  ];

  faqData: FaqItem[] = [
    {
      question: "What are the technical risks?",
      answer: "<strong>Smart Contract Security:</strong> Contracts will undergo professional security auditing. They will be open-source for community review. Team assets are protected by a multi-signature wallet. <br/><br/><strong>Platform Dependencies:</strong> Utility delivery depends on the iOS ecosystem and Apple App Store policies. The project also relies on Algorand network performance and third-party services like Discord."
    },
    {
      question: "What are the market and development risks?",
      answer: "<strong>Market Volatility:</strong> Secondary market prices are subject to cryptocurrency market conditions. While utility provides a value floor, it doesn't guarantee appreciation. <br/><br/><strong>Development Risks:</strong> As an indie team, development timelines are subject to change. The evolving iOS platform may require significant adaptation."
    },
    {
      question: "How does community governance work?",
      answer: "Core development decisions are team-led with strong community input. NFT holders can vote on feature prioritization via a Discord-based proposal system. We hold regular community surveys and quarterly development calls to ensure transparent discussion and consensus on major strategic changes."
    },
    {
      question: "Which blockchain is used and why?",
      answer: "The Nevermore NFT Collection is built on the Algorand blockchain. We chose Algorand for its high performance, low transaction costs, carbon-negative footprint, and robust security through its pure proof-of-stake consensus mechanism. This ensures long-term viability and seamless integration with the Algorand ecosystem."
    }
  ];

  copyButtonText: string = 'Copy';
  private chartInstance: any = null;
  private themeService = inject(ThemeService);

  constructor() {
    super();

    if (window.innerWidth >= 1920) { // Assuming 1920px is a common "bigger" screen width
      this.width.set(1200);
      this.height.set(720);
    } else {
      this.width.set(865);
      this.height.set(600);
    }

    // Watch for theme changes and regenerate chart
    effect(() => {
      this.themeService.theme(); // Track the theme signal

      // Regenerate chart if it exists (skip on first run before AfterViewInit)
      if (this.chartInstance) {
        this.generateTokenomicsChartData();
      }
    });
  }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.generateTokenomicsChartData();
  }

  // Override the close method to clear URL state from any state changes
  override close() {
    history.replaceState(null, '', window.location.pathname);
    super.close();
  }

  toggleFAQItem(index: number): void {
    const container = this.faqContainer()?.nativeElement;
    if (!container) return;

    const faqItems = container.getElementsByClassName('faq-item');
    if (index >= 0 && index < faqItems.length) {
      faqItems[index].classList.toggle('open');
    }
  }

  async copyWalletAddress(): Promise<void> {
    const walletAddress = "WGSHC4TYKYBS6EX5V5E377BQDLKWIIPBCFOLZQZIXCKHFIEKRPBFOMW25A";
    try {
      await navigator.clipboard.writeText(walletAddress);
      this.copyButtonText = 'Copied!';

      setTimeout(() => {
        this.copyButtonText = 'Copy';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  }

  private generateTokenomicsChartData() {
    const canvas = this.tokenomicsChart()?.nativeElement;
    if (!canvas || typeof canvas == 'undefined') return;

    // Get theme colors from CSS variables
    const styles = getComputedStyle(document.body);
    const primaryAccent = styles.getPropertyValue('--theme-primary-accent').trim() || '#f9e9c8';
    const success = styles.getPropertyValue('--theme-success').trim() || '#66bb6a';
    const warning = styles.getPropertyValue('--theme-warning').trim() || '#ffa726';
    const primaryText = styles.getPropertyValue('--theme-primary-text').trim() || '#f9e9c8';
    const secondaryBg = styles.getPropertyValue('--theme-secondary-bg').trim() || '#171a30';

    // Destroy existing chart instance before creating a new one
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const tokenomicsData = {
      labels: ['Community Distribution', 'Team Allocation', 'Ecosystem Treasury'],
      datasets: [{
        label: 'Allocation',
        data: [85, 10, 5],
        backgroundColor: [
          primaryAccent,
          success,
          warning
        ],
        borderColor: [
          secondaryBg
        ],
        borderWidth: 2,
        hoverOffset: 8
      }]
    };

    const tokenomicsConfig = {
      type: 'doughnut',
      data: tokenomicsData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: primaryText,
              font: {
                size: 14,
                family: 'Press Start 2P, cursive'
              },
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: secondaryBg,
            titleColor: primaryText,
            bodyColor: primaryText,
            borderColor: primaryAccent,
            borderWidth: 1,
            callbacks: {
              label: function (context: any) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += context.parsed + '%';
                }
                return label;
              }
            }
          }
        },
        cutout: '60%',
      }
    };

    this.chartInstance = new Chart(canvas.getContext('2d'), tokenomicsConfig);
  }
}