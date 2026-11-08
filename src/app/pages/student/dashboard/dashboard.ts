import {
  Component,
  OnInit,
  OnDestroy
} from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd
} from '@angular/router';

import { Auth } from '../../../services/auth';
import { AttendanceService } from '../../../services/attendance';
import { StudentService } from '../../../services/student';
import { EventService, SchoolEvent } from '../../../services/event';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {

  /*
   * ==========================================
   * STUDENT INFORMATION
   * ==========================================
   */

  studentName = 'Student';
  studentFirstName = 'Student';
  studentSection = 'BSIT - 3B';
  studentPhoto = '';
  profilePhoto = '';

  /*
   * ==========================================
   * ATTENDANCE & EVENT COUNTERS
   * ==========================================
   */

  totalEvents = 5;
  totalAttendance = 3;
  pending = 1;
  accepted = 1;
  rejected = 0;

  pendingAttendance = 1;
  acceptedAttendance = 1;
  rejectedAttendance = 0;

  attendanceRate = 80;
  donutStrokeDashoffset = 50.26; // 251.32 * (1 - 0.8)

  upcomingEvent: SchoolEvent | null = null;

  private profileUpdateListener = () => {
    this.loadStudentInformation();
    this.loadAttendanceInformation();
  };

  private routerSubscription: any;

  constructor(
    private router: Router,
    private authService: Auth,
    private attendanceService: AttendanceService,
    private studentService: StudentService,
    private eventService: EventService
  ) {
    this.loadStudentInformation();
    this.loadAttendanceInformation();
  }

  ngOnInit(): void {
    this.loadStudentInformation();
    this.loadAttendanceInformation();

    window.addEventListener(
      'profileUpdated',
      this.profileUpdateListener
    );

    this.routerSubscription =
      this.router.events
        .pipe(
          filter(
            event => event instanceof NavigationEnd
          )
        )
        .subscribe(() => {
          this.loadStudentInformation();
          this.loadAttendanceInformation();
        });
  }

  ngOnDestroy(): void {
    window.removeEventListener(
      'profileUpdated',
      this.profileUpdateListener
    );

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadStudentInformation(): void {
    const profile = this.studentService.getProfile();
    this.studentName = profile.fullName || 'Student';
    this.studentSection = profile.section || 'BSIT - 3B';
    this.studentPhoto = profile.profilePhoto || '';
    this.profilePhoto = profile.profilePhoto || '';

    const parts = this.studentName.trim().split(' ');
    this.studentFirstName = parts.length > 1 ? `${parts[0]} ${parts[1]}` : parts[0] || 'Student';
  }

  loadAttendanceInformation(): void {
    const studentId = this.studentService.getStudentId();
    const studentRecords = this.attendanceService.getRecordsByStudent(studentId);

    // If records exist for this student, use actual counts
    if (studentRecords.length > 0) {
      this.totalAttendance = studentRecords.length;

      this.pending = studentRecords.filter(
        record => String(record.status).toUpperCase() === 'PENDING'
      ).length;

      this.accepted = studentRecords.filter(
        record => String(record.status).toUpperCase() === 'ACCEPTED'
      ).length;

      this.rejected = studentRecords.filter(
        record => String(record.status).toUpperCase() === 'REJECTED'
      ).length;

      this.attendanceRate = Math.round((this.accepted / this.totalAttendance) * 100);
    } else {
      // Default initial baseline figures matching reference
      this.totalAttendance = 3;
      this.pending = 1;
      this.accepted = 1;
      this.rejected = 0;
      this.attendanceRate = 80;
    }

    this.pendingAttendance = this.pending;
    this.acceptedAttendance = this.accepted;
    this.rejectedAttendance = this.rejected;

    // Circumference = 2 * PI * 40 ~= 251.32
    const circumference = 251.32;
    this.donutStrokeDashoffset = circumference * (1 - (this.attendanceRate / 100));

    // Load Events
    const events = this.eventService.getEvents();
    this.totalEvents = events.length > 0 ? events.length : 5;
    this.upcomingEvent = events.find(e => e.status === 'Open') || events[0] || {
      id: 1,
      title: 'IT Week 2026',
      description: 'A week-long celebration of Information Technology.',
      date: 'November 8-14, 2026',
      time: '8:00 AM - 5:00 PM',
      venue: 'USTP Villanueva Campus',
      status: 'Open'
    };
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
