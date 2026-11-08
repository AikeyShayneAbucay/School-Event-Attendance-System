import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import {
  AttendanceRecord,
  AttendanceService
} from '../../../services/attendance';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-staff-pending',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './pending.html',
  styleUrl: './pending.css'
})
export class Pending implements OnInit {

  records: AttendanceRecord[] = [];
  searchTerm = '';
  staffName = 'Staff / Event In-Charge';

  // Checkbox selection state
  selectedIds = new Set<number>();

  // Confirmation Modal state
  showConfirmModal = false;
  manualReviewConfirmed = false;
  isProcessing = false;

  // Photo Inspection Modal state
  showPhotoModal = false;
  inspectingRecord?: AttendanceRecord;

  // Feedback banner
  successMessage = '';

  constructor(
    private attendanceService: AttendanceService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStaffInfo();
    this.loadRecords();
  }

  loadStaffInfo(): void {
    const user = this.authService.getCurrentUser();
    if (user && user.fullName) {
      this.staffName = user.fullName;
    }
  }

  loadRecords(): void {
    this.records = this.attendanceService
      .getPendingRecords()
      .reverse();

    // Clean up any selected IDs that are no longer pending
    const currentPendingIds = new Set(this.records.map(r => r.id));
    for (const id of Array.from(this.selectedIds)) {
      if (!currentPendingIds.has(id)) {
        this.selectedIds.delete(id);
      }
    }
  }

  get filteredRecords(): AttendanceRecord[] {
    const search = this.searchTerm.trim().toLowerCase();
    if (!search) {
      return this.records;
    }
    return this.records.filter(r =>
      (r.studentName && r.studentName.toLowerCase().includes(search)) ||
      (r.studentId && r.studentId.toLowerCase().includes(search)) ||
      (r.eventTitle && r.eventTitle.toLowerCase().includes(search)) ||
      (r.section && r.section.toLowerCase().includes(search))
    );
  }

  // Checkbox management
  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleRecord(id: number): void {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  get isAllSelected(): boolean {
    const displayed = this.filteredRecords;
    if (displayed.length === 0) {
      return false;
    }
    return displayed.every(r => this.selectedIds.has(r.id));
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const displayed = this.filteredRecords;

    if (checked) {
      for (const record of displayed) {
        this.selectedIds.add(record.id);
      }
    } else {
      for (const record of displayed) {
        this.selectedIds.delete(record.id);
      }
    }
  }

  getSelectedRecords(): AttendanceRecord[] {
    return this.records.filter(r => this.selectedIds.has(r.id));
  }

  // Bulk Accept workflow
  openBulkAcceptModal(): void {
    if (this.selectedIds.size === 0) {
      return;
    }
    this.manualReviewConfirmed = false;
    this.showConfirmModal = true;
  }

  closeBulkAcceptModal(): void {
    if (this.isProcessing) {
      return;
    }
    this.showConfirmModal = false;
    this.manualReviewConfirmed = false;
  }

  confirmBulkAccept(): void {
    if (this.selectedIds.size === 0 || this.isProcessing) {
      return;
    }

    if (!this.manualReviewConfirmed) {
      alert('Please check the confirmation statement affirming that you have manually reviewed and compared the photos of all selected students.');
      return;
    }

    this.isProcessing = true;
    const reviewer = this.authService.getUsername() || this.staffName;
    const idsToAccept = Array.from(this.selectedIds);
    const count = idsToAccept.length;

    const acceptedCount = this.attendanceService.bulkUpdateStatus(
      idsToAccept,
      'ACCEPTED',
      reviewer,
      'Bulk accepted by staff after manual photo review'
    );

    this.isProcessing = false;
    this.showConfirmModal = false;
    this.selectedIds.clear();
    this.manualReviewConfirmed = false;

    this.successMessage = `Successfully accepted ${acceptedCount} attendance submission${acceptedCount === 1 ? '' : 's'}. Records are now moved to Verified Records.`;
    this.loadRecords();

    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  // Photo Preview Inspection Modal
  openPhotoPreview(record: AttendanceRecord, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.inspectingRecord = record;
    this.showPhotoModal = true;
  }

  closePhotoPreview(): void {
    this.showPhotoModal = false;
    this.inspectingRecord = undefined;
  }

  acceptSingleFromModal(): void {
    if (!this.inspectingRecord) {
      return;
    }

    const reviewer = this.authService.getUsername() || this.staffName;
    const studentName = this.inspectingRecord.studentName;

    this.attendanceService.updateStatus(
      this.inspectingRecord.id,
      'ACCEPTED',
      reviewer,
      'Accepted after manual photo review'
    );

    this.selectedIds.delete(this.inspectingRecord.id);
    this.closePhotoPreview();
    this.successMessage = `Attendance for ${studentName} was accepted and moved to Verified Records.`;
    this.loadRecords();

    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
