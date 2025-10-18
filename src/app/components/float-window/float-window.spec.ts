import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatWindow } from './float-window';

describe('FloatWindow', () => {
  let component: FloatWindow;
  let fixture: ComponentFixture<FloatWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatWindow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
