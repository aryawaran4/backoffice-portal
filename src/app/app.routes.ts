import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'employees', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'employees',
        loadComponent: () =>
          import('./pages/employee-list/employee-list.component').then(
            m => m.EmployeeListComponent,
          ),
      },
      {
        path: 'employees/add',
        loadComponent: () =>
          import('./pages/employee-form/employee-form.component').then(
            m => m.EmployeeFormComponent,
          ),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'employees/:id/edit',
        loadComponent: () =>
          import('./pages/employee-form/employee-form.component').then(
            m => m.EmployeeFormComponent,
          ),
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'employees/:id',
        loadComponent: () =>
          import('./pages/employee-detail/employee-detail.component').then(
            m => m.EmployeeDetailComponent,
          ),
      },
    ],
  },
  {
    path: '404',
    loadComponent: () =>
      import('./pages/404/not-found.component').then(m => m.NotFoundComponent),
  },
  { path: '**', redirectTo: '404' },
];
