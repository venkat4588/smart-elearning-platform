import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  instructor: {
    name: string;
  };
  rating: number;
  enrolledCount: number;
  duration: number;
  thumbnail?: string;
  isEnrolled?: boolean;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './courses.html',
  styleUrls: ['./courses.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = false;
  error = '';
  searchTerm = '';
  selectedCategory = '';
  selectedLevel = '';
  categories: string[] = [];
  levels: string[] = ['Beginner', 'Intermediate', 'Advanced'];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.loading = true;
    this.error = '';

    this.apiService.getCourses().subscribe({
      next: (response) => {
        this.courses = response.data;
        this.filteredCourses = [...this.courses];
        this.extractCategories();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load courses. Please try again.';
        this.loading = false;
        console.error('Error loading courses:', error);
      }
    });
  }

  extractCategories(): void {
    const categorySet = new Set(this.courses.map(course => course.category));
    this.categories = Array.from(categorySet).sort();
  }

  filterCourses(): void {
    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = !this.selectedCategory || course.category === this.selectedCategory;
      const matchesLevel = !this.selectedLevel || course.level === this.selectedLevel;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }

  onSearchChange(): void {
    this.filterCourses();
  }

  onCategoryChange(): void {
    this.filterCourses();
  }

  onLevelChange(): void {
    this.filterCourses();
  }

  enrollInCourse(courseId: string): void {
    this.apiService.enrollInCourse(courseId).subscribe({
      next: (response) => {
        // Update the course in the list to show enrolled status
        const course = this.courses.find(c => c._id === courseId);
        if (course) {
          course.isEnrolled = true;
        }
        this.filterCourses();
        alert('Successfully enrolled in the course!');
      },
      error: (error) => {
        console.error('Error enrolling in course:', error);
        alert('Failed to enroll in the course. Please try again.');
      }
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedLevel = '';
    this.filteredCourses = [...this.courses];
  }

  getDifficultyColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'danger';
      default: return 'secondary';
    }
  }
}