import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  username = '';
  password = '';

  errorMessage = '';

  constructor(
    private router: Router,
    private auth: Auth
  ) {}

  login(): void {

    this.errorMessage = '';

    const enteredUsername =
      this.username.trim();

    const enteredPassword =
      this.password;

    if (
      !enteredUsername ||
      !enteredPassword
    ) {

      this.errorMessage =
        'Please enter your username and password.';

      return;
    }

    /*
     * ==============================
     * LOGIN USING AUTH SERVICE
     * ==============================
     *
     * Auth service handles:
     *
     * Student
     * Staff
     * Admin
     */

    const result =
      this.auth.login(
        enteredUsername,
        enteredPassword
      );

    if (!result.success) {

      this.errorMessage =
        result.message ||
        'Invalid username or password.';

      return;
    }

    const user =
      result.user;

    if (!user) {

      this.errorMessage =
        'Unable to identify the account.';

      return;
    }

    /*
     * ==============================
     * SAVE LOGIN INFORMATION
     * ==============================
     */

    localStorage.setItem(
      'loggedInRole',
      user.role
    );

    localStorage.setItem(
      'loggedInUsername',
      user.username
    );

    /*
     * ==============================
     * STUDENT
     * ==============================
     */

    if (user.role === 'student') {

      localStorage.setItem(
        'currentStudentId',
        user.studentId
      );

      localStorage.setItem(
        'currentStudentName',
        user.fullName
      );

      /*
       * Keep student information
       * synchronized with the rest
       * of the prototype.
       */

      localStorage.setItem(
        'studentId',
        user.studentId
      );

      localStorage.setItem(
        'studentUsername',
        user.username
      );

      localStorage.setItem(
        'studentName',
        user.fullName
      );

      localStorage.setItem(
        'studentSection',
        user.section
      );

      localStorage.setItem(
        'studentDepartment',
        user.department
      );

      if (user.profilePhoto) {
        localStorage.setItem(
          'studentPhoto',
          user.profilePhoto
        );
      } else {
        localStorage.removeItem('studentPhoto');
      }

      this.router.navigate([
        '/student/dashboard'
      ]);

      return;
    }

    /*
     * ==============================
     * STAFF
     * ==============================
     */

    if (user.role === 'staff') {

      this.router.navigate([
        '/staff/dashboard'
      ]);

      return;
    }

    /*
     * ==============================
     * ADMIN
     * ==============================
     */

    if (user.role === 'admin') {

      this.router.navigate([
        '/admin/dashboard'
      ]);

      return;
    }

    /*
     * UNKNOWN ROLE
     */

    this.errorMessage =
      'Unable to determine account role.';
  }

  goToSignup(): void {

    this.router.navigate([
      '/signup'
    ]);
  }
}