import shared from '../../../shared/constants.json';

// Values shared with the client live in app/shared/constants.json
export const FREE_CALL_LIMIT: number = shared.freeCallLimit;

export const ITALIAN_LEVELS = shared.levels as readonly string[];

export const CHAT_MODES = shared.modes as readonly string[];

export const SUPPORT_LANGUAGES = shared.supportLanguages as readonly string[];

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

export const AI_MODEL = 'gemini-2.5-flash-lite';
export const AI_REQUEST_TIMEOUT_MS = 20_000;
export const AI_RETRY_DELAY_MS = 500;
export const AI_HISTORY_LIMIT = 20;
