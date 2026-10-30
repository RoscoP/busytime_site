---
title: Troubleshooting
description: Fixes for common BusyTime setup problems.
---

Not sure what the light is telling you? See [Status colors](/guide/status-colors). If the light pulses between blue and red, BusyTime cannot read your calendar. Check the calendar and Wi-Fi sections below.

## The calendar does not appear or shows no events

- Check that the calendar name in **Calendar Providers** matches the calendar exactly.
- For a work Google calendar, make sure you [shared it](/guide/calendars/google-work-share) and accepted the invitation.
- For Apple Calendar, confirm you used an [app-specific password](/guide/calendars/apple), not your Apple ID password.

## The device does not connect to Wi-Fi

- Re-check the network name and password in the **WiFi** section.
- Use a 2.4 GHz network if your router separates 2.4 GHz and 5 GHz.

## My changes did not take effect

- Make sure `settings.json` was saved to the root of the BusyTime drive and replaced the old file.
- Safely eject the drive and restart the device.

## "Save as..." is missing on the Review page

Your browser may not support saving directly to a drive. Use **Download settings.json** and copy the file to the BusyTime drive instead.
