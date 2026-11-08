import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-attendance',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class Attendance implements OnInit {

  records: AttendanceRecord[] = [];
  searchTerm = '';
  selectedStatus = 'ALL';

  adminName = 'System Administrator';

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminInfo();
    this.loadRecords();
  }

  loadAdminInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.fullName) {
      this.adminName = user.fullName;
    }
  }

  loadRecords(): void {
    this.records = this.attendanceService
      .getAllRecords()
      .reverse();
  }

  get filteredRecords(): AttendanceRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.records.filter(record => {
      const matchesSearch = !search ||
        (record.studentName && record.studentName.toLowerCase().includes(search)) ||
        (record.studentId && record.studentId.toLowerCase().includes(search)) ||
        (record.section && record.section.toLowerCase().includes(search)) ||
        (record.department && record.department.toLowerCase().includes(search)) ||
        (record.eventTitle && record.eventTitle.toLowerCase().includes(search)) ||
        (record.status && record.status.toLowerCase().includes(search));

      const matchesStatus = this.selectedStatus === 'ALL' ||
        String(record.status).toUpperCase() === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  deleteRecord(id: number): void {
    const confirmed = confirm('Are you sure you want to remove this attendance record?');
    if (!confirmed) {
      return;
    }
    this.attendanceService.deleteRecord(id);
    this.loadRecords();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
