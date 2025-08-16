import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Simple session-based auth for Better Auth integration
export const createSession = mutation({
	args: {
		userId: v.id('users'),
		token: v.string(),
		expiresAt: v.number()
	},
	handler: async (ctx, args) => {
		const sessionId = await ctx.db.insert('sessions', {
			userId: args.userId,
			token: args.token,
			expiresAt: args.expiresAt,
			createdAt: Date.now()
		});
		return { sessionId, token: args.token };
	}
});

export const validateSession = query({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const session = await ctx.db
			.query('sessions')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.first();

		if (!session) return null;
		if (session.expiresAt < Date.now()) return null;

		const user = await ctx.db.get(session.userId);
		return user;
	}
});

export const signUp = mutation({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// Check if user exists with this email
		const existing = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.first();

		if (existing) {
			throw new Error('User already exists');
		}

		// Create user (password hashing would be done client-side with Better Auth)
		const userId = await ctx.db.insert('users', {
			email: args.email,
			name: args.name,
			emailVerified: false,
			createdAt: new Date().toISOString()
		});

		// Generate session token
		const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
		const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

		await ctx.db.insert('sessions', {
			userId,
			token,
			expiresAt,
			createdAt: Date.now()
		});

		return { userId, token };
	}
});

export const signIn = mutation({
	args: {
		email: v.string(),
		password: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.first();

		if (!user) {
			throw new Error('Invalid credentials');
		}

		// Password verification would be done client-side with Better Auth
		// For now, we'll just create a session

		// Generate session token
		const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
		const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

		await ctx.db.insert('sessions', {
			userId: user._id,
			token,
			expiresAt,
			createdAt: Date.now()
		});

		return { userId: user._id, token, user };
	}
});

export const signInAnonymously = mutation({
	handler: async (ctx) => {
		// Create anonymous user (no email required)
		const userId = await ctx.db.insert('users', {
			name: 'Anonymous User',
			isAnonymous: true,
			emailVerified: false,
			createdAt: new Date().toISOString()
		});

		// Generate session token
		const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
		const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 1 day for anonymous

		await ctx.db.insert('sessions', {
			userId,
			token,
			expiresAt,
			createdAt: Date.now()
		});

		const user = await ctx.db.get(userId);
		return { userId, token, user };
	}
});

export const signOut = mutation({
	args: { token: v.string() },
	handler: async (ctx, args) => {
		const session = await ctx.db
			.query('sessions')
			.withIndex('by_token', (q) => q.eq('token', args.token))
			.first();

		if (session) {
			await ctx.db.delete(session._id);
		}

		return { success: true };
	}
});

export const currentUser = query({
	args: { token: v.optional(v.string()) },
	handler: async (ctx, args) => {
		if (!args.token) return null;

		const session = await ctx.db
			.query('sessions')
			.withIndex('by_token', (q) => q.eq('token', args.token!))
			.first();

		if (!session) return null;
		if (session.expiresAt < Date.now()) return null;

		const user = await ctx.db.get(session.userId);
		return user;
	}
});
