<script lang="ts">
  import {
    PageHeader,
    Card,
    Badge,
    Button,
    Modal,
    Input,
    toast,
    CARD_ACCENTS,
    BADGE_VARIANTS
  } from '$ui';
  import { authStore } from '$core/stores';
  import {
    getCompany,
    updateCompany,
    getDepartments,
    getRoles,
    type Company,
    type Department,
    type Role
  } from '$features/company';
  import { UI_CONSTANTS } from '$core/constants';

  let company = $state<Company | null>(null);
  let departments = $state<Department[]>([]);
  let roles = $state<Role[]>([]);
  let loading = $state(true);

  // Edit Company State
  let isEditModalOpen = $state(false);
  let isSubmitting = $state(false);
  let editForm = $state({
    name: '',
    taxCode: '',
    phone: '',
    email: '',
    address: '',
    website: ''
  });
  let formErrors = $state<Record<string, string>>({});

  function formatField(value: string | null | undefined): string {
    if (value && value.trim().length > 0) {
      return value;
    }
    return UI_CONSTANTS.EMPTY_PLACEHOLDER;
  }

  function openEditCompanyModal() {
    if (!company) {
      return;
    }
    editForm = {
      name: company.name || '',
      taxCode: company.taxCode || '',
      phone: company.phone || '',
      email: company.email || '',
      address: company.address || '',
      website: company.website || ''
    };
    formErrors = {};
    isEditModalOpen = true;
  }

  async function handleSaveCompany() {
    formErrors = {};
    if (!editForm.name.trim()) {
      formErrors.name = 'Tên công ty không được để trống';
    }

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    isSubmitting = true;
    try {
      const updated = await updateCompany({
        name: editForm.name.trim(),
        taxCode: editForm.taxCode.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        address: editForm.address.trim(),
        website: editForm.website.trim()
      });
      company = updated;
      isEditModalOpen = false;
      toast.success('Cập nhật thông tin doanh nghiệp thành công!');
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật thông tin: ' + (err.message || 'Lỗi kết nối'));
    } finally {
      isSubmitting = false;
    }
  }

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
      let errDetail = 'Lỗi kết nối';
      if (err && err.message) {
        errDetail = err.message;
      }
      toast.error('Không thể tải dữ liệu doanh nghiệp: ' + errDetail);
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

<PageHeader>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => loadData(true)} disabled={loading}>
      {#if loading}Đang làm mới...{:else}Làm mới dữ liệu{/if}
    </Button>
    {#if authStore.hasPermission('COMPANY_MANAGE')}
      <Button variant="primary" onclick={openEditCompanyModal}>
        Chỉnh sửa thông tin
      </Button>
    {/if}
  {/snippet}
</PageHeader>

<!-- 1. Company Overview Card (Full Width) -->
{#if company}
  <Card accent={CARD_ACCENTS.ORANGE} style="margin-bottom: 24px;">
    <div class="company-card-header">
      <div>
        <div class="company-code-badge">{company.code}</div>
        <h2 class="company-name">{company.name}</h2>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <Badge variant={BADGE_VARIANTS.SUCCESS}>Hoạt Động</Badge>
        {#if authStore.hasPermission('COMPANY_MANAGE')}
          <Button variant="outline" size="sm" onclick={openEditCompanyModal}>
            Chỉnh sửa
          </Button>
        {/if}
      </div>
    </div>

    <div class="company-grid">
      <div class="info-item">
        <span class="info-label">Mã số thuế</span>
        <span class="info-value font-mono">{formatField(company.taxCode)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Điện thoại liên hệ</span>
        <span class="info-value">{formatField(company.phone)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Email chính thức</span>
        <span class="info-value">{formatField(company.email)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Trang thông tin (Website)</span>
        <span class="info-value font-mono">{formatField(company.website)}</span>
      </div>
      <div class="info-item full-width">
        <span class="info-label">Địa chỉ trụ sở / Nhà máy</span>
        <span class="info-value">{formatField(company.address)}</span>
      </div>
    </div>
  </Card>
{/if}

<!-- 2. Departments Table (Trải ngang full width, responsive) -->
<div class="tables-stack">
  <Card accent={CARD_ACCENTS.ORANGE}>
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
                <Badge variant={BADGE_VARIANTS.SUCCESS}>Hoạt động</Badge>
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
  <Card accent={CARD_ACCENTS.ORANGE}>
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
                <Badge variant={BADGE_VARIANTS.SUCCESS}>Hoạt động</Badge>
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

<!-- Edit Company Modal -->
{#if isEditModalOpen}
  <Modal bind:open={isEditModalOpen} title="Chỉnh Sửa Thông Tin Doanh Nghiệp" size="lg">
    <div class="edit-company-form">
      <div class="form-group">
        <label for="companyName" class="form-label required">Tên Doanh Nghiệp</label>
        <input
          id="companyName"
          type="text"
          class="form-input"
          class:is-invalid={!!formErrors.name}
          bind:value={editForm.name}
          placeholder="Nhập tên chính thức của công ty"
        />
        {#if formErrors.name}
          <span class="field-error-text">{formErrors.name}</span>
        {/if}
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label for="companyTaxCode" class="form-label">Mã Số Thuế (MST)</label>
          <input
            id="companyTaxCode"
            type="text"
            class="form-input font-mono"
            bind:value={editForm.taxCode}
            placeholder="Ví dụ: 3502320150"
          />
        </div>
        <div class="form-group">
          <label for="companyPhone" class="form-label">Số Điện Thoại Hotline</label>
          <input
            id="companyPhone"
            type="text"
            class="form-input"
            bind:value={editForm.phone}
            placeholder="Ví dụ: 0949382374"
          />
        </div>
      </div>

      <div class="form-row-2">
        <div class="form-group">
          <label for="companyEmail" class="form-label">Email Doanh Nghiệp</label>
          <input
            id="companyEmail"
            type="email"
            class="form-input"
            bind:value={editForm.email}
            placeholder="contact@premiernuts.vn"
          />
        </div>
        <div class="form-group">
          <label for="companyWebsite" class="form-label">Website Chính Thức</label>
          <input
            id="companyWebsite"
            type="text"
            class="form-input font-mono"
            bind:value={editForm.website}
            placeholder="https://premiernuts.vn"
          />
        </div>
      </div>

      <div class="form-group">
        <label for="companyAddress" class="form-label">Địa Chỉ Trụ Sở & Nhà Máy</label>
        <textarea
          id="companyAddress"
          class="form-textarea"
          rows="3"
          bind:value={editForm.address}
          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
        ></textarea>
      </div>
    </div>

    {#snippet footer()}
      <Button variant="secondary" onclick={() => (isEditModalOpen = false)} disabled={isSubmitting}>
        Hủy bỏ
      </Button>
      <Button variant="primary" onclick={handleSaveCompany} disabled={isSubmitting}>
        {#if isSubmitting}Đang lưu...{:else}Lưu thay đổi{/if}
      </Button>
    {/snippet}
  </Modal>
{/if}

<style>
  .edit-company-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 8px 0;
  }

  .form-row-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  @media (max-width: 640px) {
    .form-row-2 {
      grid-template-columns: 1fr;
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 13px;
    font-weight: 700;
    color: var(--pn-ink, #2B2116);
  }

  .form-label.required::after {
    content: ' *';
    color: #DC2626;
  }

  .form-input, .form-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: 8px;
    background: #FFF;
    font-size: 14px;
    color: var(--pn-ink, #2B2116);
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .form-input:focus, .form-textarea:focus {
    outline: none;
    border-color: var(--pn-orange, #F0821E);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.15);
  }

  .form-input.is-invalid {
    border-color: #DC2626 !important;
    background-color: #FEF2F2 !important;
  }

  .field-error-text {
    font-size: 12px;
    color: #DC2626;
    font-weight: 600;
  }
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
