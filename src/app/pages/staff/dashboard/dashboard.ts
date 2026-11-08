import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';

import {
  AuthService
} from '../../../services/auth';

@Component({
  selector: 'app-staff-dashboard',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  total = 0;
  pending = 0;
  accepted = 0;
  rejected = 0;

  staffName = 'Staff / Event In-Charge';
  staffRole = 'Event In-Charge';

  pendingQueue: AttendanceRecord[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStaffInfo();
    this.loadStats();
  }

  loadStaffInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.fullName) {
      this.staffName = user.fullName;
    }
  }

  loadStats(): void {
    this.total = this.attendanceService.getTotal();
    this.pending = this.attendanceService.getPending();
    this.accepted = this.attendanceService.getAccepted();
    this.rejected = this.attendanceService.getRejected();

    this.pendingQueue = this.attendanceService
      .getPendingRecords()
      .slice(0, 5);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
