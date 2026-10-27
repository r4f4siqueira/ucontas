"use client";

import React, { useEffect, useState } from "react";
import { Wallet as WalletIcon, ChevronDown, Plus, Check, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/lib/i18n/context";
import { useWallet } from "@/lib/wallets/context";
import { createClient } from "@/lib/supabase/client";
import { CreateWalletDialog } from "@/components/create-wallet-dialog";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function WalletSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { text } = useLanguage();
  const {
    wallets,
    currentWallet,
    setCurrentWallet,
    isLoading,
    isCreateWalletOpen,
    setIsCreateWalletOpen,
    openCreateWalletModal,
  } = useWallet();

  useEffect(() => {
    setMounted(true);
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!mounted || !user) {
    return null;
  }

  if (isLoading) {
    return <div className="bg-muted/50 h-8 w-24 animate-pulse rounded-md" />;
  }

  // Helper icon for wallet name
  const getWalletIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (
      lower.includes("empresa") ||
      lower.includes("pj") ||
      lower.includes("corp") ||
      lower.includes("negócio")
    ) {
      return <Building2 size={15} className="shrink-0 text-blue-500" />;
    }
    if (
      lower.includes("pessoal") ||
      lower.includes("pf") ||
      lower.includes("casa") ||
      lower.includes("família")
    ) {
      return <User size={15} className="shrink-0 text-emerald-500" />;
    }
    return <WalletIcon size={15} className="shrink-0 text-amber-500" />;
  };

  return (
    <>
      {wallets.length === 0 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={openCreateWalletModal}
          className="border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary flex h-8 items-center gap-1.5 px-2.5 text-xs font-semibold"
        >
          <Plus size={14} />
          <span>{text.wallets.createWallet}</span>
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hover:bg-accent flex h-8 max-w-[170px] items-center gap-2 truncate px-2.5 text-xs font-semibold shadow-sm sm:max-w-[210px]"
              title={currentWallet ? currentWallet.name : text.wallets.selectWallet}
            >
              {currentWallet ? (
                getWalletIcon(currentWallet.name)
              ) : (
                <WalletIcon size={14} className="text-muted-foreground shrink-0" />
              )}
              <span className="truncate font-medium">
                {currentWallet ? currentWallet.name : text.wallets.selectWallet}
              </span>
              <ChevronDown
                size={13}
                className="text-muted-foreground ml-auto shrink-0 opacity-70"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-semibold tracking-wider uppercase">
              {text.wallets.myWallets}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="max-h-56 overflow-y-auto py-1">
              {wallets.map((wallet) => {
                const isSelected = currentWallet?.id === wallet.id;
                return (
                  <DropdownMenuItem
                    key={wallet.id}
                    onClick={() => setCurrentWallet(wallet)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs"
                  >
                    <div className="flex min-w-0 items-center gap-2 pr-2">
                      {getWalletIcon(wallet.name)}
                      <div className="min-w-0">
                        <p
                          className={`truncate font-medium ${isSelected ? "text-primary font-semibold" : ""}`}
                        >
                          {wallet.name}
                        </p>
                        {wallet.description && (
                          <p className="text-muted-foreground truncate text-[10px]">
                            {wallet.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check size={14} className="text-primary ml-auto shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={openCreateWalletModal}
              className="text-primary flex cursor-pointer items-center gap-2 py-2 text-xs font-semibold"
            >
              <Plus size={14} />
              <span>{text.wallets.newWallet}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Modal Dialog for creating wallet */}
      <CreateWalletDialog
        isOpen={isCreateWalletOpen}
        onClose={() => setIsCreateWalletOpen(false)}
      />
    </>
  );
}
