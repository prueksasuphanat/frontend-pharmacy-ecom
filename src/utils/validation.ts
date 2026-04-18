/**
 * Validation utility functions
 * **Validates: Requirements 5.3**
 */

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates Thai phone number format
 * Must be 10 digits starting with 0
 * @param phone - Phone number to validate
 * @returns true if phone number format is valid
 */
export function isValidThaiPhone(phone: string): boolean {
  const phoneRegex = /^0[0-9]{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validates password strength
 * Must be at least 8 characters with uppercase, lowercase, and number
 * @param password - Password to validate
 * @returns true if password meets strength requirements
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}
