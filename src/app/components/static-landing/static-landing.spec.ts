import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticLanding } from './static-landing';

describe('StaticLanding', () => {
  let component: StaticLanding;
  let fixture: ComponentFixture<StaticLanding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticLanding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaticLanding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
