# Security Specification for Fa Hui Urban Pulse

## Phase 0: Payload-First Security TDD

### 1. Data Invariants

- **User profiles** (`/users/{userId}`) can only be written by the authenticated user whose `uid` matches the document path. Field sizes must be strictly bounded.
- **Transactions** (`/users/{userId}/transactions/{txId}`) can only be written by the owner of the user account. They are immutable once written.
- **Reports** (`/reports/{reportId}`) must be associated with the creator's `userId` (which must match `request.auth.uid`). The coordinates (`lat`, `lng`) and report text must be bounded, and state transitions (e.g., `restored` status) must be authenticated.
- **Metrics** (`/metrics/{metricId}`) are global real-time sensor parameters. Standard users can only read metrics; they are strictly forbidden from modifying them.
- **Workshops** (`/workshops/{workshopId}`) can be read by anyone, but users can only modify the `participants` list and `spots` decrement count to register. They cannot alter titles, organizers, or rewards.
- **Insights** (`/insights/{insightId}`) can be created by signed-in users. However, they can only be updated to increment `likes` or modified by the author.

---

### 2. The "Dirty Dozen" Payloads (Exploitation Profiles)

Below are twelve malicious payloads designed to test and break our rules:

1. **User Identity Hijack (Spoofing UID)**
   - Attempt: User `attacker_uid` attempts to write a user document at `/users/victim_uid` to hijack their coins/points.
   - Expected Result: `PERMISSION_DENIED`

2. **Self-Assigned Coins / Points Injection**
   - Attempt: Authenticated user attempts to modify their own profile to add `1,000,000` coins directly without completing a challenge.
   - Expected Result: `PERMISSION_DENIED`

3. **Orphaned Transaction Spoofing**
   - Attempt: Attacker inserts an arbitrary transaction at `/users/victim_uid/transactions/fake_tx` claiming they spent or earned coins.
   - Expected Result: `PERMISSION_DENIED`

4. **Resource Poisoning via Oversized Description in Reports**
   - Attempt: Attacker attempts to upload a report with a `15MB` junk string in the `description` to trigger "Denial of Wallet" database size inflation.
   - Expected Result: `PERMISSION_DENIED`

5. **Coordinates Injection (Off-Grid coordinates)**
   - Attempt: Attacker reports a plant species with coordinates outside physical limits (e.g. `lat: 999.9`, `lng: 888.8`).
   - Expected Result: `PERMISSION_DENIED`

6. **Unauthorized Verification Status Escaping**
   - Attempt: Standard user creates or updates a report with `status: 'resolved'` or `restored: true` without performing the real-world restoration activity.
   - Expected Result: `PERMISSION_DENIED`

7. **Malicious Global Metrics Infiltration**
   - Attempt: Standard signed-in user writes to `/metrics/fahui_park_live` to falsely report the AQI as `999` to trigger neighborhood panic.
   - Expected Result: `PERMISSION_DENIED`

8. **Workshop Hijacking & Reward Manipulation**
   - Attempt: Signed-in user updates a workshop's reward field from `50` to `50,000` coins to prepare for a mass-earning exploit.
   - Expected Result: `PERMISSION_DENIED`

9. **Double-Enrollment Spot Drainage**
   - Attempt: Attacker attempts to update a workshop's `spots` count to a negative value or remove existing participants.
   - Expected Result: `PERMISSION_DENIED`

10. **Shadow Field Injection on User Profiles**
    - Attempt: Attacker attempts to write a profile containing a hidden RBAC field like `{ "isAdmin": true }` to gain administrative access.
    - Expected Result: `PERMISSION_DENIED`

11. **Immutability Breach on Creation Date**
    - Attempt: Attacker attempts to update an existing user's `/users/userId` profile to set their `createdAt` date into the future or past.
    - Expected Result: `PERMISSION_DENIED`

12. **Blind Query Scraping / PII Blanket Scan**
    - Attempt: Non-owner reads raw details of another user's email and location preference without matching conditions.
    - Expected Result: `PERMISSION_DENIED`
