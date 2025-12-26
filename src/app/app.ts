import { HttpClient } from '@angular/common/http';
import { Component, Inject, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

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

  //create singals for list of array of students
  studentList = signal<STUDENTS[]>([]);

  ngOnInit() {
    this.getFormData();
  }

  //for sending student data
  async SendFormData() {
    const data: STUDENTS = this.formData();
    try {
      const response = await firstValueFrom(
        this.http.post(`${environment.apiUrl}api/submit`, data)
      );
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
      const data = await firstValueFrom(
        this.http.get<STUDENTS[]>(`${environment.apiUrl}api/students`)
      );
      this.studentList.set(data);
    } catch (error) {
      console.log('Error: ', error);
    }
  }
  async DeleteStudent(id: string) {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await firstValueFrom(this.http.delete(`${environment.apiUrl}api/delete/${id}`));
      alert('Student Deleted!');
      this.getFormData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  }
}
