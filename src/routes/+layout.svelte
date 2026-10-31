<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import { ToastContainer } from '$ui';
	import '$ui/theme.css';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Premier Nuts ERP</title>
</svelte:head>

<div class="app-root">
	{@render children()}
	<ToastContainer />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		background: var(--pn-cream);
		color: var(--pn-ink);
		font-family: var(--pn-font-family);
	}

	.app-root {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
