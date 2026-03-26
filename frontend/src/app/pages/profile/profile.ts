import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  learningGoals: string[];
  level: number;
  points: number;
  streak: number;
  badges: any[];
  enrolledCourses: number;
  completedCourses: number;
  totalTimeSpent: number;
  joinDate: Date;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = false;
  error = '';
  isEditing = false;
  editForm = {
    name: '',
    bio: '',
    interests: [] as string[],
    learningGoals: [] as string[]
  };
  newInterest = '';
  newGoal = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getCurrentUser().subscribe({
      next: (response) => {
        this.profile = response.data;
        this.initializeEditForm();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load profile. Please try again.';
        this.loading = false;
        console.error('Error loading profile:', error);
      }
    });
  }

  initializeEditForm(): void {
    if (this.profile) {
      this.editForm = {
        name: this.profile.name,
        bio: this.profile.bio || '',
        interests: [...this.profile.interests],
        learningGoals: [...this.profile.learningGoals]
      };
    }
  }

  startEditing(): void {
    this.isEditing = true;
    this.initializeEditForm();
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.initializeEditForm();
  }

  saveProfile(): void {
    this.apiService.updateProfile(this.editForm).subscribe({
      next: (response) => {
        this.profile = response.data;
        this.isEditing = false;
        alert('Profile updated successfully!');
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    });
  }

  addInterest(): void {
    if (this.newInterest.trim() && !this.editForm.interests.includes(this.newInterest.trim())) {
      this.editForm.interests.push(this.newInterest.trim());
      this.newInterest = '';
    }
  }

  removeInterest(interest: string): void {
    this.editForm.interests = this.editForm.interests.filter(i => i !== interest);
  }

  addGoal(): void {
    if (this.newGoal.trim() && !this.editForm.learningGoals.includes(this.newGoal.trim())) {
      this.editForm.learningGoals.push(this.newGoal.trim());
      this.newGoal = '';
    }
  }

  removeGoal(goal: string): void {
    this.editForm.learningGoals = this.editForm.learningGoals.filter(g => g !== goal);
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  formatTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }

  getLevelProgress(): number {
    if (!this.profile) return 0;
    // Assuming 1000 points per level
    const pointsForCurrentLevel = (this.profile.level - 1) * 1000;
    const pointsForNextLevel = this.profile.level * 1000;
    const progressPoints = this.profile.points - pointsForCurrentLevel;
    const totalPointsNeeded = pointsForNextLevel - pointsForCurrentLevel;
    return Math.min((progressPoints / totalPointsNeeded) * 100, 100);
  }
}