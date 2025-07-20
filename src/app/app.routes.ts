import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard.component';
import { ProducersComponent } from './pages/producers.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'producers', component: ProducersComponent },
];
