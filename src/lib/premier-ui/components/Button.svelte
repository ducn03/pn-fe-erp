<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
    class?: string;
    title?: string;
    onclick?: (e: MouseEvent) => void;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    class: className = '',
    title,
    onclick,
    children
  }: Props = $props();
</script>

<button
  {type}
  {title}
  class="pn-btn pn-btn--{variant} pn-btn--{size} {className}"
  disabled={disabled || loading}
  {onclick}
>
  {#if loading}
    <span class="pn-spinner" aria-hidden="true"></span>
  {/if}
  {#if children}
    {@render children()}
  {/if}
</button>

<style>
  .pn-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--pn-font-family);
    font-weight: 600;
    border-radius: var(--pn-radius);
    cursor: pointer;
    transition: all var(--pn-transition);
    border: 1px solid transparent;
    text-decoration: none;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
  }

  .pn-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Sizes */
  .pn-btn--sm {
    padding: 7px 12px;
    font-size: 12.5px;
  }
  .pn-btn--md {
    padding: 10px 18px;
    font-size: 14px;
  }
  .pn-btn--lg {
    padding: 13px 24px;
    font-size: 15.5px;
  }

  /* Variants */
  .pn-btn--primary {
    background: var(--pn-orange);
    color: #ffffff;
    box-shadow: 0 4px 12px -2px rgba(240, 130, 30, 0.35);
  }
  .pn-btn--primary:hover:not(:disabled) {
    background: var(--pn-orange-hover);
    box-shadow: 0 6px 16px -2px rgba(240, 130, 30, 0.45);
    transform: translateY(-1px);
  }

  .pn-btn--secondary {
    background: var(--pn-sidebar-bg);
    color: var(--pn-ink);
    border-color: var(--pn-line-dark);
  }
  .pn-btn--secondary:hover:not(:disabled) {
    background: #f7eedf;
    border-color: #c4b09b;
  }

  .pn-btn--success {
    background: var(--pn-green);
    color: #ffffff;
    box-shadow: 0 4px 12px -2px rgba(143, 197, 62, 0.35);
  }
  .pn-btn--success:hover:not(:disabled) {
    background: var(--pn-green-dark);
  }

  .pn-btn--outline {
    background: transparent;
    color: var(--pn-orange);
    border-color: var(--pn-orange);
  }
  .pn-btn--outline:hover:not(:disabled) {
    background: var(--pn-orange-mist);
    border-color: var(--pn-orange-hover);
    color: var(--pn-orange-hover);
  }

  .pn-btn--danger {
    background: var(--pn-error);
    color: #ffffff;
  }
  .pn-btn--danger:hover:not(:disabled) {
    background: #9b2121;
  }

  .pn-btn--ghost {
    background: transparent;
    color: var(--pn-ink-soft);
  }
  .pn-btn--ghost:hover:not(:disabled) {
    background: rgba(43, 33, 22, 0.05);
    color: var(--pn-ink);
  }

  .pn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: pn-spin 0.65s linear infinite;
  }

  @keyframes pn-spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
