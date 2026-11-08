import { Injectable } from '@angular/core';

export interface StudentAccount {
  studentId: string;
  fullName: string;
  section: string;
  department: string;
  program: 'BSIT';
  organization: 'ATLAS';
  username: string;
  password: string;
  role: 'student';
  profilePhoto: string | null;
  isBsitVerified: boolean;
}

export interface LoginResult {
  success: boolean;
  message: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private readonly storageKey = 'ustp_student_accounts';
  private readonly currentUserKey = 'ustp_current_user';
  private readonly settingsKey = 'ustp_system_settings';

  constructor() {
    this.initializeAccounts();
  }

  private initializeAccounts(): void {
    const existingAccounts =
      localStorage.getItem(this.storageKey);

    if (existingAccounts === null) {
      // Seed initial verified BSIT student account for Maria Santos if none exist
      const defaultStudent: StudentAccount = {
        studentId: '2024-0001',
        fullName: 'Maria Santos',
        section: 'BSIT-3B',
        department: 'Bachelor of Science in Information Technology (BSIT)',
        program: 'BSIT',
        organization: 'ATLAS',
        username: 'student1',
        password: 'password123',
        role: 'student',
        profilePhoto: null,
        isBsitVerified: true
      };

      localStorage.setItem(
        this.storageKey,
        JSON.stringify([defaultStudent])
      );
    }
  }

  private getAccounts(): StudentAccount[] {
    const accounts =
      localStorage.getItem(this.storageKey);

    if (!accounts) {
      return [];
    }

    try {
      return JSON.parse(accounts) as StudentAccount[];
    } catch {
      return [];
    }
  }

  private saveAccounts(
    accounts: StudentAccount[]
  ): void {
    localStorage.setItem(
      this.storageKey,
      JSON.stringify(accounts)
    );
  }

  getAccountById(studentId: string): StudentAccount | undefined {
    if (!studentId) return undefined;
    const cleanId = studentId.trim().toLowerCase();
    return this.getAccounts().find(
      account => account.studentId && account.studentId.trim().toLowerCase() === cleanId
    );
  }

  getAccountByUsername(username: string): StudentAccount | undefined {
    if (!username) return undefined;
    const cleanUsername = username.trim().toLowerCase();
    return this.getAccounts().find(
      account => account.username && account.username.trim().toLowerCase() === cleanUsername
    );
  }

  updateStudentProfilePhoto(studentId: string, photo: string | null): void {
    if (!studentId) return;
    const cleanId = studentId.trim().toLowerCase();
    const accounts = this.getAccounts();
    const account = accounts.find(
      a => a.studentId && a.studentId.trim().toLowerCase() === cleanId
    );

    if (account) {
      account.profilePhoto = photo || null;
      this.saveAccounts(accounts);
    }

    // Sync currentUser if it's the currently logged-in student
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.studentId && currentUser.studentId.trim().toLowerCase() === cleanId) {
      currentUser.profilePhoto = photo || null;
      localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));
      if (photo) {
        localStorage.setItem('studentPhoto', photo);
      } else {
        localStorage.removeItem('studentPhoto');
      }
    }
  }

  updateStudentAccount(studentId: string, updates: Partial<StudentAccount>): void {
    if (!studentId) return;
    const cleanId = studentId.trim().toLowerCase();
    const accounts = this.getAccounts();
    const account = accounts.find(
      a => a.studentId && a.studentId.trim().toLowerCase() === cleanId
    );

    if (account) {
      Object.assign(account, updates);
      this.saveAccounts(accounts);
    }

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.studentId && currentUser.studentId.trim().toLowerCase() === cleanId) {
      Object.assign(currentUser, updates);
      localStorage.setItem(this.currentUserKey, JSON.stringify(currentUser));
    }
  }

  /*
   * ================================
   * STUDENT REGISTRATION (BSIT ONLY)
   * ================================
   */

  registerStudent(student: {
    studentId: string;
    fullName: string;
    section: string;
    department: string;
    username: string;
    password: string;
  }): {
    success: boolean;
    message: string;
  } {
    // Strict BSIT program eligibility verification
    const cleanSection = student.section.trim().toUpperCase();
    const cleanDept = student.department.trim().toUpperCase();

    if (!cleanDept.includes('BSIT') && !cleanDept.includes('INFORMATION TECHNOLOGY')) {
      return {
        success: false,
        message: 'Registration restricted: This system is exclusively for BSIT students of USTP Villanueva (ATLAS Organization).'
      };
    }

    if (!cleanSection.includes('BSIT') && !cleanSection.includes('IT')) {
      return {
        success: false,
        message: 'Invalid section: Please specify a valid BSIT section (e.g. BSIT-1A, BSIT-2B, BSIT-3B).'
      };
    }

    const accounts = this.getAccounts();

    const studentIdExists = accounts.some(
      account =>
        account.studentId.toLowerCase() ===
        student.studentId.toLowerCase()
    );

    if (studentIdExists) {
      return {
        success: false,
        message: 'This Student ID is already registered.'
      };
    }

    const usernameExists = accounts.some(
      account =>
        account.username.toLowerCase() ===
        student.username.toLowerCase()
    );

    if (usernameExists) {
      return {
        success: false,
        message: 'This username is already taken.'
      };
    }

    const newAccount: StudentAccount = {
      studentId: student.studentId.trim(),
      fullName: student.fullName.trim(),
      section: student.section.trim(),
      department: 'Bachelor of Science in Information Technology (BSIT)',
      program: 'BSIT',
      organization: 'ATLAS',
      username: student.username.trim(),
      password: student.password,
      role: 'student',
      profilePhoto: null,
      isBsitVerified: true
    };

    accounts.push(newAccount);
    this.saveAccounts(accounts);

    return {
      success: true,
      message: 'BSIT student account registered successfully.'
    };
  }

  /*
   * ================================
   * LOGIN
   * ================================
   */

  login(
    username: string,
    password: string
  ): LoginResult {
    const normalizedUsername =
      username.trim().toLowerCase();

    /*
     * STAFF ACCOUNT
     */
    if (
      normalizedUsername === 'staff1' &&
      password === '123456'
    ) {
      const staffUser = {
        username: 'staff1',
        role: 'staff',
        fullName: 'Staff / Event In-Charge'
      };

      localStorage.setItem(this.currentUserKey, JSON.stringify(staffUser));
      localStorage.setItem('loggedInRole', 'staff');
      localStorage.setItem('loggedInUsername', 'staff1');

      return {
        success: true,
        message: 'Staff login successful.',
        user: staffUser
      };
    }

    /*
     * ADMIN ACCOUNT
     */
    const savedAdminProfile = localStorage.getItem('ustp_admin_profile');
    let adminUsername = 'admin1';
    let adminPass = '123456';
    let adminName = 'System Administrator';

    if (savedAdminProfile) {
      try {
        const parsed = JSON.parse(savedAdminProfile);
        if (parsed.username) adminUsername = parsed.username.toLowerCase();
        if (parsed.password) adminPass = parsed.password;
        if (parsed.fullName) adminName = parsed.fullName;
      } catch {
        // fallback
      }
    }

    if (
      normalizedUsername === adminUsername &&
      password === adminPass
    ) {
      const adminUser = {
        username: adminUsername,
        role: 'admin',
        fullName: adminName
      };

      localStorage.setItem(this.currentUserKey, JSON.stringify(adminUser));
      localStorage.setItem('loggedInRole', 'admin');
      localStorage.setItem('loggedInUsername', adminUsername);

      return {
        success: true,
        message: 'Admin login successful.',
        user: adminUser
      };
    }

    /*
     * REGISTERED BSIT STUDENT
     */
    const accounts = this.getAccounts();

    const student = accounts.find(
      account =>
        account.username.toLowerCase() === normalizedUsername &&
        account.password === password
    );

    if (!student) {
      return {
        success: false,
        message: 'Invalid username or password.'
      };
    }

    // Verify BSIT eligibility
    const dept = (student.department || '').toUpperCase();
    if (!dept.includes('BSIT') && !dept.includes('INFORMATION TECHNOLOGY') && student.program !== 'BSIT') {
      return {
        success: false,
        message: 'Access restricted: Only BSIT students of USTP Villanueva (ATLAS Organization) are eligible.'
      };
    }

    localStorage.setItem(this.currentUserKey, JSON.stringify(student));
    localStorage.setItem('loggedInRole', 'student');
    localStorage.setItem('loggedInUsername', student.username);
    localStorage.setItem('studentId', student.studentId);
    localStorage.setItem('studentUsername', student.username);
    localStorage.setItem('studentName', student.fullName);
    localStorage.setItem('studentSection', student.section);
    localStorage.setItem('studentDepartment', student.department);
    localStorage.setItem('studentProgram', 'BSIT');
    if (student.profilePhoto) {
      localStorage.setItem('studentPhoto', student.profilePhoto);
    } else {
      localStorage.removeItem('studentPhoto');
    }

    return {
      success: true,
      message: 'BSIT student login successful.',
      user: student
    };
  }

  /*
   * ================================
   * CURRENT USER & ACCESS CHECKS
   * ================================
   */

  getCurrentUser(): any | null {
    const currentUser = localStorage.getItem(this.currentUserKey);
    if (!currentUser) {
      const role = localStorage.getItem('loggedInRole');
      const username = localStorage.getItem('loggedInUsername');
      if (role && username) {
        if (role === 'admin') {
          return { username, role: 'admin', fullName: 'System Administrator' };
        }
        if (role === 'staff') {
          return { username, role: 'staff', fullName: 'Staff / Event In-Charge' };
        }
        if (role === 'student') {
          const studentId = localStorage.getItem('studentId') || '';
          const account = studentId ? this.getAccountById(studentId) : this.getAccountByUsername(username);
          return {
            username,
            role: 'student',
            fullName: account?.fullName || localStorage.getItem('studentName') || 'Student',
            studentId: account?.studentId || studentId,
            section: account?.section || localStorage.getItem('studentSection') || '',
            department: account?.department || localStorage.getItem('studentDepartment') || 'Bachelor of Science in Information Technology (BSIT)',
            program: 'BSIT',
            profilePhoto: account?.profilePhoto || null,
            isBsitVerified: true
          };
        }
      }
      return null;
    }

    try {
      const parsed = JSON.parse(currentUser);
      if (parsed && parsed.role === 'student' && parsed.studentId) {
        const account = this.getAccountById(parsed.studentId);
        if (account) {
          parsed.profilePhoto = account.profilePhoto || null;
          parsed.fullName = account.fullName || parsed.fullName;
          parsed.section = account.section || parsed.section;
        }
      }
      return parsed;
    } catch {
      return null;
    }
  }

  getUsername(): string {
    const user = this.getCurrentUser();
    return user ? (user.username ?? '') : '';
  }

  logout(): void {
    localStorage.removeItem(this.currentUserKey);
    localStorage.removeItem('loggedInRole');
    localStorage.removeItem('loggedInUsername');
    localStorage.removeItem('studentPhoto');
    localStorage.removeItem('studentId');
    localStorage.removeItem('studentUsername');
    localStorage.removeItem('studentName');
    localStorage.removeItem('studentSection');
    localStorage.removeItem('studentDepartment');
    localStorage.removeItem('studentProgram');
    localStorage.removeItem('studentGmail');
    localStorage.removeItem('studentPassword');
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  isStudent(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'student';
  }

  isEligibleBsitStudent(): boolean {
    const user = this.getCurrentUser();
    if (!user || user.role !== 'student') {
      return false;
    }
    const dept = (user.department || '').toUpperCase();
    return dept.includes('BSIT') || dept.includes('INFORMATION TECHNOLOGY') || user.program === 'BSIT';
  }

  isStaff(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'staff';
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  getSystemSettings(): any {
    const saved = localStorage.getItem(this.settingsKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      campusName: 'USTP Villanueva Campus',
      academicYear: '2026-2027',
      semester: '1st Semester',
      verificationMode: 'Strict Manual Verification',
      allowSelfieGallery: false,
      organization: 'ATLAS (Association of Technology Leaders and Aspiring Scholars)',
      targetProgram: 'BSIT (Bachelor of Science in Information Technology)'
    };
  }

  saveSystemSettings(settings: any): void {
    localStorage.setItem(this.settingsKey, JSON.stringify(settings));
  }

  saveAdminProfile(profile: { fullName: string; username: string; password?: string }): void {
    localStorage.setItem('ustp_admin_profile', JSON.stringify(profile));
    const user = this.getCurrentUser();
    if (user && user.role === 'admin') {
      user.fullName = profile.fullName;
      user.username = profile.username;
      localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }
  }
}

export {
  Auth as AuthService
};
