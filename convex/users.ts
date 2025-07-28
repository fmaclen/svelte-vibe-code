import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
	args: {
		email: v.string(),
		username: v.optional(v.string()),
		name: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// Check if user already exists
		const existingUser = await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first();

		if (existingUser) {
			throw new Error('User already exists');
		}

		// Create new user
		const userId = await ctx.db.insert('users', {
			email: args.email,
			username: args.username,
			name: args.name,
			verified: false,
			created: new Date().toISOString(),
			updated: new Date().toISOString()
		});

		return userId;
	}
});

export const getByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('users')
			.withIndex('by_email', (q) => q.eq('email', args.email))
			.first();
	}
});

export const list = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db.query('users').collect();
	}
});

export const update = mutation({
	args: {
		id: v.id('users'),
		email: v.optional(v.string()),
		username: v.optional(v.string()),
		name: v.optional(v.string()),
		verified: v.optional(v.boolean())
	},
	handler: async (ctx, args) => {
		const { id, ...updateData } = args;

		// Add updated timestamp
		const dataToUpdate = {
			...updateData,
			updated: new Date().toISOString()
		};

		// Remove undefined fields
		Object.keys(dataToUpdate).forEach((key) => {
			if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
				delete dataToUpdate[key as keyof typeof dataToUpdate];
			}
		});

		await ctx.db.patch(id, dataToUpdate);
		return await ctx.db.get(id);
	}
});
