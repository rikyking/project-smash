# Admin Panel Setup Guide

## Overview
The admin panel has been migrated from a simple hardcoded check (`RIC-ADMIN`) to a secure Firebase Authentication system with role-based access control.

## How It Works

### 1. Authentication Flow
- Users log in anonymously by default
- Admin users can authenticate via Firebase Auth (email/password)
- User roles are stored in Firestore under the `users` collection

### 2. Role-Based Access Control
Each user has a role field in Firestore:
```json
{
  "users": {
    "<userId>": {
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2026-05-12"
    }
  }
}
```

## Setup Instructions

### Step 1: Create Admin User in Firebase Auth
1. Go to Firebase Console → Authentication → Users
2. Click "Add user"
3. Enter email: `admin@example.com`
4. Enter password (store securely)
5. Click "Create user"

### Step 2: Add User Document in Firestore
1. Go to Firebase Console → Firestore Database
2. Create collection: `users`
3. Create document with ID matching the user's UID
4. Add fields:
   - `email`: admin@example.com
   - `role`: admin
   - `createdAt`: (timestamp)

### Step 3: Set Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Admin-only: manage orders
    match /artifacts/{appId}/public/data/orders/{document=**} {
      // Anyone can read and create
      allow read, create: if true;
      // Only admins can update
      allow update: if
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Security Considerations

### ✅ Best Practices Implemented
- Credentials stored in `.env.local` (not in git)
- Role verification against Firestore (server-side)
- No hardcoded admin credentials
- Proper error handling and validation

### 🔒 Additional Recommendations

1. **Use Custom Claims** (advanced):
   ```javascript
   // Set custom claims via Admin SDK
   admin.auth().setCustomUserClaims(uid, { role: 'admin' });
   ```

2. **Enable Multi-Factor Authentication (MFA)**:
   - Firebase Console → Authentication → MFA

3. **Monitor Admin Access**:
   - Firebase Console → Firestore → Audit Logs

4. **Rate Limiting**:
   - Implement Firestore rules to prevent abuse

5. **Rotate Passwords Regularly**:
   - Change admin password every 90 days

## Accessing the Admin Panel

### Via UI
1. User enters their Firebase-authenticated email in the username field
2. System checks Firestore for admin role
3. If admin, the admin panel loads automatically

### Programmatically
```javascript
import { checkAdminAccess } from './admin.js';

const isAdmin = await checkAdminAccess(userId);
if (isAdmin) {
  // Grant admin access
}
```

## Troubleshooting

### "Admin access denied"
- Verify user document exists in Firestore
- Check that `role` field equals `'admin'`
- Ensure `userId` matches the Firestore document ID

### "Orders not loading"
- Check Firestore Security Rules
- Verify admin user has read/write permissions
- Check browser console for errors

### "Cannot authenticate"
- Verify `.env.local` has correct Firebase credentials
- Check that user exists in Firebase Auth
- Ensure user is authenticated before checking admin status

## Future Enhancements

- [ ] Email verification for admin accounts
- [ ] Admin activity logging
- [ ] Multiple admin roles (manager, owner, etc.)
- [ ] Admin dashboard with analytics
- [ ] Order history and export to CSV
