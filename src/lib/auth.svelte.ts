import { browser } from '$app/environment';
import { useConvexClient } from '$lib/client.svelte';
import type { ConvexClient } from 'convex/browser';
import { api } from '$convex/_generated/api';
import type { Doc } from '$convex/_generated/dataModel';

export const AUTH_TOKEN_KEY = 'svelte_vibe_auth_token';

class AuthStore {
	private client: ConvexClient | null = $state(null);
	private token: string | null = $state(null);

	user: Doc<'users'> | null = $state(null);
	isLoading = $state(true);
	isAuthenticated = $derived(!!this.user);

	constructor() {
		// Initialize from localStorage
		if (browser) {
			const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
			if (storedToken) {
				this.token = storedToken;
			}
		}

		// Set up reactive effects
		$effect(() => {
			try {
				this.client = useConvexClient();
			} catch (error) {
				console.error('Failed to initialize Convex client:', error);
			}
		});

		// Watch for token changes and fetch user
		$effect(() => {
			if (this.client && this.token) {
				this.fetchUser();
			} else {
				this.user = null;
				this.isLoading = false;
			}
		});
	}

	private async fetchUser() {
		if (!this.client || !this.token) {
			this.user = null;
			this.isLoading = false;
			return;
		}

		try {
			this.isLoading = true;
			this.user = await this.client.query(api.auth.currentUser, { token: this.token });
		} catch (error) {
			console.error('Failed to fetch user:', error);
			this.clearSession();
		} finally {
			this.isLoading = false;
		}
	}

	private setSession(token: string, user: Doc<'users'>) {
		this.token = token;
		this.user = user;
		if (browser) {
			localStorage.setItem(AUTH_TOKEN_KEY, token);
		}
	}

	private clearSession() {
		if (browser) {
			localStorage.removeItem(AUTH_TOKEN_KEY);
		}
		this.token = null;
		this.user = null;
		this.isLoading = false;
	}

	async signUp(email: string, password: string, name?: string) {
		if (!this.client) throw new Error('Client not initialized');

		try {
			const result = await this.client.mutation(api.auth.signUp, {
				email,
				password,
				name
			});

			if (result.token) {
				const user = await this.client.query(api.auth.currentUser, { token: result.token });
				if (user) {
					this.setSession(result.token, user);
				}
			}

			return result;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Sign up failed');
		}
	}

	async signIn(email: string, password: string) {
		if (!this.client) throw new Error('Client not initialized');

		try {
			const result = await this.client.mutation(api.auth.signIn, {
				email,
				password
			});

			if (result.token && result.user) {
				this.setSession(result.token, result.user);
			}

			return result;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Sign in failed');
		}
	}

	async signInAnonymously() {
		if (!this.client) throw new Error('Client not initialized');

		try {
			const result = await this.client.mutation(api.auth.signInAnonymously, {});

			if (result.token && result.user) {
				this.setSession(result.token, result.user);
			}

			return result;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Anonymous sign in failed');
		}
	}

	async signOut() {
		// Clear session first to prevent any further queries
		const token = this.token;
		this.clearSession();

		// Then try to clear the session on the server
		if (this.client && token) {
			try {
				await this.client.mutation(api.auth.signOut, { token });
			} catch (error) {
				console.error('Sign out server error:', error);
				// Continue anyway - local session is already cleared
			}
		}
	}
}

let authInstance: AuthStore | null = null;

export function useAuth(): AuthStore {
	if (!authInstance) {
		authInstance = new AuthStore();
	}
	return authInstance;
}
