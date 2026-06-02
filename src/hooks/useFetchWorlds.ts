import { LOCAL_SERVER } from "../lib/localServer";
import type { WorldHeader } from "../lib/readWorldHeader";
import { useFetch } from "./useFetch";

export interface FileEntry {
  name: string;
  path: string;
  size: number;
  lastModified: number;
}

export interface WorldEntry extends FileEntry, WorldHeader {
}

export default function useFetchWorlds() {
  return useFetch<WorldEntry[]>(`${LOCAL_SERVER}/worlds`, { immediate: true });
}