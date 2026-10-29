---
title: Connect Apple Calendar
description: Create an app-specific password so BusyTime can read your iCloud calendar.
---

Apple Calendar is accessed through CalDAV, which requires an app-specific password for security. This lets BusyTime connect directly to your iCloud calendar.

## Create an app-specific password

1. Open [Apple Account settings](https://appleid.apple.com) and sign in with your Apple ID.
1. Go to the **Sign-In and Security** (or **Security**) section.
1. Under **App-Specific Passwords**, click **Generate Password** ([details](https://support.apple.com/en-us/102654)).
1. Enter a label (for example, "BusyTime") and click **Create**.
1. Copy the generated password.

## Add it in Configure

1. Open the [Configure tool](/configure) and go to **Calendar Providers**.
1. Choose **Apple iCloud** and click **Add Provider**.
1. Enter your iCloud email address as the username and the app-specific password as the password.
1. Enter the names of the calendars you want to track.
1. Continue to [Device setup](/guide/device) to save the settings.
