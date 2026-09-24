"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n/context";
import { useEffect, useState } from "react";

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, text } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex gap-1.5 items-center px-2"
        >
          <Globe size={ICON_SIZE} className="text-muted-foreground" />
          <span className="text-xs font-semibold uppercase">{language}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="end">
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(val) => setLanguage(val as Language)}
        >
          <DropdownMenuRadioItem className="flex gap-2" value="pt">
            <span>🇧🇷</span>
            <span>{text.common.portuguese}</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="en">
            <span>🇺🇸</span>
            <span>{text.common.english}</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
