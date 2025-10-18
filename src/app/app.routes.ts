import { Routes } from '@angular/router';
import { StaticLanding } from './components/static-landing/static-landing';
import { MainViewComponent } from './components/new-landing/main-view.component';

export const routes: Routes = [
  {
    path: '',
    component: StaticLanding
  },
  {
    path: 'new-page',
    component: MainViewComponent
  }
];
