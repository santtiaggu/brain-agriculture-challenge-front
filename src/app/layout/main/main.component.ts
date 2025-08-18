import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-layout-main',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class MainComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}
