"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchProfiles, type SearchResult } from "@/actions/search";
import { useDebounce } from "@/hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      const data = await searchProfiles(debouncedQuery);
      setResults(data);
      setIsLoading(false);
      setIsOpen(true);
    }

    performSearch();
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (username: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/u/${username}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[200px] sm:max-w-[300px]">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search students..."
          className="h-9 w-full pl-9 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/50"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (results.length > 0 || (debouncedQuery.length >= 2 && !isLoading)) && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                <p className="px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Users found
                </p>
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.username)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-accent transition-colors"
                  >
                    <Avatar className="size-8 border">
                      <AvatarImage src={result.avatarUrl || ""} />
                      <AvatarFallback className="text-[10px]">
                        {result.fullName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate">{result.fullName}</span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        @{result.username} • {result.role}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                No users found for &quot;{debouncedQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
