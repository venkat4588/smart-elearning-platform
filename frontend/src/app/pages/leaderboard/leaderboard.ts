import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface LeaderboardEntry {
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rank: number;
  points: number;
  level: number;
  coursesCompleted: number;
  quizzesPassed: number;
  streak: number;
}

interface UserRank {
  rank: number;
  points: number;
  level: number;
  nextLevelPoints: number;
  progressToNext: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.css']
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  userRank: UserRank | null = null;
  loading = false;
  error = '';
  activeTab = 'points';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadLeaderboard();
    this.loadUserRank();
  }

  loadLeaderboard(type: string = 'points'): void {
    this.loading = true;
    this.error = '';

    this.apiService.getLeaderboard(type).subscribe({
      next: (response) => {
        this.leaderboard = response.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load leaderboard. Please try again.';
        this.loading = false;
        console.error('Error loading leaderboard:', error);
      }
    });
  }

  loadUserRank(): void {
    this.apiService.getUserRank().subscribe({
      next: (response) => {
        this.userRank = response.data;
      },
      error: (error) => {
        console.error('Error loading user rank:', error);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.loadLeaderboard(tab);
  }

  getRankIcon(rank: number): string {
    switch (rank) {
      case 1: return 'fas fa-crown text-warning';
      case 2: return 'fas fa-medal text-secondary';
      case 3: return 'fas fa-award text-warning';
      default: return 'fas fa-trophy text-muted';
    }
  }

  getRankBadgeClass(rank: number): string {
    if (rank <= 3) return 'bg-warning text-dark';
    if (rank <= 10) return 'bg-info';
    return 'bg-secondary';
  }

  getLevelColor(level: number): string {
    if (level >= 20) return 'text-danger';
    if (level >= 15) return 'text-warning';
    if (level >= 10) return 'text-info';
    if (level >= 5) return 'text-success';
    return 'text-muted';
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  isCurrentUser(userId: string): boolean {
    // This would need to be implemented based on authentication
    return false;
  }
}
