<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    striped?: boolean;
    compact?: boolean;
    hover?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    striped = true,
    compact = false,
    hover = true,
    class: className = '',
    children
  }: Props = $props();
</script>

<div class="pn-table-container {className}">
  <table
    class="pn-table"
    class:pn-table--striped={striped}
    class:pn-table--compact={compact}
    class:pn-table--hover={hover}
  >
    {#if children}
      {@render children()}
    {/if}
  </table>
</div>

<style>
  .pn-table-container {
    width: 100%;
    overflow-x: auto;
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    border-radius: var(--pn-radius-lg);
    box-shadow: var(--pn-shadow-sm);
  }

  .pn-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
    text-align: left;
  }

  :global(.pn-table th) {
    background: var(--pn-sidebar-bg);
    color: var(--pn-ink);
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 2px solid var(--pn-line);
    white-space: nowrap;
  }

  :global(.pn-table td) {
    padding: 12px 16px;
    border-bottom: 1px solid var(--pn-line);
    color: var(--pn-ink);
    vertical-align: middle;
  }

  :global(.pn-table tr:last-child td) {
    border-bottom: none;
  }

  .pn-table--striped :global(tbody tr:nth-child(even)) {
    background: #FCF9F3;
  }

  .pn-table--hover :global(tbody tr:hover) {
    background: var(--pn-orange-mist);
  }

  .pn-table--compact :global(th),
  .pn-table--compact :global(td) {
    padding: 8px 12px;
    font-size: 12.5px;
  }
</style>
