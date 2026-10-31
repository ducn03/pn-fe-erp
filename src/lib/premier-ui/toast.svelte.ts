/**
 * Svelte 5 Reactive Toast State Manager for Premier UI
 */

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration: number;
}

class ToastStore {
  toasts = $state<ToastItem[]>([]);

  show(message: string, options: { type?: ToastItem['type']; duration?: number } = {}) {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const type = options.type || 'info';
    const duration = options.duration ?? 4000;

    const item: ToastItem = { id, message, type, duration };
    this.toasts.push(item);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    return id;
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  success(message: string, duration?: number) {
    return this.show(message, { type: 'success', duration });
  }

  error(message: string, duration?: number) {
    return this.show(message, { type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    return this.show(message, { type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    return this.show(message, { type: 'info', duration });
  }
}

export const toast = new ToastStore();
