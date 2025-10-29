export interface User {
  id: number;
  email: string;
  password: string;
  businessId: number;
  role: 'admin' | 'employee';
  createdAt: Date;
  updatedAt: Date;
}

export interface Business {
  id: number;
  name: string;
  type: string;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sale {
  id: number;
  total: number;
  businessId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
