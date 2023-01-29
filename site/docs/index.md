---
slug: /
---

# BusyTime

BusyTime is a light for showing when you are busy. 

It uses [Google Calendar](https://calendar.google.com) API to update the color of a [USB-C](https://en.wikipedia.org/wiki/USB-C) light to indicate when a calendar is busy.

<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#ff0000"/></svg> Busy  <BR/>
<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#ffff00"/></svg> Busy time is coming up  <BR/>
<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#00ff00"/></svg> Free  <BR/>
<svg width="20" height="20" role="img" version="1.1" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#a000a0"/></svg> All day  <BR/>
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