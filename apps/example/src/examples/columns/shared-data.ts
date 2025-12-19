/**
 * Shared data for column examples
 */

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  description?: string;
  hireDate?: Date;
}

export const sampleEmployees: Employee[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    salary: 75000,
    status: 'active',
    isActive: true,
    description: 'Senior Software Engineer with expertise in React and TypeScript. Leading the frontend team.',
    hireDate: new Date('2021-03-15'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    department: 'Marketing',
    salary: 65000,
    status: 'active',
    isActive: true,
    description: 'Digital Marketing Manager focused on growth and brand awareness.',
    hireDate: new Date('2020-06-20'),
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    department: 'Sales',
    salary: 60000,
    status: 'inactive',
    isActive: false,
    description: 'Sales Representative with strong client relationships.',
    hireDate: new Date('2019-11-10'),
  },
  {
    id: 4,
    name: 'Alice Williams',
    email: 'alice.williams@company.com',
    department: 'HR',
    salary: 55000,
    status: 'pending',
    isActive: true,
    description: 'HR Coordinator managing recruitment and employee relations.',
    hireDate: new Date('2022-01-05'),
  },
  {
    id: 5,
    name: 'Charlie Brown',
    email: 'charlie.brown@company.com',
    department: 'Finance',
    salary: 80000,
    status: 'active',
    isActive: true,
    description: 'Financial Analyst responsible for budgeting and forecasting.',
    hireDate: new Date('2018-09-12'),
  },
  {
    id: 6,
    name: 'Diana Prince',
    email: 'diana.prince@company.com',
    department: 'Engineering',
    salary: 90000,
    status: 'active',
    isActive: true,
    description: 'Principal Engineer leading architecture and technical strategy.',
    hireDate: new Date('2017-04-22'),
  },
  {
    id: 7,
    name: 'Eve Anderson',
    email: 'eve.anderson@company.com',
    department: 'Marketing',
    salary: 62000,
    status: 'active',
    isActive: true,
    description: 'Content Marketing Specialist creating engaging content.',
    hireDate: new Date('2021-07-30'),
  },
  {
    id: 8,
    name: 'Frank Miller',
    email: 'frank.miller@company.com',
    department: 'Sales',
    salary: 58000,
    status: 'pending',
    isActive: true,
    description: 'Junior Sales Associate learning the ropes.',
    hireDate: new Date('2023-02-14'),
  },
];

export const departmentOptions = [
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'HR', label: 'HR' },
  { value: 'Finance', label: 'Finance' },
];

export const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
];
