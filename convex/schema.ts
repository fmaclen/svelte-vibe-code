import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		email: v.optional(v.string()),
		name: v.optional(v.string()),
		passwordHash: v.optional(v.string()),
		emailVerified: v.optional(v.boolean()),
		isAnonymous: v.optional(v.boolean()),
		createdAt: v.optional(v.string())
	}),

	sessions: defineTable({
		userId: v.id('users'),
		token: v.string(),
		expiresAt: v.number(),
		createdAt: v.number()
	}).index('by_token', ['token']),

	messages: defineTable({
		userId: v.optional(v.id('users')),
		author: v.string(),
		body: v.string(),
		created: v.optional(v.string())
	}).index('by_user', ['userId'])
});
