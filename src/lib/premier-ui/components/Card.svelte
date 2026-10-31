<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title?: string;
    subtitle?: string;
    accent?: 'orange' | 'green' | 'espresso' | 'none';
    class?: string;
    style?: string;
    header?: Snippet;
    footer?: Snippet;
    children?: Snippet;
  }

  let {
    title,
    subtitle,
    accent = 'none',
    class: className = '',
    style = '',
    header,
    footer,
    children
  }: Props = $props();
</script>

<div class="pn-card pn-card--accent-{accent} {className}" {style}>
  {#if header}
    <div class="pn-card__header">
      {@render header()}
    </div>
  {:else if title}
    <div class="pn-card__header">
      <div>
        <h3 class="pn-card__title">{title}</h3>
        {#if subtitle}
          <p class="pn-card__subtitle">{subtitle}</p>
        {/if}
      </div>
    </div>
  {/if}

  <div class="pn-card__body">
    {#if children}
      {@render children()}
    {/if}
  </div>

  {#if footer}
    <div class="pn-card__footer">
      {@render footer()}
    </div>
  {/if}
</div>

<style>
  .pn-card {
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    border-radius: var(--pn-radius-lg);
    box-shadow: var(--pn-shadow-sm);
    overflow: hidden;
    transition: all var(--pn-transition);
  }

  .pn-card:hover {
    box-shadow: var(--pn-shadow-md);
    border-color: var(--pn-line-dark);
  }

  .pn-card--accent-orange {
    border-top: 4px solid var(--pn-orange);
  }
  .pn-card--accent-green {
    border-top: 4px solid var(--pn-green);
  }
  .pn-card--accent-espresso {
    border-top: 4px solid var(--pn-ink);
  }

  .pn-card__header {
    padding: 18px 24px 12px;
    border-bottom: 1px solid var(--pn-line);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pn-card__title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .pn-card__subtitle {
    margin: 4px 0 0;
    font-size: 13px;
    color: var(--pn-ink-soft);
  }

  .pn-card__body {
    padding: 20px 24px;
  }

  .pn-card__footer {
    padding: 14px 24px;
    background: var(--pn-sidebar-bg);
    border-top: 1px solid var(--pn-line);
  }
</style>
