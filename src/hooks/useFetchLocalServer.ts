import { LOCAL_SERVER } from "../lib/localServer";
import { useFetch } from "./useFetch";

export default function useFetchLocalServer() {
  const result = useFetch<{ status: string, version: string }>(`${LOCAL_SERVER}/health`, { immediate: true });

  return {
    ...result,
    localServerAvailable: result.data?.status === 'ok'
  }
}