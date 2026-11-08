import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  EventService,
  SchoolEvent
} from '../../../services/event';
import { StudentService } from '../../../services/student';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-events',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  events: SchoolEvent[] = [];

  studentName = 'Student';
  studentSection = '';
  studentPhoto = '';

  constructor(
    private eventService: EventService,
    private studentService: StudentService,
    private authService: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.events = this.eventService.getEvents();
    this.loadStudentInformation();
  }

  loadStudentInformation(): void {
    const profile = this.studentService.getProfile();
    this.studentName = profile.fullName || 'Student';
    this.studentSection = profile.section || '';
    this.studentPhoto = profile.profilePhoto || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
