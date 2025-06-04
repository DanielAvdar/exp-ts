export function getSimpleId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
