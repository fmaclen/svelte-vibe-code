import { mutation } from './_generated/server';

// Development helper functions
// WARNING: Only use these in development/testing!
// These functions can destroy all data - never expose them in production!

export const clearAllData = mutation({
	handler: async (ctx) => {
		// Check if we're in dev/test mode - this uses Convex's environment variables
		// Set IS_DEV_OR_TEST in your Convex dashboard or via `npx convex env set IS_DEV_OR_TEST true`
		// In production, don't set this variable or set it to undefined
		if (process.env.IS_DEV_OR_TEST !== 'true') {
			throw new Error('Cannot clear data in production! Set IS_DEV_OR_TEST=true to enable.');
		}

		// WARNING: This will delete ALL data in the database!
		// Only use in development/test environments

		// Clear all messages
		const messages = await ctx.db.query('messages').collect();
		for (const message of messages) {
			await ctx.db.delete(message._id);
		}

		// Clear all sessions
		const sessions = await ctx.db.query('sessions').collect();
		for (const session of sessions) {
			await ctx.db.delete(session._id);
		}

		// Clear all users
		const users = await ctx.db.query('users').collect();
		for (const user of users) {
			await ctx.db.delete(user._id);
		}

		return {
			cleared: {
				messages: messages.length,
				sessions: sessions.length,
				users: users.length
			}
		};
	}
});
