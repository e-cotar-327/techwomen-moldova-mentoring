# 🔐 SECURITY GUIDELINES - TechWomen Moldova Admin

## ✅ SAFE to commit to GitHub:
- admin/dashboard.html
- admin/css/admin.css  
- admin/js/admin-dashboard.js (no hardcoded secrets)
- netlify/functions/update-profiles.js

## ❌ NEVER commit to GitHub:
- Netlify Personal Access Tokens
- Form IDs (though less sensitive)
- Any admin/.env files
- Any files with "secret", "token", or "key" in the name

## 🛡️ How Security Works:

1. **Browser-Only Storage**: Credentials stored in localStorage
2. **No Server Transmission**: Tokens never leave your browser
3. **No Git Tracking**: Sensitive files in .gitignore
4. **Easy Cleanup**: Clear browser data = clear credentials

## 🚨 If Credentials Are Compromised:

1. **Revoke Netlify Token**: 
   - Go to Netlify User Settings → Applications
   - Delete the compromised token
   - Generate a new one

2. **Clear Browser Data**:
   - Settings → Clear browsing data → localStorage
   - Or use the "Clear Credentials" button in admin

3. **Check Git History**:
   - Ensure no tokens were ever committed
   - If found, consider rotating all tokens

## 💡 Best Practices:

✅ Only access admin on trusted devices
✅ Log out of Netlify when done
✅ Use browser private/incognito mode for extra security  
✅ Regularly rotate access tokens
✅ Never share screenshots of the settings page

## 🔧 Team Access:

Each admin user should:
1. Get their own Netlify account access
2. Generate their own personal access token
3. Configure their own browser with their credentials
4. Never share tokens with other team members

This ensures complete access control and audit trails.
