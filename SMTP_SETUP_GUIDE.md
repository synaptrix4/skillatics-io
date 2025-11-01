# Gmail SMTP Setup for OTP Emails

## Quick Fix for Render Deployment

If OTP emails are failing on Render but working locally, follow these steps:

### Step 1: Generate Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** if not already enabled
4. After 2-Step Verification is enabled, go back to Security
5. Scroll down to "How you sign in to Google"
6. Click on **App passwords** (you'll need to sign in again)
7. In the "Select app" dropdown, choose **Mail**
8. In the "Select device" dropdown, choose **Other (Custom name)**
9. Enter "Skillatics Render" as the name
10. Click **Generate**
11. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)
12. Remove the spaces: `abcdefghijklmnop`

### Step 2: Add Environment Variables in Render

1. Go to your Render Dashboard
2. Click on your **skillatics-backend** service
3. Go to **Environment** tab
4. Add/Update these variables:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the app password you generated (no spaces)

5. Click **Save Changes**
6. Your service will automatically redeploy

### Step 3: Test OTP Email

1. Wait for the redeploy to complete (2-3 minutes)
2. Go to your frontend URL
3. Try to register or login
4. Check if you receive the OTP email

### Step 4: Check Logs (If Still Failing)

1. Go to your backend service in Render
2. Click on **Logs** tab
3. Look for messages like:
   - `[Skillatics-Success] OTP email sent to user@example.com` ✅ Working
   - `[Skillatics-Warning] SMTP credentials not configured` ⚠️ Env vars not set
   - `[Skillatics-Error] Failed to send OTP email` ❌ Check error details

## Common Issues and Solutions

### Issue 1: "SMTP credentials not configured"
**Solution:** Environment variables are not set in Render. Follow Step 2 above.

### Issue 2: "Authentication failed" or "Username and Password not accepted"
**Solutions:**
- Make sure you're using an **App Password**, not your regular Gmail password
- Verify the app password has no spaces
- Check that SMTP_USER is your full Gmail address

### Issue 3: "Less secure app access"
**Solution:** This is outdated. Google now requires App Passwords with 2-Step Verification. Regular passwords don't work anymore.

### Issue 4: OTP shows in logs but email not received
**Solutions:**
- Check your spam/junk folder
- Verify the recipient email address is correct
- Make sure Gmail hasn't blocked the app password (check Gmail security alerts)

### Issue 5: "Connection timeout" or "Connection refused"
**Solutions:**
- Verify SMTP_PORT is set to `465` (not 587)
- Check SMTP_SERVER is `smtp.gmail.com`
- Ensure Render can make outbound connections (should work by default)

## Alternative: Use Without Email (Development)

If you just want to test without setting up email:

1. Don't set SMTP_USER and SMTP_PASS in Render
2. Check the backend logs after requesting OTP
3. You'll see: `[Skillatics-Warning] SMTP credentials not configured. OTP: 123456`
4. Copy the OTP from the logs and use it to verify

**Note:** This is only for development/testing. For production, you must set up proper email.

## Using Other Email Providers

### Using Outlook/Hotmail
```
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Using SendGrid (Recommended for Production)
```
SMTP_SERVER=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Using Mailgun
```
SMTP_SERVER=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
```

## Security Best Practices

1. ✅ Always use App Passwords, never your main password
2. ✅ Keep SMTP_PASS secret (never commit to Git)
3. ✅ Use environment variables for credentials
4. ✅ Enable 2-Step Verification on your email account
5. ✅ Regularly rotate app passwords
6. ✅ For production, consider dedicated email services (SendGrid, Mailgun, AWS SES)

## Troubleshooting Checklist

- [ ] 2-Step Verification is enabled on Gmail
- [ ] App Password is generated (not regular password)
- [ ] App Password has no spaces
- [ ] SMTP_USER is set to full email address
- [ ] SMTP_PASS is set to the app password
- [ ] SMTP_SERVER is smtp.gmail.com
- [ ] SMTP_PORT is 465
- [ ] Environment variables are saved in Render
- [ ] Backend service has redeployed after adding env vars
- [ ] Checked backend logs for error messages
- [ ] Checked spam folder for OTP emails

## Still Having Issues?

Check the backend logs in Render for the specific error message and search for it online, or review the error details in the logs to identify the exact problem.
