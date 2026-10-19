# BusyTime Setup Guide

## How to connect BusyTime to a work calendar
Work calendars will often be limited on what programs can access them.  This can usually be worked around by sharing a limited view of the calendar with your personal account.

### Google
1. [Google Calendar](https://calendar.google.com)
1. Click **Settings Gear** -> **Settings**
1. <img src="/img/CalendarSettings.png" alt="CalendarSettings" width="640" />
1. Click **Calendar Name** (BusyTime in this example)
1. <img src="/img/CalendarSelect.png" alt="CalendarSelect" width="640" />
1. Click **Shared with** -> **Add people and groups**
1. <img src="/img/CalendarShare.png" alt="CalendarShare" width="640" />
1. Enter in your *personal* gmail address
1. <img src="/img/CalendarShareWithEmail.png" alt="CalendarShareWithEmail" width="640" />
1. Check your email and accept the calendar
1. <img src="/img/EmailAcceptShare.png" alt="EmailAcceptShare" width="640" />
1. It will now be selectable when configuring BusyTime
1. See Google's [Share your calendar with someone](https://support.google.com/calendar/answer/37082)

## How to connect BusyTime to Apple Calendar
Apple Calendar can be accessed through CalDAV authentication, which requires an app-specific password for security. This allows BusyTime to connect directly to your iCloud calendar.

### Apple Calendar
1. [iCloud Account Settings](https://appleid.apple.com)
1. Sign in with your Apple ID
1. Navigate to **Security** section
1. Under **App-Specific Passwords**, click **Genverate Password** ([*details*](https://support.apple.com/en-us/102654))
1. Enter a label (e.g., "BusyTime") and click **Create**
1. Copy the generated app-specific password
1. On the [configure](configure) page, select **Configure Apple Calendar**
1. Enter your iCloud email address as the username
1. Use the app-specific password you just generated
1. Enter in the names of the calendars you want to track
