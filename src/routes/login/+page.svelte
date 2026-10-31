<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button, toast } from '$ui';
  import { authStore } from '$core/stores';
  import { StringHelper } from '$core/utils';
  import { login } from '$features/auth';

  let username = $state('admin');
  let password = $state('admin123');
  let showPassword = $state(false);
  let rememberMe = $state(true);
  let loading = $state(false);
  let errorMessage = $state('');

  // If already authenticated, redirect to home
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

<div class="login-wrapper">
  <!-- Subtle decorative ambient orbs -->
  <div class="ambient-glow glow-top"></div>
  <div class="ambient-glow glow-bottom"></div>

  <div class="login-card">
    <!-- Brand Header -->
    <div class="card-header">
      <div class="brand-badge">PREMIER NUTS ERP</div>
      <h1 class="brand-title">Đăng Nhập Hệ Thống</h1>
      <p class="brand-subtitle">
        Hệ điều hành nguồn lực chế biến hạt & nông sản xuất khẩu
      </p>
    </div>

    <!-- Error Alert Banner -->
    {#if errorMessage}
      <div class="error-banner">
        <span class="error-dot"></span>
        <span class="error-text">{errorMessage}</span>
      </div>
    {/if}

    <!-- Login Form -->
    <form class="login-form" onsubmit={handleLogin}>
      <!-- Username Field -->
      <div class="form-group">
        <label for="username" class="form-label">
          Tài khoản đăng nhập
          <span class="required">*</span>
        </label>
        <div class="input-container">
          <input
            id="username"
            type="text"
            class="custom-input"
            placeholder="Ví dụ: admin"
            bind:value={username}
            autocomplete="username"
            disabled={loading}
            required
          />
        </div>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <div class="label-row">
          <label for="password" class="form-label">
            Mật khẩu
            <span class="required">*</span>
          </label>
          <button
            type="button"
            class="toggle-pass-btn"
            onclick={() => (showPassword = !showPassword)}
          >
            {showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          </button>
        </div>
        <div class="input-container">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            class="custom-input"
            placeholder="Nhập mật khẩu..."
            bind:value={password}
            autocomplete="current-password"
            disabled={loading}
            required
          />
        </div>
      </div>

      <!-- Remember Me & Forgot -->
      <div class="form-options">
        <label class="remember-label">
          <input
            type="checkbox"
            bind:checked={rememberMe}
            class="custom-checkbox"
          />
          <span>Ghi nhớ phiên đăng nhập</span>
        </label>
        <a href="#forgot" class="forgot-link" onclick={() => toast.info('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu!')}>
          Quên mật khẩu?
        </a>
      </div>

      <!-- Submit Button -->
      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        class="submit-btn"
      >
        {#if loading}
          <span class="loading-spinner"></span>
          Đang xác thực hệ thống...
        {:else}
          Đăng nhập vào hệ thống →
        {/if}
      </Button>
    </form>

    <!-- Quick Demo Accounts -->
    <div class="demo-box">
      <span class="demo-label">Tài khoản thử nghiệm nhanh:</span>
      <div class="demo-tags">
        <button
          type="button"
          class="demo-chip chip-admin"
          onclick={() => fillDemoAccount('admin', 'admin123')}
        >
          <strong>admin</strong> (Quản trị viên)
        </button>
      </div>
    </div>

    <!-- Security & Gateway Footer -->
    <div class="card-footer">
      <div class="gateway-badge">
        <span class="status-indicator"></span>
        API Gateway :9000 • Identity :9001
      </div>
      <p class="copyright">
        © 2026 Premier Nuts Co., Ltd. Tất cả quyền được bảo lưu.
      </p>
    </div>
  </div>
</div>

<style>
  .login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 15% 20%, #2a221b 0%, #15110d 100%);
    padding: 24px;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
  }

  /* Decorative Ambient Lights */
  .ambient-glow {
    position: absolute;
    width: 480px;
    height: 480px;
    border-radius: 50%;
    filter: blur(120px);
    pointer-events: none;
    opacity: 0.18;
  }

  .glow-top {
    top: -100px;
    left: -100px;
    background: var(--pn-orange, #f0821e);
  }

  .glow-bottom {
    bottom: -100px;
    right: -100px;
    background: #d97706;
  }

  /* Main Card */
  .login-card {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 450px;
    background: rgba(30, 24, 20, 0.92);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(240, 130, 30, 0.22);
    border-radius: 18px;
    padding: 38px 34px;
    box-shadow:
      0 24px 64px -12px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(255, 255, 255, 0.04);
    box-sizing: border-box;
  }

  /* Header */
  .card-header {
    text-align: center;
    margin-bottom: 26px;
  }

  .brand-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: var(--pn-orange, #f0821e);
    background: rgba(240, 130, 30, 0.12);
    border: 1px solid rgba(240, 130, 30, 0.25);
    padding: 5px 12px;
    border-radius: 20px;
    margin-bottom: 12px;
  }

  .brand-title {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .brand-subtitle {
    margin: 0;
    font-size: 13.5px;
    color: #a89f91;
    line-height: 1.45;
  }

  /* Error Banner */
  .error-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(185, 28, 28, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 10px;
    padding: 10px 14px;
    margin-bottom: 20px;
    animation: fadeIn 0.25s ease-out;
  }

  .error-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ef4444;
    flex-shrink: 0;
  }

  .error-text {
    font-size: 13px;
    color: #fca5a5;
    font-weight: 500;
  }

  /* Form */
  .login-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: #e5ded5;
  }

  .required {
    color: var(--pn-orange, #f0821e);
  }

  .toggle-pass-btn {
    background: none;
    border: none;
    padding: 0;
    font-size: 12px;
    color: var(--pn-orange, #f0821e);
    cursor: pointer;
    text-decoration: underline;
  }

  .custom-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(18, 14, 11, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9px;
    padding: 12px 14px;
    font-size: 14.5px;
    color: #ffffff;
    transition: all 0.2s ease;
    outline: none;
  }

  .custom-input:focus {
    border-color: var(--pn-orange, #f0821e);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.22);
    background: rgba(18, 14, 11, 0.95);
  }

  .custom-input::placeholder {
    color: #6e6459;
  }

  /* Options Row */
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12.5px;
  }

  .remember-label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a89f91;
    cursor: pointer;
    user-select: none;
  }

  .custom-checkbox {
    accent-color: var(--pn-orange, #f0821e);
    width: 15px;
    height: 15px;
    cursor: pointer;
  }

  .forgot-link {
    color: #c4b5a2;
    text-decoration: none;
    font-weight: 500;
  }

  .forgot-link:hover {
    color: var(--pn-orange, #f0821e);
    text-decoration: underline;
  }

  /* Submit Button Loading */
  :global(.submit-btn) {
    width: 100%;
    padding: 13px 18px !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    margin-top: 4px;
    display: flex !important;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .loading-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* Demo Chip */
  .demo-box {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  .demo-label {
    display: block;
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #8c8273;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .demo-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .demo-chip {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: #d1c7b8;
    padding: 6px 10px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .demo-chip:hover {
    background: rgba(240, 130, 30, 0.15);
    border-color: rgba(240, 130, 30, 0.35);
    color: #ffffff;
  }

  /* Footer */
  .card-footer {
    margin-top: 24px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .gateway-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: monospace;
    font-size: 11px;
    color: #8c8273;
    background: rgba(0, 0, 0, 0.3);
    padding: 3px 10px;
    border-radius: 12px;
  }

  .status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }

  .copyright {
    margin: 0;
    font-size: 11.5px;
    color: #6e6459;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
