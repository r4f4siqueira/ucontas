"use client";

import React, { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import { TransactionType } from "@/lib/types/transaction";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  onSuccess?: () => void;
}

export function TransactionDialog({
  isOpen,
  onClose,
  defaultType = "income",
  onSuccess,
}: TransactionDialogProps) {
  const { text } = useLanguage();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Today's date formatted as YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setTitle("");
      setAmount("");
      setDescription("");
      setDate(getTodayDate());
      setErrorMessage(null);
    }
  }, [isOpen, defaultType]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Robust currency parser supporting Brazilian (1.500,50 or 150,50) and international formats
  const parseCurrencyInput = (value: string): number => {
    if (!value) return 0;
    let clean = value.trim();

    if (clean.includes(".") && clean.includes(",")) {
      const lastDot = clean.lastIndexOf(".");
      const lastComma = clean.lastIndexOf(",");
      if (lastComma > lastDot) {
        // Brazilian: 1.500,50 -> 1500.50
        clean = clean.replace(/\./g, "").replace(",", ".");
      } else {
        // US: 1,500.50 -> 1500.50
        clean = clean.replace(/,/g, "");
      }
    } else if (clean.includes(",")) {
      // 150,50 -> 150.50
      clean = clean.replace(/,/g, ".");
    }

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Allow only numbers, dots and commas
    val = val.replace(/[^0-9.,]/g, "");
    setAmount(val);
  };

  const handleAmountBlur = () => {
    const num = parseCurrencyInput(amount);
    if (num > 0) {
      setAmount(
        num.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate required fields
    if (!title.trim()) {
      setErrorMessage(text.dashboard.errorFillRequired);
      return;
    }

    const numericAmount = parseCurrencyInput(amount);

    if (numericAmount <= 0) {
      setErrorMessage(text.dashboard.errorFillRequired);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const transactionDate = date.trim() ? date : getTodayDate();

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        title: title.trim(),
        amount: numericAmount,
        type,
        description: description.trim() || null,
        date: transactionDate,
      });

      if (error) {
        console.error("Supabase insert error:", error);
        if (error.code === "42P01" || error.message.includes("relation") || error.message.includes("transactions")) {
          setErrorMessage(text.dashboard.tableMissingWarning);
        } else {
          setErrorMessage(error.message || text.dashboard.errorSaving);
        }
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error("Error submitting transaction:", err);
      const message = err instanceof Error ? err.message : text.dashboard.errorSaving;
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  const isIncome = type === "income";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card p-6 text-card-foreground shadow-2xl transition-all sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
          aria-label="Fechar"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="mb-6 space-y-1">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isIncome
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isIncome ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {isIncome
                ? text.dashboard.modalIncomeTitle
                : text.dashboard.modalExpenseTitle}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {isIncome
              ? text.dashboard.modalIncomeSubtitle
              : text.dashboard.modalExpenseSubtitle}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {text.dashboard.typeLabel}
            </Label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/60 p-1">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                  isIncome
                    ? "bg-background text-emerald-600 shadow-sm dark:text-emerald-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingUp size={16} />
                {text.dashboard.income}
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                  !isIncome
                    ? "bg-background text-rose-600 shadow-sm dark:text-rose-400"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TrendingDown size={16} />
                {text.dashboard.expenses}
              </button>
            </div>
          </div>

          {/* Title (Required) */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-title" className="text-sm font-medium">
              {text.dashboard.titleLabel} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="tx-title"
              type="text"
              required
              autoFocus
              placeholder={
                isIncome
                  ? text.dashboard.titlePlaceholderIncome
                  : text.dashboard.titlePlaceholderExpense
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="h-10"
            />
          </div>

          {/* Amount (Required) & Date (Optional/Pre-filled) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="tx-amount" className="text-sm font-medium">
                {text.dashboard.amountLabel} <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                  R$
                </span>
                <Input
                  id="tx-amount"
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder={text.dashboard.amountPlaceholder}
                  value={amount}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  disabled={isSubmitting}
                  className="h-10 pl-10 font-medium"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label htmlFor="tx-date" className="text-sm font-medium">
                {text.dashboard.dateLabel}
              </Label>
              <Input
                id="tx-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                className="h-10 block"
              />
            </div>
          </div>

          {/* Description (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-desc" className="text-sm font-medium">
              {text.dashboard.descriptionLabel}
            </Label>
            <textarea
              id="tx-desc"
              rows={3}
              placeholder={text.dashboard.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {text.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  : "bg-rose-600 hover:bg-rose-700 text-white font-medium"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {text.dashboard.saving}
                </>
              ) : (
                text.dashboard.saveTransaction
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
