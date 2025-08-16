import { useConvexClient, useQuery } from '$lib/client.svelte';
import { api } from '../../convex/_generated/api';

interface User {
	_id: string;
	email: string;
	name?: string;
	isAnonymous?: boolean;
}

class AuthStore {
	private client = $state<any>(null);
	private token = $state<string | null>(null);

	user = $state<User | null>(null);
	isLoading = $state(true);
	isAuthenticated = $derived(!!this.user);

	constructor() {
		// Initialize from localStorage
		if (typeof window !== 'undefined') {
			const storedToken = localStorage.getItem('auth_token');
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
			const user = await this.client.query(api.auth.currentUser, { token: this.token });
			this.user = user;
		} catch (error) {
			console.error('Failed to fetch user:', error);
			this.clearSession();
		} finally {
			this.isLoading = false;
		}
	}

	private setSession(token: string, user: User) {
		this.token = token;
		this.user = user;
		localStorage.setItem('auth_token', token);
	}

	private clearSession() {
		localStorage.removeItem('auth_token');
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
				this.setSession(
					result.token,
					await this.client.query(api.auth.currentUser, { token: result.token })
				);
			}

			return result;
		} catch (error: any) {
			throw new Error(error.message || 'Sign up failed');
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
		} catch (error: any) {
			throw new Error(error.message || 'Sign in failed');
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
		} catch (error: any) {
			throw new Error(error.message || 'Anonymous sign in failed');
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
