<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { Sidebar, Button, Badge, toast } from '$ui';
  import { authStore } from '$core/stores';
  import { ERP_NAV_SECTIONS } from '$features/navigation';

  let { children } = $props();

  let activeHref = $derived(page.url.pathname);
  let user = $derived(authStore.user);

  // Auth Guard: redirect to login if unauthenticated in browser
  $effect(() => {
    if (typeof window !== 'undefined' && !authStore.isAuthenticated) {
      goto('/login');
    }
  });

  function handleLogout() {
    authStore.logout();
    toast.info('Đã đăng xuất khỏi hệ thống');
    goto('/login');
  }
</script>

<div class="erp-layout">
  <!-- Left Navigation Sidebar -->
  <Sidebar
    brandName="PREMIER NUTS ERP"
    logoText="PN"
    sections={ERP_NAV_SECTIONS}
    {activeHref}
  />

  <!-- Main Work Area -->
  <div class="erp-content-pane">
    <!-- Top Global Header / User Bar -->
    <header class="top-header">
      <div class="header-status">
        <span class="live-dot"></span>
        <span class="status-text">Hệ thống đang hoạt động</span>
      </div>

      <div class="header-actions">
        {#if user}
          <div class="user-info-box">
            <div class="user-avatar">
              {(user.username || 'U').substring(0, 2).toUpperCase()}
            </div>
            <div class="user-text">
              <span class="user-name">{user.fullName || user.username}</span>
              <span class="user-role">
                {#if user.roles && user.roles.length > 0}
                  {user.roles[0]}
                {:else}
                  Nhân viên
                {/if}
              </span>
            </div>
          </div>
        {/if}

        <Button size="sm" variant="outline" onclick={handleLogout}>
          Đăng xuất
        </Button>
      </div>
    </header>

    <main class="erp-main">
      {@render children()}
    </main>
  </div>
</div>

<style>
  .erp-layout {
    display: flex;
    min-height: 100vh;
    background: var(--pn-cream);
  }

  .erp-content-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .top-header {
    height: 56px;
    background: var(--pn-paper);
    border-bottom: 1px solid var(--pn-line);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    box-sizing: border-box;
  }

  .header-status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    color: var(--pn-ink-soft);
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .user-info-box {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--pn-orange-mist);
    border: 1px solid var(--pn-orange);
    color: var(--pn-orange-hover);
    font-weight: 800;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .user-text {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
  }

  .user-name {
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .user-role {
    font-size: 11px;
    color: var(--pn-ink-soft);
  }

  .erp-main {
    flex: 1;
    padding: 28px 32px;
    overflow-y: auto;
    max-height: calc(100vh - 56px);
    box-sizing: border-box;
  }
</style>
