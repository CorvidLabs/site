import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { ResizableDirective } from '../../../directives/resizable.directive';
import { FloatWindow } from '../float-window/float-window.component';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';
import { CvdCheckboxComponent } from "../../shared/corvid-checkbox/corvid-checkbox.component";

interface RoadmapItem {
  text: string;
  completed: boolean;
}

interface RoadmapSection {
  title: string | null;
  items: RoadmapItem[];
  badge?: 'progress' | 'success';
}

interface RoadmapQuarter {
  id: string;
  quarter: string;
  sections: RoadmapSection[];
  isCurrent: boolean;
}

@Component({
  selector: 'cvd-roadmap-window',
  templateUrl: 'roadmap-window.component.html',
  styleUrls: ['roadmap-window.component.scss'],
  imports: [
    CommonModule, DraggableDirective, ResizableDirective, PixelIconComponent,
    CvdCheckboxComponent
]
})
export class RoadmapWindowComponent extends FloatWindow {
  override title = input<string>('Roadmap');

  // Expanded state for quarters
  expandedQuarters = signal<Set<string>>(new Set(['q4-2025']));

  // Roadmap data
  roadmapData = signal<RoadmapQuarter[]>([
    {
      id: 'q4-2025',
      quarter: 'Q4 2025',
      isCurrent: true,
      sections: [
        {
          title: 'In Progress',
          badge: 'progress',
          items: [
            { text: 'Working on Website', completed: false },
            { text: 'Investigating and building Algorand Python examples', completed: false },
            { text: 'Continue minting NFTs', completed: false },
            { text: 'Algoland quests', completed: false }
          ]
        },
        {
          title: 'Done',
          badge: 'success',
          items: [
            { text: 'Initial planning', completed: true },
            { text: 'Discord open', completed: true },
            { text: 'Website up', completed: true },
            { text: 'Social accounts', completed: true },
            { text: 'Started the NFT collection', completed: true },
            { text: 'Got NFT collection listed on Downbad', completed: true },
            { text: 'Defined benefits of holding the NFT and the ASA', completed: true },
            { text: 'Created the CORVID ASA', completed: true },
            { text: 'Linked the assets with Discord for benefits', completed: true },
            { text: 'Shuffled NFTs using GhettoPigeons', completed: true },
            { text: 'iOS app submitted to the AppStore', completed: true },
            { text: 'Working on some VIP NFTs', completed: true },
            { text: 'Team building exercises', completed: true }
          ]
        }
      ]
    },
    {
      id: 'q1-2026',
      quarter: 'Q1 2026',
      isCurrent: false,
      sections: [
        {
          title: null,
          items: [
            { text: 'Connect software to the NFT / ASA', completed: false },
            { text: 'Continue development on the website', completed: false },
            { text: 'Game Development', completed: false },
            { text: 'Implement NFT holder verification in Website for pro features', completed: false },
            { text: 'Start building Discord bot for automated NFT verification and role assignment', completed: false },
            { text: 'Continue minting Nevermore NFTs (target: 300+ minted by end Q1)', completed: false },
            { text: 'Begin documenting and open sourcing core utilities (Swift packages, Python tools)', completed: false },
            { text: 'Update website with Mono launch details and holder dashboard', completed: false },
            { text: 'Expand website with tutorials and documentation for open source tools', completed: false }
          ]
        }
      ]
    },
    {
      id: 'q2-2026',
      quarter: 'Q2 2026',
      isCurrent: false,
      sections: [
        {
          title: null,
          items: [
            { text: 'Continue building Discord bot for automated NFT verification and role assignment', completed: false },
            { text: 'Implement NFT holder verification in Mono for pro features', completed: false },
            { text: 'Begin Mono v2.0 development (Applet Process Manager, concurrent tasks)', completed: false },
            { text: 'Gather and integrate Mono v1.0 user feedback', completed: false },
            { text: 'Continue minting Nevermore NFTs (target: 500+ minted by end Q2)', completed: false },
            { text: 'Create educational content: "Building on Algorand with Swift" series', completed: false },
            { text: 'Monthly development progress updates and transparency reports', completed: false }
          ]
        }
      ]
    },
    {
      id: 'q3-2026',
      quarter: 'Q3 2026',
      isCurrent: false,
      sections: [
        {
          title: null,
          items: [
            { text: 'Ship Mono v2.0 with concurrent applets and platform features', completed: false },
            { text: 'Continue minting Nevermore NFTs (target: 700+ minted by end Q3)', completed: false },
            { text: 'Release open source Rust tools (if Algorand smart contract work begins)', completed: false },
            { text: 'Launch Mono v2.0 marketing campaign highlighting NFT holder exclusive features', completed: false },
            { text: 'Expand open source library collection (5+ new Swift packages, 3+ Python tools)', completed: false },
            { text: 'Begin work on additional "mono applets" based on community voting', completed: false },
            { text: 'Host community hackathon or builder event with prizes', completed: false },
            { text: 'Establish Corvid Labs presence at Algorand community events', completed: false },
            { text: 'Create comprehensive developer documentation hub on website', completed: false },
            { text: 'Launch contributor recognition program for open source contributions', completed: false },
            { text: 'Discord community growth initiatives (target: 300+ members by end Q3)', completed: false }
          ]
        }
      ]
    },
    {
      id: 'q4-2026',
      quarter: 'Q4 2026',
      isCurrent: false,
      sections: [
        {
          title: null,
          items: [
            { text: 'Polish and expand Mono v2.0 based on user feedback', completed: false },
            { text: 'Complete Nevermore NFT minting (target: 850+ community allocation complete)', completed: false },
            { text: 'Launch Phase 3 Mono features (Cloud Sync, Advanced Weather, etc.) for NFT holders', completed: false },
            { text: 'Release major open source framework consolidation (unified Algorand Swift SDK)', completed: false },
            { text: 'Host year-end community celebration and 2027 roadmap reveal', completed: false },
            { text: 'Publish case studies: "How we built Corvid Labs on Algorand"', completed: false },
            { text: 'Expand cross-platform exploration (macOS improvements, web prototype research)', completed: false },
            { text: 'Establish recurring revenue streams from Mono App Store sales', completed: false },
            { text: 'Launch governance proposals for community-voted 2027 priorities', completed: false },
            { text: 'Discord community target: 400+ members', completed: false },
            { text: 'NFT holder target: 800+ holders', completed: false },
            { text: 'Document full year retrospective and lessons learned', completed: false },
            { text: 'Plan potential second collection or utility expansion (if validated by community)', completed: false },
            { text: 'Strengthen team capacity and evaluate strategic hires for 2027', completed: false }
          ]
        }
      ]
    }
  ]);

  // Computed statistics
  totalQuarters = computed(() => this.roadmapData().length);

  totalItems = computed(() => {
    return this.roadmapData().reduce((total, quarter) => {
      return total + quarter.sections.reduce((sum, section) => sum + section.items.length, 0);
    }, 0);
  });

  completedItems = computed(() => {
    return this.roadmapData().reduce((total, quarter) => {
      return total + quarter.sections.reduce((sum, section) => {
        return sum + section.items.filter(item => item.completed).length;
      }, 0);
    }, 0);
  });

  constructor() {
    super();
    this.width.set(800);
    this.height.set(600);
  }

  // Toggle quarter expansion
  toggleQuarter(quarterId: string): void {
    const expanded = new Set(this.expandedQuarters());
    if (expanded.has(quarterId)) {
      expanded.delete(quarterId);
    } else {
      expanded.add(quarterId);
    }
    this.expandedQuarters.set(expanded);
  }

  // Check if quarter is expanded
  quarterExpanded(quarterId: string): boolean {
    return this.expandedQuarters().has(quarterId);
  }

  // Get quarter progress percentage
  getQuarterProgress(quarter: RoadmapQuarter): number {
    const total = this.getTotalCount(quarter);
    const completed = this.getCompletedCount(quarter);
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  // Get total item count for quarter
  getTotalCount(quarter: RoadmapQuarter): number {
    return quarter.sections.reduce((sum, section) => sum + section.items.length, 0);
  }

  // Get completed item count for quarter
  getCompletedCount(quarter: RoadmapQuarter): number {
    return quarter.sections.reduce((sum, section) => {
      return sum + section.items.filter(item => item.completed).length;
    }, 0);
  }
}