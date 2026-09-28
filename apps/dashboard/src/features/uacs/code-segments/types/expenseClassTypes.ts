export interface ExpenseClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  type: number;
  isActive: boolean;
  fiscalYear?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExpenseClassPayload {
  name: string;
  code: string;
  description?: string;
  type: number;
  isActive: boolean;
}

export interface UpdateExpenseClassPayload {
  name: string;
  code: string;
  description?: string;
  type: number;
  isActive: boolean;
}
