import { Injectable } from '@angular/core';
import { Auth, StudentAccount } from './auth';

export interface StudentProfile {
  studentId: string;
  fullName: string;
  section: string;
  department: string;
  profilePhoto: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private readonly storageKey = 'attendance_student_profile';

  private defaultProfile: StudentProfile = {
    studentId: '2024-0001',
    fullName: 'Maria Santos',
    section: 'BSIT-3B',
    department: 'Bachelor of Science in Information Technology (BSIT)',
    profilePhoto: ''
  };

  constructor(private authService: Auth) {}

  getProfile(): StudentProfile {
    // 1. Identify currently active student
    const currentUser = this.authService.getCurrentUser();
    const activeStudentId =
      localStorage.getItem('studentId') ||
      (currentUser && currentUser.role === 'student' ? currentUser.studentId : '') ||
      '';

    const activeUsername =
      localStorage.getItem('studentUsername') ||
      localStorage.getItem('loggedInUsername') ||
      (currentUser && currentUser.role === 'student' ? currentUser.username : '') ||
      '';

    // 2. Look up student in registered accounts
    let account: StudentAccount | undefined;
    if (activeStudentId) {
      account = this.authService.getAccountById(activeStudentId);
    }
    if (!account && activeUsername) {
      account = this.authService.getAccountByUsername(activeUsername);
    }

    // 3. Check per-student profile storage
    const targetStudentId = account?.studentId || activeStudentId;
    let perStudentProfile: Partial<StudentProfile> = {};

    if (targetStudentId) {
      const perStudentSaved = localStorage.getItem(`attendance_student_profile_${targetStudentId}`);
      if (perStudentSaved) {
        try {
          perStudentProfile = JSON.parse(perStudentSaved);
        } catch {}
      }
    }

    // 4. Resolve profilePhoto strictly for this student
    // New accounts must start with empty photo and never inherit from another student
    let resolvedPhoto = '';
    if (account) {
      resolvedPhoto = account.profilePhoto || perStudentProfile.profilePhoto || '';
    } else if (targetStudentId) {
      const legacySaved = localStorage.getItem(this.storageKey);
      if (legacySaved) {
        try {
          const parsed = JSON.parse(legacySaved);
          if (parsed.studentId && parsed.studentId.trim().toLowerCase() === targetStudentId.trim().toLowerCase()) {
            resolvedPhoto = parsed.profilePhoto || '';
          }
        } catch {}
      }
      if (!resolvedPhoto && perStudentProfile.profilePhoto) {
        resolvedPhoto = perStudentProfile.profilePhoto;
      }
    }

    // Sync active session studentPhoto key so legacy consumers match this exact student
    if (resolvedPhoto) {
      localStorage.setItem('studentPhoto', resolvedPhoto);
    } else {
      localStorage.removeItem('studentPhoto');
    }

    const studentId = account?.studentId || activeStudentId || this.defaultProfile.studentId;
    const fullName = account?.fullName || localStorage.getItem('studentName') || perStudentProfile.fullName || (account ? '' : this.defaultProfile.fullName);
    const section = account?.section || localStorage.getItem('studentSection') || perStudentProfile.section || (account ? 'BSIT-3B' : this.defaultProfile.section);
    const department = account?.department || localStorage.getItem('studentDepartment') || 'Bachelor of Science in Information Technology (BSIT)';

    return {
      studentId,
      fullName,
      section,
      department,
      profilePhoto: resolvedPhoto
    };
  }

  saveProfile(profile: StudentProfile): void {
    if (!profile.studentId) return;

    const studentId = profile.studentId.trim();

    // 1. Save per-student isolated storage
    localStorage.setItem(
      `attendance_student_profile_${studentId}`,
      JSON.stringify(profile)
    );

    // 2. Keep generic key updated for current active student
    localStorage.setItem(this.storageKey, JSON.stringify(profile));
    localStorage.setItem('studentId', studentId);
    localStorage.setItem('studentName', profile.fullName);
    localStorage.setItem('studentSection', profile.section);
    localStorage.setItem('studentDepartment', profile.department);

    // 3. Update auth account and photo
    if (profile.profilePhoto) {
      localStorage.setItem('studentPhoto', profile.profilePhoto);
      this.authService.updateStudentProfilePhoto(studentId, profile.profilePhoto);
      this.authService.updateStudentAccount(studentId, {
        fullName: profile.fullName,
        section: profile.section,
        department: profile.department,
        profilePhoto: profile.profilePhoto
      });
    } else {
      localStorage.removeItem('studentPhoto');
      this.authService.updateStudentProfilePhoto(studentId, null);
      this.authService.updateStudentAccount(studentId, {
        fullName: profile.fullName,
        section: profile.section,
        department: profile.department,
        profilePhoto: null
      });
    }

    // 4. Notify open components
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  }

  getStudentId(): string {
    const currentUser = this.authService.getCurrentUser();
    return localStorage.getItem('studentId') ||
      (currentUser && currentUser.role === 'student' ? currentUser.studentId : '') ||
      this.defaultProfile.studentId;
  }
}

export { StudentService as Student };
