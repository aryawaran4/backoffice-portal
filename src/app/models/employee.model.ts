export interface Employee {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
  basicSalary: number;
  status: string;
  group: string;
  description: string;
}

export interface SearchState {
  name: string;
  group: string;
  pageIndex: number;
  pageSize: number;
  sortActive: string;
  sortDirection: string;
}
