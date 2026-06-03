/// <reference types="@sveltejs/kit" />
import {
  PUBLIC_DISTRIBUTION_URL,
  PUBLIC_API_KEY,
  PUBLIC_STORY_MAX_SECONDS,
  PUBLIC_REEL_MAX_SECONDS,
} from '$env/static/public';
import { parseThreshold } from './catalog';

export const DISTRIBUTION_URL = PUBLIC_DISTRIBUTION_URL;
export const API_KEY = PUBLIC_API_KEY;
export const FETCH_TIMEOUT_MS = 10_000;

const storyMax = parseThreshold(PUBLIC_STORY_MAX_SECONDS, 30);
const reelMax = parseThreshold(PUBLIC_REEL_MAX_SECONDS, 90);
// Enforce stories < reels; otherwise both fall back to defaults.
const valid = reelMax > storyMax;
export const STORY_MAX_SECONDS = valid ? storyMax : 30;
export const REEL_MAX_SECONDS = valid ? reelMax : 90;
