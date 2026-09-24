"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export function LogoutButton() {
  const router = useRouter();
  const { text } = useLanguage();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <Button onClick={logout} size="sm">
      {text.nav.logout}
    </Button>
  );
}
