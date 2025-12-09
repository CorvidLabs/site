import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, input, model, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/**
 * Pixel Checkbox Component
 *
 * A reusable checkbox component with NES pixel styling that supports:
 * - Two-way binding via model()
 * - FormControl integration
 * - Change events (only when value actually changes)
 * - Disabled state (from input or FormControl)
 *
 * Usage:
 * // Two-way binding
 * <app-pixel-checkbox [(checked)]="myValue" label="Enable feature" />
 *
 * // FormControl
 * <app-pixel-checkbox [control]="myControl" label="Enable feature" />
 *
 * // With change event
 * <app-pixel-checkbox [(checked)]="myValue" (valueChange)="onChange($event)" />
 *
 * // Custom label content
 * <app-pixel-checkbox [(checked)]="myValue">
 *   Enable <strong>advanced</strong> feature
 * </app-pixel-checkbox>
 */
@Component({
  selector: 'cvd-checkbox',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <label class="nes-checkbox" [class.disabled]="isDisabled()">
      <input
        type="checkbox"
        [checked]="internalChecked()"
        [disabled]="isDisabled()"
        (click)="onCheckboxClick($event)"
      />
      <span></span>
      @if (label()) {
        {{ label() }}
      } @else {
        <ng-content></ng-content>
      }
    </label>
  `,
  styles: [`
    :host {
      display: inline-block;
    }

    // .nes-checkbox.disabled {
    //   cursor: not-allowed;
    // }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CvdCheckboxComponent {
  // API
  checked = model<boolean>(false);
  control = input<FormControl<boolean> | undefined>();
  disabled = input<boolean>(false);
  label = input<string | undefined>();
  valueChange = output<boolean>();

  // Internal state
  protected internalChecked = signal<boolean>(false);
  private isUpdatingFromControl = false;
  private previousValue: boolean | null = null;

  // Computed
  isDisabled = computed(() => {
    const ctrl = this.control();
    const inputDisabled = this.disabled();
    return inputDisabled || (ctrl?.disabled ?? false);
  });

  constructor() {
    // Effect 1: Sync model to internal state
    effect(() => {
      const modelValue = this.checked();
      if (this.internalChecked() !== modelValue && !this.isUpdatingFromControl) {
        this.internalChecked.set(modelValue);
      }
    }, { allowSignalWrites: true });

    // Effect 2: Sync FormControl to internal state
    effect((onCleanup) => {
      const ctrl = this.control();
      if (ctrl) {
        // Initial sync
        const controlValue = ctrl.value ?? false;
        if (this.internalChecked() !== controlValue) {
          this.isUpdatingFromControl = true;
          this.internalChecked.set(controlValue);
          this.checked.set(controlValue);
          this.isUpdatingFromControl = false;
        }

        // Subscribe to changes
        const subscription = ctrl.valueChanges.subscribe(value => {
          const newValue = value ?? false;
          if (this.internalChecked() !== newValue) {
            this.isUpdatingFromControl = true;
            this.internalChecked.set(newValue);
            this.checked.set(newValue);
            this.isUpdatingFromControl = false;
          }
        });

        // Cleanup
        onCleanup(() => subscription.unsubscribe());
      }
    }, { allowSignalWrites: true });

    // Effect 3: Emit valueChange only on actual changes
    effect(() => {
      const currentValue = this.internalChecked();

      if (!this.isUpdatingFromControl && this.previousValue !== currentValue) {
        if (this.previousValue !== null) {
          this.valueChange.emit(currentValue);
        }
        this.previousValue = currentValue;
      }
    });
  }

  protected onCheckboxClick(event: Event): void {
    event.preventDefault();

    if (this.isDisabled()) {
      return;
    }

    const newValue = !this.internalChecked();

    this.internalChecked.set(newValue);
    this.checked.set(newValue);

    const ctrl = this.control();
    if (ctrl && !ctrl.disabled) {
      ctrl.setValue(newValue);
      ctrl.markAsTouched();
      ctrl.markAsDirty();
    }
  }
}
