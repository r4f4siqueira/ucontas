"use client";

import { InfoIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function DashboardPage() {
  const { text } = useLanguage();

  return (
    <div className="flex-1 w-full flex flex-col gap-6 max-w-5xl mx-auto py-6">
      <div className="w-full">
        <div className="bg-primary/10 border border-primary/20 text-sm p-4 px-5 rounded-lg text-foreground flex gap-3 items-center">
          <InfoIcon size="18" className="text-primary" />
          <span>{text.dashboard.protectedMessage}</span>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          {text.dashboard.title}
        </h1>
        <p className="text-muted-foreground">{text.dashboard.welcome}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {text.dashboard.totalBalance}
          </p>
          <p className="text-2xl font-bold mt-2">R$ 0,00</p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {text.dashboard.income}
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            R$ 0,00
          </p>
        </div>
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {text.dashboard.expenses}
          </p>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            R$ 0,00
          </p>
        </div>
      </div>
    </div>
  );
}
