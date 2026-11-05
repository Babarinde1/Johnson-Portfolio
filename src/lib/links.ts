import { safeHttpUrl } from "./safeUrl";

// Confirmed public profile. Can be overridden with VITE_GITHUB_URL.
export const GITHUB_URL = safeHttpUrl(import.meta.env.VITE_GITHUB_URL as string | undefined) ?? "https://github.com/Babarinde1";
