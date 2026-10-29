---
title: BusyTime Device Setup
description: Create a settings file with the Configure tool and save it to your BusyTime device.
---

BusyTime reads its settings from a `settings.json` file stored on the device. When you plug the device into your computer, it appears as a removable drive.

Before you start, finish any [calendar setup](/guide/calendars) your calendar needs.

## 1. Connect the device

Plug BusyTime into your computer with a USB cable. A new drive appears in your file manager.

## 2. Create your settings

Open the [Configure tool](/configure) and start a new file, or load the `settings.json` already on the device to edit it. Settings are edited in your browser and are not uploaded anywhere.

Work through each section in the sidebar:

- **WiFi**: the network the device will join.
- **General & Schedule**: when BusyTime should be active.
- **Displays**: the lights or screens that show your status.
- **Calendar Providers**: the accounts and calendars to track. See [Calendar setup](/guide/calendars).
- **Review & Save**: check the summary and fix any errors.

## 3. Save the file to the device

On **Review & Save**, use one of these options:

- **Save as...** (Chrome, Edge and other Chromium browsers): choose the BusyTime drive and save as `settings.json`. This replaces the old file.
- **Download settings.json** (any browser): download the file, then copy it to the root of the BusyTime drive, replacing the existing `settings.json`.

## 4. Restart and check

Safely eject the drive and restart the device. After a short time it should join your Wi-Fi and start showing your calendar status. If it does not, see [Troubleshooting](/guide/troubleshooting).
