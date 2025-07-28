import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		email: v.string(),
		username: v.optional(v.string()),
		name: v.optional(v.string()),
		avatar: v.optional(v.string()),
		verified: v.optional(v.boolean()),
		created: v.optional(v.string()),
		updated: v.optional(v.string())
	}).index('by_email', ['email']),

	// Add other tables as needed based on your app's requirements
	messages: defineTable({
		author: v.string(),
		body: v.string(),
		created: v.optional(v.string())
	})
});
