<script lang="ts">
  import { Card, Badge, Button, toast, CARD_ACCENTS, BADGE_VARIANTS } from '$ui';
  import {
    getRoles,
    getPermissions,
    updateRolePermissions,
    type Role,
    type Permission
  } from '$features/company';
  import { authStore } from '$core/stores';

  let roles = $state<Role[]>([]);
  let permissions = $state<Permission[]>([]);
  let loading = $state(true);
  let selectedRoleId = $state<number | null>(null);
  let currentPermissionIds = $state<number[]>([]);
  let isSaving = $state(false);

  const MODULE_METAS: Record<string, { label: string; color: string }> = {
    IDENTITY: { label: 'Tài Khoản & Nhân Sự', color: '#3B82F6' },
    INVENTORY: { label: 'Kho Vận & Vật Tư', color: '#F0821E' },
    BRANCH: { label: 'Quản Lý Chi Nhánh', color: '#10B981' },
    FINANCE: { label: 'Tài Chính & Kế Toán', color: '#8B5CF6' },
    MANUFACTURING: { label: 'Xưởng Sản Xuất', color: '#EC4899' },
    QC: { label: 'Kiểm Định Chất Lượng', color: '#06B6D4' },
    MANAGEMENT: { label: 'Ban Giám Đốc & Điều Hành', color: '#F59E0B' }
  };

  let selectedRole = $derived.by(() => {
    return roles.find((r) => r.id === selectedRoleId) || null;
  });

  let groupedPermissions = $derived.by(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of permissions) {
      const mod = p.module || 'KHAC';
      if (!groups[mod]) {
        groups[mod] = [];
      }
      groups[mod].push(p);
    }
    return groups;
  });

  async function loadData() {
    loading = true;
    try {
      const [roleList, permList] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);
      roles = roleList;
      permissions = permList;
      if (roles.length > 0) {
        selectRole(roles[0]);
      }
    } catch (err: any) {
      toast.error('Lỗi khi nạp dữ liệu vai trò: ' + (err.message || 'Lỗi mạng'));
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadData();
  });

  function selectRole(r: Role) {
    selectedRoleId = r.id;
    currentPermissionIds = [...(r.permissionIds || [])];
  }

  function togglePermission(pId: number) {
    if (currentPermissionIds.includes(pId)) {
      currentPermissionIds = currentPermissionIds.filter((id) => id !== pId);
    } else {
      currentPermissionIds = [...currentPermissionIds, pId];
    }
  }

  function toggleAllInModule(modPerms: Permission[]) {
    const ids = modPerms.map((p) => p.id);
    const allChecked = ids.every((id) => currentPermissionIds.includes(id));
    if (allChecked) {
      currentPermissionIds = currentPermissionIds.filter((id) => !ids.includes(id));
    } else {
      currentPermissionIds = Array.from(new Set([...currentPermissionIds, ...ids]));
    }
  }

  async function handleSaveRoleTemplate() {
    if (!selectedRoleId || !selectedRole) {
      return;
    }
    isSaving = true;
    try {
      const updated = await updateRolePermissions(selectedRoleId, currentPermissionIds);
      // Cập nhật lại trong mảng roles
      roles = roles.map((r) => {
        if (r.id === updated.id) {
          return {
            ...r,
            permissionIds: updated.permissionIds,
            permissionCodes: updated.permissionCodes
          };
        }
        return r;
      });
      toast.success(`Đã lưu khuôn mẫu quyền cho vai trò "${selectedRole.name}" thành công!`);
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật khuôn mẫu quyền: ' + (err.message || 'Lỗi hệ thống'));
    } finally {
      isSaving = false;
    }
  }
</script>

<div class="template-manager-layout">
  <!-- Cột Trái: Danh sách vai trò -->
  <div class="roles-sidebar">
    <div class="sidebar-header">
      <h4 class="sidebar-title">Danh Sách Vai Trò Mẫu</h4>
      <p class="sidebar-subtitle">Chọn vai trò để cấu hình bộ quyền mẫu</p>
    </div>

    {#if loading}
      <div class="loading-box">Đang tải vai trò...</div>
    {:else}
      <div class="roles-list">
        {#each roles as r (r.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="role-item-btn"
            class:active={selectedRoleId === r.id}
            onclick={() => selectRole(r)}
          >
            <div class="role-btn-top">
              <span class="role-btn-code">{r.code}</span>
              <span class="role-btn-count">{r.permissionIds?.length || 0} quyền</span>
            </div>
            <div class="role-btn-name">{r.name}</div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Cột Phải: Ma trận điều chỉnh quyền cho vai trò được chọn -->
  <div class="permissions-content">
    {#if selectedRole}
      <Card accent={CARD_ACCENTS.ORANGE}>
        <div class="role-detail-header">
          <div>
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
              <span class="role-badge-code">{selectedRole.code}</span>
              <h3 class="role-detail-name">{selectedRole.name}</h3>
            </div>
            <p class="role-detail-desc">{selectedRole.description}</p>
          </div>

          <Button
            variant="primary"
            onclick={handleSaveRoleTemplate}
            disabled={isSaving || !authStore.isAdmin}
          >
            {#if isSaving}Đang lưu...{:else}Lưu khuôn mẫu quyền{/if}
          </Button>
        </div>

        <div class="stats-bar">
          <span>Khuôn mẫu đang kích hoạt: <strong>{currentPermissionIds.length}</strong> / {permissions.length} quyền hệ thống</span>
        </div>

        <div class="modules-stack">
          {#each Object.entries(groupedPermissions) as [modKey, modPerms] (modKey)}
            {@const meta = MODULE_METAS[modKey] || { label: modKey, color: '#F0821E' }}
            <div class="module-card">
              <div class="module-card-header">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="color-dot" style="background-color: {meta.color};"></span>
                  <span class="module-title">{meta.label} ({modKey})</span>
                </div>
                <button
                  type="button"
                  class="select-all-link"
                  onclick={() => toggleAllInModule(modPerms)}
                >
                  Chọn tất cả
                </button>
              </div>

              <div class="checkbox-grid">
                {#each modPerms as p (p.id)}
                  {@const checked = currentPermissionIds.includes(p.id)}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="perm-box"
                    class:is-active={checked}
                    onclick={() => togglePermission(p.id)}
                  >
                    <input
                      type="checkbox"
                      class="custom-check"
                      {checked}
                      tabindex="-1"
                    />
                    <div>
                      <div class="p-name">{p.name}</div>
                      <div class="p-code">{p.code}</div>
                      {#if p.description}
                        <div class="p-desc">{p.description}</div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </Card>
    {:else}
      <Card>
        <div style="padding: 40px; text-align: center; color: var(--pn-ink-soft);">
          Vui lòng chọn một vai trò bên trái để xem và cấu hình khuôn mẫu quyền hạn.
        </div>
      </Card>
    {/if}
  </div>
</div>

<style>
  .template-manager-layout {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .template-manager-layout {
      grid-template-columns: 1fr;
    }
  }

  .roles-sidebar {
    background: #FFF;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sidebar-header {
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
    padding-bottom: 10px;
  }

  .sidebar-title {
    margin: 0;
    font-size: 15px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
  }

  .sidebar-subtitle {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .loading-box {
    padding: 20px;
    text-align: center;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .roles-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .role-item-btn {
    padding: 10px 12px;
    border: 1.5px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    background: #FAF7F2;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .role-item-btn:hover {
    border-color: var(--pn-orange, #F0821E);
    background: #FFF;
  }

  .role-item-btn.active {
    border-color: var(--pn-orange, #F0821E);
    background: #FFF8F0;
    box-shadow: 0 0 0 1.5px var(--pn-orange, #F0821E);
  }

  .role-btn-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .role-btn-code {
    font-size: 11px;
    font-weight: 800;
    font-family: monospace;
    color: var(--pn-orange, #F0821E);
  }

  .role-btn-count {
    font-size: 11px;
    font-weight: 700;
    color: #059669;
  }

  .role-btn-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .role-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
  }

  .role-badge-code {
    font-size: 11px;
    font-weight: 800;
    font-family: monospace;
    color: var(--pn-orange, #F0821E);
    background: #FFF5EA;
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid #FDEBD3;
  }

  .role-detail-name {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
  }

  .role-detail-desc {
    margin: 4px 0 0 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .stats-bar {
    background: #FAF7F2;
    border: 1px dashed var(--pn-line, #EEE3D3);
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 12.5px;
    color: var(--pn-ink, #2B2116);
    margin-bottom: 16px;
  }

  .modules-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .module-card {
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    padding: 12px 14px;
    background: #FFF;
  }

  .module-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
    padding-bottom: 6px;
    border-bottom: 1px dashed var(--pn-line, #EEE3D3);
  }

  .color-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .module-title {
    font-size: 12.5px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
    text-transform: uppercase;
  }

  .select-all-link {
    background: none;
    border: none;
    font-size: 11.5px;
    color: var(--pn-orange, #F0821E);
    font-weight: 700;
    cursor: pointer;
    text-decoration: underline;
  }

  .checkbox-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 8px;
  }

  .perm-box {
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 6px;
    padding: 8px 10px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    background: #FAFAFA;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .perm-box:hover {
    background: #FFF;
    border-color: var(--pn-orange, #F0821E);
  }

  .perm-box.is-active {
    background: #FFF8F0;
    border-color: var(--pn-orange, #F0821E);
  }

  .custom-check {
    margin-top: 3px;
    accent-color: var(--pn-orange, #F0821E);
  }

  .p-name {
    font-size: 12px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .p-code {
    font-size: 10px;
    font-family: monospace;
    color: var(--pn-ink-soft, #8C7D6F);
  }

  .p-desc {
    font-size: 10.5px;
    color: var(--pn-ink-soft, #6B5D4F);
    margin-top: 2px;
    line-height: 1.25;
  }
</style>
