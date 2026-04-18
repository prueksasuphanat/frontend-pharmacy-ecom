/**
 * Storage utility functions for localStorage and sessionStorage
 * **Validates: Requirements 5.4**
 */

/**
 * localStorage wrapper with JSON serialization and error handling
 */
export const storage = {
  /**
   * Get an item from localStorage
   * @param key - Storage key
   * @returns Parsed value or null if not found or error occurs
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set an item in localStorage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  },

  /**
   * Remove an item from localStorage
   * @param key - Storage key to remove
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  },

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    localStorage.clear();
  },
};

/**
 * sessionStorage wrapper with JSON serialization and error handling
 */
export const sessionStorage = {
  /**
   * Get an item from sessionStorage
   * @param key - Storage key
   * @returns Parsed value or null if not found or error occurs
   */
  get<T>(key: string): T | null {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  /**
   * Set an item in sessionStorage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   */
  set<T>(key: string, value: T): void {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to sessionStorage:", error);
    }
  },

  /**
   * Remove an item from sessionStorage
   * @param key - Storage key to remove
   */
  remove(key: string): void {
    window.sessionStorage.removeItem(key);
  },

  /**
   * Clear all items from sessionStorage
   */
  clear(): void {
    window.sessionStorage.clear();
  },
};
