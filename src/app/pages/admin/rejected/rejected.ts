import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-admin-rejected',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './rejected.html',
  styleUrl: './rejected.css'
})
export class Rejected implements OnInit {

  records: AttendanceRecord[] = [];
  searchTerm = '';
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
      .getRejectedRecords()
      .reverse();
  }

  get filteredRecords(): AttendanceRecord[] {
    const search = this.searchTerm.trim().toLowerCase();
    if (!search) {
      return this.records;
    }
    return this.records.filter(r =>
      (r.studentName && r.studentName.toLowerCase().includes(search)) ||
      (r.studentId && r.studentId.toLowerCase().includes(search)) ||
      (r.eventTitle && r.eventTitle.toLowerCase().includes(search)) ||
      (r.remarks && r.remarks.toLowerCase().includes(search)) ||
      (r.reviewedBy && r.reviewedBy.toLowerCase().includes(search))
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
