import { Component, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FloatWindow } from '../float-window/float-window.component';
import { DraggableDirective } from '../../../directives/draggable.directive';
import { CommonModule } from '@angular/common';
import { PixelIconComponent } from '../../shared/pixel-icon/pixel-icon.component';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  createdAt: string;
  endsAt?: string;
}

const STORAGE_KEY = 'corvid_poll_votes';
const POLL_DATA_KEY = 'corvid_poll_data';

// Default poll - can be changed via config
const DEFAULT_POLL: Poll = {
  id: 'poll_001',
  question: 'What feature should we build next?',
  options: [
    { id: 'opt_1', text: 'On-chain voting system', votes: 12 },
    { id: 'opt_2', text: 'NFT staking rewards', votes: 8 },
    { id: 'opt_3', text: 'Community chat room', votes: 15 },
    { id: 'opt_4', text: 'Rarity checker tool', votes: 5 }
  ],
  createdAt: new Date().toISOString()
};

@Component({
  selector: 'app-poll-window',
  imports: [CommonModule, DraggableDirective, PixelIconComponent],
  templateUrl: 'poll-window.component.html',
  styleUrls: ['poll-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollWindowComponent extends FloatWindow implements OnInit {
  poll = signal<Poll>(DEFAULT_POLL);
  userVote = signal<string | null>(null);
  hasVoted = computed(() => this.userVote() !== null);

  totalVotes = computed(() => {
    return this.poll().options.reduce((sum, opt) => sum + opt.votes, 0);
  });

  optionsWithPercentage = computed(() => {
    const total = this.totalVotes();
    return this.poll().options.map(opt => ({
      ...opt,
      percentage: total > 0 ? Math.round((opt.votes / total) * 100) : 0
    }));
  });

  constructor() {
    super();
    this.title = 'Community Poll';
    this.width.set(400);
    this.height.set(450);
  }

  ngOnInit() {
    this.loadPollData();
    this.loadUserVote();
  }

  private loadPollData(): void {
    try {
      const storedPoll = localStorage.getItem(POLL_DATA_KEY);
      if (storedPoll) {
        const parsedPoll = JSON.parse(storedPoll) as Poll;
        // Only use stored poll if it matches current poll ID
        if (parsedPoll.id === DEFAULT_POLL.id) {
          this.poll.set(parsedPoll);
        } else {
          // New poll, reset storage
          this.savePollData(DEFAULT_POLL);
          this.poll.set(DEFAULT_POLL);
        }
      } else {
        this.savePollData(DEFAULT_POLL);
      }
    } catch {
      this.poll.set(DEFAULT_POLL);
    }
  }

  private savePollData(poll: Poll): void {
    try {
      localStorage.setItem(POLL_DATA_KEY, JSON.stringify(poll));
    } catch {
      // localStorage might be full or disabled
    }
  }

  private loadUserVote(): void {
    try {
      const storedVotes = localStorage.getItem(STORAGE_KEY);
      if (storedVotes) {
        const votes = JSON.parse(storedVotes) as Record<string, string>;
        const currentPollVote = votes[this.poll().id];
        if (currentPollVote) {
          this.userVote.set(currentPollVote);
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }

  private saveUserVote(optionId: string): void {
    try {
      const storedVotes = localStorage.getItem(STORAGE_KEY);
      const votes = storedVotes ? JSON.parse(storedVotes) : {};
      votes[this.poll().id] = optionId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch {
      // localStorage might be full or disabled
    }
  }

  vote(optionId: string): void {
    if (this.hasVoted()) {
      return; // Already voted
    }

    // Update local state
    this.userVote.set(optionId);

    // Update poll options with new vote
    const currentPoll = this.poll();
    const updatedOptions = currentPoll.options.map(opt => ({
      ...opt,
      votes: opt.id === optionId ? opt.votes + 1 : opt.votes
    }));

    const updatedPoll = { ...currentPoll, options: updatedOptions };
    this.poll.set(updatedPoll);

    // Persist to localStorage
    this.saveUserVote(optionId);
    this.savePollData(updatedPoll);
  }

  isSelected(optionId: string): boolean {
    return this.userVote() === optionId;
  }

  resetVote(): void {
    const currentVote = this.userVote();
    if (!currentVote) return;

    // Decrement the vote count
    const currentPoll = this.poll();
    const updatedOptions = currentPoll.options.map(opt => ({
      ...opt,
      votes: opt.id === currentVote ? Math.max(0, opt.votes - 1) : opt.votes
    }));

    const updatedPoll = { ...currentPoll, options: updatedOptions };
    this.poll.set(updatedPoll);
    this.savePollData(updatedPoll);

    // Clear user vote
    this.userVote.set(null);
    try {
      const storedVotes = localStorage.getItem(STORAGE_KEY);
      if (storedVotes) {
        const votes = JSON.parse(storedVotes);
        delete votes[this.poll().id];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
      }
    } catch {
      // Ignore errors
    }
  }
}
