# Supabase Setup Instructions

## Your app is working! The error "Invalid login credentials" means:
- ✅ Your app is successfully connecting to Supabase
- ✅ The API calls are working correctly
- ❌ You just need to create a user account

## Step-by-Step: Create Your First User

### Option 1: Via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Login to your account
   - Select your project: `djfrkmlhhgcjxtfdrbat`

2. **Navigate to Authentication**
   - Click on "Authentication" in the left sidebar
   - Click on "Users" tab

3. **Create a Test User**
   - Click the "Add user" button (top right)
   - Select "Create new user"
   - Fill in:
     ```
     Email: test@example.com
     Password: Test123456!
     ```
   - **IMPORTANT**: Check the box "Auto Confirm User"
   - Click "Create user"

4. **Verify User Was Created**
   - You should see the user in the list
   - Status should show as "Confirmed"

5. **Try Logging In**
   - Go back to your app
   - Enter:
     - Email: `test@example.com`
     - Password: `Test123456!`
   - Click Login

### Option 2: Via Registration Screen

1. **In Your App**
   - Click "Sign Up" or "Register" link
   - Fill in the registration form
   - Submit

2. **Check Email Confirmation**
   - If email confirmation is enabled, check your email
   - Click the confirmation link
   - Then try logging in

### Option 3: Disable Email Confirmation (For Testing)

1. **Go to Supabase Dashboard**
   - Authentication → Settings → Email Auth
   - Find "Enable email confirmations"
   - **Disable it** for testing
   - Save changes

2. **Now Register Through App**
   - Users will be auto-confirmed
   - Can login immediately after registration

## Troubleshooting

### If you still get "Invalid login credentials":

1. **Check the user exists**:
   - Go to Supabase Dashboard → Authentication → Users
   - Verify the user is there
   - Check if status is "Confirmed"

2. **Check email confirmation settings**:
   - Go to Authentication → Settings
   - Look for "Enable email confirmations"
   - For testing, disable it

3. **Try creating user via SQL**:
   ```sql
   -- Run this in Supabase SQL Editor
   -- This creates a user with email confirmation disabled
   INSERT INTO auth.users (
     instance_id,
     id,
     aud,
     role,
     email,
     encrypted_password,
     email_confirmed_at,
     created_at,
     updated_at,
     confirmation_token
   ) VALUES (
     '00000000-0000-0000-0000-000000000000',
     gen_random_uuid(),
     'authenticated',
     'authenticated',
     'test@example.com',
     crypt('Test123456!', gen_salt('bf')),
     NOW(),
     NOW(),
     NOW(),
     ''
   );
   ```

## Your App is Ready!

Once you create a user, everything will work. The authentication system is properly configured and working - you just need users in the database!
