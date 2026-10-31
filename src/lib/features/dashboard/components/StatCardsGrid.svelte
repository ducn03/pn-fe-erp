<script lang="ts">
  import { StatCard } from '$ui';
  import type { StatMetric } from '../dashboard.types';

  interface Props {
    metrics: StatMetric[];
  }

  let { metrics }: Props = $props();
</script>

<div class="stats-grid">
  {#each metrics as m (m.id)}
    <StatCard
      title={m.title}
      value={m.value}
      change={m.change}
      trend={m.trend}
    />
  {/each}
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
    margin-bottom: 22px;
  }
</style>
