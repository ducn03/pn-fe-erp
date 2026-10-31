<script lang="ts">
  interface Option {
    value: string | number;
    label: string;
  }

  interface Props {
    label?: string;
    error?: string;
    hint?: string;
    value?: string | number;
    options: Option[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    id?: string;
    class?: string;
  }

  let {
    label,
    error,
    hint,
    value = $bindable(''),
    options = [],
    placeholder,
    required = false,
    disabled = false,
    id = 'select-' + Math.random().toString(36).substring(2, 7),
    class: className = ''
  }: Props = $props();
</script>

<div class="pn-select-group {className}">
  {#if label}
    <label class="pn-label" for={id}>
      {label}
      {#if required}<span class="required">*</span>{/if}
    </label>
  {/if}

  <select
    {id}
    {disabled}
    {required}
    bind:value
    class="pn-select"
    class:has-error={!!error}
  >
    {#if placeholder}
      <option value="" disabled selected>{placeholder}</option>
    {/if}
    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>

  {#if error}
    <span class="pn-error-msg">{error}</span>
  {:else if hint}
    <span class="pn-hint">{hint}</span>
  {/if}
</div>

<style>
  .pn-select-group {
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

  .pn-select {
    font-family: var(--pn-font-family);
    font-size: 14px;
    padding: 10px 14px;
    border: 1px solid var(--pn-line-dark);
    border-radius: var(--pn-radius);
    background: var(--pn-paper);
    color: var(--pn-ink);
    outline: none;
    cursor: pointer;
    transition: all var(--pn-transition);
  }

  .pn-select:focus {
    border-color: var(--pn-orange);
    box-shadow: 0 0 0 3px rgba(240, 130, 30, 0.16);
  }

  .pn-select.has-error {
    border-color: var(--pn-error);
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
