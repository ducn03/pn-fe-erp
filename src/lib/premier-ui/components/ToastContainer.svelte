<script lang="ts">
  import { toast } from '../toast.svelte';
</script>

<div class="pn-toast-container" aria-live="polite">
  {#each toast.toasts as t (t.id)}
    <div class="pn-toast pn-toast--{t.type}">
      <span class="pn-toast__icon">
        {#if t.type === 'success'}✓
        {:else if t.type === 'error'}✕
        {:else if t.type === 'warning'}⚠
        {:else}ℹ{/if}
      </span>
      <div class="pn-toast__content">{t.message}</div>
      <button
        class="pn-toast__close"
        onclick={() => toast.dismiss(t.id)}
        aria-label="Close notification"
      >&times;</button>
    </div>
  {/each}
</div>

<style>
  .pn-toast-container {
    position: fixed;
    top: 24px;
    right: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 9999;
    max-width: 380px;
    width: 100%;
    pointer-events: none;
  }

  .pn-toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    border-radius: var(--pn-radius);
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    box-shadow: var(--pn-shadow-md);
    font-size: 13.5px;
    color: var(--pn-ink);
    animation: pn-slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pn-toast--success {
    border-left: 4px solid var(--pn-green);
    background: var(--pn-success-bg);
  }
  .pn-toast--success .pn-toast__icon {
    color: var(--pn-green-dark);
  }

  .pn-toast--error {
    border-left: 4px solid var(--pn-error);
    background: var(--pn-error-bg);
  }
  .pn-toast--error .pn-toast__icon {
    color: var(--pn-error);
  }

  .pn-toast--warning {
    border-left: 4px solid var(--pn-orange);
    background: var(--pn-warning-bg);
  }
  .pn-toast--warning .pn-toast__icon {
    color: var(--pn-orange-hover);
  }

  .pn-toast--info {
    border-left: 4px solid var(--pn-info);
    background: var(--pn-info-bg);
  }
  .pn-toast--info .pn-toast__icon {
    color: var(--pn-info);
  }

  .pn-toast__icon {
    font-weight: 800;
    font-size: 15px;
  }

  .pn-toast__content {
    flex: 1;
    line-height: 1.4;
  }

  .pn-toast__close {
    background: transparent;
    border: none;
    font-size: 18px;
    color: var(--pn-ink-soft);
    cursor: pointer;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .pn-toast__close:hover {
    color: var(--pn-ink);
    background: rgba(0, 0, 0, 0.06);
  }

  @keyframes pn-slide-in {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>
