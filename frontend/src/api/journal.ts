import axios from "axios";
import { Paginated } from "./types";

export type JournalActivity =
  | "listening_watching"
  | "reading"
  | "speaking"
  | "writing"
  | "other";

export interface ApiJournalEntry {
  id: number;
  activity: JournalActivity;
  attentionRate: string | null;
  realityRates: string[] | null;
  inputComprehensibility: number | null;
  comment: string;
  date_start: string;
  date_end: string;
  time_duration: number;
  totalInputMinutes: number;
}

export interface JournalQueryParams {
  page?: number;
  from?: string;
  to?: string;
}

export async function fetchJournalEntries(
  token: string,
  params: JournalQueryParams = {}
): Promise<Paginated<ApiJournalEntry>> {
  const searchParams = new URLSearchParams();
  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }
  if (params.from) {
    searchParams.set("from", params.from);
  }
  if (params.to) {
    searchParams.set("to", params.to);
  }

  const query = searchParams.toString();
  const url = `/api/journal/${query ? `?${query}` : ""}`;
  const res = await axios.get<Paginated<ApiJournalEntry>>(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}