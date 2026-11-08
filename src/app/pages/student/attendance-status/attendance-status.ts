import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';
import { StudentService } from '../../../services/student';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-attendance-status',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './attendance-status.html',
  styleUrl: './attendance-status.css'
})
export class AttendanceStatus implements OnInit {

  records: AttendanceRecord[] = [];

  studentName = 'Student';
  studentSection = '';
  studentPhoto = '';

  totalCount = 0;
  pendingCount = 0;
  acceptedCount = 0;
  rejectedCount = 0;

  filterStatus = 'ALL';

  constructor(
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStudent();
    this.loadRecords();
  }

  loadStudent(): void {
    const profile = this.studentService.getProfile();
    this.studentName = profile.fullName || 'Student';
    this.studentSection = profile.section || '';
    this.studentPhoto = profile.profilePhoto || '';
  }

  loadRecords(): void {
    const studentId = this.studentService.getStudentId();
    this.records = this.attendanceService
      .getRecordsByStudent(studentId)
      .reverse();

    this.totalCount = this.records.length;
    this.pendingCount = this.records.filter(r => String(r.status).toUpperCase() === 'PENDING').length;
    this.acceptedCount = this.records.filter(r => String(r.status).toUpperCase() === 'ACCEPTED').length;
    this.rejectedCount = this.records.filter(r => String(r.status).toUpperCase() === 'REJECTED').length;
  }

  get filteredRecords(): AttendanceRecord[] {
    if (this.filterStatus === 'ALL') {
      return this.records;
    }
    return this.records.filter(r => String(r.status).toUpperCase() === this.filterStatus);
  }

  setFilter(status: string): void {
    this.filterStatus = status;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
