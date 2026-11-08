import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  studentId = '';
  username = '';
  gmail = '';
  fullName = '';

  // BSIT Program locked to BSIT
  department = 'Bachelor of Science in Information Technology (BSIT)';

  // Year level and section
  selectedYear = '3';
  sectionChoice = 'BSIT-3B';
  customSection = '';

  password = '';
  confirmPassword = '';

  standardSections = [
    'BSIT-1A', 'BSIT-1B', 'BSIT-1C',
    'BSIT-2A', 'BSIT-2B',
    'BSIT-3A', 'BSIT-3B',
    'BSIT-4A', 'BSIT-4B',
    'Other BSIT Section'
  ];

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  get finalSection(): string {
    if (this.sectionChoice === 'Other BSIT Section') {
      return this.customSection.trim().toUpperCase();
    }
    return this.sectionChoice;
  }

  register(): void {
    const enteredStudentId = this.studentId.trim();
    const enteredUsername = this.username.trim();
    const enteredGmail = this.gmail.trim();
    const enteredFullName = this.fullName.trim();
    const enteredSection = this.finalSection;

    // Check required fields
    if (
      !enteredStudentId ||
      !enteredUsername ||
      !enteredGmail ||
      !enteredFullName ||
      !enteredSection ||
      !this.password.trim() ||
      !this.confirmPassword.trim()
    ) {
      alert('Please complete all required fields.');
      return;
    }

    // Strict BSIT section validation
    if (!enteredSection.startsWith('BSIT')) {
      alert('Eligibility Error: Section must be a valid BSIT section (e.g. BSIT-1A, BSIT-2B, BSIT-3B). Only BSIT students are eligible.');
      return;
    }

    // Validate Gmail
    const gmailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailPattern.test(enteredGmail)) {
      alert('Please enter a valid Gmail address (@gmail.com).');
      return;
    }

    // Validate username
    if (enteredUsername.length < 4) {
      alert('Username must be at least 4 characters.');
      return;
    }

    // Validate password
    if (this.password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    // Check password confirmation
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // Register strictly as BSIT student with Auth Service
    const registerResult = this.auth.registerStudent({
      studentId: enteredStudentId,
      fullName: enteredFullName,
      section: enteredSection,
      department: 'Bachelor of Science in Information Technology (BSIT)',
      username: enteredUsername,
      password: this.password
    });

    if (!registerResult.success) {
      alert(registerResult.message);
      return;
    }

    // Persist verified student local storage keys
    localStorage.setItem('studentId', enteredStudentId);
    localStorage.setItem('studentUsername', enteredUsername);
    localStorage.setItem('studentGmail', enteredGmail);
    localStorage.setItem('studentName', enteredFullName);
    localStorage.setItem('studentSection', enteredSection);
    localStorage.setItem('studentDepartment', 'Bachelor of Science in Information Technology (BSIT)');
    localStorage.setItem('studentProgram', 'BSIT');
    localStorage.setItem('studentPassword', this.password);
    localStorage.removeItem('studentPhoto');
    localStorage.removeItem(`attendance_student_profile_${enteredStudentId}`);
    localStorage.setItem('registered', 'true');

    alert('BSIT Registration successful! You can now sign in using your BSIT student account.');
    this.router.navigate(['/login']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
