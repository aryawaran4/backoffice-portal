import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Employee } from '../../models/employee.model';
import { EmployeeService, GROUPS } from '../../services/employee.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  employeeService = inject(EmployeeService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  groups = GROUPS;

  displayedColumns = [
    'username', 'firstName', 'lastName', 'email',
    'birthDate', 'basicSalary', 'status', 'group', 'actions',
  ];

  dataSource = new MatTableDataSource<Employee>([]);

  searchForm = this.fb.group({ name: [''], group: [''] });

  ngOnInit(): void {
    this.dataSource.data = this.employeeService.employees;
    this.dataSource.filterPredicate = this.buildFilterPredicate();

    const state = this.employeeService.searchState;
    this.searchForm.setValue({ name: state.name, group: state.group });
    this.applyFilter();

    this.searchForm.valueChanges.subscribe(() => this.applyFilter());
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    const state = this.employeeService.searchState;
    if (state.sortActive) {
      this.sort.sort({ id: state.sortActive, start: state.sortDirection as 'asc' | 'desc', disableClear: false });
    }
    this.paginator.pageIndex = state.pageIndex;
    this.paginator.pageSize = state.pageSize;

    this.sort.sortChange.subscribe(() => this.saveState());
    this.paginator.page.subscribe(() => this.saveState());
  }

  private buildFilterPredicate() {
    return (employee: Employee, filter: string): boolean => {
      const { name, group } = JSON.parse(filter);
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      const nameMatch = !name || fullName.includes(name.toLowerCase());
      const groupMatch = !group || employee.group === group;
      return nameMatch && groupMatch;
    };
  }

  applyFilter(): void {
    const { name, group } = this.searchForm.value;
    this.dataSource.filter = JSON.stringify({ name: name ?? '', group: group ?? '' });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    this.saveState();
  }

  clearField(field: 'name' | 'group'): void {
    this.searchForm.get(field)?.setValue('');
  }

  clearSearch(): void {
    this.searchForm.setValue({ name: '', group: '' });
  }

  saveState(): void {
    const { name, group } = this.searchForm.value;
    this.employeeService.searchState = {
      name: name ?? '',
      group: group ?? '',
      pageIndex: this.paginator?.pageIndex ?? 0,
      pageSize: this.paginator?.pageSize ?? 10,
      sortActive: this.sort?.active ?? '',
      sortDirection: this.sort?.direction ?? '',
    };
  }

  toggleStatus(employee: Employee): void {
    this.employeeService.update(employee.id, {
      ...employee,
      status: employee.status === 'Active' ? 'Inactive' : 'Active',
    });
    this.dataSource.data = this.employeeService.employees;
  }

  viewDetail(employee: Employee): void {
    this.saveState();
    this.router.navigate(['/employees', employee.id]);
  }

  exportCsv(): void {
    const headers = ['Username', 'First Name', 'Last Name', 'Email', 'Birth Date', 'Basic Salary (IDR)', 'Status', 'Group', 'Description'];
    const escape = (v: string) => (v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v);
    const rows = this.dataSource.filteredData.map(e => [
      e.username,
      e.firstName,
      e.lastName,
      e.email,
      new Date(e.birthDate).toLocaleDateString('id-ID'),
      e.basicSalary.toString(),
      e.status,
      e.group,
      escape(e.description),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  addEmployee(): void {
    this.router.navigate(['/employees/add']);
  }

  onEdit(employee: Employee): void {
    this.router.navigate(['/employees', employee.id, 'edit']);
  }

  onDelete(employee: Employee): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { name: `${employee.firstName} ${employee.lastName}` },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.employeeService.delete(employee.id);
      this.dataSource.data = this.employeeService.employees;
      this.snackBar.open(
        `${employee.firstName} ${employee.lastName} has been deleted.`,
        'Close',
        {
          duration: 4000,
          panelClass: ['snack-danger'],
          horizontalPosition: 'right',
          verticalPosition: 'bottom',
        },
      );
    });
  }
}
