import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './guards/auth.guard';

// Public pages
import { Login } from './pages/login/login';
import { Signup } from './pages/signup/signup';

// Student pages
import { Dashboard as StudentDashboard } from './pages/student/dashboard/dashboard';
import { Profile } from './pages/student/profile/profile';
import { Events as StudentEvents } from './pages/student/events/events';
import { Attendance as StudentAttendance } from './pages/student/attendance/attendance';
import { AttendanceStatus } from './pages/student/attendance-status/attendance-status';

// Staff pages
import { Dashboard as StaffDashboard } from './pages/staff/dashboard/dashboard';
import { Verification as StaffVerification } from './pages/staff/verification/verification';
import { Pending as StaffPending } from './pages/staff/pending/pending';
import { Verified as StaffVerified } from './pages/staff/verified/verified';
import { Events as StaffEvents } from './pages/staff/events/events';

// Admin pages
import { Dashboard as AdminDashboard } from './pages/admin/dashboard/dashboard';
import { Attendance as AdminAttendance } from './pages/admin/attendance/attendance';
import { Pending as AdminPending } from './pages/admin/pending/pending';
import { Rejected as AdminRejected } from './pages/admin/rejected/rejected';
import { Events as AdminEvents } from './pages/admin/events/events';
import { Settings as AdminSettings } from './pages/admin/settings/settings';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'signup',
    component: Signup
  },

  /*
   * ======================================
   * STUDENT ROUTES (Protected: Student Role)
   * ======================================
   */
  {
    path: 'student/dashboard',
    component: StudentDashboard,
    canActivate: [authGuard, roleGuard(['student'])]
  },
  {
    path: 'student/profile',
    component: Profile,
    canActivate: [authGuard, roleGuard(['student'])]
  },
  {
    path: 'student/events',
    component: StudentEvents,
    canActivate: [authGuard, roleGuard(['student'])]
  },
  {
    path: 'student/attendance/:eventId',
    component: StudentAttendance,
    canActivate: [authGuard, roleGuard(['student'])]
  },
  {
    path: 'student/attendance-status',
    component: AttendanceStatus,
    canActivate: [authGuard, roleGuard(['student'])]
  },

  /*
   * ======================================
   * STAFF ROUTES (Protected: Staff Role)
   * ======================================
   */
  {
    path: 'staff/dashboard',
    component: StaffDashboard,
    canActivate: [authGuard, roleGuard(['staff'])]
  },
  {
    path: 'staff/verification',
    component: StaffVerification,
    canActivate: [authGuard, roleGuard(['staff'])]
  },
  {
    path: 'staff/pending',
    component: StaffPending,
    canActivate: [authGuard, roleGuard(['staff'])]
  },
  {
    path: 'staff/verified',
    component: StaffVerified,
    canActivate: [authGuard, roleGuard(['staff'])]
  },
  {
    path: 'staff/events',
    component: StaffEvents,
    canActivate: [authGuard, roleGuard(['staff'])]
  },

  /*
   * ======================================
   * ADMIN ROUTES (Protected: Admin Role)
   * ======================================
   */
  {
    path: 'admin/dashboard',
    component: AdminDashboard,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/attendance',
    component: AdminAttendance,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/pending',
    component: AdminPending,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/rejected',
    component: AdminRejected,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/events',
    component: AdminEvents,
    canActivate: [authGuard, roleGuard(['admin'])]
  },
  {
    path: 'admin/settings',
    component: AdminSettings,
    canActivate: [authGuard, roleGuard(['admin'])]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
