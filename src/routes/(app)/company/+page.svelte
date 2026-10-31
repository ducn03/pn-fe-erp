<script lang="ts">
  import {
    PageHeader,
    Card,
    Badge,
    Button,
    toast
  } from '$ui';
  import {
    getCompany,
    getDepartments,
    getRoles,
    type Company,
    type Department,
    type Role
  } from '$features/company';

  let company = $state<Company | null>(null);
  let departments = $state<Department[]>([]);
  let roles = $state<Role[]>([]);
  let loading = $state(true);

  async function loadData() {
    loading = true;
    try {
      const [compData, deptData, roleData] = await Promise.all([
        getCompany(),
        getDepartments(),
        getRoles()
      ]);
      company = compData;
      departments = deptData;
      roles = roleData;
    } catch (err: any) {
      toast.error('Không thể tải dữ liệu doanh nghiệp: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadData();
  });
</script>

<svelte:head>
  <title>Thông Tin Doanh Nghiệp | Premier Nuts ERP</title>
</svelte:head>

<PageHeader
  title="Thông Tin Doanh Nghiệp & Cơ Cấu"
  subtitle="Quản lý pháp nhân công ty, cơ cấu phòng ban và phân định vai trò nhiệm vụ"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Doanh nghiệp' },
    { label: 'Thông tin chung' }
  ]}
>
  {#snippet actions()}
    <Button variant="secondary" onclick={loadData} disabled={loading}>
      {#if loading}Đang làm mới...{:else}Làm mới dữ liệu{/if}
    </Button>
  {/snippet}
</PageHeader>

<!-- Company Overview Card -->
{#if company}
  <Card accent="orange" style="margin-bottom: 24px;">
    <div class="company-card-header">
      <div>
        <div class="company-code-badge">{company.code}</div>
        <h2 class="company-name">{company.name}</h2>
      </div>
      <Badge variant="success">Hoạt Động</Badge>
    </div>

    <div class="company-grid">
      <div class="info-item">
        <span class="info-label">Mã số thuế</span>
        <span class="info-value font-mono">{company.taxCode || '—'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Điện thoại liên hệ</span>
        <span class="info-value">{company.phone || '—'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email chính thức</span>
        <span class="info-value">{company.email || '—'}</span>
      </div>
      <div class="info-item full-width">
        <span class="info-label">Địa chỉ trụ sở / Nhà máy</span>
        <span class="info-value">{company.address || '—'}</span>
      </div>
    </div>
  </Card>
{/if}

<!-- Two Columns: Departments & Roles -->
<div class="structure-grid">
  <!-- Departments Table -->
  <Card accent="orange">
    <div class="section-title-row">
      <div>
        <h3 class="section-title">Phòng Ban & Phân Xưởng</h3>
        <p class="section-subtitle">Tổng cộng {departments.length} phòng ban trực thuộc</p>
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên Phòng Ban</th>
            <th>Mô Tả Nhiệm Vụ</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {#each departments as dept (dept.id)}
            <tr>
              <td><span class="code-tag">{dept.code}</span></td>
              <td class="font-bold">{dept.name}</td>
              <td class="desc-cell">{dept.description}</td>
              <td>
                <Badge variant="success">Hoạt động</Badge>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="empty-cell">Không có dữ liệu phòng ban</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card>

  <!-- Roles Table -->
  <Card accent="orange">
    <div class="section-title-row">
      <div>
        <h3 class="section-title">Vai Trò & Chức Vụ Phân Quyền</h3>
        <p class="section-subtitle">Tổng cộng {roles.length} vai trò trong hệ thống</p>
      </div>
    </div>

    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mã Vai Trò</th>
            <th>Tên Vai Trò</th>
            <th>Phạm Vi Quyền Hạn</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {#each roles as role (role.id)}
            <tr>
              <td><span class="code-tag">{role.code}</span></td>
              <td class="font-bold">{role.name}</td>
              <td class="desc-cell">{role.description}</td>
              <td>
                <Badge variant="success">Hoạt động</Badge>
              </td>
            </tr>
          {:else}
            <tr>
              <td colspan="4" class="empty-cell">Không có dữ liệu vai trò</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </Card>
</div>

<style>
  .company-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
  }

  .company-code-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--pn-orange, #F0821E);
    background: var(--pn-orange-mist, #FFF5EA);
    border: 1px solid var(--pn-orange-light, #FDEBD3);
    padding: 2px 8px;
    border-radius: 4px;
    margin-bottom: 6px;
  }

  .company-name {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
  }

  .company-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-item.full-width {
    grid-column: 1 / -1;
  }

  .info-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--pn-ink-soft, #6B5D4F);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .info-value {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .font-mono {
    font-family: monospace;
  }

  .structure-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  @media (min-width: 1024px) {
    .structure-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .section-title-row {
    margin-bottom: 16px;
  }

  .section-title {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .section-subtitle {
    margin: 0;
    font-size: 12.5px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .table-wrap {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
    text-align: left;
  }

  .data-table th {
    background: var(--pn-sidebar-bg, #FDF9F2);
    color: var(--pn-ink, #2B2116);
    font-weight: 700;
    padding: 10px 14px;
    border-bottom: 2px solid var(--pn-line, #EEE3D3);
    white-space: nowrap;
  }

  .data-table td {
    padding: 11px 14px;
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
    color: var(--pn-ink, #2B2116);
    vertical-align: middle;
  }

  .data-table tbody tr:hover {
    background: var(--pn-orange-mist, #FFF5EA);
  }

  .code-tag {
    font-family: monospace;
    font-size: 11.5px;
    background: var(--pn-sidebar-bg, #FDF9F2);
    border: 1px solid var(--pn-line-dark, #D6C5B3);
    padding: 2px 6px;
    border-radius: 4px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .font-bold {
    font-weight: 600;
  }

  .desc-cell {
    color: var(--pn-ink-soft, #6B5D4F);
    font-size: 12.5px;
  }

  .empty-cell {
    text-align: center;
    color: var(--pn-ink-light, #9B8D80);
    padding: 24px;
  }
</style>
