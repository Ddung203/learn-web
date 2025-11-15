import type { ICardSet } from '~/interfaces';

export interface ConflictResult<T> {
  resolved: T;
  strategy: 'local' | 'remote' | 'merge' | 'manual';
}

/**
 * Resolve conflicts for card sets using last-write-wins strategy
 */
export function resolveCardSetConflict(
  localCardSet: ICardSet,
  remoteCardSet: ICardSet
): ConflictResult<ICardSet> {
  const localTime = new Date(localCardSet.updated_at).getTime();
  const remoteTime = new Date(remoteCardSet.updated_at).getTime();

  // Last-write-wins: use the most recent version
  if (localTime > remoteTime) {
    return {
      resolved: localCardSet,
      strategy: 'local',
    };
  } else if (remoteTime > localTime) {
    return {
      resolved: remoteCardSet,
      strategy: 'remote',
    };
  }

  // If timestamps are equal, merge the changes
  return {
    resolved: mergeCardSets(localCardSet, remoteCardSet),
    strategy: 'merge',
  };
}

/**
 * Merge two card sets by combining their cards
 */
function mergeCardSets(local: ICardSet, remote: ICardSet): ICardSet {
  // Create a map of cards by terminology to detect duplicates
  const cardMap = new Map<string, any>();

  // Add remote cards first (base)
  for (const card of remote.cards) {
    cardMap.set(card.terminology.toLowerCase(), card);
  }

  // Merge local cards (override duplicates)
  for (const card of local.cards) {
    cardMap.set(card.terminology.toLowerCase(), card);
  }

  return {
    ...remote,
    cards: Array.from(cardMap.values()),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Detect if there's a conflict between local and remote data
 */
export function hasConflict<T extends { updated_at: string }>(
  local: T,
  remote: T
): boolean {
  const localTime = new Date(local.updated_at).getTime();
  const remoteTime = new Date(remote.updated_at).getTime();

  // Consider it a conflict if they're very close in time (within 5 seconds)
  // and the data is different
  const timeDiff = Math.abs(localTime - remoteTime);
  return timeDiff < 5000 && JSON.stringify(local) !== JSON.stringify(remote);
}

/**
 * Merge statistics by summing up counts and keeping latest timestamps
 */
export function mergeStatistics(localStats: any, remoteStats: any): any {
  return {
    ...remoteStats,
    // Sum up numerical values
    total_study_time: (localStats.total_study_time || 0) + (remoteStats.total_study_time || 0),
    cards_studied: (localStats.cards_studied || 0) + (remoteStats.cards_studied || 0),
    correct_answers: (localStats.correct_answers || 0) + (remoteStats.correct_answers || 0),
    incorrect_answers: (localStats.incorrect_answers || 0) + (remoteStats.incorrect_answers || 0),
    // Keep the latest timestamp
    updated_at: new Date(
      Math.max(
        new Date(localStats.updated_at || 0).getTime(),
        new Date(remoteStats.updated_at || 0).getTime()
      )
    ).toISOString(),
  };
}
