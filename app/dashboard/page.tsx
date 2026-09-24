"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Wallet,
  Trash2,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { Transaction, TransactionType } from "@/lib/types/transaction";
import { TransactionDialog } from "@/components/transaction-dialog";

export default function DashboardPage() {
  const { text, language } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<TransactionType>("income");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
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

  // Fetch transactions from Supabase
  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transactions:", error);
        if (
          error.code === "42P01" ||
          error.message.includes("relation") ||
          error.message.includes("transactions")
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
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
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

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

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-5xl mx-auto py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl p-4 text-sm font-medium shadow-xl border animate-in slide-in-from-bottom-4 duration-200 ${
            toastMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-800"
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Table Missing Warning Alert if Supabase Table doesn't exist */}
      {tableMissing && (
        <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm p-4 px-5 rounded-lg flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex gap-3 items-start sm:items-center">
            <AlertCircle
              size="20"
              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0"
            />
            <div>
              <p className="font-semibold">
                {text.dashboard.tableMissingWarning}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Execute o script de criação da tabela &apos;transactions&apos;
                no Supabase SQL Editor.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchTransactions()}
            className="self-end sm:self-auto shrink-0"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Dashboard Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {text.dashboard.title}
          </h1>
          <p className="text-muted-foreground">{text.dashboard.welcome}</p>
        </div>

        {/* 2 Main Action Buttons: Cadastrar Receita & Adicionar Despesa */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenIncome}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] gap-2 h-10 px-4"
          >
            <TrendingUp size={18} />
            <span>{text.dashboard.addIncome}</span>
          </Button>

          <Button
            onClick={handleOpenExpense}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] gap-2 h-10 px-4"
          >
            <TrendingDown size={18} />
            <span>{text.dashboard.addExpense}</span>
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance Card */}
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {text.dashboard.totalBalance}
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet size={18} />
            </div>
          </div>
          <p
            className={`text-2xl font-bold mt-3 tracking-tight ${
              totalBalance > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : totalBalance < 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-foreground"
            }`}
          >
            {isLoading ? "..." : formatCurrency(totalBalance)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {totalBalance >= 0 ? "Saldo positivo" : "Saldo negativo"}
          </p>
        </div>

        {/* Income Card */}
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {text.dashboard.income}
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-3 tracking-tight">
            {isLoading ? "..." : formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.filter((t) => t.type === "income").length}{" "}
            {text.dashboard.incomeFilter.toLowerCase()}
          </p>
        </div>

        {/* Expenses Card */}
        <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {text.dashboard.expenses}
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowDownRight size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-3 tracking-tight">
            {isLoading ? "..." : formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {transactions.filter((t) => t.type === "expense").length}{" "}
            {text.dashboard.expenseFilter.toLowerCase()}
          </p>
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="rounded-2xl border bg-card text-card-foreground shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {text.dashboard.recentTransactions}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Histórico de movimentações financeiras
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {text.dashboard.allFilter} ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType("income")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === "income"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {text.dashboard.incomeFilter}
            </button>
            <button
              onClick={() => setFilterType("expense")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === "expense"
                  ? "bg-background text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {text.dashboard.expenseFilter}
            </button>
          </div>
        </div>

        {/* Transactions List Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm">{text.common.loading}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground">
              <Calendar size={28} />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="font-semibold text-foreground">
                {text.dashboard.noTransactions}
              </p>
              <p className="text-xs text-muted-foreground">
                {text.dashboard.noTransactionsDesc}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleOpenIncome}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3"
              >
                <Plus size={14} className="mr-1" />
                {text.dashboard.newIncome}
              </Button>
              <Button
                size="sm"
                onClick={handleOpenExpense}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-8 px-3"
              >
                <Plus size={14} className="mr-1" />
                {text.dashboard.newExpense}
              </Button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const isDeleting = deletingId === tx.id;

              return (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 transition-colors hover:bg-muted/30 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isIncome
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {isIncome ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {tx.title}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-[10px] px-1.5 py-0 font-medium ${
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {isIncome
                            ? text.dashboard.income
                            : text.dashboard.expenses}
                        </Badge>
                      </div>

                      {tx.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {tx.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Calendar size={12} />
                        <span>{formatDate(tx.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
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
                      className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-destructive"
                        />
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
        onSuccess={() => {
          fetchTransactions();
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
