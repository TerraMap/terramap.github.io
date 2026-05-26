export function capitalizeFirstLetter(text: string) {
  return text.length >= 1 ? text[0].toUpperCase() + text.substring(1).toLowerCase() : text;
}
