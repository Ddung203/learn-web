export function splitUsernameFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();

  const atIndex = normalized.indexOf('@');
  if (atIndex === -1) {
    return normalized.replace(/\s+/g, '');
  }

  let username = normalized.slice(0, atIndex);

  username = username
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/[._-]{2,}/g, (match) => match[0]);

  if (!username) {
    return normalized.replace(/\s+/g, '');
  }

  return username;
}
