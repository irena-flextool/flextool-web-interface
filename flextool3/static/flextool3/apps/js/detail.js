(function(e){function t(t){for(var r,l,u=t[0],a=t[1],i=t[2],f=0,j=[];f<u.length;f++)l=u[f],Object.prototype.hasOwnProperty.call(c,l)&&c[l]&&j.push(c[l][0]),c[l]=0;for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r]);b&&b(t);while(j.length)j.shift()();return o.push.apply(o,i||[]),n()}function n(){for(var e,t=0;t<o.length;t++){for(var n=o[t],r=!0,u=1;u<n.length;u++){var a=n[u];0!==c[a]&&(r=!1)}r&&(o.splice(t--,1),e=l(l.s=n[0]))}return e}var r={},c={detail:0},o=[];function l(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,l),n.l=!0,n.exports}l.m=e,l.c=r,l.d=function(e,t,n){l.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},l.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},l.t=function(e,t){if(1&t&&(e=l(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(l.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)l.d(n,r,function(t){return e[t]}.bind(null,r));return n},l.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return l.d(t,"a",t),t},l.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},l.p="";var u=window["webpackJsonp"]=window["webpackJsonp"]||[],a=u.push.bind(u);u.push=t,u=u.slice();for(var i=0;i<u.length;i++)t(u[i]);var b=a;o.push([1,"chunk-vendors"]),n()})({1:function(e,t,n){e.exports=n("8bec")},"8bec":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("f2bf"),c=n("5333"),o=n("7a23"),l=Object(o["l"])("This is the navigation hub for the current FlexTool 3 project. Available actions:"),u=Object(o["l"])("Model editor"),a=Object(o["l"])(" lets you to define the project's model."),i=Object(o["l"])("Solve"),b=Object(o["l"])(" page allows you to define scenarios and solve the model."),f=Object(o["l"])("Results"),j=Object(o["l"])(" shows results of solved scenarios.");function p(e,t,n,r,c,p){var O=Object(o["K"])("page-path"),s=Object(o["K"])("n-p"),d=Object(o["K"])("n-a"),h=Object(o["K"])("n-space");return Object(o["D"])(),Object(o["j"])(o["b"],null,[Object(o["m"])(O,{path:[{name:"Projects",url:n.indexUrl}],"leaf-name":n.projectName},null,8,["path","leaf-name"]),Object(o["m"])(h,{vertical:""},{default:Object(o["R"])((function(){return[Object(o["m"])(s,null,{default:Object(o["R"])((function(){return[l]})),_:1}),Object(o["m"])(s,null,{default:Object(o["R"])((function(){return[Object(o["m"])(d,{href:n.editUrl},{default:Object(o["R"])((function(){return[u]})),_:1},8,["href"]),a]})),_:1}),Object(o["m"])(s,null,{default:Object(o["R"])((function(){return[Object(o["m"])(d,{href:n.solveUrl},{default:Object(o["R"])((function(){return[i]})),_:1},8,["href"]),b]})),_:1}),Object(o["m"])(s,null,{default:Object(o["R"])((function(){return[Object(o["m"])(d,{href:n.viewUrl},{default:Object(o["R"])((function(){return[f]})),_:1},8,["href"]),j]})),_:1})]})),_:1})],64)}var O=n("c46e"),s={props:{projectName:String,indexUrl:String,editUrl:String,solveUrl:String,viewUrl:String},components:{"page-path":O["a"]}},d=n("6b0d"),h=n.n(d);const v=h()(s,[["render",p]]);var m=v,g=r["b"]({});g.use(c["a"]),g.component("detail-app",m),g.mount("#detail-app")},c46e:function(e,t,n){"use strict";n("b0c0");var r=n("7a23");function c(e,t,n,c,o,l){var u=Object(r["K"])("n-breadcrumb-item"),a=Object(r["K"])("n-breadcrumb");return Object(r["D"])(),Object(r["h"])(a,null,{default:Object(r["R"])((function(){return[(Object(r["D"])(!0),Object(r["j"])(r["b"],null,Object(r["I"])(n.path,(function(e,t){return Object(r["D"])(),Object(r["h"])(u,{href:e.url,key:t},{default:Object(r["R"])((function(){return[Object(r["l"])(Object(r["L"])(e.name),1)]})),_:2},1032,["href"])})),128)),Object(r["m"])(u,null,{default:Object(r["R"])((function(){return[Object(r["l"])(Object(r["L"])(n.leafName),1)]})),_:1})]})),_:1})}var o={props:{path:Array,leafName:String}},l=n("6b0d"),u=n.n(l);const a=u()(o,[["render",c]]);t["a"]=a}});