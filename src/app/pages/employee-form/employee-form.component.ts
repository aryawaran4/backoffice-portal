import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Employee } from '../../models/employee.model';
import { EmployeeService, GROUPS } from '../../services/employee.service';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  today = new Date();
  filteredGroups = signal<string[]>(GROUPS);
  isEditMode = false;
  existingEmployee: Employee | undefined;

  form = this.fb.group({
    username: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    birthDate: [null as Date | null, Validators.required],
    basicSalary: [null as number | null, [Validators.required, Validators.min(0)]],
    status: ['', Validators.required],
    group: ['', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.existingEmployee = this.employeeService.getById(Number(id));
      if (!this.existingEmployee) {
        this.router.navigate(['/404']);
        return;
      }
      this.form.patchValue({
        ...this.existingEmployee,
        birthDate: new Date(this.existingEmployee.birthDate),
      });
    }
  }

  private errorMessages: Record<string, Record<string, string>> = {
    username:    { required: 'Username is required', duplicate: 'Username is already taken' },
    email:       { required: 'Email is required', email: 'Please enter a valid email address', duplicate: 'Email is already in use' },
    firstName:   { required: 'First name is required' },
    lastName:    { required: 'Last name is required' },
    birthDate:   { required: 'Birth date is required', matDatepickerMax: 'Birth date cannot be in the future' },
    basicSalary: { required: 'Basic salary is required', min: 'Salary must be a positive number' },
    status:      { required: 'Status is required' },
    group:       { required: 'Group is required' },
    description: { required: 'Description is required' },
  };

  getError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.touched || !ctrl.errors) return '';
    const msgs = this.errorMessages[field] ?? {};
    return Object.keys(ctrl.errors).map(k => msgs[k]).find(Boolean) ?? '';
  }

  filterGroups(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredGroups.set(GROUPS.filter(g => g.toLowerCase().includes(query)));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const excludeId = this.existingEmployee?.id;

    const usernameTaken = this.employeeService.isUsernameTaken(val.username!, excludeId);
    const emailTaken = this.employeeService.isEmailTaken(val.email!, excludeId);

    if (usernameTaken) this.form.get('username')?.setErrors({ duplicate: true });
    if (emailTaken) this.form.get('email')?.setErrors({ duplicate: true });
    if (usernameTaken || emailTaken) return;

    const data = {
      username: val.username!,
      firstName: val.firstName!,
      lastName: val.lastName!,
      email: val.email!,
      birthDate: val.birthDate!,
      basicSalary: val.basicSalary!,
      status: val.status!,
      group: val.group!,
      description: val.description ?? '',
    };

    if (this.isEditMode && this.existingEmployee) {
      this.employeeService.update(this.existingEmployee.id, data);
    } else {
      this.employeeService.add(data);
    }

    this.form.markAsPristine();
    this.router.navigate(['/employees']);
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
