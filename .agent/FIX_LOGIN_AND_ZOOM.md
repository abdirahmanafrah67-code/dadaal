# Fixing Firebase Login & Zoom Issues

## 1. Google Login Error on Vercel
**Problem:** The error "Khalad ayaa dhacay markii la galinaayey Google!" often happens because your Vercel domain is not authorized in Firebase.

**Solution:**
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project **mcling-f256c**.
3. Go to **Authentication** > **Settings** > **Authorized Domains**.
4. Click **Add Domain**.
5. Add your Vercel domain (e.g., `somali-design-studio-react.vercel.app` or whatever the URL is).
6. Wait a moment and try logging in again.

**Verify:**
I have updated the code to show the *specific* error message. If you redeploy and try again, it will tell you exactly what is wrong (e.g., "Domain-kan lama oggola").

## 2. "Too Zoomed In" on Mobile
**Problem:** Mobile browsers can sometimes zoom in on input fields or make the site feel "unstable".

**Solution:**
I have updated your `index.html` to prevent automatic zooming and lock the scale to 1.0. 
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```
This forces the app to look like a native app and prevents accidental pinch-zooming.

## 3. Next Steps
1. Push these changes to GitHub/Vercel.
2. Go to Firebase Console and add your domain.
3. Refresh your site and test.
