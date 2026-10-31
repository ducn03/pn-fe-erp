/**
 * Utility functions for Date & Time manipulation
 */
export class DateHelper {
  static formatDate(val: string | number | Date | null | undefined, locale = 'vi-VN'): string {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  }

  static formatDateTime(val: string | number | Date | null | undefined, locale = 'vi-VN'): string {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  }

  static isExpired(expireDate: string | number | Date | null | undefined): boolean {
    if (!expireDate) return true;
    try {
      const d = new Date(expireDate);
      return d.getTime() <= Date.now();
    } catch {
      return true;
    }
  }
}
