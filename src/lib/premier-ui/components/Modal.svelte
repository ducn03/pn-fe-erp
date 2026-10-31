<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open?: boolean;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
    class?: string;
    onclose?: () => void;
    footer?: Snippet;
    children?: Snippet;
  }

  let {
    open = $bindable(false),
    title,
    size = 'md',
    class: className = '',
    onclose,
    footer,
    children
  }: Props = $props();

  function handleClose() {
    open = false;
    onclose?.();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      handleClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="pn-modal-backdrop"
    onclick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    role="presentation"
  >
    <div class="pn-modal pn-modal--{size} {className}" role="dialog" aria-modal="true" tabindex="-1">
      <div class="pn-modal__header">
        {#if title}
          <h3 class="pn-modal__title">{title}</h3>
        {/if}
        <button class="pn-modal__close" onclick={handleClose} aria-label="Close modal">&times;</button>
      </div>

      <div class="pn-modal__body">
        {#if children}
          {@render children()}
        {/if}
      </div>

      {#if footer}
        <div class="pn-modal__footer">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .pn-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(43, 33, 22, 0.45);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    z-index: 999;
    animation: pn-fade-in 0.18s ease-out;
  }

  .pn-modal {
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    border-radius: var(--pn-radius-lg);
    box-shadow: var(--pn-shadow-lg);
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: pn-pop-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pn-modal--sm { max-width: 420px; }
  .pn-modal--md { max-width: 580px; }
  .pn-modal--lg { max-width: 820px; }

  .pn-modal__header {
    padding: 18px 24px;
    border-bottom: 1px solid var(--pn-line);
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--pn-sidebar-bg);
  }

  .pn-modal__title {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: var(--pn-ink);
  }

  .pn-modal__close {
    background: transparent;
    border: none;
    font-size: 24px;
    line-height: 1;
    color: var(--pn-ink-soft);
    cursor: pointer;
    border-radius: 6px;
    padding: 2px 8px;
    transition: all var(--pn-transition);
  }

  .pn-modal__close:hover {
    background: rgba(43, 33, 22, 0.08);
    color: var(--pn-ink);
  }

  .pn-modal__body {
    padding: 24px;
    overflow-y: auto;
    font-size: 14px;
    line-height: 1.6;
    color: var(--pn-ink);
  }

  .pn-modal__footer {
    padding: 14px 24px;
    border-top: 1px solid var(--pn-line);
    background: var(--pn-sidebar-bg);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  @keyframes pn-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes pn-pop-in {
    from { opacity: 0; transform: scale(0.96) translateY(-8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
</style>
