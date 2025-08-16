import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { Id } from './_generated/dataModel';
import type { MutationCtx } from './_generated/server';
import bcrypt from 'bcryptjs';

// Helper function to generate secure session token
function generateSecureToken(): string {
	// Generate random bytes and convert to base64url string
	const randomBytes = new Uint8Array(32);
	crypto.getRandomValues(randomBytes);
	return btoa(String.fromCharCode(...randomBytes))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

// Helper function to create a session
async function createUserSession(
	ctx: MutationCtx,
	userId: Id<'users'>,
	expirationHours: number = 24 * 7 // Default 7 days
) {
	const token = generateSecureToken();
	const expiresAt = Date.now() + expirationHours * 60 * 60 * 1000;

	await ctx.db.insert('sessions', {
		userId,
		token,
		expiresAt,
		createdAt: Date.now()
	});

	return { token, expiresAt };
}

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
		passwordHash: v.string(),
		name: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const existing = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.first();

		if (existing) {
			throw new Error('User already exists');
		}

		const serverHash = await bcrypt.hash(args.passwordHash, 10);

		const userId = await ctx.db.insert('users', {
			email: args.email,
			name: args.name,
			passwordHash: serverHash,
			emailVerified: false,
			createdAt: new Date().toISOString()
		});

		// Create session
		const { token } = await createUserSession(ctx, userId);

		return { userId, token };
	}
});

export const signIn = mutation({
	args: {
		email: v.string(),
		passwordHash: v.string()
	},
	handler: async (ctx, args) => {
		const user = await ctx.db
			.query('users')
			.filter((q) => q.eq(q.field('email'), args.email))
			.first();

		const dummyHash = '$2a$10$dummyHashForTimingAttackPrevention123456';
		const hashToVerify = user?.passwordHash || dummyHash;
		
		const isValidPassword = await bcrypt.compare(args.passwordHash, hashToVerify);
		
		if (!user || !isValidPassword) {
			throw new Error('Invalid credentials');
		}

		// Create session
		const { token } = await createUserSession(ctx, user._id);

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

		// Create session (24 hours for anonymous users)
		const { token } = await createUserSession(ctx, userId, 24);

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
