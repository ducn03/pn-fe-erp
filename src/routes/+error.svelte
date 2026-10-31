<script lang="ts">
  import { page } from '$app/state';
  import { Button } from '$ui';

  let status = $derived(page.status);
  let message = $derived(page.error?.message || '');

  // Error details mapping
  let errorInfo = $derived.by(() => {
    switch (status) {
      case 404:
        return {
          code: '404',
          title: 'Không Tìm Thấy Trang Yêu Cầu',
          subtitle: 'Địa chỉ URL bạn truy cập không tồn tại hoặc đã được chuyển sang phân hệ khác.',
          tip: 'Vui lòng kiểm tra lại đường dẫn trên thanh địa chỉ hoặc sử dụng các liên kết điều hướng bên dưới.',
          actionPrimary: 'Về Bàn làm việc (Dashboard)',
          actionPrimaryHref: '/',
          actionSecondary: 'Đến Kho hạt & Nguyên liệu',
          actionSecondaryHref: '/kho'
        };
      case 403:
        return {
          code: '403',
          title: 'Truy Cập Bị Từ Chối (Forbidden)',
          subtitle: 'Tài khoản của bạn không có đủ quyền hạn để truy cập vào tài nguyên này.',
          tip: 'Hãy liên hệ Quản trị viên (Admin) của hệ thống Premier Nuts để được cấp quyền theo vai trò.',
          actionPrimary: 'Quay lại Bàn làm việc',
          actionPrimaryHref: '/',
          actionSecondary: 'Xem danh mục Tài khoản',
          actionSecondaryHref: '/identity'
        };
      case 500:
        return {
          code: '500',
          title: 'Lỗi Máy Chủ Nội Bộ (Server Error)',
          subtitle: 'Đã xảy ra sự cố kỹ thuật trong quá trình xử lý yêu cầu phía máy chủ.',
          tip: 'Cụm dịch vụ pn-api-gateway hoặc các microservices vệ tinh có thể đang khởi động lại hoặc mất kết nối.',
          actionPrimary: 'Tải lại trang (Reload)',
          actionPrimaryHref: 'reload',
          actionSecondary: 'Đến Quản trị Tài khoản',
          actionSecondaryHref: '/identity'
        };
      case 502:
      case 503:
      case 504:
        return {
          code: String(status),
          title: 'Cổng Kết Nối Không Khả Dụng (Gateway Unavailable)',
          subtitle: 'Không thể thiết lập kết nối tới Spring Cloud Gateway (pn-api-gateway:9000).',
          tip: 'Hãy đảm bảo tiến trình backend đang chạy và cổng mạng nội bộ không bị chặn tường lửa.',
          actionPrimary: 'Tải lại trang',
          actionPrimaryHref: 'reload',
          actionSecondary: 'Về Bàn làm việc',
          actionSecondaryHref: '/'
        };
      default:
        return {
          code: String(status || 'LỖI'),
          title: 'Đã Xảy Ra Sự Cố Không Mong Muốn',
          subtitle: 'Hệ thống ghi nhận một lỗi phát sinh trong phiên làm việc.',
          tip: 'Vui lòng quay lại màn hình chính hoặc thử tải lại trang sau ít phút.',
          actionPrimary: 'Về Bàn làm việc',
          actionPrimaryHref: '/',
          actionSecondary: 'Đến Kho hạt & Nguyên liệu',
          actionSecondaryHref: '/kho'
        };
    }
  });

  function handleAction(href: string) {
    if (href === 'reload') {
      if (typeof window !== 'undefined') window.location.reload();
    } else if (typeof window !== 'undefined') {
      window.location.href = href;
    }
  }
</script>

<svelte:head>
  <title>{errorInfo.code} - {errorInfo.title} | Premier Nuts ERP</title>
</svelte:head>

<div class="error-container">
  <div class="error-card">
    <!-- Header with System Badge -->
    <div class="error-topbar">
      <span class="system-tag">PREMIER NUTS ERP • HỆ THỐNG BÁO LỖI</span>
      <span class="status-code">HTTP {errorInfo.code}</span>
    </div>

    <!-- Main Message Area -->
    <div class="error-body">
      <div class="code-banner">
        {errorInfo.code}
      </div>

      <h1 class="error-title">{errorInfo.title}</h1>
      <p class="error-subtitle">{errorInfo.subtitle}</p>

      {#if message && message !== errorInfo.subtitle}
        <div class="error-detail-box">
          <span class="detail-label">Chi tiết kỹ thuật từ hệ thống:</span>
          <code>{message}</code>
        </div>
      {/if}

      <div class="error-tip-box">
        <strong>Hướng xử lý:</strong> {errorInfo.tip}
      </div>

      <!-- Action Buttons (No emojis/icons) -->
      <div class="error-actions">
        <Button
          variant="primary"
          onclick={() => handleAction(errorInfo.actionPrimaryHref)}
        >
          {errorInfo.actionPrimary}
        </Button>

        <Button
          variant="secondary"
          onclick={() => handleAction(errorInfo.actionSecondaryHref)}
        >
          {errorInfo.actionSecondary}
        </Button>

        <Button
          variant="ghost"
          onclick={() => { if (typeof window !== 'undefined') window.history.back(); }}
        >
          Quay lại trang trước
        </Button>
      </div>
    </div>

    <!-- Footer Information -->
    <div class="error-footer">
      <span>Premier Nuts Enterprise Resource Planning (PN-ERP)</span>
      <span>Cổng dịch vụ: Gateway :9000 • Identity :9001</span>
    </div>
  </div>
</div>

<style>
  .error-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 20px;
    background: var(--pn-cream);
    box-sizing: border-box;
  }

  .error-card {
    width: 100%;
    max-width: 680px;
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    border-top: 4px solid var(--pn-orange);
    border-radius: var(--pn-radius-lg);
    box-shadow: var(--pn-shadow-md);
    overflow: hidden;
  }

  .error-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    border-bottom: 1px solid var(--pn-line);
    background: var(--pn-sidebar-bg);
  }

  .system-tag {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--pn-ink-soft);
  }

  .status-code {
    font-family: monospace;
    font-size: 12px;
    font-weight: 700;
    color: var(--pn-orange-hover);
    background: var(--pn-orange-mist);
    padding: 2px 8px;
    border-radius: var(--pn-radius);
    border: 1px solid rgba(240, 130, 30, 0.2);
  }

  .error-body {
    padding: 36px 32px 28px;
    text-align: center;
  }

  .code-banner {
    font-size: 64px;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.04em;
    color: var(--pn-orange);
    margin-bottom: 14px;
    user-select: none;
  }

  .error-title {
    margin: 0 0 10px;
    font-size: 22px;
    font-weight: 800;
    color: var(--pn-ink);
  }

  .error-subtitle {
    margin: 0 0 20px;
    font-size: 14.5px;
    color: var(--pn-ink-soft);
    line-height: 1.5;
  }

  .error-detail-box {
    text-align: left;
    background: var(--pn-sidebar-bg);
    border: 1px solid var(--pn-line-dark);
    border-radius: var(--pn-radius);
    padding: 12px 16px;
    margin-bottom: 18px;
  }

  .detail-label {
    display: block;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--pn-ink-soft);
    margin-bottom: 4px;
  }

  .error-detail-box code {
    font-family: monospace;
    font-size: 13px;
    color: #b91c1c;
    word-break: break-all;
  }

  .error-tip-box {
    text-align: left;
    font-size: 13px;
    color: var(--pn-ink);
    background: var(--pn-orange-mist);
    border-left: 3px solid var(--pn-orange);
    padding: 10px 14px;
    border-radius: 0 var(--pn-radius) var(--pn-radius) 0;
    margin-bottom: 28px;
    line-height: 1.4;
  }

  .error-actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .error-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 24px;
    border-top: 1px solid var(--pn-line);
    background: var(--pn-sidebar-bg);
    font-size: 12px;
    color: var(--pn-ink-soft);
  }

  @media (max-width: 600px) {
    .error-body {
      padding: 24px 18px;
    }
    .code-banner {
      font-size: 48px;
    }
    .error-footer {
      flex-direction: column;
      gap: 6px;
      text-align: center;
    }
  }
</style>
