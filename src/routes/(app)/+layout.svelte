<script lang="ts">
  import { page } from '$app/state';
  import { Sidebar } from '#lib/premier-ui';
  import { ERP_NAV_SECTIONS } from '#lib/modules/navigation';

  let { children } = $props();

  let activeHref = $derived(page.url.pathname);
</script>

<div class="erp-layout">
  <Sidebar
    brandName="PREMIER NUTS ERP"
    logoText="PN"
    sections={ERP_NAV_SECTIONS}
    {activeHref}
  />

  <main class="erp-main">
    {@render children()}
  </main>
</div>

<style>
  .erp-layout {
    display: flex;
    min-height: 100vh;
    background: var(--pn-cream);
  }

  .erp-main {
    flex: 1;
    padding: 28px 32px;
    overflow-y: auto;
    max-height: 100vh;
    box-sizing: border-box;
  }
</style>
