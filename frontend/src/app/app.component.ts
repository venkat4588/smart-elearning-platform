import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { filter as filterOp } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Smart E-Learning Platform';
  isLoggedIn = false;
  currentUser: any = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      this.isLoggedIn = true;
      // In a real app, you'd decode the token to get user info
      this.currentUser = { name: 'John Doe', role: 'student' };
    }

    // Listen to route changes to update login status
    this.router.events
      .pipe(filterOp(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginStatus();
      });
  }

  checkLoginStatus() {
    const token = localStorage.getItem('token');
    this.isLoggedIn = !!token;
    if (this.isLoggedIn) {
      // Update current user info if needed
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.currentUser = null;
    this.router.navigate(['/home']);
  }
}