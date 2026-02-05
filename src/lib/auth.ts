// Re-export legacy auth functions from unified auth module
// This maintains backward compatibility while eliminating code duplication

export {
  generateSessionToken,
  validateLegacyCredentials as validateCredentials,
  verifyLegacySession as verifySession,
  destroyLegacySession as destroySession,
} from './supabase-auth'
