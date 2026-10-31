<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { BreadcrumbItem } from '../types';

  interface Props {
    title: string;
    subtitle?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: Snippet;
  }

  let {
    title,
    subtitle,
    breadcrumbs = [],
    actions
  }: Props = $props();
</script>

<header class="pn-page-header">
  <div class="pn-page-header__left">
    {#if breadcrumbs.length > 0}
      <nav class="pn-breadcrumb">
        {#each breadcrumbs as b, i}
          {#if i > 0}<span class="pn-breadcrumb__separator">/</span>{/if}
          {#if b.href}
            <a href={b.href} class="pn-breadcrumb__link">{b.label}</a>
          {:else}
            <span class="pn-breadcrumb__current">{b.label}</span>
          {/if}
        {/each}
      </nav>
    {/if}

    <h1 class="pn-page-header__title">{title}</h1>
    {#if subtitle}
      <p class="pn-page-header__subtitle">{subtitle}</p>
    {/if}
  </div>

  {#if actions}
    <div class="pn-page-header__actions">
      {@render actions()}
    </div>
  {/if}
</header>

<style>
  .pn-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 28px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--pn-line);
    flex-wrap: wrap;
    gap: 16px;
  }

  .pn-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: var(--pn-ink-soft);
    margin-bottom: 8px;
  }

  .pn-breadcrumb__link {
    color: var(--pn-ink-soft);
    text-decoration: none;
  }
  .pn-breadcrumb__link:hover {
    color: var(--pn-orange);
  }

  .pn-breadcrumb__separator {
    color: var(--pn-line-dark);
  }

  .pn-breadcrumb__current {
    color: var(--pn-ink);
    font-weight: 600;
  }

  .pn-page-header__title {
    margin: 0;
    font-size: 24px;
    font-weight: 800;
    color: var(--pn-ink);
    letter-spacing: -0.01em;
  }

  .pn-page-header__subtitle {
    margin: 4px 0 0;
    font-size: 13.5px;
    color: var(--pn-ink-soft);
  }

  .pn-page-header__actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
</style>
