/**
 * Sample data for examples
 * Import JSON data files for use in DataTable examples
 */

import employeesData from './employees.json';
import productsData from './products.json';
import ordersData from './orders.json';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: 'active' | 'inactive';
  joinDate: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'in_stock' | 'out_of_stock';
  rating: number;
  brand: string;
}

export interface Order {
  id: string;
  customerName: string;
  product: string;
  quantity: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed';
  orderDate: string;
  shippingAddress: string;
}

export const employees: Employee[] = employeesData as Employee[];
export const products: Product[] = productsData as Product[];
export const orders: Order[] = ordersData as Order[];

export default {
  employees,
  products,
  orders,
};

