// daily.js — daily-seed algorithm (spec §6).
import { generateGrid, DIFFICULTY } from './puzzle.js';

export const DAILY_SIZE = 6;
export const DAILY_FRAC = DIFFICULTY.easy; // 0.25

// Rollover at 06:00 Philippine Time (UTC+8) = 22:00 UTC. Shifting the instant
// +2h lands the whole-day boundary exactly on that moment.
const ROLLOVER_SHIFT_MS = 2 * 60 * 60 * 1000;

/** Day number of the daily puzzle active at `date`; increments at 06:00 PHT. */
export function dailySeed(date = new Date()) {
	return Math.floor((date.getTime() + ROLLOVER_SHIFT_MS) / 86400000);
}

/** The 6×6 Easy clue grid for the currently-active daily puzzle. */
export function dailyGrid(date = new Date()) {
	return generateGrid(DAILY_SIZE, DAILY_FRAC, dailySeed(date));
}

/** Stable key for localStorage / "puzzle #N" labels. */
export function dailyKey(date = new Date()) {
	return `shikaku-daily-${dailySeed(date)}`;
}

/** Human-readable Philippine calendar date for the active daily puzzle. */
export function dailyDateLabel(date = new Date()) {
	// The active puzzle's PHT date == the UTC date of (instant shifted +2h),
	// because the seed is floor((utcMillis + 2h) / day). Read that shifted
	// instant in UTC to recover the calendar date the seed belongs to.
	const shifted = new Date(date.getTime() + ROLLOVER_SHIFT_MS);
	return shifted.toLocaleDateString('en-US', {
		timeZone: 'UTC',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}
