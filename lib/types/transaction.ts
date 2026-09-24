export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id?: string | null;
  title: string;
  amount: number;
  type: TransactionType;
  description?: string | null;
  date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTransactionDTO {
  wallet_id: string;
  title: string;
  amount: number;
  type: TransactionType;
  description?: string | null;
  date?: string;
}
