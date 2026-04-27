import { APP_URL } from "@/lib/constants";

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  private: boolean;
  updated_at: string;
  stargazers_count: number;
}

export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  avatar_url: string;
}

// Language bytes map returned by GET /repos/{owner}/{repo}/languages
export type LanguageBytes = Record<string, number>;

export function getGitHubAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${APP_URL}/api/webhooks/github`,
    scope: "read:user,repo",
    state: userId, // we pass the user's profile id as state for CSRF / lookup
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to exchange GitHub code for token");
  }

  const data = (await res.json()) as { access_token?: string; error?: string };

  if (data.error || !data.access_token) {
    throw new Error(data.error ?? "No access token returned by GitHub");
  }

  return data.access_token;
}

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return res.json() as Promise<GitHubUser>;
}

export async function fetchUserRepos(accessToken: string): Promise<GitHubRepo[]> {
  const allRepos: GitHubRepo[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated&type=owner`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch GitHub repositories");
    }

    const batch = (await res.json()) as GitHubRepo[];
    if (batch.length === 0) break;

    allRepos.push(...batch);

    // Stop after 3 pages (300 repos) to stay well within rate limits
    if (batch.length < 100 || page >= 3) break;
    page++;
  }

  return allRepos;
}

export async function fetchRepoLanguages(
  accessToken: string,
  owner: string,
  repo: string
): Promise<LanguageBytes> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/languages`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!res.ok) {
    return {};
  }

  return res.json() as Promise<LanguageBytes>;
}

export async function fetchAggregatedLanguages(
  accessToken: string,
  repos: GitHubRepo[]
): Promise<LanguageBytes> {
  const totals: LanguageBytes = {};

  // Limit to 30 most recently updated repos to avoid hammering rate limits
  const reposToScan = repos.slice(0, 30);

  await Promise.allSettled(
    reposToScan.map(async (repo) => {
      const [owner, name] = repo.full_name.split("/");
      const langs = await fetchRepoLanguages(accessToken, owner, name);
      for (const [lang, bytes] of Object.entries(langs)) {
        totals[lang] = (totals[lang] ?? 0) + bytes;
      }
    })
  );

  return totals;
}

export const LANGUAGE_TO_SKILL: Record<string, string> = {
  JavaScript: "JavaScript",
  TypeScript: "TypeScript",
  Python: "Python",
  "Jupyter Notebook": "Python",
  Java: "Java",
  "C++": "C++",
  "C#": "C#",
  C: "C",
  Go: "Go",
  Rust: "Rust",
  Ruby: "Ruby",
  PHP: "PHP",
  Swift: "Swift",
  Kotlin: "Kotlin",
  Scala: "Scala",
  R: "R",
  MATLAB: "MATLAB",
  Dart: "Dart",
  "Objective-C": "Objective-C",
  Elixir: "Elixir",
  Haskell: "Haskell",
  Lua: "Lua",
  Perl: "Perl",
  Groovy: "Groovy",
  Clojure: "Clojure",
  "F#": "F#",
  Dockerfile: "Docker",
  HCL: "Terraform",
  Shell: "Shell Scripting",
  PowerShell: "PowerShell",
  Solidity: "Solidity",
};

export function languagesToSkillSuggestions(languages: LanguageBytes): string[] {
  const seen = new Set<string>();
  const entries = Object.entries(languages).sort(([, a], [, b]) => b - a);
  const suggestions: string[] = [];

  for (const [lang] of entries) {
    const skill = LANGUAGE_TO_SKILL[lang];
    if (skill && !seen.has(skill)) {
      seen.add(skill);
      suggestions.push(skill);
    }
  }

  return suggestions;
}