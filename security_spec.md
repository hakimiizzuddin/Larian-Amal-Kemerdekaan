# Security Specification: Larian Amal Merdeka

## 1. Data Invariants

1. **Entity Path Isolation & ID Guard**: Document IDs must be strings conforming to `^[a-zA-Z0-9_\-]+$` and length <= 128 bytes.
2. **Registration Integrity**: A registration cannot be created without a valid `fullName`, `email`, valid `category` (`10km_veteran`, `10km_open`, `5km_fun`), `feePaid` == 50, and valid `bibNumber` matching `^LAM-[0-9]{3,6}$`.
3. **Identity Verification & Ownership**: Registrations submitted by authenticated users must match `request.auth.uid`. If unauthenticated or guest mode is enabled for open charity registrations, `userId` must equal 'guest' or be absent, but once created, `userId` and `createdAt` are immortal/immutable.
4. **Admin Protection**: Only authorized administrators (verified against `/databases/$(database)/documents/admins/$(request.auth.uid)` or authenticated matching the operator email `hakimiizzuddin@gmail.com` with `email_verified == true`) may update registration statuses or delete records.
5. **No Shadow Fields**: Incoming records during create must only contain permitted fields.
6. **Temporal Immutability**: `createdAt` cannot be altered after creation.
7. **Read Security**: Registrations can be listed/read by their creator (`resource.data.userId == request.auth.uid`), by administrators, or publicly for the verified finisher/bib lookup registry without exposing private phone numbers.

---

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Ghost Field Injection / Shadow Field Attack)**:
   Attempt to create a registration with an unapproved injected field `isAdmin: true` or `verifiedBypass: true`.
2. **Payload 2 (Fee Tampering)**:
   Attempt to create a registration with `feePaid: 0` or negative fee instead of the fixed RM 50.
3. **Payload 3 (ID Poisoning Attack)**:
   Attempt to write a document with an ID containing illegal path traversal tokens `../../etc/passwd` or excessive 10KB string.
4. **Payload 4 (Identity Spoofing Attack)**:
   Attempt to register setting `userId` to another user's UID while logged in as an attacker.
5. **Payload 5 (Unverified Email Admin Spoofing)**:
   Attacker registers with `email: "hakimiizzuddin@gmail.com"` but `email_verified: false` to claim admin operations.
6. **Payload 6 (Category Enum Bypass)**:
   Attempt to register with illegal category `marathon_vip_free` or invalid distance string.
7. **Payload 7 (Immortal Field Overwrite Attack)**:
   Attempt to update a confirmed registration to alter `createdAt` or overwrite original `bibNumber`.
8. **Payload 8 (Terminal State Lock Bypass)**:
   Attempt by a regular non-admin user to unilaterally alter `status` from `confirmed` to `cancelled` or delete records.
9. **Payload 9 (Bib Number Regex Infiltration)**:
   Attempt to inject invalid bib string format `LAM-HACK<script>` rather than `^LAM-[0-9]{3,6}$`.
10. **Payload 10 (Massive Payload / Denial of Wallet)**:
    Attempt to inject a 500,000 character string into `fullName` or `emergencyContact`.
11. **Payload 11 (Self-Elevation of Admin Node)**:
    Non-admin user attempts to write directly into `/databases/$(database)/documents/admins/{uid}`.
12. **Payload 12 (Unauthorized Deletion)**:
    Unauthenticated or unauthorized participant attempts to delete another runner's registration.

---

## 3. Test Runner Specification

The test suite in `firestore.rules.test.ts` validates that every single one of the Dirty Dozen exploits is denied by Firestore security rules.
