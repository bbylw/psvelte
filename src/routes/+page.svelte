<script>
	import { onMount } from 'svelte';
	import { pushState } from '$app/navigation';
	import { categories } from '$lib/navData.js';

	let activeHash = $state('#ai-search');
	let searchQuery = $state('');

	// Reactive filtering of categories and links based on the search query
	let filteredCategories = $derived(
		categories.map(category => {
			const filteredLinks = category.links.filter(link => 
				link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				link.url.toLowerCase().includes(searchQuery.toLowerCase())
			);
			return { ...category, links: filteredLinks };
		}).filter(category => category.links.length > 0)
	);

	onMount(() => {
		const handleHashChange = () => {
			const hash = window.location.hash;
			if (hash) {
				activeHash = hash;
				const targetElement = document.getElementById(hash.substring(1));
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: 'smooth' });
				}
			}
		};

		window.addEventListener('hashchange', handleHashChange);
		handleHashChange(); // Check hash on initial load

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
		};
	});

	/**
	 * @param {MouseEvent} e
	 * @param {string} targetId
	 */
	function handleNavClick(e, targetId) {
		e.preventDefault();
		activeHash = `#${targetId}`;
		const targetElement = document.getElementById(targetId);
		if (targetElement) {
			targetElement.scrollIntoView({ behavior: 'smooth' });
			pushState(`#${targetId}`, {});
		}
	}

	function clearSearch() {
		searchQuery = '';
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	function handleKeyDown(e) {
		if (e.key === 'Escape') {
			clearSearch();
		}
	}
</script>

<header>
	<h1>WebNav Hub</h1>
</header>

<div class="search-container">
	<div class="search-wrapper">
		<i class="fa-solid fa-magnifying-glass search-icon"></i>
		<input
			type="text"
			placeholder="Freedom Is the Default Setting."
			class="search-input"
			bind:value={searchQuery}
			onkeydown={handleKeyDown}
		/>
		{#if searchQuery}
			<button class="clear-btn" onclick={clearSearch} aria-label="清除搜索">
				<i class="fa-solid fa-xmark"></i>
			</button>
		{/if}
	</div>
</div>

{#if filteredCategories.length > 0}
	<nav>
		<ul>
			{#each filteredCategories as category}
				<li>
					<a
						href="#{category.id}"
						class={activeHash === `#${category.id}` ? 'active' : ''}
						onclick={(e) => handleNavClick(e, category.id)}
					>
						{category.title}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<main>
	{#if filteredCategories.length > 0}
		{#each filteredCategories as category}
			<section id={category.id}>
				<h2 class="category-title">{category.title}</h2>
				<div class="link-grid">
					{#each category.links as link}
						<div class="link-card">
							<a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.title}></a>
							<i class={link.icon}></i>
							<h3>{link.title}</h3>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	{:else}
		<div class="no-results">
			<i class="fa-solid fa-magnifying-glass"></i>
			<p>未找到与 "{searchQuery}" 相关的网站</p>
		</div>
	{/if}
</main>
<footer>
	<p>© {new Date().getFullYear()} WebNav Hub. 保留所有权利。</p>
	<nav>
		<!-- svelte-ignore a11y_invalid_attribute -->
		<a href="#">隐私政策</a>
		<!-- svelte-ignore a11y_invalid_attribute -->
		<a href="#">使用条款</a>
		<!-- svelte-ignore a11y_invalid_attribute -->
		<a href="#">联系我们</a>
	</nav>
</footer>
