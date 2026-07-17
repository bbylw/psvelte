import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// adapter-static compiles to static files (build/ folder)
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html', // For single-page app (SPA) fallback on GitHub Pages
				precompress: false,
				strict: true
			})
		})
	]
});
