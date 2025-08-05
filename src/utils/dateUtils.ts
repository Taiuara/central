/**
 * Utility functions for safe date conversions from Firestore
 */

/**
 * Safely converts a Firestore Timestamp or Date object to a JavaScript Date
 * @param dateValue - The value from Firestore (can be Timestamp, Date, or string)
 * @param fallback - Fallback date if conversion fails (defaults to current date)
 * @returns JavaScript Date object
 */
export function safeToDate(dateValue: any, fallback: Date = new Date()): Date {
  console.log('[DEBUG] safeToDate called with:', dateValue, 'type:', typeof dateValue);
  
  if (!dateValue) {
    console.log('[DEBUG] safeToDate: No value, returning fallback');
    return fallback;
  }

  // If it's already a Date object
  if (dateValue instanceof Date) {
    console.log('[DEBUG] safeToDate: Already a Date object');
    return dateValue;
  }

  // If it's a Firestore Timestamp with toDate method
  if (typeof dateValue.toDate === 'function') {
    try {
      console.log('[DEBUG] safeToDate: Converting Timestamp to Date');
      const result = dateValue.toDate();
      console.log('[DEBUG] safeToDate: Timestamp converted successfully to:', result);
      return result;
    } catch (error) {
      console.warn('[DEBUG] safeToDate: Failed to convert Timestamp to Date:', error);
      return fallback;
    }
  }

  // If it's a string or number, try to create a Date
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    try {
      console.log('[DEBUG] safeToDate: Converting string/number to Date');
      const date = new Date(dateValue);
      const isValid = !isNaN(date.getTime());
      console.log('[DEBUG] safeToDate: String/number conversion result:', date, 'isValid:', isValid);
      return isValid ? date : fallback;
    } catch (error) {
      console.warn('[DEBUG] safeToDate: Failed to convert string/number to Date:', error);
      return fallback;
    }
  }

  // If it's an object with seconds and nanoseconds (Firestore Timestamp-like)
  if (typeof dateValue === 'object' && 'seconds' in dateValue) {
    try {
      console.log('[DEBUG] safeToDate: Converting timestamp-like object to Date');
      const result = new Date(dateValue.seconds * 1000);
      console.log('[DEBUG] safeToDate: Timestamp-like converted to:', result);
      return result;
    } catch (error) {
      console.warn('[DEBUG] safeToDate: Failed to convert timestamp-like object to Date:', error);
      return fallback;
    }
  }

  console.warn('[DEBUG] safeToDate: Unknown date format, using fallback:', dateValue);
  return fallback;
}

/**
 * Safely converts an attendance date (can be null)
 * @param dateValue - The value from Firestore
 * @returns JavaScript Date object or null
 */
export function safeToAttendanceDate(dateValue: any): Date | null {
  if (!dateValue) {
    return null;
  }
  
  try {
    return safeToDate(dateValue, new Date());
  } catch (error) {
    return null;
  }
}
