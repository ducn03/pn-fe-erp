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

  async function loadData(isManual = false) {
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
      if (isManual) {
        toast.success('Đã cập nhật dữ liệu doanh nghiệp mới nhất!');
      }
    } catch (err: any) {
      toast.error('Không thể tải dữ liệu doanh nghiệp: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    loadData(false);
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
    <Button variant="secondary" onclick={() => loadData(true)} disabled={loading}>
      {#if loading}Đang làm mới...{:else}Làm mới dữ liệu{/if}
    </Button>
  {/snippet}
</PageHeader>

<!-- 1. Company Overview Card (Full Width) -->
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

<!-- 2. Departments Table (Trải ngang full width, responsive) -->
<div class="tables-stack">
  <Card accent="orange">
    <div class="section-title-row">
      <div>
        <h3 class="section-title">Phòng Ban & Phân Xưởng</h3>
        <p class="section-subtitle">Tổng cộng {departments.length} phòng ban trực thuộc hệ thống</p>
      </div>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 140px;">Mã Phòng Ban</th>
            <th style="width: 260px;">Tên Phòng Ban</th>
            <th>Mô Tả Nhiệm Vụ</th>
            <th style="width: 140px; text-align: center;">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {#each departments as dept (dept.id)}
            <tr>
              <td><span class="code-tag">{dept.code}</span></td>
              <td class="font-bold">{dept.name}</td>
              <td class="desc-cell">{dept.description}</td>
              <td style="text-align: center;">
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

  <!-- 3. Roles Table (Trải ngang full width, responsive) -->
  <Card accent="orange">
    <div class="section-title-row">
      <div>
        <h3 class="section-title">Vai Trò & Chức Vụ Phân Quyền</h3>
        <p class="section-subtitle">Tổng cộng {roles.length} vai trò trong hệ thống</p>
      </div>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 180px;">Mã Vai Trò</th>
            <th style="width: 260px;">Tên Vai Trò</th>
            <th>Phạm Vi Quyền Hạn</th>
            <th style="width: 140px; text-align: center;">Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          {#each roles as role (role.id)}
            <tr>
              <td><span class="code-tag">{role.code}</span></td>
              <td class="font-bold">{role.name}</td>
              <td class="desc-cell">{role.description}</td>
              <td style="text-align: center;">
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
    font-size: 11.5px;
    font-weight: 700;
    color: var(--pn-ink-soft, #6B5D4F);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .info-value {
    font-size: 14.5px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .font-mono {
    font-family: monospace;
  }

  /* Bố cục trải ngang toàn diện (Full Width Stack) */
  .tables-stack {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  .section-title-row {
    margin-bottom: 16px;
  }

  .section-title {
    margin: 0 0 4px;
    font-size: 16.5px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .section-subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  /* Responsive Table Container */
  .table-responsive {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: var(--pn-radius, 6px);
  }

  .data-table {
    width: 100%;
    min-width: 650px;
    border-collapse: collapse;
    font-size: 13.5px;
    text-align: left;
  }

  .data-table th {
    background: var(--pn-sidebar-bg, #FDF9F2);
    color: var(--pn-ink, #2B2116);
    font-weight: 700;
    padding: 12px 16px;
    border-bottom: 2px solid var(--pn-line, #EEE3D3);
    white-space: nowrap;
  }

  .data-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--pn-line, #EEE3D3);
    color: var(--pn-ink, #2B2116);
    vertical-align: middle;
  }

  .data-table tbody tr:last-child td {
    border-bottom: none;
  }

  .data-table tbody tr:hover {
    background: var(--pn-orange-mist, #FFF5EA);
  }

  .code-tag {
    font-family: monospace;
    font-size: 12px;
    background: var(--pn-sidebar-bg, #FDF9F2);
    border: 1px solid var(--pn-line-dark, #D6C5B3);
    padding: 3px 8px;
    border-radius: 4px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
    white-space: nowrap;
  }

  .font-bold {
    font-weight: 600;
  }

  .desc-cell {
    color: var(--pn-ink-soft, #6B5D4F);
    font-size: 13px;
    line-height: 1.5;
  }

  .empty-cell {
    text-align: center;
    color: var(--pn-ink-light, #9B8D80);
    padding: 32px;
  }
</style>
