"use client";

import React, { useState, useEffect } from "react";
import { X, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n/context";
import { useWallet } from "@/lib/wallets/context";

interface CreateWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateWalletDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateWalletDialogProps) {
  const { text } = useLanguage();
  const { createWallet } = useWallet();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setErrorMessage(null);
    }
  }, [isOpen]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage(text.wallets.errorFillName);
      return;
    }

    setIsSubmitting(true);

    try {
      const { wallet, error } = await createWallet(name, description);

      if (error || !wallet) {
        setErrorMessage(
          error?.message?.includes("relation") || error?.message?.includes("wallets")
            ? text.wallets.tableMissingWarning
            : error?.message || text.wallets.errorCreated
        );
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      console.error("Create wallet error:", err);
      const msg = err instanceof Error ? err.message : text.wallets.errorCreated;
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

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
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6 text-card-foreground shadow-2xl transition-all sm:p-7 z-10 animate-in fade-in zoom-in-95 duration-150">
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Wallet size={18} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {text.wallets.createWallet}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Cadastre uma carteira para separar suas contas pessoais e empresariais.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Wallet Name (Required) */}
          <div className="space-y-1.5">
            <Label htmlFor="wallet-name" className="text-sm font-medium">
              {text.wallets.nameLabel} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="wallet-name"
              type="text"
              required
              autoFocus
              placeholder={text.wallets.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className="h-10"
            />
          </div>

          {/* Description (Optional) */}
          <div className="space-y-1.5">
            <Label htmlFor="wallet-desc" className="text-sm font-medium">
              {text.wallets.descriptionLabel}
            </Label>
            <textarea
              id="wallet-desc"
              rows={3}
              placeholder={text.wallets.descriptionPlaceholder}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Error Banner */}
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
              className="font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {text.wallets.creating}
                </>
              ) : (
                text.wallets.createWallet
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
