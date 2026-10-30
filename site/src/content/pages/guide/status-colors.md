---
title: Status Colors
description: What each BusyTime light color means, from free and upcoming to busy and error.
---

BusyTime shows your calendar status as a color. The colors below apply to the BusyTime Pyramid and Matrix. Third-party displays receive the same colors.

<table class="status-table">
  <thead><tr><th>Color</th><th>State</th><th>Meaning</th></tr></thead>
  <tbody>
    <tr><td><span class="sw" style="background:var(--status-free)"></span></td><td>Free</td><td>No busy events.</td></tr>
    <tr><td><span class="sw" style="background:var(--status-free-scheduled)"></span></td><td>Free, scheduled</td><td>Scheduled event that is marked free (for example, all-day events).</td></tr>
    <tr><td><span class="sw" style="background:var(--status-upcoming)"></span></td><td>Upcoming</td><td>A busy time is coming up.</td></tr>
    <tr><td><span class="sw" style="background:var(--status-busy-next)"></span></td><td>Busy, more to follow</td><td>Currently busy, and another busy time follows.</td></tr>
    <tr><td><span class="sw" style="background:var(--status-busy)"></span></td><td>Busy</td><td>Currently busy.</td></tr>
    <tr><td><span class="sw" style="background:var(--status-error)"></span></td><td>Error</td><td>The device cannot read the calendar. The light pulses between blue and red.</td></tr>
    <tr><td><span class="sw" style="background:var(--status-off)"></span></td><td>Off</td><td>No upcoming busy times, or outside the checking hours.</td></tr>
  </tbody>
</table>

If the light shows the error pattern, see [Troubleshooting](/guide/troubleshooting).
