<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';
  import { StringHelper } from '$core/utils';
  import { login } from '$features/auth';
  import { toast } from '$ui';

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
    <!-- Header -->
    <div class="login-header">
      <div class="brand-logo">
        <span class="logo-mark">PN</span>
        <span class="logo-text">PREMIER NUTS</span>
      </div>
      <h1 class="login-title">Đăng nhập hệ thống</h1>
      <p class="login-desc">Hệ thống quản lý nguồn lực doanh nghiệp ERP</p>
    </div>

    <!-- Error Alert -->
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
          placeholder="Tên tài khoản"
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
          placeholder="Mật khẩu truy cập"
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

      <button
        type="submit"
        class="btn-submit"
        disabled={loading}
      >
        {#if loading}
          <span class="spinner"></span>
          Đang đăng nhập...
        {:else}
          Đăng nhập
        {/if}
      </button>
    </form>

    <!-- Demo Fill Box -->
    <div class="demo-box">
      <span class="demo-title">Tài khoản demo:</span>
      <button
        type="button"
        class="demo-chip"
        onclick={() => fillDemoAccount('admin', 'admin123')}
      >
        admin / admin123
      </button>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <span class="gateway-text">API Gateway :9000 • Identity Service :9001</span>
      <p class="copyright">© 2026 Premier Nuts ERP. All rights reserved.</p>
    </div>
  </div>
</div>

<style>
  .login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8fafc;
    padding: 24px;
    box-sizing: border-box;
    font-family: inherit;
  }

  .login-card {
    width: 100%;
    max-width: 420px;
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 36px 32px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
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
    background-color: #0f172a;
    color: #ffffff;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .logo-text {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.08em;
  }

  .login-title {
    margin: 0 0 6px;
    font-size: 22px;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  .login-desc {
    margin: 0;
    font-size: 13px;
    color: #64748b;
  }

  /* Alert */
  .alert-error {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #b91c1c;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 6px;
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
    color: #334155;
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
    color: #2563eb;
    cursor: pointer;
  }

  .toggle-pass-link:hover {
    text-decoration: underline;
  }

  .form-input {
    width: 100%;
    box-sizing: border-box;
    background-color: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 10px 13px;
    font-size: 14px;
    color: #0f172a;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }

  .form-input:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
  }

  .form-input::placeholder {
    color: #94a3b8;
  }

  .form-input:disabled {
    background-color: #f1f5f9;
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
    color: #475569;
    cursor: pointer;
    user-select: none;
  }

  .checkbox-input {
    width: 15px;
    height: 15px;
    accent-color: #0f172a;
    cursor: pointer;
  }

  .link-forgot {
    background: none;
    border: none;
    padding: 0;
    font-size: 13px;
    color: #2563eb;
    cursor: pointer;
  }

  .link-forgot:hover {
    text-decoration: underline;
  }

  /* Submit Button */
  .btn-submit {
    width: 100%;
    background-color: #0f172a;
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 11px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 6px;
    transition: background-color 0.15s ease;
  }

  .btn-submit:hover:not(:disabled) {
    background-color: #1e293b;
  }

  .btn-submit:active:not(:disabled) {
    background-color: #334155;
  }

  .btn-submit:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  /* Demo Chip */
  .demo-box {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .demo-title {
    font-size: 12px;
    color: #64748b;
  }

  .demo-chip {
    background-color: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    color: #334155;
    padding: 3px 8px;
    font-size: 12px;
    font-family: monospace;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .demo-chip:hover {
    background-color: #e2e8f0;
    color: #0f172a;
  }

  /* Footer */
  .login-footer {
    margin-top: 20px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .gateway-text {
    font-size: 11px;
    color: #94a3b8;
    font-family: monospace;
  }

  .copyright {
    margin: 0;
    font-size: 11px;
    color: #94a3b8;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
