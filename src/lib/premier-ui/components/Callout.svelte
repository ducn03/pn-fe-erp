<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    variant = 'info',
    title,
    class: className = '',
    children
  }: Props = $props();
</script>

<div class="pn-callout pn-callout--{variant} {className}">
  {#if title}
    <h4 class="pn-callout__title">{title}</h4>
  {/if}
  <div class="pn-callout__body">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .pn-callout {
    padding: 16px 20px;
    border-radius: var(--pn-radius);
    margin: 14px 0;
    font-size: 13.5px;
    line-height: 1.5;
  }

  .pn-callout__title {
    margin: 0 0 6px;
    font-size: 14.5px;
    font-weight: 700;
  }

  .pn-callout--info {
    background: var(--pn-info-bg);
    border-left: 4px solid var(--pn-info);
    color: var(--pn-ink);
  }
  .pn-callout--info .pn-callout__title {
    color: var(--pn-info);
  }

  .pn-callout--success {
    background: var(--pn-success-bg);
    border-left: 4px solid var(--pn-green);
    color: var(--pn-green-dark);
  }
  .pn-callout--success .pn-callout__title {
    color: var(--pn-green-dark);
  }

  .pn-callout--warning {
    background: var(--pn-warning-bg);
    border-left: 4px solid var(--pn-orange);
    color: #8c4c06;
  }
  .pn-callout--warning .pn-callout__title {
    color: var(--pn-orange-hover);
  }

  .pn-callout--error {
    background: var(--pn-error-bg);
    border-left: 4px solid var(--pn-error);
    color: var(--pn-error);
  }
  .pn-callout--error .pn-callout__title {
    color: var(--pn-error);
  }
</style>
