import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeFormComponent } from '../pages/employee-form/employee-form.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';

export const unsavedChangesGuard: CanDeactivateFn<EmployeeFormComponent> = (component) => {
  if (!component.form.dirty) return true;

  const dialog = inject(MatDialog);
  return dialog.open(ConfirmDialogComponent, {
    width: '360px',
    data: {
      title: 'Unsaved Changes',
      name: '',
      message: 'You have unsaved changes. If you leave, your changes will be lost.',
      confirmLabel: 'Leave',
      confirmIcon: 'exit_to_app',
    },
  }).afterClosed();
};
