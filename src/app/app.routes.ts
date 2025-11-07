import { Routes } from '@angular/router';
import { StaticLanding } from './components/static-landing/static-landing';
import { MainViewComponent } from './components/main-view/main-view.component';

export const routes: Routes = [
  {
    path: '',
    // component: StaticLanding
    component: MainViewComponent
  },
  {
    path: 'old-landing',
    component: StaticLanding
  }
];
