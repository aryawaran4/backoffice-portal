import { computed, Injectable, signal } from '@angular/core';
import { Employee, SearchState } from '../models/employee.model';

export const GROUPS = [
  'Engineering',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'Sales',
  'Product',
  'Design',
  'Legal',
  'Support',
];

const STATUSES = ['Active', 'Inactive'];

const FIRST_NAMES = [
  'Budi', 'Siti', 'Andi', 'Dewi', 'Rizky', 'Ani', 'Doni', 'Rina',
  'Fajar', 'Mega', 'Hendra', 'Yuni', 'Bagas', 'Putri', 'Galih',
  'Indah', 'Wahyu', 'Novi', 'Dian', 'Agus',
];

const LAST_NAMES = [
  'Santoso', 'Wijaya', 'Kusuma', 'Prasetyo', 'Hidayat', 'Rahayu',
  'Setiawan', 'Lestari', 'Putra', 'Wati', 'Nugroho', 'Sari',
  'Handoko', 'Purnama', 'Saputra',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmployees(): Employee[] {
  const employees: Employee[] = [];
  for (let i = 1; i <= 100; i++) {
    const firstName = randomFrom(FIRST_NAMES);
    const lastName = randomFrom(LAST_NAMES);
    employees.push({
      id: i,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@company.com`,
      birthDate: randomDate(new Date(1975, 0, 1), new Date(2000, 11, 31)),
      basicSalary: Math.round((3_000_000 + Math.random() * 17_000_000) / 1000) * 1000,
      status: randomFrom(STATUSES),
      group: randomFrom(GROUPS),
      description: `Employee ${i} — ${randomFrom(GROUPS)} division team member.`,
    });
  }
  return employees;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private _employees = signal<Employee[]>(generateEmployees());

  totalCount = computed(() => this._employees().length);
  activeCount = computed(() => this._employees().filter(e => e.status === 'Active').length);
  averageSalary = computed(() => {
    const list = this._employees();
    if (!list.length) return 0;
    return Math.round(list.reduce((sum, e) => sum + e.basicSalary, 0) / list.length);
  });
  largestGroup = computed(() => {
    const counts = this._employees().reduce((acc, e) => {
      acc[e.group] = (acc[e.group] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
  });

  searchState: SearchState = {
    name: '',
    group: '',
    pageIndex: 0,
    pageSize: 10,
    sortActive: '',
    sortDirection: '',
  };

  get employees() {
    return this._employees();
  }

  getById(id: number): Employee | undefined {
    return this._employees().find(e => e.id === id);
  }

  add(employee: Omit<Employee, 'id'>): void {
    const nextId = Math.max(...this._employees().map(e => e.id)) + 1;
    this._employees.update(list => [...list, { id: nextId, ...employee }]);
  }

  update(id: number, changes: Omit<Employee, 'id'>): void {
    this._employees.update(list =>
      list.map(e => (e.id === id ? { id, ...changes } : e)),
    );
  }

  delete(id: number): void {
    this._employees.update(list => list.filter(e => e.id !== id));
  }
}
