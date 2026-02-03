import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'skeleton-card.component.html',
  styleUrls: ['skeleton-card.component.scss']
})
export class SkeletonCardComponent {}
