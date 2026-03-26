import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="main-layout">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .main-layout {
      min-height: calc(100vh - 76px); /* Subtract navbar height */
    }
  `]
})
export class MainLayoutComponent {}