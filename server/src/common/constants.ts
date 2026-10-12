export const ITALIAN_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export const CHAT_MODES = ['grammar', 'topic'] as const;

export const SUPPORT_LANGUAGES = [
  'English',
  'French',
  'Spanish',
  'Portuguese',
  'Italian',
  'Ukrainian',
  'Arabic',
] as const;

export const MAX_FOCUS_AREA_LENGTH = 80;
export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_NAME_LENGTH = 50;
export const MAX_EMAIL_LENGTH = 254;
export const MIN_PASSWORD_LENGTH = 8;
// bcrypt ignores everything after 72 bytes
export const MAX_PASSWORD_LENGTH = 72;
export const MIN_API_KEY_LENGTH = 20;
export const MAX_API_KEY_LENGTH = 200;

// ttl is in milliseconds
export const DEFAULT_THROTTLE = { limit: 60, ttl: 60_000 };
export const SIGNUP_THROTTLE = { limit: 5, ttl: 60_000 };
export const LOGIN_THROTTLE = { limit: 10, ttl: 60_000 };
export const START_SESSION_THROTTLE = { limit: 5, ttl: 60_000 };
export const SEND_MESSAGE_THROTTLE = { limit: 15, ttl: 60_000 };
