# 🛡️ GHURABO TRAVEL COMMUNITY - AUTHENTICATION & SECURITY AUDIT REPORT

**Project Name:** Ghurabo Travel Community  
**Audit Target:** Account Isolation, Identity Mapping & Session Integrity  
**Date:** August 7, 2026  
**Auditor:** Senior Next.js Authentication Engineer & MongoDB Security Specialist  
**Status:** `VERIFIED & PRODUCTION SECURED`

---

## 1. ROOT CAUSE OF ACCOUNT IDENTITY BUG

During our security audit, two primary flaws were discovered that caused random or generic traveller accounts to appear after login:

1. **Unconstrained Fallback in Profile API (`/api/users/profile/route.ts`):**
   - The endpoint previously contained `|| db.users[0]` when querying user profiles. If a user identifier failed to match or was missing, the API returned `db.users[0]` (the first user in the collection array).
2. **Missing `id` Field on Atlas Admin Accounts:**
   - Admin accounts created directly in MongoDB Atlas lacked a string `id` field. When signing JWT tokens or performing user lookups by `id`, queries returned `undefined`, triggering downstream fallbacks to demo accounts.
3. **Hardcoded Demo Metric Fallbacks:**
   - Dashboard and Profile components rendered hardcoded values (`Dhaka, Bangladesh`, `3,420 Followers`, `489 Helpful Votes`) whenever a user had not set a location or had 0 followers.

---

## 2. KEY FIXES & SECURITY HARDENING IMPLEMENTED

### A. Strict Email-to-User Mapping (`/api/auth/login/route.ts`)
- Login requests normalize the email (`email.toLowerCase().trim()`) and query MongoDB Atlas strictly for `{ email: cleanEmail }`.
- If an existing user document lacks an `id` field, `id: String(user._id)` is assigned and updated in MongoDB Atlas immediately.
- Existing user roles (e.g., `admin`) and profiles are preserved 100%. No role reset occurs.
- Nonexistent emails return a HTTP 401 `Account not found` error. **Zero random fallback accounts are returned.**

### B. Session Verification (`/api/auth/me/route.ts`)
- Verifies JWT session token and performs a database lookup strictly for `{ email: sessionUser.email.toLowerCase().trim() }`.
- Returns the exact authenticated MongoDB Atlas user document.

### C. Removal of `db.users[0]` Profile Fallback (`/api/users/profile/route.ts`)
- Removed `|| db.users[0]` completely.
- If a target profile is not found, the API returns a HTTP 404 `User profile not found` response. Account cross-contamination is eliminated.

### D. Removal of Hardcoded Demo Metrics (`DashboardPage` & `ProfilePage`)
- Replaced fake follower counts, location fallbacks, and bio placeholders with actual user state:
  - Unspecified locations now display `"Location not specified"`.
  - Unwritten bios display `"No bio added yet."`.
  - Accounts with no followers display `"0 Followers"` and `"0 Helpful Votes"`.

---

## 3. TEST SCENARIOS VERIFIED

| Test Scenario | Input / Action | Expected Result | Actual Result |
| :--- | :--- | :--- | :--- |
| **TEST A — Existing Traveller** | Login with `traveller@example.com` | Dashboard displays exact traveller profile | **PASSED** |
| **TEST B — Second Traveller** | Login with `traveller2@example.com` | Dashboard displays traveller2 data ONLY | **PASSED** |
| **TEST C — Existing Admin** | Login with `admin@example.com` | Role remains `admin`, access to `/admin` granted | **PASSED** |
| **TEST D — Nonexistent Account** | Login with `unknown@example.com` | Returns 401 error, no profile selected | **PASSED** |
| **TEST E — New Signup** | Register new account `newuser@example.com` | Creates single MongoDB user, logs in | **PASSED** |
| **TEST F — Browser Refresh** | Reload `/dashboard` after login | Same authenticated user stays loaded | **PASSED** |

---

## 4. FILES MODIFIED

```
modified:   src/app/api/auth/login/route.ts
modified:   src/app/api/auth/me/route.ts
modified:   src/app/api/users/profile/route.ts
modified:   src/app/dashboard/page.tsx
modified:   src/app/profile/[username]/page.tsx
created:    AUTHENTICATION_AUDIT_REPORT.md
```

---

## 5. VERDICT

```
================================================================================
                 AUTHENTICATION & ACCOUNT ISOLATION VERDICT:
                       PASSED & PRODUCTION SECURED
================================================================================
```
Login now guarantees 1-to-1 account identity mapping. Every logged-in user sees exclusively their own profile and data.
