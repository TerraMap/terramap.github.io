export function capitalizeFirstLetter(text: string) {
  return text.length >= 1 ? text[0].toUpperCase() + text.substring(1).toLowerCase() : text;
}

export function truncateString(text?: string | null, maxLength = 10, ellipsis = '…') {
  if (maxLength < ellipsis.length)
    throw new Error(`maxLength of ${maxLength} is shorter than the ellipsis ${ellipsis} length ${ellipsis.length}`);
  if (!text) return '';

  return text.length <= maxLength ? text : text.slice(0, maxLength) + ellipsis;
}

export const formatBytes = (bytes?: number): string => {
  if (!bytes) return '';

  if (Math.abs(bytes) < 1_000) {
    return `${bytes.toLocaleString(undefined, { maximumFractionDigits: 0 })} B`;
  } else if (Math.abs(bytes) < 1_000_000) {
    return `${(bytes / 1_000).toLocaleString(undefined, { maximumFractionDigits: 0 })} KB`;
  } else if (Math.abs(bytes) < 1_000_000_000) {
    return `${(bytes / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 0 })} MB`;
  }

  return `${bytes.toLocaleString(undefined, { maximumFractionDigits: 0 })}} B`;
};
