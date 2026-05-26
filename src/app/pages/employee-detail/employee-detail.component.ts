import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss'],
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  employee: Employee | undefined;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.employee = this.employeeService.getById(id);
    if (!this.employee) {
      this.router.navigate(['/404']);
    }
  }

  formatSalary(amount: number): string {
    const formatted = amount
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `Rp. ${formatted}`;
  }

  onEdit(): void {
    this.router.navigate(['/employees', this.employee!.id, 'edit']);
  }

  onDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: { name: `${this.employee!.firstName} ${this.employee!.lastName}` },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.employeeService.delete(this.employee!.id);
      this.snackBar.open(
        `${this.employee!.firstName} ${this.employee!.lastName} has been deleted.`,
        'Close',
        { duration: 4000, panelClass: ['snack-danger'], horizontalPosition: 'right', verticalPosition: 'top' },
      );
      this.router.navigate(['/employees']);
    });
  }

  goBack(): void {
    this.router.navigate(['/employees']);
  }
}
