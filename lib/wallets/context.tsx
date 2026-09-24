"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { Wallet } from "@/lib/types/wallet";

interface WalletContextType {
  wallets: Wallet[];
  currentWallet: Wallet | null;
  isLoading: boolean;
  tableMissing: boolean;
  setCurrentWallet: (wallet: Wallet) => void;
  refreshWallets: () => Promise<Wallet[]>;
  createWallet: (
    name: string,
    description?: string,
  ) => Promise<{ wallet: Wallet | null; error: Error | null }>;
  isCreateWalletOpen: boolean;
  setIsCreateWalletOpen: (open: boolean) => void;
  openCreateWalletModal: () => void;
}

const STORAGE_KEY = "ucontas_active_wallet_id";

const WalletContext = createContext<WalletContextType>({
  wallets: [],
  currentWallet: null,
  isLoading: true,
  tableMissing: false,
  setCurrentWallet: () => {},
  refreshWallets: async () => [],
  createWallet: async () => ({ wallet: null, error: null }),
  isCreateWalletOpen: false,
  setIsCreateWalletOpen: () => {},
  openCreateWalletModal: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currentWallet, setCurrentWalletState] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState(false);

  const fetchWallets = useCallback(async (): Promise<Wallet[]> => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setWallets([]);
        setCurrentWalletState(null);
        setIsLoading(false);
        return [];
      }

      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching wallets:", error);
        if (
          error.code === "42P01" ||
          error.message.includes("relation") ||
          error.message.includes("wallets")
        ) {
          setTableMissing(true);
        }
        setWallets([]);
        setCurrentWalletState(null);
        setIsLoading(false);
        return [];
      }

      setTableMissing(false);
      const userWallets: Wallet[] = data || [];
      setWallets(userWallets);

      if (userWallets.length > 0) {
        const savedId = localStorage.getItem(STORAGE_KEY);
        const matched = userWallets.find((w) => w.id === savedId);
        if (matched) {
          setCurrentWalletState(matched);
        } else {
          setCurrentWalletState(userWallets[0]);
          localStorage.setItem(STORAGE_KEY, userWallets[0].id);
        }
      } else {
        setCurrentWalletState(null);
        localStorage.removeItem(STORAGE_KEY);
      }

      setIsLoading(false);
      return userWallets;
    } catch (err) {
      console.error("fetchWallets catch:", err);
      setIsLoading(false);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchWallets();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchWallets();
      } else {
        setWallets([]);
        setCurrentWalletState(null);
        localStorage.removeItem(STORAGE_KEY);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchWallets]);

  const setCurrentWallet = (wallet: Wallet) => {
    setCurrentWalletState(wallet);
    localStorage.setItem(STORAGE_KEY, wallet.id);
  };

  const createWallet = async (
    name: string,
    description?: string,
  ): Promise<{ wallet: Wallet | null; error: Error | null }> => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("wallets")
        .insert({
          user_id: user.id,
          name: name.trim(),
          description: description?.trim() || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating wallet:", error);
        if (
          error.code === "42P01" ||
          error.message.includes("relation") ||
          error.message.includes("wallets")
        ) {
          setTableMissing(true);
        }
        return { wallet: null, error: new Error(error.message) };
      }

      const newWallet: Wallet = data;
      setWallets((prev) => [...prev, newWallet]);
      setCurrentWallet(newWallet);
      return { wallet: newWallet, error: null };
    } catch (err: unknown) {
      console.error("createWallet catch:", err);
      const error = err instanceof Error ? err : new Error("Erro desconhecido");
      return { wallet: null, error };
    }
  };

  const openCreateWalletModal = () => {
    setIsCreateWalletOpen(true);
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        currentWallet,
        isLoading,
        tableMissing,
        setCurrentWallet,
        refreshWallets: fetchWallets,
        createWallet,
        isCreateWalletOpen,
        setIsCreateWalletOpen,
        openCreateWalletModal,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
