import Toaster from './Toaster.svelte';
import { writable } from 'svelte/store';

const toasts = writable([]);
let idCounter = 1;

function removeToast(id) {
  toasts.update((items) => items.filter((toast) => toast.id !== id));
}

function pushToast(message, type = 'blank', options = {}) {
  const id = idCounter++;
  const duration = options.duration ?? (type === 'loading' ? Infinity : 3000);
  const toast = {
    id,
    message,
    type,
    duration,
  };

  toasts.update((items) => [...items, toast]);

  if (duration !== Infinity) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

function toast(message, options = {}) {
  return pushToast(message, options.type ?? 'blank', options);
}

toast.success = (message, options = {}) => pushToast(message, 'success', options);
toast.error = (message, options = {}) => pushToast(message, 'error', options);
toast.loading = (message, options = {}) => pushToast(message, 'loading', { ...options, duration: Infinity });
toast.dismiss = (id) => {
  if (id) {
    removeToast(id);
  } else {
    toasts.set([]);
  }
};

toast.toasts = toasts;

export { Toaster, toasts };
export default toast;
