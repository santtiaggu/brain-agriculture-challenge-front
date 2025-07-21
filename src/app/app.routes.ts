import { Routes } from '@angular/router';
import { MainComponent } from './layout/main/main.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ProducersComponent } from './pages/producers.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'producers', component: ProducersComponent },
    ],
  },
];
