"use strict";(self.webpackChunksite=self.webpackChunksite||[]).push([[756],{3905:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>d});var o=r(7294);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,o)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,o,n=function(e,t){if(null==e)return{};var r,o,n={},a=Object.keys(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(o=0;o<a.length;o++)r=a[o],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var s=o.createContext({}),u=function(e){var t=o.useContext(s),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=u(e.components);return o.createElement(s.Provider,{value:t},e.children)},p="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.createElement(o.Fragment,{},t)}},g=o.forwardRef((function(e,t){var r=e.components,n=e.mdxType,a=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),p=u(r),g=n,d=p["".concat(s,".").concat(g)]||p[g]||m[g]||a;return r?o.createElement(d,i(i({ref:t},c),{},{components:r})):o.createElement(d,i({ref:t},c))}));function d(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var a=r.length,i=new Array(a);i[0]=g;var l={};for(var s in t)hasOwnProperty.call(t,s)&&(l[s]=t[s]);l.originalType=e,l[p]="string"==typeof e?e:n,i[1]=l;for(var u=2;u<a;u++)i[u]=r[u];return o.createElement.apply(null,i)}return o.createElement.apply(null,r)}g.displayName="MDXCreateElement"},3009:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>s,contentTitle:()=>i,default:()=>p,frontMatter:()=>a,metadata:()=>l,toc:()=>u});var o=r(7462),n=(r(7294),r(3905));const a={},i="BusyTime Setup Guide",l={unversionedId:"guide",id:"guide",title:"BusyTime Setup Guide",description:"Authorize google to access you calendar",source:"@site/docs/guide.md",sourceDirName:".",slug:"/guide",permalink:"/busytime_site/guide",draft:!1,tags:[],version:"current",frontMatter:{}},s={},u=[{value:"Authorize google to access you calendar",id:"authorize-google-to-access-you-calendar",level:2},{value:"Configure BusyTime",id:"configure-busytime",level:2}],c={toc:u};function p(e){let{components:t,...a}=e;return(0,n.kt)("wrapper",(0,o.Z)({},c,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"busytime-setup-guide"},"BusyTime Setup Guide"),(0,n.kt)("h2",{id:"authorize-google-to-access-you-calendar"},"Authorize google to access you calendar"),(0,n.kt)("ol",null,(0,n.kt)("li",{parentName:"ol"},"The ",(0,n.kt)("strong",{parentName:"li"},"Google Code")," will be Red to indicate that you need to authorize google permissions in order to continue.",(0,n.kt)("br",{parentName:"li"}),(0,n.kt)("img",{alt:"SetupAuthorized",src:r(1232).Z,width:"588",height:"320"})),(0,n.kt)("li",{parentName:"ol"},"Click ",(0,n.kt)("strong",{parentName:"li"},"Authorize")),(0,n.kt)("li",{parentName:"ol"},"The ",(0,n.kt)("strong",{parentName:"li"},"Google Code")," wwill turn Yellow while it waits for you to complete the authorization.",(0,n.kt)("br",{parentName:"li"}),(0,n.kt)("img",{alt:"SetupAuthWaiting",src:r(8369).Z,width:"588",height:"320"})),(0,n.kt)("li",{parentName:"ol"},"Setup will generate a code and place it in ",(0,n.kt)("strong",{parentName:"li"},"Google Code")," and copy it into the clipboard."),(0,n.kt)("li",{parentName:"ol"},"A browser will start up seeking permissions to your google account."),(0,n.kt)("li",{parentName:"ol"},"Paste the code into the form brought up in the web browser.",(0,n.kt)("br",{parentName:"li"}),(0,n.kt)("img",{alt:"GoogleEnterCode",src:r(2660).Z,width:"454",height:"507"})),(0,n.kt)("li",{parentName:"ol"},"Click through dialogs to give permissions."),(0,n.kt)("li",{parentName:"ol"},"Once permission is granted successfully return to setup"),(0,n.kt)("li",{parentName:"ol"},"The ",(0,n.kt)("strong",{parentName:"li"},"Google Code")," section will turn green indicating success.",(0,n.kt)("br",{parentName:"li"}),(0,n.kt)("img",{alt:"SetupAuthorized",src:r(7447).Z,width:"588",height:"320"}))),(0,n.kt)("h2",{id:"configure-busytime"},"Configure BusyTime"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"WiFi:")," WiFi name to connect to."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"WiFi Password:")," WiFi password to use."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"Calendar ID:")," Name/ID of the google calendar to use for showing BusyTime."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"Calendar Time Zone:")," Timezone of the calendar."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"Work Start Hour:")," Hour to start reporting BusyTime (24hour)."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"Work End Hour:")," Hour to stop reporting BusyTime (24hour)."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"Yellow Time:")," Number of minutes to show Yellow light before a BusyTime."),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"Work Days:")," Days of the week to check for BusyTime.")))}p.isMDXComponent=!0},2660:(e,t,r)=>{r.d(t,{Z:()=>o});const o=r.p+"assets/images/GoogleEnterCode-5e16fa5ce14c7f7fef0a3222ca56efce.png"},8369:(e,t,r)=>{r.d(t,{Z:()=>o});const o=r.p+"assets/images/SetupAuthWaiting-67af9ea3f7d304de63d89d537fb79efd.png"},7447:(e,t,r)=>{r.d(t,{Z:()=>o});const o=r.p+"assets/images/SetupAuthorized-427924d4b801bf4756eb855d9226d7be.png"},1232:(e,t,r)=>{r.d(t,{Z:()=>o});const o=r.p+"assets/images/SetupUnauthorized-4627c3613a1f7b61739bf231995262fa.png"}}]);