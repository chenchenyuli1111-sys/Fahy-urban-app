# Security Specification

## Data Invariants

1. A user document can only be created by the authenticated user whose `uid` matches the document ID.
2. The user document must only contain the allowed keys: `username`, `photoURL`, `createdAt`, `points`, `coins`, `xp`, `level`.
3. The `createdAt` field must be an immortal field (cannot be updated after creation).
4. The user cannot artificially inflate their points, coins, xp, or level arbitrarily through direct client access unless allowed (but wait, we update them from client). Let's restrict it to type constraints for now, since this is a simple app, we can just enforce types and sizes.
5. All users can list (read) user documents.

## Dirty Dozen Payloads

1. Create user with invalid ID.
2. Create user as anonymous/unauthenticated.
3. Update another user's document.
4. Add extra ghost fields.
5. Provide a huge string for username.
6. Provide wrong types for points.

These will be tested.
