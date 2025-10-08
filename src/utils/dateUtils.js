// Date utility functions for consistent date formatting across the application
import dayjs from 'dayjs';

/**
 * Format date for database storage (dd-mm-yy format)
 * @param {string|Date} dateValue - The date to format
 * @returns {string|null} - Formatted date string or null
 */
export const formatDateForDB = (dateValue) => {
  if (!dateValue) return '';
  try {
    return dayjs(dateValue).format('DD-MM-YY');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Parse date from database (dd-mm-yy to YYYY-MM-DD for form inputs)
 * @param {string} dateValue - The date string from database
 * @returns {string|null} - Parsed date string or null
 */
export const parseDateFromDB = (dateValue) => {
  if (!dateValue) return null;
  try {
    // Handle dd-mm-yy format
    if (dateValue.includes('-') && dateValue.length === 8) {
      const [day, month, year] = dateValue.split('-');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month}-${day}`;
    }
    return dateValue;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Format date for display (dd-mm-yyyy format)
 * @param {string|Date} dateValue - The date to format
 * @returns {string|null} - Formatted date string or null
 */
export const formatDateForDisplay = (dateValue) => {
  if (!dateValue) return null;
  try {
    return dayjs(dateValue).format('DD-MM-YYYY');
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return null;
  }
};

/**
 * Parse date from database for DatePicker components (returns dayjs object)
 * @param {string} dateValue - The date string from database
 * @returns {dayjs.Dayjs|null} - dayjs object or null
 */
export const parseDateForDatePicker = (dateValue) => {
  if (!dateValue) return null;
  try {
    // Handle dd-mm-yy format
    if (dateValue.includes('-') && dateValue.length === 8) {
      const [day, month, year] = dateValue.split('-');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return dayjs(`${fullYear}-${month}-${day}`);
    }
    // Handle other formats
    return dayjs(dateValue);
  } catch (error) {
    console.error('Error parsing date for DatePicker:', error);
    return null;
  }
};

/**
 * Format date for database storage (YYYY-MM-DD format for API)
 * @param {dayjs.Dayjs|Date|string} dateValue - The date to format
 * @returns {string|null} - Formatted date string or null
 */
export const formatDateForAPI = (dateValue) => {
  if (!dateValue) return null;
  try {
    return dayjs(dateValue).format('YYYY-MM-DD');
  } catch (error) {
    console.error('Error formatting date for API:', error);
    return null;
  }
};

/**
 * Validate if a date is valid using dayjs
 * @param {any} dateValue - The date to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  try {
    const dayjsDate = dayjs(dateValue);
    return dayjsDate.isValid();
  } catch (error) {
    console.error('Error validating date:', error);
    return false;
  }
};

/**
 * Validate if a date is in the past
 * @param {any} dateValue - The date to validate
 * @returns {boolean} - True if date is in the past, false otherwise
 */
export const isDateInPast = (dateValue) => {
  if (!dateValue) return false;
  try {
    const dayjsDate = dayjs(dateValue);
    return dayjsDate.isValid() && dayjsDate.isBefore(dayjs());
  } catch (error) {
    console.error('Error checking if date is in past:', error);
    return false;
  }
};

/**
 * Validate if a date is in the future
 * @param {any} dateValue - The date to validate
 * @returns {boolean} - True if date is in the future, false otherwise
 */
export const isDateInFuture = (dateValue) => {
  if (!dateValue) return false;
  try {
    const dayjsDate = dayjs(dateValue);
    return dayjsDate.isValid() && dayjsDate.isAfter(dayjs());
  } catch (error) {
    console.error('Error checking if date is in future:', error);
    return false;
  }
};

/**
 * Validate if a date is before a specific date
 * @param {any} dateValue - The date to validate
 * @param {any} beforeDate - The date to compare against
 * @returns {boolean} - True if date is before the specified date, false otherwise
 */
export const isDateBefore = (dateValue, beforeDate) => {
  if (!dateValue || !beforeDate) return false;
  try {
    const dayjsDate = dayjs(dateValue);
    const dayjsBeforeDate = dayjs(beforeDate);
    return dayjsDate.isValid() && dayjsBeforeDate.isValid() && dayjsDate.isBefore(dayjsBeforeDate);
  } catch (error) {
    console.error('Error checking if date is before:', error);
    return false;
  }
};

/**
 * Validate if a date is after a specific date
 * @param {any} dateValue - The date to validate
 * @param {any} afterDate - The date to compare against
 * @returns {boolean} - True if date is after the specified date, false otherwise
 */
export const isDateAfter = (dateValue, afterDate) => {
  if (!dateValue || !afterDate) return false;
  try {
    const dayjsDate = dayjs(dateValue);
    const dayjsAfterDate = dayjs(afterDate);
    return dayjsDate.isValid() && dayjsAfterDate.isValid() && dayjsDate.isAfter(dayjsAfterDate);
  } catch (error) {
    console.error('Error checking if date is after:', error);
    return false;
  }
};