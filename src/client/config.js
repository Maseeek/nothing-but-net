// API Configuration
// For Vite, environment variables must be prefixed with VITE_
// These are set at build time and embedded in the bundle

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
export const ANALYSIS_API_URL = import.meta.env.VITE_ANALYSIS_API_URL || 'http://localhost:5000';
