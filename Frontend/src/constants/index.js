// Ownership status enum matching backend
export const OWNERSHIP_STATUS = {
  WANT_TO_BUY: 'WantToBuy',
  OWN: 'Own',
  SOLD_OR_GAVE_AWAY: 'SoldOrGaveAway'
};

// Reading status enum matching backend
export const READING_STATUS = {
  BACKLOG: 'Backlog',
  COMPLETED: 'Completed',
  ABANDONED: 'Abandoned'
};

// Ownership status options for dropdowns
export const OWNERSHIP_STATUS_OPTIONS = [
  { value: OWNERSHIP_STATUS.WANT_TO_BUY, label: 'Want to Buy' },
  { value: OWNERSHIP_STATUS.OWN, label: 'Own' },
  { value: OWNERSHIP_STATUS.SOLD_OR_GAVE_AWAY, label: 'Sold or Gave Away' }
];

// Reading status options for dropdowns
export const READING_STATUS_OPTIONS = [
  { value: READING_STATUS.BACKLOG, label: 'Backlog' },
  { value: READING_STATUS.COMPLETED, label: 'Completed' },
  { value: READING_STATUS.ABANDONED, label: 'Abandoned' }
];

// Maximum length constants for form validation
export const MAX_LENGTHS = {
  TITLE: 100,
  AUTHOR: 100,
  DESCRIPTION: 500,
  NOTES: 1000,
  ISBN: 20,
  BORROWED_TO: 100,
  RATING_NOTES: 1000
};

// Score range for ratings
export const SCORE_MIN = 1;
export const SCORE_MAX = 10;
