<script>
  import { fly, fade } from 'svelte/transition';
  import { toasts } from './index.js';
</script>

<div class="toaster" aria-live="polite" aria-atomic="true">
  {#each $toasts as toast (toast.id)}
    <div class={`toast ${toast.type}`} in:fly={{ y: 16, duration: 150 }} out:fade={{ duration: 150 }}>
      {toast.message}
    </div>
  {/each}
</div>

<style>
  .toaster {
    position: fixed;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    z-index: 1000;
  }

  .toast {
    background: #1f2937;
    color: #f9fafb;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.08);
    min-width: 220px;
  }

  .toast.success {
    background: #14532d;
    border-color: rgba(74, 222, 128, 0.5);
  }

  .toast.error {
    background: #7f1d1d;
    border-color: rgba(248, 113, 113, 0.55);
  }

  .toast.loading {
    background: #0f172a;
    border-color: rgba(59, 130, 246, 0.5);
  }
</style>
