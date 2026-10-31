<script lang="ts">
  import {
    Button,
    Card,
    PageHeader,
    Callout
  } from '$ui';
</script>

<PageHeader
  title="Trung Tâm Thử Nghiệm Trang Báo Lỗi"
  subtitle="Mô phỏng và kiểm tra các trạng thái HTTP 404, 500, 403 trong Premier Nuts ERP"
  breadcrumbs={[
    { label: 'Premier Nuts', href: '/' },
    { label: 'Hệ thống' },
    { label: 'Trang lỗi' }
  ]}
/>

<Callout variant="info" title="Cơ chế xử lý lỗi trong Premier Nuts ERP">
  Hệ thống sử dụng cơ chế Error Boundary tập trung tại <code>src/routes/+error.svelte</code>. Bất kỳ khi nào người dùng gõ sai đường dẫn URL (404), dịch vụ backend Gateway bị ngắt kết nối (500/502), hoặc tài khoản không đủ quyền (403), giao diện lỗi đồng bộ theo chuẩn thương hiệu Premier Nuts sẽ được tự động hiển thị.
</Callout>

<div class="test-grid">
  <!-- Card 404 -->
  <Card accent="orange">
    <div class="card-content">
      <div class="status-badge status-404">HTTP 404</div>
      <h3>Không Tìm Thấy Trang (Not Found)</h3>
      <p class="desc">
        Xảy ra khi người dùng truy cập một URL không tồn tại trong hệ thống hoặc tài nguyên lô hàng đã bị xóa.
      </p>
      <div class="btn-group">
        <Button
          variant="primary"
          onclick={() => (window.location.href = '/trang-khong-ton-tai-123')}
        >
          Kích hoạt 404 (Đường dẫn sai)
        </Button>
        <Button
          variant="secondary"
          onclick={() => (window.location.href = '/error-demo?trigger=404')}
        >
          Kích hoạt 404 (Dữ liệu không thấy)
        </Button>
      </div>
    </div>
  </Card>

  <!-- Card 500 -->
  <Card accent="espresso">
    <div class="card-content">
      <div class="status-badge status-500">HTTP 500</div>
      <h3>Lỗi Máy Chủ Nội Bộ (Server Error)</h3>
      <p class="desc">
        Xảy ra khi có lỗi ném ra từ backend Java (Spring Boot pn-identity / Gateway) hoặc truy vấn database MySQL gặp sự cố.
      </p>
      <div class="btn-group">
        <Button
          variant="danger"
          onclick={() => (window.location.href = '/error-demo?trigger=500')}
        >
          Kích hoạt lỗi 500 (Lỗi máy chủ)
        </Button>
      </div>
    </div>
  </Card>

  <!-- Card 403 -->
  <Card accent="green">
    <div class="card-content">
      <div class="status-badge status-403">HTTP 403</div>
      <h3>Truy Cập Bị Từ Chối (Forbidden)</h3>
      <p class="desc">
        Xảy ra khi tài khoản người dùng đăng nhập không có quyền truy cập vào màn hình cấu hình hệ thống hoặc tài chính.
      </p>
      <div class="btn-group">
        <Button
          variant="secondary"
          onclick={() => (window.location.href = '/error-demo?trigger=403')}
        >
          Kích hoạt lỗi 403 (Không đủ quyền)
        </Button>
      </div>
    </div>
  </Card>
</div>

<style>
  .test-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }

  .card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .status-badge {
    font-family: monospace;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: var(--pn-radius);
    width: fit-content;
    margin-bottom: 12px;
  }

  .status-404 {
    color: var(--pn-orange-hover);
    background: var(--pn-orange-mist);
    border: 1px solid rgba(240, 130, 30, 0.3);
  }

  .status-500 {
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid rgba(185, 28, 28, 0.3);
  }

  .status-403 {
    color: #92400e;
    background: #fefce8;
    border: 1px solid rgba(146, 64, 14, 0.3);
  }

  h3 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .desc {
    margin: 0 0 20px;
    font-size: 13.5px;
    color: var(--pn-ink-soft);
    line-height: 1.5;
    flex: 1;
  }

  .btn-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  code {
    background: var(--pn-orange-light);
    color: var(--pn-orange-hover);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
  }
</style>
