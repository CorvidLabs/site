import { CommonModule } from '@angular/common';
import { Component, OnInit, InputSignal, input, OutputEmitterRef, output } from '@angular/core';
import { PixelIconComponent } from '../shared/pixel-icon/pixel-icon.component';

@Component({
  selector: 'cvd-slider',
  templateUrl: 'slider.component.html',
  styleUrls: ['slider.component.scss'],
  imports: [CommonModule, PixelIconComponent]
})
export class CvdSliderComponent  {
  style: InputSignal<string> = input<string>('');
  label: InputSignal<string> = input<string>('');
  showValueLabel: InputSignal<boolean> = input<boolean>(true);

  icon: InputSignal<string | null> = input<string | null>(null);
  iconSize: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('md');

  min: InputSignal<number> = input(0);
  max: InputSignal<number> = input(100);

  value: InputSignal<number> = input(0);

  valueChange: OutputEmitterRef<number> = output<number>();
  percentageChanged: OutputEmitterRef<number> = output<number>();

  barStyle: InputSignal<'smooth' | 'pixelated'> = input<'smooth' | 'pixelated'>('smooth');

  // Slider position as 0–100 percentage
  percentage = 0;

  // Math reference for template
  protected readonly Math = Math;

  ngOnInit() {
    this.percentage = (this.value() - this.min()) / (this.max() - this.min()) * 100;
  }

  onElementInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.percentage = Number(target.value);

    const mappedValue = this.min() + (this.percentage / 100) * (this.max() - this.min());

    this.valueChange.emit(mappedValue);
    this.percentageChanged.emit(this.percentage);
  }
}