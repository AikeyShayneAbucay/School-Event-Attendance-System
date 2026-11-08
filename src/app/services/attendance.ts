import { Injectable } from '@angular/core';

export type AttendanceStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'REJECTED';

export interface AttendanceRecord {
  id: number;
  studentId: string;
  studentName: string;
  section: string;
  department: string;

  eventId: number;
  eventTitle: string;

  profilePhoto: string;
  selfiePhoto: string;

  date: string;
  time: string;

  status: AttendanceStatus;

  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private readonly storageKey = 'school_attendance_records';
  private readonly legacyKey = 'attendanceRecords';

  private getRecords(): AttendanceRecord[] {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const records = JSON.parse(saved);
        if (Array.isArray(records)) {
          return records;
        }
      } catch {
        // Continue to fallback
      }
    }

    const legacySaved = localStorage.getItem(this.legacyKey);
    if (legacySaved) {
      try {
        const records = JSON.parse(legacySaved);
        if (Array.isArray(records)) {
          return records;
        }
      } catch {
        // Fallback
      }
    }

    return [];
  }

  private saveRecords(records: AttendanceRecord[]): void {
    const json = JSON.stringify(records);
    localStorage.setItem(this.storageKey, json);
    // Keep legacy key in sync so legacy components read the same data
    localStorage.setItem(this.legacyKey, json);
  }

  getAllRecords(): AttendanceRecord[] {
    return this.getRecords();
  }

  getRecordsByStudent(studentId: string): AttendanceRecord[] {
    if (!studentId) {
      return [];
    }
    const cleanId = studentId.trim().toLowerCase();
    return this.getRecords().filter(
      record => record.studentId && record.studentId.trim().toLowerCase() === cleanId
    );
  }

  getPendingRecords(): AttendanceRecord[] {
    return this.getRecords().filter(
      record => String(record.status).toUpperCase() === 'PENDING'
    );
  }

  getAcceptedRecords(): AttendanceRecord[] {
    return this.getRecords().filter(
      record => String(record.status).toUpperCase() === 'ACCEPTED'
    );
  }

  getRejectedRecords(): AttendanceRecord[] {
    return this.getRecords().filter(
      record => String(record.status).toUpperCase() === 'REJECTED'
    );
  }

  getRecordById(id: number): AttendanceRecord | undefined {
    return this.getRecords().find(
      record => record.id === id
    );
  }

  hasAttendance(
    studentId: string,
    eventId: number
  ): boolean {
    const cleanId = (studentId || '').trim().toLowerCase();
    return this.getRecords().some(
      record =>
        record.studentId &&
        record.studentId.trim().toLowerCase() === cleanId &&
        record.eventId === eventId
    );
  }

  addAttendance(
    data: Omit<
      AttendanceRecord,
      'id' | 'status'
    >
  ): AttendanceRecord {
    const records = this.getRecords();

    const newId =
      records.length > 0
        ? Math.max(...records.map(record => record.id || 0)) + 1
        : 1;

    const newRecord: AttendanceRecord = {
      ...data,
      id: newId,
      status: 'PENDING'
    };

    records.push(newRecord);
    this.saveRecords(records);
    return newRecord;
  }

  updateStatus(
    id: number,
    status: AttendanceStatus,
    reviewedBy: string,
    remarks: string = ''
  ): void {
    const records = this.getRecords();

    const index = records.findIndex(
      record => record.id === id
    );

    if (index === -1) {
      return;
    }

    records[index] = {
      ...records[index],
      status,
      reviewedBy,
      reviewedAt: new Date().toLocaleString(),
      remarks
    };

    this.saveRecords(records);
  }

  bulkUpdateStatus(
    ids: number[],
    status: AttendanceStatus,
    reviewedBy: string,
    remarks: string = ''
  ): number {
    if (!ids || ids.length === 0) {
      return 0;
    }

    const records = this.getRecords();
    const nowStr = new Date().toLocaleString();
    let updatedCount = 0;

    const idSet = new Set(ids);

    for (let i = 0; i < records.length; i++) {
      if (idSet.has(records[i].id)) {
        // Enforce rule: Only pending records can be accepted
        if (String(records[i].status).toUpperCase() === 'PENDING') {
          records[i] = {
            ...records[i],
            status,
            reviewedBy,
            reviewedAt: nowStr,
            remarks: remarks || records[i].remarks || 'Bulk accepted by staff after manual review'
          };
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      this.saveRecords(records);
    }

    return updatedCount;
  }

  deleteRecord(id: number): void {
    const records = this.getRecords().filter(
      record => record.id !== id
    );
    this.saveRecords(records);
  }

  getTotal(): number {
    return this.getRecords().length;
  }

  getPending(): number {
    return this.getPendingRecords().length;
  }

  getAccepted(): number {
    return this.getAcceptedRecords().length;
  }

  getRejected(): number {
    return this.getRejectedRecords().length;
  }
}

export { AttendanceService as Attendance };
