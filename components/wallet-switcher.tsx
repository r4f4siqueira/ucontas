"use client";

import React, { useEffect, useState } from "react";
import {
  Wallet as WalletIcon,
  ChevronDown,
  Plus,
  Check,
  Building2,
  User,
} from "lucide-react";
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

    supabase.auth.getUser().then(({ data: { user } }) => {
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
    return (
      <div className="h-8 w-24 rounded-md bg-muted/50 animate-pulse" />
    );
  }

  // Helper icon for wallet name
  const getWalletIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("empresa") || lower.includes("pj") || lower.includes("corp") || lower.includes("negócio")) {
      return <Building2 size={15} className="text-blue-500 shrink-0" />;
    }
    if (lower.includes("pessoal") || lower.includes("pf") || lower.includes("casa") || lower.includes("família")) {
      return <User size={15} className="text-emerald-500 shrink-0" />;
    }
    return <WalletIcon size={15} className="text-amber-500 shrink-0" />;
  };

  return (
    <>
      {wallets.length === 0 ? (
        <Button
          variant="outline"
          size="sm"
          onClick={openCreateWalletModal}
          className="flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
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
              className="flex items-center gap-2 h-8 px-2.5 text-xs font-semibold max-w-[170px] sm:max-w-[210px] truncate shadow-sm hover:bg-accent"
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
              <ChevronDown size={13} className="text-muted-foreground ml-auto shrink-0 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold uppercase tracking-wider px-2 py-1.5">
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
                    className="flex items-center justify-between cursor-pointer py-2 px-2.5 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {getWalletIcon(wallet.name)}
                      <div className="min-w-0">
                        <p className={`truncate font-medium ${isSelected ? "text-primary font-semibold" : ""}`}>
                          {wallet.name}
                        </p>
                        {wallet.description && (
                          <p className="truncate text-[10px] text-muted-foreground">
                            {wallet.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className="text-primary shrink-0 ml-auto" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={openCreateWalletModal}
              className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer py-2"
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
