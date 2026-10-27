"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Wallet as WalletIcon,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  FolderPlus,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { useWallet } from "@/lib/wallets/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Transaction, TransactionType } from "@/lib/types/transaction";
import { TransactionDialog } from "@/components/transaction-dialog";

export default function DashboardPage() {
  const { text, language } = useLanguage();
  const {
    wallets,
    currentWallet,
    isLoading: isWalletsLoading,
    tableMissing: isWalletsTableMissing,
    openCreateWalletModal,
  } = useWallet();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TransactionType>("income");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch transactions from Supabase for current wallet
  const fetchTransactions = useCallback(async () => {
    if (!currentWallet) {
      setTransactions([]);
      setIsLoadingTransactions(false);
      return;
    }

    try {
      setIsLoadingTransactions(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingTransactions(false);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .eq("wallet_id", currentWallet.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        if (
          error.code === "42P01" ||
          error.message.includes("relation") ||
          error.message.includes("transactions") ||
          error.message.includes("wallet_id")
        ) {
          setTableMissing(true);
        }
        setTransactions([]);
      } else {
        setTableMissing(false);
        setTransactions(data || []);
      }
    } catch (err) {
      console.error("Fetch transactions catch:", err);
    } finally {
      setIsLoadingTransactions(false);
    }
  }, [currentWallet]);

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  // Open dialog for income
  const handleOpenIncome = () => {
    setDialogType("income");
    setIsDialogOpen(true);
  };

  // Open dialog for expense
  const handleOpenExpense = () => {
    setDialogType("expense");
    setIsDialogOpen(true);
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    const confirmed = window.confirm(text.dashboard.deleteConfirm);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("transactions").delete().eq("id", id);

      if (error) {
        console.error("Error deleting transaction:", error);
        setToastMessage({
          text: text.dashboard.errorDeleting,
          type: "error",
        });
      } else {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        setToastMessage({
          text: text.dashboard.successDelete,
          type: "success",
        });
      }
    } catch (err) {
      console.error("Delete catch:", err);
      setToastMessage({
        text: text.dashboard.errorDeleting,
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpenses;

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(language === "pt" ? "pt-BR" : "en-US", {
      style: "currency",
      currency: language === "pt" ? "BRL" : "USD",
    }).format(val);
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split("-");
      if (!year || !month || !day) return dateString;
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      return dateObj.toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Filtered transactions list
  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "income") return tx.type === "income";
    if (filterType === "expense") return tx.type === "expense";
    return true;
  });

  // If wallets are loading
  if (isWalletsLoading) {
    return (
      <div className="flex min-h-[50vh] w-full flex-1 flex-col items-center justify-center gap-3">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-muted-foreground text-sm">{text.common.loading}</p>
      </div>
    );
  }

  // If user has no wallets yet
  if (wallets.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12">
        {/* Table Warning if needed */}
        {(tableMissing || isWalletsTableMissing) && (
          <div className="mb-6 flex w-full items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 px-5 text-sm text-amber-900 dark:text-amber-200">
            <AlertCircle size="20" className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold">{text.wallets.tableMissingWarning}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Execute o script de migração no Supabase SQL Editor.
              </p>
            </div>
          </div>
        )}

        <div className="bg-card text-card-foreground w-full space-y-6 rounded-2xl border p-8 text-center shadow-lg sm:p-10">
          <div className="bg-primary/10 text-primary mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
            <WalletIcon size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{text.wallets.noWalletsTitle}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {text.wallets.noWalletsDesc}
            </p>
          </div>

          <div className="pt-2">
            <Button
              onClick={openCreateWalletModal}
              size="lg"
              className="h-11 gap-2 px-6 font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FolderPlus size={18} />
              <span>{text.wallets.createFirstWallet}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`animate-in slide-in-from-bottom-4 fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-xl border p-4 text-sm font-medium shadow-xl duration-200 ${
            toastMessage.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
              : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-200"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Table Missing Warning Alert if Supabase Table doesn't exist */}
      {tableMissing && (
        <div className="flex w-full flex-col justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 px-5 text-sm text-amber-900 sm:flex-row sm:items-center dark:text-amber-200">
          <div className="flex items-start gap-3 sm:items-center">
            <AlertCircle
              size="20"
              className="mt-0.5 shrink-0 text-amber-600 sm:mt-0 dark:text-amber-400"
            />
            <div>
              <p className="font-semibold">{text.dashboard.tableMissingWarning}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Execute o script de criação das tabelas &apos;wallets&apos; e
                &apos;transactions&apos; no Supabase SQL Editor.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchTransactions()}
            className="shrink-0 self-end sm:self-auto"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Dashboard Top Header & Action Buttons */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-3xl font-bold tracking-tight">{text.dashboard.title}</h1>
            {currentWallet && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5 border px-2.5 py-0.5 text-xs font-semibold"
              >
                <WalletIcon size={12} />
                <span>{currentWallet.name}</span>
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {currentWallet?.description || text.dashboard.welcome}
          </p>
        </div>

        {/* 2 Main Action Buttons: Cadastrar Receita & Adicionar Despesa */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenIncome}
            className="h-10 gap-2 bg-emerald-600 px-4 font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            <TrendingUp size={18} />
            <span>{text.dashboard.addIncome}</span>
          </Button>

          <Button
            onClick={handleOpenExpense}
            className="h-10 gap-2 bg-rose-600 px-4 font-medium text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-rose-700 hover:shadow-md active:scale-[0.98]"
          >
            <TrendingDown size={18} />
            <span>{text.dashboard.addExpense}</span>
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Total Balance Card */}
        <div className="bg-card text-card-foreground rounded-2xl border p-6 shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium">
              {text.dashboard.totalBalance}
            </p>
            <div className="bg-primary/10 text-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <WalletIcon size={18} />
            </div>
          </div>
          <p
            className={`mt-3 text-2xl font-bold tracking-tight ${
              totalBalance > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : totalBalance < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
            }`}
          >
            {isLoadingTransactions ? "..." : formatCurrency(totalBalance)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {totalBalance >= 0 ? "Saldo positivo" : "Saldo negativo"}
          </p>
        </div>

        {/* Income Card */}
        <div className="bg-card text-card-foreground rounded-2xl border p-6 shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium">{text.dashboard.income}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {isLoadingTransactions ? "..." : formatCurrency(totalIncome)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {transactions.filter((t) => t.type === "income").length}{" "}
            {text.dashboard.incomeFilter.toLowerCase()}
          </p>
        </div>

        {/* Expenses Card */}
        <div className="bg-card text-card-foreground rounded-2xl border p-6 shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm font-medium">{text.dashboard.expenses}</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {isLoadingTransactions ? "..." : formatCurrency(totalExpenses)}
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
            {transactions.filter((t) => t.type === "expense").length}{" "}
            {text.dashboard.expenseFilter.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="bg-card text-card-foreground space-y-5 rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b pb-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {text.dashboard.recentTransactions}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Histórico de lançamentos em {currentWallet?.name || "esta carteira"}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="bg-muted/60 flex items-center gap-1.5 self-start rounded-xl p-1 sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {text.dashboard.allFilter} ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType("income")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === "income"
                  ? "bg-background text-emerald-600 shadow-sm dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {text.dashboard.incomeFilter}
            </button>
            <button
              onClick={() => setFilterType("expense")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filterType === "expense"
                  ? "bg-background text-rose-600 shadow-sm dark:text-rose-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {text.dashboard.expenseFilter}
            </button>
          </div>
        </div>

        {/* Transactions List Content */}
        {isLoadingTransactions ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="text-primary h-7 w-7 animate-spin" />
            <p className="text-sm">{text.common.loading}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center space-y-3 py-12 text-center">
            <div className="bg-muted/80 text-muted-foreground flex h-14 w-14 items-center justify-center rounded-2xl">
              <Calendar size={28} />
            </div>
            <div className="max-w-sm space-y-1">
              <p className="text-foreground font-semibold">{text.dashboard.noTransactions}</p>
              <p className="text-muted-foreground text-xs">{text.dashboard.noTransactionsDesc}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleOpenIncome}
                className="h-8 bg-emerald-600 px-3 text-xs text-white hover:bg-emerald-700"
              >
                <Plus size={14} className="mr-1" />
                {text.dashboard.newIncome}
              </Button>
              <Button
                size="sm"
                onClick={handleOpenExpense}
                className="h-8 bg-rose-600 px-3 text-xs text-white hover:bg-rose-700"
              >
                <Plus size={14} className="mr-1" />
                {text.dashboard.newExpense}
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-border/60 divide-y">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const isDeleting = deletingId === tx.id;

              return (
                <div
                  key={tx.id}
                  className="hover:bg-muted/30 flex flex-col justify-between gap-3 rounded-xl px-2 py-3.5 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-foreground truncate text-sm font-semibold">{tx.title}</p>
                        <Badge
                          variant="secondary"
                          className={`px-1.5 py-0 text-[10px] font-medium ${
                            isIncome
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {isIncome ? text.dashboard.income : text.dashboard.expenses}
                        </Badge>
                      </div>

                      {tx.description && (
                        <p className="text-muted-foreground line-clamp-1 text-xs">
                          {tx.description}
                        </p>
                      )}

                      <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                        <Calendar size={12} />
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pl-13 sm:justify-end sm:pl-0">
                    <span
                      className={`text-base font-bold tracking-tight whitespace-nowrap ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(Number(tx.amount))}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteTransaction(tx.id)}
                      disabled={isDeleting}
                      title={text.common.delete}
                      className="text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive rounded-lg p-1.5 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2 size={16} className="text-destructive animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction Modal Dialog */}
      <TransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        defaultType={dialogType}
        walletId={currentWallet?.id}
        onSuccess={() => {
          void fetchTransactions();
          setToastMessage({
            text:
              dialogType === "income"
                ? text.dashboard.successIncome
                : text.dashboard.successExpense,
            type: "success",
          });
        }}
      />
    </div>
  );
}
