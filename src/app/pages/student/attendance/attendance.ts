import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  EventService,
  SchoolEvent
} from '../../../services/event';

import {
  AttendanceService
} from '../../../services/attendance';

import {
  StudentService,
  StudentProfile
} from '../../../services/student';

@Component({
  selector: 'app-student-attendance',
  imports: [RouterLink],
  templateUrl: './attendance.html',
  styleUrl: './attendance.css'
})
export class Attendance implements OnInit, OnDestroy {

  event?: SchoolEvent;

  student!: StudentProfile;

  videoStream: MediaStream | null = null;

  cameraStarted = false;

  cameraError = '';

  capturedSelfie = '';

  submitted = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private studentService: StudentService,
    private attendanceService: AttendanceService
  ) {}

  ngOnInit(): void {

    const eventId =
      Number(
        this.route.snapshot.paramMap.get('eventId')
      );

    this.event =
      this.eventService.getEventById(eventId);

    this.student =
      this.studentService.getProfile();

    /*
     * We load the student's verified profile photo
     * through StudentService for the current student.
     */
    this.student.profilePhoto = this.student.profilePhoto || '';

    /*
     * Also make sure the latest student information
     * is synchronized with localStorage.
     */
    const savedName =
      localStorage.getItem('studentName');

    const savedStudentId =
      localStorage.getItem('studentId');

    const savedSection =
      localStorage.getItem('studentSection');

    const savedDepartment =
      localStorage.getItem('studentDepartment');

    if (savedName) {
      this.student.fullName = savedName;
    }

    if (savedStudentId) {
      this.student.studentId = savedStudentId;
    }

    if (savedSection) {
      this.student.section = savedSection;
    }

    if (savedDepartment) {
      this.student.department = savedDepartment;
    }

    if (!this.event) {

      alert('Event not found.');

      this.router.navigate([
        '/student/events'
      ]);

      return;
    }

    if (
      this.attendanceService.hasAttendance(
        this.student.studentId,
        this.event.id
      )
    ) {

      this.submitted = true;
    }
  }

  async startCamera(): Promise<void> {

    this.cameraError = '';

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      this.cameraError =
        'Camera access is not supported by this browser.';

      return;
    }

    try {

      this.videoStream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            facingMode: 'user'
          },

          audio: false

        });

      const video =
        document.getElementById(
          'attendanceCamera'
        ) as HTMLVideoElement;

      if (video) {

        video.srcObject =
          this.videoStream;

        await video.play();
      }

      this.cameraStarted = true;

    } catch (error) {

      console.error(error);

      this.cameraError =
        'Camera access was denied or is not available. Please allow camera permission and try again.';

      this.cameraStarted = false;
    }
  }

  captureSelfie(): void {

    const video =
      document.getElementById(
        'attendanceCamera'
      ) as HTMLVideoElement;

    if (
      !video ||
      !video.videoWidth ||
      !video.videoHeight
    ) {

      this.cameraError =
        'Camera is not ready yet. Please wait a moment and try again.';

      return;
    }

    const canvas =
      document.createElement('canvas');

    canvas.width =
      video.videoWidth || 640;

    canvas.height =
      video.videoHeight || 480;

    const context =
      canvas.getContext('2d');

    if (!context) {
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    this.capturedSelfie =
      canvas.toDataURL(
        'image/jpeg',
        0.85
      );

    this.cameraError = '';

    this.stopCamera();
  }

  retakeSelfie(): void {

    this.capturedSelfie = '';

    this.cameraError = '';

    this.startCamera();
  }

  submitAttendance(): void {

    if (!this.event) {
      return;
    }

    /*
     * BSIT Eligibility Check
     */
    const dept = (this.student.department || localStorage.getItem('studentDepartment') || '').toUpperCase();
    if (!dept.includes('BSIT') && !dept.includes('INFORMATION TECHNOLOGY')) {
      alert('Attendance submission is restricted to BSIT students of USTP Villanueva (ATLAS Organization) only.');
      return;
    }

    /*
     * Get the latest profile photo directly from
     * localStorage before checking.
     */
    const savedPhoto =
      localStorage.getItem('studentPhoto');

    if (savedPhoto) {
      this.student.profilePhoto =
        savedPhoto;
    }

    /*
     * Only show this message when there is truly
     * no registered profile photo.
     */
    if (!this.student.profilePhoto) {

      alert(
        'Please add your profile photo in My Profile before submitting attendance.'
      );

      this.router.navigate([
        '/student/profile'
      ]);

      return;
    }

    if (!this.capturedSelfie) {

      alert(
        'Please capture your attendance selfie first.'
      );

      return;
    }

    if (
      this.attendanceService.hasAttendance(
        this.student.studentId,
        this.event.id
      )
    ) {

      alert(
        'You have already submitted attendance for this event.'
      );

      this.submitted = true;

      return;
    }

    const now =
      new Date();

    this.attendanceService.addAttendance({

      studentId:
        this.student.studentId,

      studentName:
        this.student.fullName,

      section:
        this.student.section,

      department:
        this.student.department,

      eventId:
        this.event.id,

      eventTitle:
        this.event.title,

      profilePhoto:
        this.student.profilePhoto,

      selfiePhoto:
        this.capturedSelfie,

      date:
        now.toLocaleDateString(),

      time:
        now.toLocaleTimeString(),

      reviewedBy:
        '',

      reviewedAt:
        '',

      remarks:
        ''
    });

    this.submitted = true;

    this.stopCamera();
  }

  stopCamera(): void {

    if (this.videoStream) {

      this.videoStream
        .getTracks()
        .forEach(
          track => track.stop()
        );

      this.videoStream = null;
    }

    this.cameraStarted = false;
  }

  ngOnDestroy(): void {

    this.stopCamera();
  }
}