import { Component, ElementRef, viewChild, afterNextRender, PLATFORM_ID, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';


declare const Chart: any;

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-static-landing',
  imports: [CommonModule],
  templateUrl: './static-landing.html',
  styleUrl: './static-landing.scss'
})
export class StaticLanding implements AfterViewInit {
  mobileMenu = viewChild<ElementRef<HTMLDivElement>>('mobileMenu');
  tokenomicsChart = viewChild<ElementRef<HTMLCanvasElement>>('tokenomicsChart');
  faqContainer = viewChild<ElementRef<HTMLDivElement>>('faqContainer');

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

  constructor() { }

  ngAfterViewInit(): void {
    this.initializeTokenomicsChart();
    this.initializeSmoothScroll();
    this.initializeNavigationHighlight();
  }

  private initializeSmoothScroll(): void {
    const menu = this.mobileMenu()?.nativeElement;
    const header = document.getElementById('header');
    const headerHeight = header?.offsetHeight || 0;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        e.preventDefault();
        if (menu && !menu.classList.contains('hidden')) {
          menu.classList.add('hidden');
        }
        const targetElement = document.querySelector(href!);
        if (targetElement) {
          window.scrollTo({
            top: (targetElement as HTMLElement).offsetTop - headerHeight,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  private initializeNavigationHighlight(): void {
    const header = document.getElementById('header');
    const headerHeight = header?.offsetHeight || 0;
    const sections = document.querySelectorAll('main section');
    const navLinks = document.querySelectorAll('.nav-link');

    const highlightNavOnScroll = () => {
      const scrollPosition = window.scrollY + headerHeight + 50;
      let currentSectionId = '';

      sections.forEach(section => {
        if ((section as HTMLElement).offsetTop <= scrollPosition) {
          currentSectionId = section.getAttribute('id') || '';
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        if (linkHref === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    };

    window.addEventListener('scroll', highlightNavOnScroll);
    highlightNavOnScroll();
  }

  private initializeTokenomicsChart(): void {
    const canvas = this.tokenomicsChart()?.nativeElement;
    if (!canvas || typeof Chart === 'undefined') return;

    const tokenomicsData = {
      labels: ['Community Distribution', 'Team Allocation', 'Ecosystem Treasury'],
      datasets: [{
        label: 'Allocation',
        data: [85, 10, 5],
        backgroundColor: [
          '#8b5cf6', // Accent
          '#14b8a6', // Accent 2
          '#6b7280'  // Gray
        ],
        borderColor: '#1f2937',
        borderWidth: 3,
        hoverOffset: 4
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
              color: '#d1d5db',
              font: {
                size: 14,
                family: 'Inter, sans-serif'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
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

    new Chart(canvas.getContext('2d'), tokenomicsConfig);
  }

  toggleMobileMenu(): void {
    this.mobileMenu()?.nativeElement.classList.toggle('hidden');
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
}
