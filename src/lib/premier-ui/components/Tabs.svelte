<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { TabItem } from '../types';

  interface Props {
    items: TabItem[];
    active?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    items = [],
    active = $bindable(items[0]?.id || ''),
    class: className = '',
    children
  }: Props = $props();
</script>

<div class="pn-tabs-wrapper {className}">
  <div class="pn-tabs" role="tablist">
    {#each items as item}
      <button
        type="button"
        role="tab"
        aria-selected={active === item.id}
        class="pn-tab-btn"
        class:is-active={active === item.id}
        onclick={() => (active = item.id)}
      >
        {#if item.icon}
          <span class="pn-tab-icon">{item.icon}</span>
        {/if}
        <span>{item.label}</span>
        {#if item.badge !== undefined}
          <span class="pn-tab-badge">{item.badge}</span>
        {/if}
      </button>
    {/each}
  </div>

  <div class="pn-tab-content">
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .pn-tabs-wrapper {
    width: 100%;
  }

  .pn-tabs {
    display: flex;
    gap: 4px;
    border-bottom: 2px solid var(--pn-line);
    margin-bottom: 18px;
    overflow-x: auto;
  }

  .pn-tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    font-family: var(--pn-font-family);
    font-size: 14px;
    font-weight: 600;
    color: var(--pn-ink-soft);
    cursor: pointer;
    transition: all var(--pn-transition);
    white-space: nowrap;
  }

  .pn-tab-btn:hover {
    color: var(--pn-ink);
    background: rgba(240, 130, 30, 0.05);
  }

  .pn-tab-btn.is-active {
    color: var(--pn-orange);
    border-bottom-color: var(--pn-orange);
    background: transparent;
  }

  .pn-tab-badge {
    background: var(--pn-orange-light);
    color: var(--pn-orange-hover);
    font-size: 11px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--pn-radius-pill);
  }
</style>
