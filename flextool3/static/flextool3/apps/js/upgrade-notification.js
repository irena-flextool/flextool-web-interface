(function(e){function t(t){for(var r,a,c=t[0],i=t[1],l=t[2],f=0,d=[];f<c.length;f++)a=c[f],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&d.push(o[a][0]),o[a]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);p&&p(t);while(d.length)d.shift()();return u.push.apply(u,l||[]),n()}function n(){for(var e,t=0;t<u.length;t++){for(var n=u[t],r=!0,c=1;c<n.length;c++){var i=n[c];0!==o[i]&&(r=!1)}r&&(u.splice(t--,1),e=a(a.s=n[0]))}return e}var r={},o={"upgrade-notification":0},u=[];function a(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=r,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="";var c=window["webpackJsonp"]=window["webpackJsonp"]||[],i=c.push.bind(c);c.push=t,c=c.slice();for(var l=0;l<c.length;l++)t(c[l]);var p=i;u.push([7,"chunk-vendors"]),n()})({"4edd":function(e,t,n){"use strict";n.r(t);n("b2c9"),n("2ae8"),n("b75d"),n("ce9f");var r=n("a8ce"),o=n("937e"),u=n("649f"),a=Object(u["m"])("Reload"),c=Object(u["m"])(" the page to continue.");function i(e,t,n,r,o,i){var l=Object(u["N"])("n-p"),p=Object(u["N"])("n-button");return Object(u["G"])(),Object(u["k"])(u["b"],null,[Object(u["n"])(l,null,{default:Object(u["V"])((function(){return[Object(u["m"])("The "+Object(u["O"])(n.database)+" database has been upgraded and the old version has been backed up.",1)]})),_:1}),Object(u["n"])(l,null,{default:Object(u["V"])((function(){return[Object(u["n"])(p,{onClick:r.reload},{default:Object(u["V"])((function(){return[a]})),_:1},8,["onClick"]),c]})),_:1})],64)}var l={props:{database:{type:String,required:!0}},setup:function(){return{reload:function(){location.reload()}}}},p=n("e582"),f=n.n(p);const d=f()(l,[["render",i]]);var b=d,s=r["b"]({});s.use(o["a"]),s.component("upgrade-notification-app",b),s.mount("#upgrade-notification-app")},7:function(e,t,n){e.exports=n("4edd")}});