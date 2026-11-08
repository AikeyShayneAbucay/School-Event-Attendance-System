import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../services/auth';
import { StudentService } from '../../../services/student';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  student = {
    studentId: '',
    username: '',
    gmail: '',
    fullName: '',
    section: 'BSIT-3B',
    department: 'Bachelor of Science in Information Technology (BSIT)',
    profilePhoto: ''
  };

  standardSections = [
    'BSIT-1A', 'BSIT-1B', 'BSIT-1C',
    'BSIT-2A', 'BSIT-2B',
    'BSIT-3A', 'BSIT-3B',
    'BSIT-4A', 'BSIT-4B',
    'Other BSIT Section'
  ];

  savedMessage = '';
  photoMessage = '';

  constructor(
    private router: Router,
    private authService: Auth,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const profile = this.studentService.getProfile();
    this.student.studentId = profile.studentId || localStorage.getItem('studentId') || '';
    this.student.username = localStorage.getItem('studentUsername') || '';
    this.student.gmail = localStorage.getItem('studentGmail') || '';
    this.student.fullName = profile.fullName || localStorage.getItem('studentName') || '';
    this.student.section = profile.section || localStorage.getItem('studentSection') || 'BSIT-3B';
    this.student.department = 'Bachelor of Science in Information Technology (BSIT)';
    this.student.profilePhoto = profile.profilePhoto || '';
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.photoMessage = 'Please select a valid image file.';
      input.value = '';
      this.hidePhotoMessageAfterDelay();
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.photoMessage = 'Profile photo must not exceed 5MB.';
      input.value = '';
      this.hidePhotoMessageAfterDelay();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.student.profilePhoto = reader.result as string;
      localStorage.setItem('studentPhoto', this.student.profilePhoto);
      localStorage.setItem('profileUpdated', Date.now().toString());

      if (this.student.studentId) {
        this.studentService.saveProfile({
          studentId: this.student.studentId,
          fullName: this.student.fullName,
          section: this.student.section,
          department: this.student.department,
          profilePhoto: this.student.profilePhoto
        });
      }

      this.photoMessage = 'Profile photo uploaded successfully.';
      this.hidePhotoMessageAfterDelay();
    };

    reader.readAsDataURL(file);
  }

  hidePhotoMessageAfterDelay(): void {
    setTimeout(() => {
      this.photoMessage = '';
    }, 3000);
  }

  removePhoto(): void {
    this.student.profilePhoto = '';
    localStorage.removeItem('studentPhoto');
    localStorage.setItem('profileUpdated', Date.now().toString());

    if (this.student.studentId) {
      this.studentService.saveProfile({
        studentId: this.student.studentId,
        fullName: this.student.fullName,
        section: this.student.section,
        department: this.student.department,
        profilePhoto: ''
      });
    }

    this.photoMessage = 'Profile photo removed successfully.';
    this.hidePhotoMessageAfterDelay();
  }

  saveProfile(): void {
    const studentId = this.student.studentId.trim();
    const username = this.student.username.trim();
    const gmail = this.student.gmail.trim();
    const fullName = this.student.fullName.trim();
    const section = this.student.section.trim().toUpperCase();

    if (
      !studentId ||
      !username ||
      !gmail ||
      !fullName ||
      !section
    ) {
      alert('Please complete all student information.');
      return;
    }

    // Enforce BSIT section
    if (!section.startsWith('BSIT')) {
      alert('Eligibility Error: Section must belong to the BSIT program (e.g. BSIT-1A, BSIT-2B, BSIT-3B).');
      return;
    }

    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(gmail)) {
      alert('Please enter a valid Gmail address.');
      return;
    }

    localStorage.setItem('studentId', studentId);
    localStorage.setItem('studentUsername', username);
    localStorage.setItem('studentGmail', gmail);
    localStorage.setItem('studentName', fullName);
    localStorage.setItem('studentSection', section);
    localStorage.setItem('studentDepartment', 'Bachelor of Science in Information Technology (BSIT)');
    localStorage.setItem('studentProgram', 'BSIT');

    if (this.student.profilePhoto) {
      localStorage.setItem('studentPhoto', this.student.profilePhoto);
    } else {
      localStorage.removeItem('studentPhoto');
    }

    this.studentService.saveProfile({
      studentId: studentId,
      fullName: fullName,
      section: section,
      department: 'Bachelor of Science in Information Technology (BSIT)',
      profilePhoto: this.student.profilePhoto
    });

    localStorage.setItem('profileUpdated', Date.now().toString());
    this.savedMessage = 'BSIT Student Profile successfully updated.';

    setTimeout(() => {
      this.savedMessage = '';
    }, 3000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
