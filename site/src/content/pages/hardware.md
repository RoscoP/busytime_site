---
title: BusyTime Hardware
description: The BusyTime device is powered over USB-C and connects over 2.4GHz WiFi.
---

BusyTime uses an embedded controller powered by [USB-C](https://en.wikipedia.org/wiki/USB-C). It uses 2.4GHz WiFi to communicate with the internet to track calendar information.

<div class="device-grid">
  <section class="device">
    <img src="/img/pyramid.png" alt="BusyTime Pyramid" />
    <h2>BusyTime Pyramid</h2>
    <p>A single LED lights the peak of the pyramid in the [BusyTime colors](/guide/status-colors).</p>
  </section>
  <section class="device">
    <img src="/img/snapfitmatrix.png" alt="BusyTime Matrix" />
    <h2>BusyTime Matrix</h2>
    <p>An 8 × 8 matrix of LEDs shows the <a href="/guide/status-colors">BusyTime colors</a>. The number of LEDs lets BusyTime show progression from one event to the next.</p>
  </section>
</div>

## Supported third-party displays

BusyTime can also drive lights and services that you set up yourself, and can serve a status page of its own. Choose them on the [Configure](/configure) page under Displays.

<div class="device-grid">
  <section class="device">
    <img src="/img/display-ledstrip.svg" alt="Addressable LED strip driven by an ESP32" />
    <h2>WLED</h2>
    <p>WLED is open source firmware for ESP8266/ESP32 controllers that drive addressable LED strips (WS2812B, WS2811, SK6812). BusyTime sends colors to the WLED server over your network, and can show a moving "now" tracker along the strip.</p>
    <p><a href="https://kno.wled.ge/">kno.wled.ge</a></p>
  </section>
  <section class="device">
    <img src="/img/display-smarthome.svg" alt="Smart light controlled from a home automation dashboard" />
    <h2>Home Assistant</h2>
    <p>Home Assistant is an open source home automation platform. BusyTime sets the color of any light entity you choose through its REST API, using a long-lived access token.</p>
    <p><a href="https://www.home-assistant.io/">home-assistant.io</a></p>
  </section>
  <section class="device">
    <img src="/img/display-website.png" alt="BusyTime website showing the current status and today's schedule" />
    <h2>Website</h2>
    <p>BusyTime can serve its own status page. When configured, open <a href="http://busytime.local">http://busytime.local</a> in a web browser on the same network to see your current status. The address uses the mDNS name set on the Configure page, which defaults to <code>busytime</code>.</p>
  </section>
</div>