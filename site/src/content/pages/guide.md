---
title: BusyTime Setup Guide
description: How to connect BusyTime to a work calendar, Google Calendar or Apple Calendar.
---

## How to connect BusyTime to a work calendar

Work calendars will often be limited on what programs can access them. This can usually be worked around by sharing a limited view of the calendar with your personal account.

### Google

1. Open [Google Calendar](https://calendar.google.com).
1. Click **Settings Gear** -> **Settings**.

   ![Google Calendar settings menu](/img/CalendarSettings.png)

1. Click **Calendar Name** (BusyTime in this example).

   ![Selecting the calendar in settings](/img/CalendarSelect.png)

1. Click **Shared with** -> **Add people and groups**.

   ![Share with specific people section](/img/CalendarShare.png)

1. Enter your *personal* Gmail address.

   ![Entering an email address in the share dialog](/img/CalendarShareWithEmail.png)

1. Check your email and accept the calendar.

   ![Email invitation to accept the shared calendar](/img/EmailAcceptShare.png)

1. The calendar is now selectable when configuring BusyTime.
1. See Google's [Share your calendar with someone](https://support.google.com/calendar/answer/37082).

## How to connect BusyTime to Apple Calendar

Apple Calendar can be accessed through CalDAV authentication, which requires an app-specific password for security. This allows BusyTime to connect directly to your iCloud calendar.

### Apple Calendar

1. Open [iCloud Account Settings](https://appleid.apple.com).
1. Sign in with your Apple ID.
1. Navigate to the **Security** section.
1. Under **App-Specific Passwords**, click **Generate Password** ([details](https://support.apple.com/en-us/102654)).
1. Enter a label (for example, "BusyTime") and click **Create**.
1. Copy the generated app-specific password.
1. On the [Configure](/configure) page, select **Configure Apple Calendar**.
1. Enter your iCloud email address as the username.
1. Use the app-specific password you just generated.
1. Enter the names of the calendars you want to track.
