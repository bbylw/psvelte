<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { categories } from '#lib/navData.js';

	let activeHash = $state('#ai-search');
	let searchQuery = $state('');
	let supportsScrollTargetGroup = $state(false);
	let liveSearchStatus = $state('');
	/** @type {HTMLElement | undefined} */
	let mainElement = $state();

	let normalizedQuery = $derived(searchQuery.trim().toLowerCase());

	// Reactive filtering of categories and links based on the search query
	let filteredCategories = $derived.by(() => {
		if (!normalizedQuery) return categories;
		return categories
			.map((category) => {
				const filteredLinks = category.links.filter((link) => {
					const linkName = link.name || link.title || '';
					return (
						linkName.toLowerCase().includes(normalizedQuery) ||
						link.url.toLowerCase().includes(normalizedQuery)
					);
				});
				return { ...category, links: filteredLinks };
			})
			.filter((category) => category.links.length > 0);
	});

	/** @returns {'auto' | 'smooth'} */
	function getScrollBehavior() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	}

	function syncTargetCurrent() {
		const currentLink = document.querySelector('.category-nav a:target-current');
		const href = currentLink?.getAttribute('href');
		if (href) {
			activeHash = href;
		}
	}

	onMount(() => {
		supportsScrollTargetGroup = CSS.supports('scroll-target-group: auto');

		const handleHashChange = () => {
			const hash = window.location.hash;
			if (hash) {
				activeHash = hash;
				const targetElement = document.getElementById(hash.substring(1));
				if (targetElement) {
					targetElement.scrollIntoView({ behavior: getScrollBehavior() });
				}
			}
		};

		window.addEventListener('hashchange', handleHashChange);
		handleHashChange();

		if (supportsScrollTargetGroup) {
			syncTargetCurrent();
			document.addEventListener('scrollend', syncTargetCurrent);
		}

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
			if (supportsScrollTargetGroup) {
				document.removeEventListener('scrollend', syncTargetCurrent);
			}
		};
	});

	// Fallback scrollspy via IntersectionObserver when scroll-target-group is unsupported
	$effect(() => {
		// Re-run when filteredCategories or support flag changes
		const currentCategories = filteredCategories;
		if (supportsScrollTargetGroup || !mainElement || currentCategories.length === 0) return;

		const sections = mainElement.querySelectorAll('section[id]');
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeHash = `#${entry.target.id}`;
						break;
					}
				}
			},
			{ rootMargin: '-20% 0px -70% 0px', threshold: 0 }
		);

		sections.forEach((section) => observer.observe(section));

		return () => {
			observer.disconnect();
		};
	});

	// Debounced screen reader announcement for dynamic search results
	$effect(() => {
		const query = normalizedQuery;
		const matchedCategories = filteredCategories;

		if (!query) {
			liveSearchStatus = '';
			return;
		}

		const timer = setTimeout(() => {
			if (matchedCategories.length === 0) {
				liveSearchStatus = `未找到与 "${searchQuery.trim()}" 相关的网站`;
			} else {
				const totalLinks = matchedCategories.reduce((sum, cat) => sum + cat.links.length, 0);
				liveSearchStatus = `找到 ${matchedCategories.length} 个分类，共 ${totalLinks} 个网站`;
			}
		}, 350);

		return () => clearTimeout(timer);
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
			targetElement.scrollIntoView({ behavior: getScrollBehavior() });
			goto(`#${targetId}`, { shallow: true });
		}
	}

	function clearSearch() {
		searchQuery = '';
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	function handleKeyDown(e) {
		if (e.isComposing || e.keyCode === 229) return;
		if (e.key === 'Escape') {
			clearSearch();
		}
	}
</script>

<header>
	<a href="#main-content" class="skip-link visually-hidden">跳转到主要内容</a>
	<h1>WebNav Hub</h1>
</header>

<search class="search-container">
	<div class="search-wrapper">
		<i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
		<label for="site-search" class="visually-hidden">搜索网站</label>
		<input
			id="site-search"
			name="q"
			type="search"
			placeholder="Freedom Is the Default Setting."
			class="search-input"
			enterkeyhint="search"
			autocorrect="off"
			autocapitalize="none"
			spellcheck={false}
			bind:value={searchQuery}
			onkeydown={handleKeyDown}
		/>
		{#if searchQuery}
			<button type="button" class="clear-btn" onclick={clearSearch} aria-label="清除搜索">
				<i class="fa-solid fa-xmark" aria-hidden="true"></i>
			</button>
		{/if}
	</div>
	<div class="visually-hidden" aria-live="polite" aria-atomic="true">
		{liveSearchStatus}
	</div>
</search>

{#if filteredCategories.length > 0}
	<nav class="category-nav" aria-label="网站分类">
		<ul>
			{#each filteredCategories as category (category.id)}
				{@const isCurrent = activeHash === `#${category.id}`}
				<li>
					<a
						href="#{category.id}"
						class={!supportsScrollTargetGroup && isCurrent ? 'active' : ''}
						aria-current={isCurrent ? 'true' : undefined}
						onclick={(e) => handleNavClick(e, category.id)}
					>
						{category.title}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<main id="main-content" bind:this={mainElement}>
	{#if filteredCategories.length > 0}
		{#each filteredCategories as category, index (category.id)}
			<section
				id={category.id}
				tabindex="-1"
				class={index > 0 && !normalizedQuery ? 'deferred-section' : undefined}
			>
				<h2 class="category-title">{category.title}</h2>
				<ul class="link-grid" role="list">
					{#each category.links as link (link.url + '|' + (link.name || link.title || ''))}
						<li class="link-card">
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={link.name || link.title}
							></a>
							<i class={link.icon} aria-hidden="true"></i>
							<span class="link-title" aria-hidden="true">{link.name || link.title}</span>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{:else}
		<div class="no-results">
			<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
			<p>未找到与 "{searchQuery}" 相关的网站</p>
		</div>
	{/if}
</main>
<footer>
	<p>© {new Date().getFullYear()} WebNav Hub. 保留所有权利。</p>
	<nav aria-label="页脚链接">
		<!-- svelte-ignore a11y_invalid_attribute -->
		<a href="#">隐私政策</a>
		<!-- svelte-ignore a11y_invalid_attribute -->
		<a href="#">使用条款</a>
		<!-- svelte-ignore a11y_invalid_attribute -->
		<a href="#">联系我们</a>
	</nav>
</footer>
