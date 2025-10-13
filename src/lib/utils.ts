import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UploadItem {
  type: "blog" | "file" | "image";
  title?: string;
  description?: string;
  author?: string;
  tags?: string[];
  content?: string;
  name?: string; // filename
  data?: string; // base64 string
  collection?: string; // for images
  path?: string;
}

/**
 * Upload one or more content items (blogs, files, images) to the backend.
 *
 * @param items - Array of UploadItem objects
 * @returns A success flag and optional error message
 */
export async function uploadContent(items: UploadItem[]) {
  try {
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "Upload failed");
    }

    return { success: true };
  } catch (err) {
    console.error("[uploadContent] Error:", err);
    return { success: false, error: (err as Error).message };
  }
}

function greekToLatin(str: string) {
  const map: Record<string, string> = {
    α: "a",
    β: "b",
    γ: "g",
    δ: "d",
    ε: "e",
    ζ: "z",
    η: "i",
    θ: "th",
    ι: "i",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ξ: "x",
    ο: "o",
    π: "p",
    ρ: "r",
    σ: "s",
    τ: "t",
    υ: "y",
    φ: "f",
    χ: "ch",
    ψ: "ps",
    ω: "o",
    ά: "a",
    έ: "e",
    ή: "i",
    ί: "i",
    ό: "o",
    ύ: "y",
    ώ: "o",
    ς: "s",
    Ά: "A",
    Έ: "E",
    Ή: "I",
    Ί: "I",
    Ό: "O",
    Ύ: "Y",
    Ώ: "O",
  };
  return str
    .split("")
    .map((c) => map[c] ?? c)
    .join("");
}

export function slugify(title: string): string {
  const latinTitle = greekToLatin(title.toLowerCase());
  return latinTitle.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}
