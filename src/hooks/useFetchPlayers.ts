import { LOCAL_SERVER } from "../lib/localServer";
import { useFetch } from "./useFetch";
import type { FileEntry, WorldEntry } from "./useFetchWorlds";

export interface PlayerEntry extends FileEntry {
  playerName: string;
}

export default function useFetchPlayers() {
  const result = useFetch<PlayerEntry[]>();

  return {
    ...result,
    execute: async (world: WorldEntry) => await result.execute(`${LOCAL_SERVER}/players?worldId=${world.id}&worldId=${world.uniqueId}`)
  }
}