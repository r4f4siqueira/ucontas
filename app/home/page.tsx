"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShieldCheck, PieChart, Wallet } from "lucide-react";

export default function HomePage() {
  const { text } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center max-w-4xl mx-auto py-12 px-4 gap-12 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          {text.home.title}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          {text.home.subtitle}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Button asChild size="lg" className="gap-2">
          <Link href="/auth/sign-up">
            {text.home.getStarted}
            <ArrowRight size={18} />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/auth/login">{text.nav.signIn}</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8 text-left">
        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Wallet size={20} />
          </div>
          <h3 className="font-semibold text-lg">{text.home.features.expenses}</h3>
          <p className="text-sm text-muted-foreground">
            {text.home.features.expensesDesc}
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
            <PieChart size={20} />
          </div>
          <h3 className="font-semibold text-lg">{text.home.features.reports}</h3>
          <p className="text-sm text-muted-foreground">
            {text.home.features.reportsDesc}
          </p>
        </div>

        <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-3">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-semibold text-lg">{text.home.features.security}</h3>
          <p className="text-sm text-muted-foreground">
            {text.home.features.securityDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
