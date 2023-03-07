---
slug: /
---

# BusyTime

BusyTime is a light displaying your busy status according to your selected [Google Calendar](https://calendar.google.com).  It plugs into a [USB-C](https://en.wikipedia.org/wiki/USB-C) for power and produces a light to indicate when the calendar indicates it is busy.

Setup requires a PC with USB connection to the USB-C port on the device.  After being setup, the device only requires USB-C power and can be placed anywhere with WiFi access.

<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#00ff00"/></svg> Free  <BR/>
<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#00a0a0"/></svg> Scheduled event, but marked free (All day events)  <BR/>
<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#ffff00"/></svg> Busy time is coming up  <BR/>
<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#ff8800"/></svg> Busy (and another Busy is coming up)  <BR/>
<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#ff0000"/></svg> Busy  <BR/>
<svg width="20" height="20">
    <rect width="20" height="20">
        <animate
            attributeType="XML"
            attributeName="fill"
            values="#00a;#00c;#00f;#00f;#00c;#00a;#500;#800;#f00;#f00;#800;#500"
            calcMode="linear"
            dur="3s"
            repeatCount="indefinite"/>
        </rect>
 </svg> Error  <BR/>
 <svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#000000"/></svg> No upcoming busy times or outside of checking times<BR/>