(function(e){function t(t){for(var r,a,s=t[0],i=t[1],u=t[2],f=0,d=[];f<s.length;f++)a=s[f],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&d.push(o[a][0]),o[a]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);l&&l(t);while(d.length)d.shift()();return c.push.apply(c,u||[]),n()}function n(){for(var e,t=0;t<c.length;t++){for(var n=c[t],r=!0,s=1;s<n.length;s++){var i=n[s];0!==o[i]&&(r=!1)}r&&(c.splice(t--,1),e=a(a.s=n[0]))}return e}var r={},o={edit:0},c=[];function a(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=r,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="";var s=window["webpackJsonp"]=window["webpackJsonp"]||[],i=s.push.bind(s);s.push=t,s=s.slice();for(var u=0;u<s.length;u++)t(s[u]);var l=i;c.push([1,"chunk-vendors"]),n()})({1:function(e,t,n){e.exports=n("8fc9")},"8fc9":function(e,t,n){"use strict";n.r(t);for(var r=n("b85c"),o=(n("e260"),n("e6cf"),n("cca6"),n("a79d"),n("ac1f"),n("1276"),n("e9c4"),n("d3b7"),n("ddb0"),n("f2bf")),c=n("9406"),a=o["a"]({data:function(){return{objectClasses:[],objects:[],objectParameterValues:[]}},methods:{objectsForClass:function(e){var t,n=Array(),o=Object(r["a"])(this.objects);try{for(o.s();!(t=o.n()).done;){var c=t.value;c.class_id===e.id&&n.push(c)}}catch(a){o.e(a)}finally{o.f()}return n},valuesForObject:function(e){if(void 0==e)return console.log("valuesForObject: object is undefined"),[];if(!this.objects)return[];var t,n=Array(),o=Object(r["a"])(this.objectParameterValues);try{for(o.s();!(t=o.n()).done;){var c=t.value;c.object_id==this.objects[0].id&&n.push(c)}}catch(a){o.e(a)}finally{o.f()}return n}}}).mount("#editor-app"),s=document.querySelectorAll(".caret"),i=0;i<s.length;i++)s[i].addEventListener("click",(function(){this.parentElement.querySelector(".nested").classList.toggle("active"),this.classList.toggle("caret-down")}));var u=c["a"](),l=c["b"](),f=window.location.pathname.split("/"),d=parseInt(f[f.length-3]),p=Object.create(l);p["body"]=JSON.stringify({type:"object classes?",projectId:d}),fetch(u.modelUrl,p).then((function(e){if(!e.ok)throw new Error("Network response was not OK.");e.json().then((function(e){a.objectClasses=e.classes}))})),p["body"]=JSON.stringify({type:"objects?",projectId:d}),fetch(u.modelUrl,p).then((function(e){if(!e.ok)throw new Error("Network response was not OK.");e.json().then((function(e){a.objects=e.objects}))})),p["body"]=JSON.stringify({type:"object parameter values?",projectId:d}),fetch(u.modelUrl,p).then((function(e){if(!e.ok)throw new Error("Network response was not OK.");e.json().then((function(e){a.objectParameterValues=e.values}))}))},9406:function(e,t,n){"use strict";n.d(t,"a",(function(){return r})),n.d(t,"b",(function(){return a}));n("ac1f"),n("1276"),n("498a");function r(){var e=document.querySelector("#script-data");return JSON.parse(e.textContent)}function o(e){var t=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var o=n[r].trim();if(o.substring(0,e.length+1)===e+"="){t=decodeURIComponent(o.substring(e.length+1));break}}return t}var c=o("csrftoken");function a(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":c,"Content-Type":"application/json"}}}}});