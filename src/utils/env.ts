/**
 * Environment configuration utilities
 *
 * Provides safe access to environment variables with fallbacks
 * and validation for production builds
 */

interface EnvConfig {
  apiBaseUrl: string;
  appName: string;
  appVersion: string;
  s3BucketUrl?: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get environment configuration
 * Validates that required environment variables are set
 */
export function getEnvConfig(): EnvConfig {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const appName = import.meta.env.VITE_APP_NAME || "Phanadrug";
  const appVersion = import.meta.env.VITE_APP_VERSION || "1.0.0";
  const s3BucketUrl = import.meta.env.VITE_S3_BUCKET_URL;
  const mode = import.meta.env.MODE;

  // Validate required variables in production
  if (mode === "production" && !apiBaseUrl) {
    console.error("❌ VITE_API_BASE_URL is not set in production build!");
    console.error("Please set GitHub Secrets properly and rebuild.");
  }

  return {
    apiBaseUrl: apiBaseUrl || "",
    appName,
    appVersion,
    s3BucketUrl,
    isDevelopment: mode === "development",
    isProduction: mode === "production",
  };
}

/**
 * Log environment configuration (for debugging)
 * Only logs in development mode
 */
export function logEnvConfig(): void {
  const config = getEnvConfig();

  if (config.isDevelopment) {
    console.log("🔧 Environment Configuration:", {
      mode: import.meta.env.MODE,
      apiBaseUrl: config.apiBaseUrl,
      appName: config.appName,
      appVersion: config.appVersion,
      s3BucketUrl: config.s3BucketUrl || "Not set",
    });
  }
}

// Export singleton instance
export const env = getEnvConfig();
