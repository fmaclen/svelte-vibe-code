import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: [
		{
			command: './pocketbase serve --dir=./pb_test_data',
			port: 8090,
			reuseExistingServer: !process.env.CI,
			timeout: 120000,
		},
		{
			command: 'npm run build && npm run preview',
			port: 4173,
			reuseExistingServer: !process.env.CI,
		}
	],
	testDir: 'e2e',
	use: {
		baseURL: 'http://localhost:4173',
	},
});
