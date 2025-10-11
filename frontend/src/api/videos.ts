import axios from "axios";

export type ApiVideo = {
  id: number;
  platform: string;
  on_platform_id: string;
  language: string;
  channel: number;
  channelName: string;
  duration: number;
  title: string;
  description: string;
  upload_date: string;
  rating: number;
  level: string;
  premium: boolean;
  tagNames: string[];
  speakerNames: string[];
  thumbnailUrl: string;
  related?: ApiVideo[]; // detail only
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export interface BrowseFilters {
  query?: string;
  levels?: string[]; // b0,b1,b2,i1,i2,adv
  speakers?: string[];
  hideWatched?: boolean;
  page?: number;
}

export async function fetchVideos(
  filters: BrowseFilters,
  token?: string
): Promise<Paginated<ApiVideo>> {
  const params = new URLSearchParams();
  if (filters.query) params.set("search", filters.query);
  if (filters.hideWatched) params.set("hide-watched", "true");
  if (filters.page && filters.page > 1)
    params.set("page", String(filters.page));

  if (filters.levels && filters.levels.length) {
    filters.levels.forEach((l) => params.append("level", l));
  }
  // Speakers (names) -> speakers__name filterset field
  if (filters.speakers && filters.speakers.length) {
    filters.speakers.forEach((sp) => params.append("speakers__name", sp));
  }

  const url = `/api/videos/${params.toString() ? "?" + params.toString() : ""}`;
  const res = await axios.get<Paginated<ApiVideo>>(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export async function fetchVideo(
  id: string | number,
  token?: string
): Promise<ApiVideo> {
  const res = await axios.get<ApiVideo>(`/api/videos/${id}/`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export type ApiSpeaker = { id: number; name: string };

export async function fetchSpeakers(token?: string): Promise<ApiSpeaker[]> {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  let url: string | null = `/api/speakers/`;
  const all: ApiSpeaker[] = [];
  while (url) {
    const res = await axios.get<any>(url, { headers });
    const data: any = res.data;
    if (Array.isArray(data)) {
      // unpaginated fallback
      return data as ApiSpeaker[];
    }
    if (data && Array.isArray(data.results)) {
      all.push(...(data.results as ApiSpeaker[]));
      url = data.next; // may be absolute; axios can handle it
    } else {
      break;
    }
  }
  return all;
}

export async function markAsWatched(id: number, token?: string) {
  await axios.post(
    `/api/videos/${id}/mark-as-watched/`,
    {},
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
}

export async function sendWatchtime(
  videoId: number,
  elapsedTime: number,
  lastVideoTime: number,
  token?: string
) {
  await axios.post(
    `/api/videos/watchtime/`,
    { videoId, elapsedTime, lastVideoTime },
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );
}

// Download endpoints (premium-only). Return a Blob the caller can trigger for download.

export async function downloadSubtitleDocx(
  id: number,
  token?: string
): Promise<Blob> {
  const res = await axios.get(`/api/videos/${id}/download/subtitle/docx/`, {
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export async function downloadAudioMp3(
  id: number,
  token?: string
): Promise<Blob> {
  const res = await axios.get(`/api/videos/${id}/download/audio/mp3/`, {
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}
