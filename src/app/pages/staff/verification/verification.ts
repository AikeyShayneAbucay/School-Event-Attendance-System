import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';

import {
  AuthService
} from '../../../services/auth';

@Component({
  selector: 'app-verification',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './verification.html',
  styleUrl: './verification.css'
})
export class Verification implements OnInit {

  records: AttendanceRecord[] = [];
  selectedRecord?: AttendanceRecord;
  remarks = '';

  staffName = 'Staff / Event In-Charge';
  staffRole = 'Event In-Charge';

  actionFeedback = '';

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
    this.records = this.attendanceService
      .getAllRecords()
      .filter(record => String(record.status).toUpperCase() === 'PENDING')
      .reverse();

    if (this.selectedRecord) {
      const stillExists = this.records.find(r => r.id === this.selectedRecord?.id);
      if (!stillExists) {
        this.selectedRecord = this.records.length > 0 ? this.records[0] : undefined;
      }
    } else if (this.records.length > 0) {
      this.selectedRecord = this.records[0];
    }
  }

  selectRecord(record: AttendanceRecord): void {
    this.selectedRecord = record;
    this.remarks = '';
    this.actionFeedback = '';
  }

  accept(): void {
    if (!this.selectedRecord) {
      return;
    }

    const reviewer = this.authService.getUsername() || this.staffName;
    const studentName = this.selectedRecord.studentName;

    this.attendanceService.updateStatus(
      this.selectedRecord.id,
      'ACCEPTED',
      reviewer,
      this.remarks.trim() || 'Verified by event staff'
    );

    this.actionFeedback = `Attendance for ${studentName} was ACCEPTED.`;
    this.remarks = '';
    this.loadRecords();

    setTimeout(() => {
      this.actionFeedback = '';
    }, 3500);
  }

  reject(): void {
    if (!this.selectedRecord) {
      return;
    }

    const reviewer = this.authService.getUsername() || this.staffName;
    const studentName = this.selectedRecord.studentName;

    this.attendanceService.updateStatus(
      this.selectedRecord.id,
      'REJECTED',
      reviewer,
      this.remarks.trim() || 'Selfie does not match registered student profile photo'
    );

    this.actionFeedback = `Attendance for ${studentName} was REJECTED.`;
    this.remarks = '';
    this.loadRecords();

    setTimeout(() => {
      this.actionFeedback = '';
    }, 3500);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
