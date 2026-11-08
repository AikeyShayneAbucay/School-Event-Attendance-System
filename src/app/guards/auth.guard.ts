import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const currentUser = auth.getCurrentUser();
    const userRole = currentUser?.role;

    // Check role authorization
    if (userRole && allowedRoles.includes(userRole)) {
      // If student role, enforce BSIT program eligibility
      if (userRole === 'student' && !auth.isEligibleBsitStudent()) {
        alert('Access denied: This portal is exclusively for BSIT students of USTP Villanueva (ATLAS Organization).');
        auth.logout();
        return router.createUrlTree(['/login']);
      }
      return true;
    }

    // Redirect to the user's appropriate role dashboard
    if (userRole === 'admin') {
      return router.createUrlTree(['/admin/dashboard']);
    } else if (userRole === 'staff') {
      return router.createUrlTree(['/staff/dashboard']);
    } else if (userRole === 'student') {
      return router.createUrlTree(['/student/dashboard']);
    }

    return router.createUrlTree(['/login']);
  };
};
