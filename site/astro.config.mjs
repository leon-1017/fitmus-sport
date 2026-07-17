import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

function configuredSite() {
	const value = process.env.PUBLIC_SITE_URL;
	if (!value) return undefined;

	const site = new URL(value);
	if (!['http:', 'https:'].includes(site.protocol)) {
		throw new Error('PUBLIC_SITE_URL must use http or https.');
	}
	return site.href;
}

// https://astro.build/config
export default defineConfig({
	site: configuredSite(),
	trailingSlash: 'always',
	vite: {
		plugins: [tailwindcss()],
	},
});
