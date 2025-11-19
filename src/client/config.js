// API Configuration
// For Vite, environment variables must be prefixed with VITE_
// These are set at build time and embedded in the bundle

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const ANALYSIS_API_URL = import.meta.env.VITE_ANALYSIS_API_URL || '';
