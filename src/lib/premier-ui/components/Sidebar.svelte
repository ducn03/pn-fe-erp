<script lang="ts">
  import type { NavItem, NavSection } from '../types';

  interface Props {
    brandName?: string;
    logoText?: string;
    sections: NavSection[];
    activeHref?: string;
    onnavigate?: (href: string) => void;
  }

  let {
    brandName = 'PREMIER NUTS ERP',
    logoText = 'PN',
    sections = [],
    activeHref = '/',
    onnavigate
  }: Props = $props();

  let searchQuery = $state('');

  // Filter items reactively using Svelte 5 $derived
  let filteredSections = $derived(
    searchQuery.trim() === ''
      ? sections
      : sections
          .map((sec) => ({
            heading: sec.heading,
            items: sec.items.filter((item) =>
              item.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          }))
          .filter((sec) => sec.items.length > 0)
  );

  function handleClick(e: MouseEvent, href: string) {
    if (onnavigate) {
      e.preventDefault();
      onnavigate(href);
    }
  }
</script>

<aside class="pn-sidebar">
  <div class="pn-sidebar__brand">
    <span class="pn-sidebar__logo">{logoText}</span>
    <span class="pn-sidebar__title">{brandName}</span>
  </div>

  <div class="pn-sidebar__search-wrap">
    <input
      type="text"
      class="pn-sidebar__search"
      placeholder="Tìm tính năng..."
      bind:value={searchQuery}
    />
  </div>

  <nav class="pn-sidebar__nav">
    {#each filteredSections as sec}
      {#if sec.heading}
        <div class="pn-sidebar__heading">{sec.heading}</div>
      {/if}
      {#each sec.items as item}
        <a
          href={item.href}
          class="pn-sidebar__link"
          class:is-active={item.active || activeHref === item.href}
          onclick={(e) => handleClick(e, item.href)}
        >
          {#if item.icon}
            <span class="pn-sidebar__icon">{item.icon}</span>
          {/if}
          <span class="pn-sidebar__label">{item.label}</span>
          {#if item.badge}
            <span class="pn-sidebar__badge">{item.badge}</span>
          {/if}
        </a>
      {/each}
    {:else}
      <div class="pn-sidebar__empty">Không tìm thấy tính năng nào</div>
    {/each}
  </nav>
</aside>

<style>
  .pn-sidebar {
    width: 270px;
    height: 100vh;
    background: var(--pn-sidebar-bg);
    border-right: 1px solid var(--pn-line);
    display: flex;
    flex-direction: column;
    padding: 20px 14px;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .pn-sidebar__brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 10px 18px;
    border-bottom: 1px solid var(--pn-line);
    margin-bottom: 16px;
  }

  .pn-sidebar__logo {
    font-size: 24px;
  }

  .pn-sidebar__title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.03em;
    color: var(--pn-ink);
  }

  .pn-sidebar__search-wrap {
    margin-bottom: 16px;
  }

  .pn-sidebar__search {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    font-size: 13px;
    font-family: var(--pn-font-family);
    border: 1px solid var(--pn-line-dark);
    border-radius: var(--pn-radius);
    background: var(--pn-paper);
    color: var(--pn-ink);
    outline: none;
    transition: all var(--pn-transition);
  }

  .pn-sidebar__search:focus {
    border-color: var(--pn-orange);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.15);
  }

  .pn-sidebar__nav {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pn-sidebar__heading {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 700;
    color: var(--pn-ink-soft);
    padding: 14px 10px 6px;
  }

  .pn-sidebar__link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: var(--pn-radius);
    color: var(--pn-ink-soft);
    font-size: 13.5px;
    font-weight: 500;
    text-decoration: none;
    transition: all var(--pn-transition);
  }

  .pn-sidebar__link:hover {
    background: var(--pn-orange-mist);
    color: var(--pn-orange-hover);
  }

  .pn-sidebar__link.is-active {
    background: var(--pn-orange-light);
    color: var(--pn-orange-hover);
    font-weight: 700;
  }

  .pn-sidebar__icon {
    font-size: 16px;
  }

  .pn-sidebar__label {
    flex: 1;
  }

  .pn-sidebar__badge {
    background: var(--pn-orange);
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: var(--pn-radius-pill);
  }

  .pn-sidebar__empty {
    font-size: 12.5px;
    color: var(--pn-ink-soft);
    font-style: italic;
    padding: 12px;
    text-align: center;
  }
</style>
