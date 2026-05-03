/**
 * Centralised localStorage keys used across the app.
 *
 * Keep all keys here so the namespace (`electoiq-*`) stays consistent and a
 * future migration / wipe is a one-file change. Each key has an inline note on
 * which feature owns it.
 */

/** Selected UI locale; one of `en | hi | ta | bn | mr | te`. */
export const LOCALE_KEY = "electoiq-locale";

/** Selected theme; one of `dark | light`. */
export const THEME_KEY = "electoiq-theme";

/** Cached translations per locale. Suffix with the locale code. */
export const TRANSLATION_CACHE_PREFIX = "electoiq-tx-";
export const translationCacheKey = (locale: string) => `${TRANSLATION_CACHE_PREFIX}${locale}`;

/** Stable per-device pseudo-uid for the localStorage Voices fallback. */
export const VOICES_LS_UID_KEY = "electoiq-uid";

/** Voices feed cache (localStorage fallback only). */
export const VOICES_KEY = "electoiq-voices";

/** Set of voice ids the device has upvoted. Suffix with the uid. */
export const UPVOTED_PREFIX = "electoiq-upvoted-";
export const upvotedKey = (uid: string) => `${UPVOTED_PREFIX}${uid}`;

/** Stable per-device pseudo-eid for the localStorage exit-poll fallback. */
export const EXIT_POLL_EID_KEY = "electoiq-eid";

/** Map of {electionKey → party} the device has voted for (localStorage fallback). */
export const EXIT_POLL_VOTES_KEY = "electoiq-exit-poll-votes";

/** Map of {electionKey → ExitPollTally} cached on the device (localStorage fallback). */
export const EXIT_POLL_TALLIES_KEY = "electoiq-exit-poll-tallies";
