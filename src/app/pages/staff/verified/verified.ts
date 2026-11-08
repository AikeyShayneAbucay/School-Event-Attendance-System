import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-staff-verified',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './verified.html',
  styleUrl: './verified.css'
})
export class Verified implements OnInit {

  records: AttendanceRecord[] = [];
  searchTerm = '';
  statusFilter = 'ALL';
  staffName = 'Staff / Event In-Charge';

  acceptedTotal = 0;
  rejectedTotal = 0;

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStaffInfo();
    this.loadRecords();
  }

  loadStaffInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.fullName) {
      this.staffName = user.fullName;
    }
  }

  loadRecords(): void {
    const all = this.attendanceService.getAllRecords();
    this.records = all
      .filter(r => r.status === 'ACCEPTED' || r.status === 'REJECTED')
      .reverse();

    this.acceptedTotal = all.filter(r => r.status === 'ACCEPTED').length;
    this.rejectedTotal = all.filter(r => r.status === 'REJECTED').length;
  }

  get filteredRecords(): AttendanceRecord[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.records.filter(record => {
      const matchesSearch = !search ||
        (record.studentName && record.studentName.toLowerCase().includes(search)) ||
        (record.studentId && record.studentId.toLowerCase().includes(search)) ||
        (record.section && record.section.toLowerCase().includes(search)) ||
        (record.eventTitle && record.eventTitle.toLowerCase().includes(search)) ||
        (record.date && record.date.toLowerCase().includes(search)) ||
        (record.remarks && record.remarks.toLowerCase().includes(search));

      const matchesStatus = this.statusFilter === 'ALL' ||
        record.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
