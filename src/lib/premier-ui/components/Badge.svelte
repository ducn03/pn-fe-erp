<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'outline';
    size?: 'sm' | 'md';
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    class: className = '',
    children
  }: Props = $props();
</script>

<span class="pn-badge pn-badge--{variant} pn-badge--{size} {className}">
  {#if children}
    {@render children()}
  {/if}
</span>

<style>
  .pn-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    border-radius: var(--pn-radius-pill);
    line-height: 1;
    white-space: nowrap;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pn-badge--sm {
    padding: 3px 8px;
    font-size: 10.5px;
  }
  .pn-badge--md {
    padding: 5px 11px;
    font-size: 11.5px;
  }

  .pn-badge--primary {
    background: var(--pn-orange-light);
    color: var(--pn-orange-hover);
    border: 1px solid rgba(240, 130, 30, 0.3);
  }

  .pn-badge--success {
    background: var(--pn-green-mist);
    color: var(--pn-green-dark);
    border: 1px solid rgba(143, 197, 62, 0.4);
  }

  .pn-badge--warning {
    background: var(--pn-warning-bg);
    color: var(--pn-warning);
    border: 1px solid rgba(240, 130, 30, 0.25);
  }

  .pn-badge--error {
    background: var(--pn-error-bg);
    color: var(--pn-error);
    border: 1px solid var(--pn-error-border);
  }

  .pn-badge--neutral {
    background: #f0e9df;
    color: var(--pn-ink-soft);
    border: 1px solid var(--pn-line);
  }

  .pn-badge--outline {
    background: transparent;
    border: 1px solid var(--pn-line-dark);
    color: var(--pn-ink);
  }
</style>
