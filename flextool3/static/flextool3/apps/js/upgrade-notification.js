(function(e){function t(t){for(var r,a,c=t[0],i=t[1],l=t[2],p=0,d=[];p<c.length;p++)a=c[p],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&d.push(o[a][0]),o[a]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);f&&f(t);while(d.length)d.shift()();return u.push.apply(u,l||[]),n()}function n(){for(var e,t=0;t<u.length;t++){for(var n=u[t],r=!0,c=1;c<n.length;c++){var i=n[c];0!==o[i]&&(r=!1)}r&&(u.splice(t--,1),e=a(a.s=n[0]))}return e}var r={},o={"upgrade-notification":0},u=[];function a(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=r,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],i=c.push.bind(c);c.push=t,c=c.slice();for(var l=0;l<c.length;l++)t(c[l]);var f=i;u.push([3,"chunk-vendors"]),n()})({3:function(e,t,n){e.exports=n("4edd")},"4edd":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("f2bf"),o=n("5333"),u=n("7a23"),a=Object(u["j"])("The model database has been upgraded and the old version has been backed up."),c=Object(u["j"])("Continue to Model editor");function i(e,t,n,r,o,i){var l=Object(u["G"])("n-p"),f=Object(u["G"])("n-a");return Object(u["z"])(),Object(u["i"])(u["b"],null,[Object(u["k"])(l,null,{default:Object(u["N"])((function(){return[a]})),_:1}),Object(u["k"])(l,null,{default:Object(u["N"])((function(){return[Object(u["k"])(f,{href:n.editUrl},{default:Object(u["N"])((function(){return[c]})),_:1},8,["href"])]})),_:1})],64)}var l={props:{editUrl:String}},f=n("6b0d"),p=n.n(f);const d=p()(l,[["render",i]]);var b=d,s=r["b"]({});s.use(o["a"]),s.component("upgrade-notification-app",b),s.mount("#upgrade-notification-app")}});