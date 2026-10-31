<script lang="ts">
  import { goto } from '$app/navigation';
  import { authStore } from '$core/stores';
  import { StringHelper } from '$core/utils';
  import { login } from '$features/auth';
  import { Button, toast } from '$ui';

  let username = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let rememberMe = $state(true);
  let loading = $state(false);

  // Field-level error messages
  let usernameError = $state('');
  let passwordError = $state('');
  let formError = $state('');

  // Tự động chuyển trang nếu đã có phiên đăng nhập
  $effect(() => {
    if (authStore.isAuthenticated) {
      goto('/');
    }
  });

  function validateForm(): boolean {
    let isValid = true;
    usernameError = '';
    passwordError = '';
    formError = '';

    const trimmedUser = StringHelper.trim(username);
    const trimmedPass = StringHelper.trim(password);

    if (StringHelper.isBlank(trimmedUser)) {
      usernameError = 'Vui lòng nhập tên tài khoản';
      isValid = false;
    }

    if (StringHelper.isBlank(trimmedPass)) {
      passwordError = 'Vui lòng nhập mật khẩu truy cập';
      isValid = false;
    }

    return isValid;
  }

  function handleUsernameInput() {
    if (usernameError) usernameError = '';
    if (formError) formError = '';
  }

  function handlePasswordInput() {
    if (passwordError) passwordError = '';
    if (formError) formError = '';
  }

  async function handleLogin(e?: Event) {
    if (e) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    loading = true;
    try {
      const trimmedUser = StringHelper.trim(username);
      const trimmedPass = StringHelper.trim(password);

      const data = await login({
        username: trimmedUser,
        password: trimmedPass
      });

      toast.success(`Đăng nhập thành công! Xin chào ${data.user.username}`);
      await goto('/');
    } catch (err: any) {
      const msg = err.message || 'Tài khoản hoặc mật khẩu không chính xác';
      formError = msg;
      usernameError = ' ';
      passwordError = msg;
      toast.error(msg);
    } finally {
      loading = false;
    }
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
        <span class="logo-text">PREMIER NUTS ERP</span>
      </div>
      <h1 class="login-title">Đăng Nhập Hệ Thống</h1>
      <p class="login-desc">Hệ thống quản lý nguồn lực doanh nghiệp</p>
    </div>

    <!-- Alert nếu có lỗi từ server -->
    {#if formError && formError !== passwordError}
      <div class="alert-error" role="alert">
        <svg class="alert-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{formError}</span>
      </div>
    {/if}

    <!-- Form -->
    <form class="login-form" onsubmit={handleLogin} novalidate>
      <!-- Username Field -->
      <div class="form-item">
        <label for="username" class="form-label">
          Tài khoản
          <span class="required">*</span>
        </label>
        <input
          id="username"
          type="text"
          class="form-input"
          class:has-error={!!usernameError}
          placeholder="Nhập tên tài khoản"
          bind:value={username}
          oninput={handleUsernameInput}
          autocomplete="username"
          disabled={loading}
        />
        {#if usernameError && usernameError.trim().length > 0}
          <div class="field-error-msg">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{usernameError}</span>
          </div>
        {/if}
      </div>

      <!-- Password Field -->
      <div class="form-item">
        <div class="label-with-action">
          <label for="password" class="form-label">
            Mật khẩu
            <span class="required">*</span>
          </label>
          <button
            type="button"
            class="toggle-pass-link"
            onclick={() => (showPassword = !showPassword)}
            tabindex="-1"
          >
            {showPassword ? 'Ẩn' : 'Hiện'}
          </button>
        </div>
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          class="form-input"
          class:has-error={!!passwordError}
          placeholder="Nhập mật khẩu"
          bind:value={password}
          oninput={handlePasswordInput}
          autocomplete="current-password"
          disabled={loading}
        />
        {#if passwordError && passwordError.trim().length > 0}
          <div class="field-error-msg">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{passwordError}</span>
          </div>
        {/if}
      </div>

      <!-- Remember & Forgot -->
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
          onclick={() => toast.info('Vui lòng liên hệ Quản trị viên để đặt lại mật khẩu!')}
          tabindex="-1"
        >
          Quên mật khẩu?
        </button>
      </div>

      <!-- Submit Button -->
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

    <!-- Footer -->
    <div class="login-footer">
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
    max-width: 410px;
    background-color: var(--pn-paper, #FFFFFF);
    border: 1px solid var(--pn-line, #EEE3D3);
    border-radius: var(--pn-radius-lg, 8px);
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
    margin-bottom: 12px;
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
    font-size: 21px;
    font-weight: 800;
    color: var(--pn-ink, #2B2116);
    letter-spacing: -0.01em;
  }

  .login-desc {
    margin: 0;
    font-size: 13px;
    color: var(--pn-ink-soft, #6B5D4F);
  }

  /* Server Alert */
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
    margin-bottom: 18px;
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
    gap: 5px;
  }

  .form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink, #2B2116);
  }

  .required {
    color: var(--pn-error, #B92C2C);
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
    padding: 10px 12px;
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
    font-size: 13.5px;
  }

  .form-input:disabled {
    background-color: var(--pn-sidebar-bg, #FDF9F2);
    cursor: not-allowed;
  }

  /* Validation Error State */
  .form-input.has-error {
    border-color: #dc2626 !important;
    background-color: #fffaf9 !important;
  }

  .form-input.has-error:focus {
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15) !important;
  }

  .field-error-msg {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #dc2626;
    font-size: 12px;
    font-weight: 500;
    margin-top: 3px;
    animation: fadeIn 0.15s ease-out;
  }

  .field-error-msg svg {
    flex-shrink: 0;
  }

  /* Checkbox & Forgot */
  .form-row-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
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
    font-size: 12.5px;
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
    margin-top: 4px;
    padding: 11px 16px !important;
    font-size: 14.5px !important;
    font-weight: 700 !important;
  }

  /* Footer */
  .login-footer {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--pn-line, #EEE3D3);
    text-align: center;
  }

  .copyright {
    margin: 0;
    font-size: 11.5px;
    color: var(--pn-ink-light, #9B8D80);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-2px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
