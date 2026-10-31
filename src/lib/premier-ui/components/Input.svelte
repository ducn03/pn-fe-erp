<script lang="ts">
  interface Props {
    label?: string;
    hint?: string;
    error?: string;
    value?: string | number;
    placeholder?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    class?: string;
  }

  let {
    label,
    hint,
    error,
    value = $bindable(''),
    placeholder = '',
    type = 'text',
    required = false,
    disabled = false,
    id = 'input-' + Math.random().toString(36).substring(2, 7),
    class: className = ''
  }: Props = $props();
</script>

<div class="pn-input-group {className}">
  {#if label}
    <label class="pn-label" for={id}>
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <input
    {id}
    {type}
    {placeholder}
    {disabled}
    {required}
    bind:value
    class="pn-input"
    class:has-error={!!error}
  />

  {#if error}
    <span class="pn-error-msg">{error}</span>
  {:else if hint}
    <span class="pn-hint">{hint}</span>
  {/if}
</div>

<style>
  .pn-input-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
    text-align: left;
  }

  .pn-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink);
  }

  .required {
    color: var(--pn-error);
    margin-left: 2px;
  }

  .pn-input {
    font-family: var(--pn-font-family);
    font-size: 14px;
    padding: 10px 14px;
    border: 1px solid var(--pn-line-dark);
    border-radius: var(--pn-radius);
    background: var(--pn-paper);
    color: var(--pn-ink);
    outline: none;
    transition: all var(--pn-transition);
  }

  .pn-input:focus {
    border-color: var(--pn-orange);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.16);
  }

  .pn-input.has-error {
    border-color: var(--pn-error);
  }

  .pn-input.has-error:focus {
    box-shadow: 0 0 0 3px rgba(185, 44, 44, 0.16);
  }

  .pn-error-msg {
    font-size: 12px;
    color: var(--pn-error);
  }

  .pn-hint {
    font-size: 12px;
    color: var(--pn-ink-soft);
  }
</style>
