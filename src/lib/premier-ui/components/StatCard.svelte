<script lang="ts">
  interface Props {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: string;
    class?: string;
  }

  let {
    title,
    value,
    change,
    trend = 'neutral',
    icon,
    class: className = ''
  }: Props = $props();
</script>

<div class="pn-stat-card {className}">
  <div class="pn-stat-main">
    <div class="pn-stat-title">{title}</div>
    <div class="pn-stat-value">{value}</div>
    {#if change}
      <div class="pn-stat-trend pn-stat-trend--{trend}">
        {#if trend === 'up'}↑
        {:else if trend === 'down'}↓
        {/if}
        {change}
      </div>
    {/if}
  </div>
  {#if icon}
    <div class="pn-stat-icon">{icon}</div>
  {/if}
</div>

<style>
  .pn-stat-card {
    background: var(--pn-paper);
    border: 1px solid var(--pn-line);
    border-radius: var(--pn-radius-lg);
    box-shadow: var(--pn-shadow-sm);
    padding: 20px 22px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    transition: all var(--pn-transition);
  }

  .pn-stat-card:hover {
    box-shadow: var(--pn-shadow-md);
    border-color: var(--pn-line-dark);
    transform: translateY(-2px);
  }

  .pn-stat-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--pn-ink-soft);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pn-stat-value {
    font-size: 26px;
    font-weight: 800;
    color: var(--pn-ink);
    line-height: 1.2;
    font-feature-settings: 'tnum';
  }

  .pn-stat-trend {
    margin-top: 8px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: var(--pn-radius-pill);
    padding: 2px 8px;
  }

  .pn-stat-trend--up {
    color: var(--pn-green-dark);
    background: var(--pn-green-mist);
  }

  .pn-stat-trend--down {
    color: var(--pn-error);
    background: var(--pn-error-bg);
  }

  .pn-stat-trend--neutral {
    color: var(--pn-ink-soft);
    background: #f4eee5;
  }

  .pn-stat-icon {
    font-size: 28px;
    background: var(--pn-cream);
    border: 1px solid var(--pn-line);
    border-radius: var(--pn-radius);
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
