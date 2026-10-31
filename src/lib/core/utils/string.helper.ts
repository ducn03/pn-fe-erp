/**
 * Utility functions for String manipulation
 */
export class StringHelper {
  static isBlank(str: string | null | undefined): boolean {
    return str === null || str === undefined || str.trim().length === 0;
  }

  static isNotBlank(str: string | null | undefined): boolean {
    return !StringHelper.isBlank(str);
  }

  static trim(str: string | null | undefined): string {
    if (str === null || str === undefined) {
      return '';
    }
    return str.trim();
  }

  static trimToNull(str: string | null | undefined): string | null {
    if (str === null || str === undefined) {
      return null;
    }
    const trimmed = str.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed;
  }

  static toLowerCase(str: string | null | undefined): string {
    if (str === null || str === undefined) {
      return '';
    }
    return str.toLowerCase();
  }

  static toUpperCase(str: string | null | undefined): string {
    if (str === null || str === undefined) {
      return '';
    }
    return str.toUpperCase();
  }
}
