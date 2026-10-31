export const SAMPLE_NOW = "2026-10-31T17:42:00Z";
export const sampleAt = (secondsAgo = 0) => new Date(Date.parse(SAMPLE_NOW) - secondsAgo * 1000).toISOString();
