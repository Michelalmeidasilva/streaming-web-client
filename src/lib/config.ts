/// <reference types="@sveltejs/kit" />
import { PUBLIC_DISTRIBUTION_URL, PUBLIC_API_KEY } from '$env/static/public';

export const DISTRIBUTION_URL = PUBLIC_DISTRIBUTION_URL;
export const API_KEY = PUBLIC_API_KEY;
export const FETCH_TIMEOUT_MS = 10_000;
