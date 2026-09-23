"use client";

import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface HomeButtonProps {
  children?: React.ReactNode;
  className?: string;
}

export function HomeButton({
  children,
  className = "p-3 px-5",
}: HomeButtonProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // 1. Obter usuário inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // 2. Escutar mudanças de autenticação em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const href = user ? "/dashboard" : "/home";

  return (
    <Link href={href} className={className}>
      {children ?? (
        <Image
          src="/letra-u.png"
          alt="uContas"
          width={50}
          height={50}
          priority
        />
      )}
    </Link>
  );
}
