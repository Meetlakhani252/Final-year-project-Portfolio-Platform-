"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioData } from "@/types/portfolio";

async function fetchPortfolio(username: string): Promise<PortfolioData> {
  const supabase = createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !profile) {
    throw new Error("Portfolio not found");
  }

  const { data: social_links } = await supabase
    .from("social_links")
    .select("*")
    .eq("profile_id", profile.id);

  return { profile, social_links: social_links ?? [] };
}

export function usePortfolio(username: string) {
  return useQuery({
    queryKey: ["portfolio", username],
    queryFn: () => fetchPortfolio(username),
    enabled: !!username,
    staleTime: 60_000,
  });
}
