import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, CommonModule], 
  templateUrl : './app.component.html',
  styleUrls : ['./app.component.scss']
})
export class AppComponent {
  title = 'helper-management-frontend';
  
  isHome(): boolean {
    return window.location.pathname === '/helpers';
  }
}
