import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';

interface Badge {
  _id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  earnedAt?: Date;
  progress?: {
    current: number;
    target: number;
    percentage: number;
  };
}

interface BadgeCategory {
  name: string;
  badges: Badge[];
}

@Component({
  selector: 'app-badges',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './badges.html',
  styleUrls: ['./badges.css']
})
export class BadgesComponent implements OnInit {
  badges: Badge[] = [];
  earnedBadges: Badge[] = [];
  availableBadges: Badge[] = [];
  categories: BadgeCategory[] = [];
  loading = false;
  error = '';
  activeCategory = 'all';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadBadges();
  }

  loadBadges(): void {
    this.loading = true;
    this.error = '';

    // For now, we'll simulate loading badges since the backend might not have this endpoint yet
    // In a real implementation, you'd call this.apiService.getBadges()
    this.simulateBadges();
    this.loading = false;
  }

  simulateBadges(): void {
    // Simulated badge data
    this.badges = [
      {
        _id: '1',
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: 'fas fa-walking',
        category: 'Learning',
        rarity: 'common',
        points: 10,
        earnedAt: new Date('2024-01-15')
      },
      {
        _id: '2',
        name: 'Quiz Master',
        description: 'Score 100% on a quiz',
        icon: 'fas fa-brain',
        category: 'Achievement',
        rarity: 'rare',
        points: 50,
        earnedAt: new Date('2024-01-20')
      },
      {
        _id: '3',
        name: 'Streak Champion',
        description: 'Maintain a 7-day learning streak',
        icon: 'fas fa-fire',
        category: 'Consistency',
        rarity: 'epic',
        points: 100,
        earnedAt: new Date('2024-02-01')
      },
      {
        _id: '4',
        name: 'Course Conqueror',
        description: 'Complete 5 courses',
        icon: 'fas fa-graduation-cap',
        category: 'Milestone',
        rarity: 'legendary',
        points: 200,
        earnedAt: new Date('2024-02-10')
      },
      {
        _id: '5',
        name: 'Speed Learner',
        description: 'Complete a course in record time',
        icon: 'fas fa-rocket',
        category: 'Achievement',
        rarity: 'epic',
        points: 75,
        progress: {
          current: 3,
          target: 5,
          percentage: 60
        }
      },
      {
        _id: '6',
        name: 'Knowledge Seeker',
        description: 'Enroll in 10 different courses',
        icon: 'fas fa-search',
        category: 'Exploration',
        rarity: 'rare',
        points: 30,
        progress: {
          current: 7,
          target: 10,
          percentage: 70
        }
      }
    ];

    this.earnedBadges = this.badges.filter(badge => badge.earnedAt);
    this.availableBadges = this.badges.filter(badge => !badge.earnedAt);

    this.groupBadgesByCategory();
  }

  groupBadgesByCategory(): void {
    const categoryMap = new Map<string, Badge[]>();

    this.badges.forEach(badge => {
      if (!categoryMap.has(badge.category)) {
        categoryMap.set(badge.category, []);
      }
      categoryMap.get(badge.category)!.push(badge);
    });

    this.categories = Array.from(categoryMap.entries()).map(([name, badges]) => ({
      name,
      badges
    }));
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
  }

  getFilteredBadges(): Badge[] {
    if (this.activeCategory === 'all') {
      return this.badges;
    }
    if (this.activeCategory === 'earned') {
      return this.earnedBadges;
    }
    if (this.activeCategory === 'available') {
      return this.availableBadges;
    }
    return this.badges.filter(badge => badge.category === this.activeCategory);
  }

  getRarityColor(rarity: string): string {
    switch (rarity) {
      case 'common': return 'secondary';
      case 'rare': return 'info';
      case 'epic': return 'warning';
      case 'legendary': return 'danger';
      default: return 'secondary';
    }
  }

  getRarityIcon(rarity: string): string {
    switch (rarity) {
      case 'common': return 'fas fa-circle';
      case 'rare': return 'fas fa-gem';
      case 'epic': return 'fas fa-crown';
      case 'legendary': return 'fas fa-star';
      default: return 'fas fa-circle';
    }
  }

  isEarned(badge: Badge): boolean {
    return !!badge.earnedAt;
  }

  getEarnedCount(): number {
    return this.earnedBadges.length;
  }

  getTotalCount(): number {
    return this.badges.length;
  }

  getCompletionPercentage(): number {
    return Math.round((this.getEarnedCount() / this.getTotalCount()) * 100);
  }
}