import { Routes } from '@angular/router';
import { MainComponent } from './layout/main/main.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProducersComponent } from './pages/producers/producers.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'producers', component: ProducersComponent },
    ],
  },
  { path: '**', redirectTo: 'login' } // rota coringa
];
