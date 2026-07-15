<script lang="ts">
	export interface FeatureTab {
		id: string;
		icon: string;
		heading: string;
		description: string;
		points?: string[];
		visual: string;
	}

	interface Props {
		tabs: FeatureTab[];
	}

	let { tabs }: Props = $props();

	let active = $state(0);
	const activeTab = $derived(tabs[active] ?? tabs[0]);

	function onKeyDown(event: KeyboardEvent) {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const delta = event.key === 'ArrowRight' ? 1 : -1;
		active = (active + delta + tabs.length) % tabs.length;
	}
</script>

{#if tabs.length}
	<section class="feature-tabs">
		<div class="feature-tabs__list" role="tablist" aria-label="Feature tabs">
			{#each tabs as tab, index (tab.id)}
				<button
					id={`tab-${tab.id}`}
					type="button"
					role="tab"
					aria-selected={index === active}
					aria-controls={`panel-${tab.id}`}
					tabindex={index === active ? 0 : -1}
					class={['feature-tabs__tab', index === active && 'is-active']}
					onclick={() => (active = index)}
					onkeydown={onKeyDown}
				>
					<span class="feature-tabs__tab-icon">
						<svg
							class="feature-tabs__icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
							focusable="false"
						>
							{#if tab.icon === 'zap'}
								<path
									d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"
								/>
							{:else if tab.icon === 'pen-line'}
								<path d="M12 20h9" />
								<path
									d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"
								/>
							{:else if tab.icon === 'trending-up'}
								<path d="M16 7h6v6" />
								<path d="m22 7-8.5 8.5-5-5L2 17" />
							{/if}
						</svg>
					</span>
					<span class="feature-tabs__tab-label">{tab.heading}</span>
				</button>
			{/each}
		</div>

		<div
			id={`panel-${activeTab.id}`}
			role="tabpanel"
			aria-labelledby={`tab-${activeTab.id}`}
			class="feature-tabs__panel"
			tabindex="0"
		>
			<div class="feature-tabs__content">
				<h3 class="feature-tabs__heading">{activeTab.heading}</h3>
				<p class="feature-tabs__description">{activeTab.description}</p>
				{#if activeTab.points && activeTab.points.length > 0}
					<ul class="feature-tabs__points">
						{#each activeTab.points as point (point)}
							<li>
								<svg
									class="feature-tabs__check"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
									focusable="false"
								>
									<path d="M20 6 9 17l-5-5" />
								</svg>
								<span>{point}</span>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
			<div class="feature-tabs__window" aria-hidden="true">
				<div class="feature-tabs__window-bar">
					<span></span>
					<span></span>
					<span></span>
				</div>
				<pre class="feature-tabs__visual">{activeTab.visual}</pre>
			</div>
		</div>
	</section>
{/if}
