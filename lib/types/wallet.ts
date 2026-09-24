export interface Wallet {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWalletDTO {
  name: string;
  description?: string | null;
}
