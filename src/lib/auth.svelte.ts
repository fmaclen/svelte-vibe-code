import { browser } from '$app/environment';
import { useQuery } from '$lib/client.svelte';
import { api } from '$convex/_generated/api';
import type { Doc } from '$convex/_generated/dataModel';
import { getContext, setContext } from 'svelte';
import { useConvexClient } from 'convex-svelte';
import type { ConvexClient } from 'convex/browser';
import CryptoJS from 'crypto-js';

export const AUTH_TOKEN_KEY = 'svelte_vibe_auth_token';

class AuthStore {
	private _token: string | null = $state(null);
	private client: ConvexClient | null = null;

	constructor() {
		// Initialize from localStorage
		if (browser) {
			this._token = localStorage.getItem(AUTH_TOKEN_KEY);
		}

		// Get Convex client
		try {
			this.client = useConvexClient();
		} catch (error) {
			console.error('Failed to get Convex client:', error);
		}

		// Watch for external session deletion
		$effect.pre(() => {
			// If query returns null but we still have a token, session was deleted externally
			if (this.userQuery?.data === null && this._token) {
				console.log('[Auth] Session deleted externally, logging out');
				this.clearSession();
			}
		});
	}

	private hashPassword(password: string, email: string) {
		const normalizedEmail = email.toLowerCase().trim();

		const hash = CryptoJS.PBKDF2(password, normalizedEmail, {
			keySize: 256 / 32,
			iterations: 10000
		});

		return hash.toString();
	}

	private validateEmail(email: string) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Reactive query for current user
	private userQuery = $derived(
		this._token ? useQuery(api.auth.currentUser, { token: this._token }) : null
	);

	get isLoading() {
		if (!this._token) return false;
		return this.userQuery?.isLoading ?? true;
	}

	get user(): Doc<'users'> | null {
		return this.userQuery?.data ?? null;
	}

	get isAuthenticated() {
		return !!this.user;
	}

	private setSession(token: string) {
		this._token = token;
		if (browser) {
			localStorage.setItem(AUTH_TOKEN_KEY, token);
		}
	}

	private clearSession() {
		this._token = null;
		if (browser) {
			localStorage.removeItem(AUTH_TOKEN_KEY);
		}
	}

	async signUp(email: string, password: string, name?: string) {
		if (!this.client) throw new Error('Client not initialized');

		if (!this.validateEmail(email)) {
			throw new Error('Invalid email address');
		}

		try {
			const passwordHash = this.hashPassword(password, email);

			const result = await this.client.mutation(api.auth.signUp, {
				email,
				passwordHash,
				name
			});

			if (result.token) {
				this.setSession(result.token);
			}

			return result;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Sign up failed');
		}
	}

	async signIn(email: string, password: string) {
		if (!this.client) throw new Error('Client not initialized');

		if (!this.validateEmail(email)) {
			throw new Error('Invalid email address');
		}

		try {
			const passwordHash = this.hashPassword(password, email);

			const result = await this.client.mutation(api.auth.signIn, {
				email,
				passwordHash
			});

			if (result.token) {
				this.setSession(result.token);
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

			if (result.token) {
				this.setSession(result.token);
			}

			return result;
		} catch (error) {
			throw new Error(error instanceof Error ? error.message : 'Anonymous sign in failed');
		}
	}

	async signOut() {
		const token = this._token;

		// Clear local session first
		this.clearSession();

		// Then clear server session
		if (this.client && token) {
			try {
				await this.client.mutation(api.auth.signOut, { token });
			} catch (error) {
				console.error('Sign out server error:', error);
			}
		}
	}
}

const CONTEXT_KEY = 'auth-store';

export function setAuthContext() {
	const store = new AuthStore();
	setContext(CONTEXT_KEY, store);
	return store;
}

export function useAuth(): AuthStore {
	const store = getContext<AuthStore>(CONTEXT_KEY);
	if (!store) {
		throw new Error('Auth context not found. Make sure to call setAuthContext() in +layout.svelte');
	}
	return store;
}
