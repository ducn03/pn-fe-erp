<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';
  import { StringHelper } from '$core/utils';
  import { login } from '$features/auth';
  import { Button, toast } from '$ui';

  let username = $state('admin');
  let password = $state('admin123');
  let showPassword = $state(false);
  let rememberMe = $state(true);
  let loading = $state(false);
  let errorMessage = $state('');

  // Nếu đã đăng nhập, tự động chuyển về trang chủ
  $effect(() => {
    if (authStore.isAuthenticated) {
      goto('/');
    }
  });

  async function handleLogin(e?: Event) {
    if (e) e.preventDefault();
    errorMessage = '';

    const trimmedUser = StringHelper.trim(username);
    const trimmedPass = StringHelper.trim(password);

    if (StringHelper.isBlank(trimmedUser)) {
      errorMessage = 'Vui lòng nhập tên tài khoản!';
      return;
    }

    if (StringHelper.isBlank(trimmedPass)) {
      errorMessage = 'Vui lòng nhập mật khẩu truy cập!';
      return;
    }

    loading = true;
    try {
      const data = await login({
        username: trimmedUser,
        password: trimmedPass
      });

      toast.success(`Đăng nhập thành công! Chào mừng ${data.user.username}`);
      await goto('/');
    } catch (err: any) {
      errorMessage = err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại!';
      toast.error(errorMessage);
    } finally {
      loading = false;
    }
  }

  function fillDemoAccount(user: string, pass: string) {
    username = user;
    password = pass;
    errorMessage = '';
  }
</script>

<svelte:head>
  <title>Đăng nhập | Premier Nuts ERP</title>
</svelte:head>

<div class="login-page">
  <div class="login-card">
    <!-- Header đồng bộ thương hiệu Premier Nuts -->
    <div class="login-header">
      <div class="brand-logo">
        <span class="logo-mark">PN</span>
        <span class="logo-text">PREMIER NUTS ERP</span>
      </div>
      <h1 class="login-title">Đăng Nhập Hệ Thống</h1>
      <p class="login-desc">Hệ thống quản lý nguồn lực doanh nghiệp</p>
    </div>

    <!-- Error Alert Banner -->
    {#if errorMessage}
      <div class="alert-error" role="alert">
        <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{errorMessage}</span>
      </div>
    {/if}

    <!-- Form -->
    <form class="login-form" onsubmit={handleLogin}>
      <div class="form-item">
        <label for="username" class="form-label">Tài khoản</label>
        <input
          id="username"
          type="text"
          class="form-input"
          placeholder="Nhập tên tài khoản (vd: admin)"
          bind:value={username}
          autocomplete="username"
          disabled={loading}
          required
        />
      </div>

      <div class="form-item">
        <div class="label-with-action">
          <label for="password" class="form-label">Mật khẩu</label>
          <button
            type="button"
            class="toggle-pass-link"
            onclick={() => (showPassword = !showPassword)}
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          class="form-input"
          placeholder="Nhập mật khẩu"
          bind:value={password}
          autocomplete="current-password"
          disabled={loading}
          required
        />
      </div>

      <div class="form-row-between">
        <label class="checkbox-label">
          <input
            type="checkbox"
            bind:checked={rememberMe}
            class="checkbox-input"
          />
          <span>Ghi nhớ đăng nhập</span>
        </label>
        <button
          type="button"
          class="link-forgot"
          onclick={() => toast.info('Vui lòng liên hệ Quản trị viên để cấp lại mật khẩu')}
        >
          Quên mật khẩu?
        </button>
      </div>

      <Button
        variant="primary"
        size="md"
        type="submit"
        disabled={loading}
        {loading}
        class="btn-submit-full"
      >
        Đăng nhập vào hệ thống
      </Button>
    </form>

    <!-- Demo Fill Box -->
    <div class="demo-box">
      <span class="demo-title">Tài khoản demo:</span>
      <button
        type="button"
        class="demo-chip"
        onclick={() => fillDemoAccount('admin', 'admin123')}
      >
        <strong>admin</strong> / admin123
      </button>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <div class="gateway-status">
        <span class="status-dot"></span>
        API Gateway :9000 • Identity :9001
      </div>
      <p class="copyright">© 2026 Premier Nuts Co., Ltd. Tất cả quyền được bảo lưu.</p>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--pn-cream, #FFFBF4);
    padding: 24px;
    box-sizing: border-box;
    font-family: var(--pn-font-family, inherit);
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background-color: var(--pn-paper, #FFFFFF);
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: var(--pn-radius-lg, 10px);
    padding: 36px 32px;
    box-shadow: var(--pn-shadow-sm, 0 2px 6px -1px rgba(60, 40, 15, 0.08));
    box-sizing: border-box;
  }

  /* Header */
  .login-header {
    text-align: center;
    margin-bottom: 24px;
  }

  .brand-logo {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .logo-mark {
    background-color: var(--pn-orange, #F0821E);
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .logo-text {
    font-size: 13px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
    letter-spacing: 0.08em;
  }

  .login-title {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
    letter-spacing: -0.01em;
  }

  .login-desc {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  /* Alert */
  .alert-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--pn-error-bg, #FDF2F2);
    border: 1px solid var(--pn-error-border, #E08484);
    color: var(--pn-error, #B92C2C);
    font-size: 13px;
    padding: 10px 14px;
    border-radius: var(--pn-radius, 6px);
    margin-bottom: 20px;
  }

  .alert-icon {
    flex-shrink: 0;
  }

  /* Form */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .label-with-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .toggle-pass-link {
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    color: var(--pn-orange, #F0821E);
    font-weight: 600;
    cursor: pointer;
  }

  .toggle-pass-link:hover {
    color: var(--pn-orange-hover, #D96A0F);
    text-decoration: underline;
  }

  .form-input {
    width: 100%;
    box-sizing: border-box;
    background-color: var(--pn-paper, #FFFFFF);
    border: 1px solid var(--pn-line-dark, #D6C5B3);
    border-radius: var(--pn-radius, 6px);
    padding: 10px 13px;
    font-size: 14px;
    color: var(--pn-ink, #2B2116);
    outline: none;
    font-family: inherit;
    transition: border-color var(--pn-transition, 0.2s), box-shadow var(--pn-transition, 0.2s);
  }

  .form-input:focus {
    border-color: var(--pn-orange, #F0821E);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.16);
  }

  .form-input::placeholder {
    color: var(--pn-ink-light, #9B8D80);
  }

  .form-input:disabled {
    background-color: var(--pn-sidebar-bg, #FDF9F2);
    cursor: not-allowed;
  }

  /* Checkbox & Forgot */
  .form-row-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    margin-top: -2px;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--pn-ink-soft, #6B5D4F);
    cursor: pointer;
    user-select: none;
  }

  .checkbox-input {
    width: 15px;
    height: 15px;
    accent-color: var(--pn-orange, #F0821E);
    cursor: pointer;
  }

  .link-forgot {
    background: none;
    border: none;
    padding: 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
    cursor: pointer;
  }

  .link-forgot:hover {
    color: var(--pn-orange, #F0821E);
    text-decoration: underline;
  }

  /* Submit Button full width */
  :global(.btn-submit-full) {
    width: 100%;
    margin-top: 6px;
    padding: 11px 16px !important;
    font-size: 14.5px !important;
  }

  /* Demo Chip */
  .demo-box {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--pn-line, #EEE3D3);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .demo-title {
    font-size: 12px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  .demo-chip {
    background-color: var(--pn-orange-mist, #FFF5EA);
    border: 1px solid var(--pn-orange-light, #FDEBD3);
    border-radius: var(--pn-radius-sm, 4px);
    color: var(--pn-ink, #2B2116);
    padding: 4px 10px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: all var(--pn-transition, 0.2s);
  }

  .demo-chip:hover {
    background-color: var(--pn-orange-light, #FDEBD3);
    border-color: var(--pn-orange, #F0821E);
  }

  /* Footer */
  .login-footer {
    margin-top: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .gateway-status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 11px;
    color: var(--pn-ink-soft, #6B5D4F);
    font-family: monospace;
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 5px #10b981;
  }

  .copyright {
    margin: 0;
    font-size: 11px;
    color: var(--pn-ink-light, #9B8D80);
  }
</style>
