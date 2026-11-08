import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';

import {
  EventService
} from '../../../services/event';

import {
  AuthService
} from '../../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  totalAttendance = 0;
  pending = 0;
  accepted = 0;
  rejected = 0;
  totalEvents = 0;

  adminName = 'System Administrator';
  adminRole = 'Administrator';

  recentRecords: AttendanceRecord[] = [];

  constructor(
    private attendanceService: AttendanceService,
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdminInfo();
    this.loadStats();
  }

  loadAdminInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.fullName) {
      this.adminName = user.fullName;
    }
  }

  loadStats(): void {
    this.totalAttendance = this.attendanceService.getTotal();
    this.pending = this.attendanceService.getPending();
    this.accepted = this.attendanceService.getAccepted();
    this.rejected = this.attendanceService.getRejected();
    this.totalEvents = this.eventService.getEvents().length;

    this.recentRecords = this.attendanceService
      .getAllRecords()
      .slice(-5)
      .reverse();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
