import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal, OnInit, PLATFORM_ID, isDevMode } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, single } from 'rxjs';

type STUDENTS = {
  name: string;
  attendance: number | null;
  _id?: string; //for MongoDB id
};

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Student Attendance Management');
  private http = inject(HttpClient);

  formData = signal<STUDENTS>({
    name: '',
    attendance: null,
  });

  LOCAL_URL = 'http://localhost:4000';
  LIVE_URL = 'https://angular-attendance-backend.onrender.com';

  get apiUrl() {
    return isDevMode() ? this.LOCAL_URL : this.LIVE_URL;
  }
  //create singals for list of array of students
  studentList = signal<STUDENTS[]>([]);
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // 4. Wrap your call in this IF statement
    if (isPlatformBrowser(this.platformId)) {
      this.getFormData();
    }
  }

  //for sending student data
  async SendFormData() {
    const data: STUDENTS = this.formData();
    try {
      const response = await firstValueFrom(this.http.post(`${this.apiUrl}/api/submit`, data));
      alert('Data Saved Successfully!');
      this.formData.set({ name: '', attendance: null });
      this.getFormData();
    } catch (error) {
      console.log('Error', error);
    }
  }
  //for getting student data
  async getFormData() {
    try {
      const data = await firstValueFrom(this.http.get<STUDENTS[]>(`${this.apiUrl}/api/students`));
      this.studentList.set(data);
    } catch (error) {
      console.log('Error: ', error);
    }
  }
  async DeleteStudent(id: string | undefined) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/api/delete/${id}`));
      alert('Student Deleted!');
      this.getFormData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }

  isEditing = signal(false);
  currentEditID = signal<string | null>(null);

  editStudent(student: STUDENTS) {
    this.isEditing.set(true);
    this.currentEditID.set(student._id ?? null);
    this.formData.set({
      name: student.name,
      attendance: student.attendance,
    });
  }

  async updateData() {
    const id = this.currentEditID();
    try {
      const response = await firstValueFrom(
        this.http.put<{ message: string }>(`${this.apiUrl}/api/update/${id}`, this.formData())
      );
      alert(`${response.message}`);
      this.cancelEdit();
      this.getFormData();
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.currentEditID.set(null);
    this.formData.set({ name: '', attendance: null });
  }
}
