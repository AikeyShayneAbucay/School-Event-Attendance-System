import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../../services/auth';
import { AttendanceService } from '../../../services/attendance';
import { EventService } from '../../../services/event';

@Component({
  selector: 'app-admin-settings',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings implements OnInit {

  adminProfile = {
    fullName: 'System Administrator',
    username: 'admin1',
    password: ''
  };

  systemSettings = {
    campusName: 'USTP Villanueva Campus',
    academicYear: '2026-2027',
    semester: '1st Semester',
    verificationMode: 'Strict Manual Verification (Staff Compare)',
    allowSelfieGallery: false
  };

  totalStudents = 0;
  totalEvents = 0;
  totalRecords = 0;

  savedMessage = '';

  constructor(
    private authService: AuthService,
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminProfile();
    this.loadSystemSettings();
    this.loadSummaryCounts();
  }

  loadAdminProfile(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.adminProfile.fullName = user.fullName || 'System Administrator';
      this.adminProfile.username = user.username || 'admin1';
    }

    const saved = localStorage.getItem('ustp_admin_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) this.adminProfile.fullName = parsed.fullName;
        if (parsed.username) this.adminProfile.username = parsed.username;
        if (parsed.password) this.adminProfile.password = parsed.password;
      } catch {
        // fallback
      }
    }
  }

  loadSystemSettings(): void {
    this.systemSettings = this.authService.getSystemSettings();
  }

  loadSummaryCounts(): void {
    this.totalEvents = this.eventService.getEvents().length;
    this.totalRecords = this.attendanceService.getTotal();

    const accountsStr = localStorage.getItem('ustp_student_accounts');
    if (accountsStr) {
      try {
        this.totalStudents = JSON.parse(accountsStr).length;
      } catch {
        this.totalStudents = 0;
      }
    }
  }

  saveSettings(): void {
    if (!this.adminProfile.fullName.trim() || !this.adminProfile.username.trim()) {
      alert('Please fill out admin profile fields.');
      return;
    }

    this.authService.saveAdminProfile(this.adminProfile);
    this.authService.saveSystemSettings(this.systemSettings);

    this.savedMessage = 'System settings & admin account updated successfully.';
    setTimeout(() => {
      this.savedMessage = '';
    }, 3000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
