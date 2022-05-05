(function(t){function e(e){for(var r,u,i=e[0],a=e[1],f=e[2],j=0,d=[];j<i.length;j++)u=i[j],Object.prototype.hasOwnProperty.call(o,u)&&o[u]&&d.push(o[u][0]),o[u]=0;for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(t[r]=a[r]);l&&l(e);while(d.length)d.shift()();return c.push.apply(c,f||[]),n()}function n(){for(var t,e=0;e<c.length;e++){for(var n=c[e],r=!0,i=1;i<n.length;i++){var a=n[i];0!==o[a]&&(r=!1)}r&&(c.splice(e--,1),t=u(u.s=n[0]))}return t}var r={},o={index:0},c=[];function u(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.m=t,u.c=r,u.d=function(t,e,n){u.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},u.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},u.t=function(t,e){if(1&e&&(t=u(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)u.d(n,r,function(e){return t[e]}.bind(null,r));return n},u.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return u.d(e,"a",e),e},u.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},u.p="";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],a=i.push.bind(i);i.push=e,i=i.slice();for(var f=0;f<i.length;f++)e(i[f]);var l=a;c.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("b635")},"315d":function(t,e,n){"use strict";n.d(e,"h",(function(){return l})),n.d(e,"b",(function(){return j})),n.d(e,"k",(function(){return i})),n.d(e,"d",(function(){return a})),n.d(e,"f",(function(){return f})),n.d(e,"j",(function(){return d})),n.d(e,"c",(function(){return b})),n.d(e,"e",(function(){return s})),n.d(e,"g",(function(){return p})),n.d(e,"a",(function(){return O})),n.d(e,"i",(function(){return h}));var r=n("5530");n("ac1f"),n("1276"),n("498a"),n("e9c4"),n("d3b7"),n("d9e2"),n("99af");function o(t){var e=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var o=n[r].trim();if(o.substring(0,t.length+1)===t+"="){e=decodeURIComponent(o.substring(t.length+1));break}}return e}var c=o("csrftoken");function u(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":c,"Content-Type":"application/json"}}}function i(t){var e=u();return e["body"]=JSON.stringify({type:"project list?"}),fetch(t,e).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to load project list: ".concat(t))}))}))}function a(t,e){var n=u();return n["body"]=JSON.stringify({type:"create project?",name:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to create project: ".concat(t))}))}))}function f(t,e){var n=u();return n["body"]=JSON.stringify({type:"destroy project?",id:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to delete project: ".concat(t))}))}))}function l(t,e,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},c=u();return c["body"]=JSON.stringify(Object(r["a"])({type:t,projectId:e},o)),fetch(n,c).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch ".concat(t,": ").concat(e))}))}))}function j(t,e,n,o){var c=u();return c.body=JSON.stringify(Object(r["a"])({type:"commit",projectId:n,message:e},t)),fetch(o,c).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error(t)}))}))}function d(t,e){var n=u();return n.body=JSON.stringify({type:"execution list?",projectId:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to load run list: ".concat(t))}))}))}function b(t,e){var n=u();return n.body=JSON.stringify({type:"create execution?",projectId:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to create run: ".concat(t))}))}))}function s(t,e){var n=u();return n["body"]=JSON.stringify({type:"destroy execution?",id:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to delete execution: ".concat(t))}))}))}function p(t,e){var n=u();return n["body"]=JSON.stringify({type:"execute?",id:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to execute: ".concat(t))}))}))}function O(t,e){var n=u();return n["body"]=JSON.stringify({type:"abort?",id:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to abort execution: ".concat(t))}))}))}function h(t,e){var n=u();return n["body"]=JSON.stringify({type:"briefing?",id:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch execution status: ".concat(t))}))}))}},b635:function(t,e,n){"use strict";n.r(e);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("f2bf"),o=n("5333"),c=n("7a23"),u={id:"index-app"};function i(t,e,n,r,o,i){var a=Object(c["L"])("page-path"),f=Object(c["L"])("project-list");return Object(c["E"])(),Object(c["j"])(c["b"],null,[Object(c["m"])(a,{"leaf-name":"Projects"}),Object(c["k"])("div",u,[Object(c["m"])(f,{"projects-url":n.projectsUrl},null,8,["projects-url"])])],64)}var a=n("c46e");n("b0c0");function f(t,e,n,r,o,u){var i=Object(c["L"])("project-row"),a=Object(c["L"])("n-list-item"),f=Object(c["L"])("new-project-row"),l=Object(c["L"])("n-list");return Object(c["E"])(),Object(c["h"])(l,null,{footer:Object(c["S"])((function(){return[Object(c["m"])(f,{onCreated:r.appendProject,"projects-url":n.projectsUrl},null,8,["onCreated","projects-url"])]})),default:Object(c["S"])((function(){return[(Object(c["E"])(!0),Object(c["j"])(c["b"],null,Object(c["J"])(r.projects,(function(t){return Object(c["E"])(),Object(c["h"])(a,{key:t.id},{default:Object(c["S"])((function(){return[Object(c["m"])(i,{onDestroyed:r.deleteProject,"project-id":t.id,"project-name":t.name,url:t.url,"projects-url":n.projectsUrl},null,8,["onDestroyed","project-id","project-name","url","projects-url"])]})),_:2},1024)})),128))]})),_:1})}n("c740"),n("d9e2"),n("a434");var l=n("315d"),j=Object(c["l"])("Create");function d(t,e,n,r,o,u){var i=Object(c["L"])("n-input"),a=Object(c["L"])("n-button"),f=Object(c["L"])("n-space");return Object(c["E"])(),Object(c["h"])(f,{justify:"space-between"},{default:Object(c["S"])((function(){return[Object(c["m"])(i,{type:"text",placeholder:"Enter project name...",clearable:"",maxlength:"60",onInput:r.updateProjectName,value:r.projectName,disabled:r.busy},null,8,["onInput","value","disabled"]),Object(c["m"])(a,{onClick:r.create,loading:r.busy,disabled:r.buttonDisabled},{default:Object(c["S"])((function(){return[j]})),_:1},8,["onClick","loading","disabled"])]})),_:1})}n("d3b7");var b=n("7317"),s={props:{projectsUrl:String},emit:["created:project"],setup:function(t,e){var n=e.emit,o=Object(r["e"])(""),c=Object(r["e"])(!1),u=Object(b["a"])(),i=Object(r["a"])((function(){return!(0!==o.value.length&&!c.value)}));return{buttonDisabled:i,projectName:o,busy:c,updateProjectName:function(t){o.value=t},create:function(){c.value=!0,Object(l["d"])(o.value,String(t.projectsUrl)).then((function(t){n("created",t.project),o.value=""})).catch((function(t){u.error(t.message)})).finally((function(){c.value=!1}))}}}},p=n("6b0d"),O=n.n(p);const h=O()(s,[["render",d]]);var y=h,v=Object(c["l"])("Delete");function m(t,e,n,r,o,u){var i=Object(c["L"])("n-a"),a=Object(c["L"])("n-button"),f=Object(c["L"])("n-space");return Object(c["E"])(),Object(c["h"])(f,{justify:"space-between",align:"baseline"},{default:Object(c["S"])((function(){return[r.busy?(Object(c["E"])(),Object(c["h"])(i,{key:1},{default:Object(c["S"])((function(){return[Object(c["l"])(Object(c["M"])(n.projectName),1)]})),_:1})):(Object(c["E"])(),Object(c["h"])(i,{key:0,href:n.url},{default:Object(c["S"])((function(){return[Object(c["l"])(Object(c["M"])(n.projectName),1)]})),_:1},8,["href"])),Object(c["m"])(a,{onClick:r.destroy,loading:r.busy,disabled:r.busy},{default:Object(c["S"])((function(){return[v]})),_:1},8,["onClick","loading","disabled"])]})),_:1})}n("a9e3");var g={props:{projectId:Number,projectName:String,url:String,projectsUrl:String},emits:["destroyed"],setup:function(t,e){var n=Object(r["e"])(!1),o=Object(b["a"])();return{busy:n,destroy:function(){n.value=!0,Object(l["f"])(t.projectId,String(t.projectsUrl)).then((function(t){e.emit("destroyed",t.id)})).catch((function(t){o.error(t.message)})).finally((function(){n.value=!1}))}}}};const w=O()(g,[["render",m]]);var S=w,x={props:{projectsUrl:String},setup:function(t){var e=Object(r["e"])([]),n=Object(r["e"])(!1);return Object(r["d"])((function(){Object(l["k"])(String(t.projectsUrl)).then((function(t){e.value=t.projects}))})),{projects:e,newProjectRowBusy:n,appendProject:function(t){e.value.push(t)},deleteProject:function(t){var n=e.value.findIndex((function(e){return e.id===t}));if(n<0)throw new Error("Project id ".concat(t," not found while deleting project."));e.value.splice(n,1)}}},components:{"new-project-row":y,"project-row":S}};const k=O()(x,[["render",f]]);var E=k,N={props:{projectsUrl:String},components:{"page-path":a["a"],"project-list":E}};const P=O()(N,[["render",i]]);var _=P,J=r["b"]({});J.use(o["a"]),J.component("index-app",_),J.mount("#index-app")},c46e:function(t,e,n){"use strict";n("b0c0");var r=n("7a23");function o(t,e,n,o,c,u){var i=Object(r["L"])("n-breadcrumb-item"),a=Object(r["L"])("n-breadcrumb");return Object(r["E"])(),Object(r["h"])(a,null,{default:Object(r["S"])((function(){return[(Object(r["E"])(!0),Object(r["j"])(r["b"],null,Object(r["J"])(n.path,(function(t,e){return Object(r["E"])(),Object(r["h"])(i,{href:t.url,key:e},{default:Object(r["S"])((function(){return[Object(r["l"])(Object(r["M"])(t.name),1)]})),_:2},1032,["href"])})),128)),Object(r["m"])(i,null,{default:Object(r["S"])((function(){return[Object(r["l"])(Object(r["M"])(n.leafName),1)]})),_:1})]})),_:1})}var c={props:{path:Array,leafName:String}},u=n("6b0d"),i=n.n(u);const a=i()(c,[["render",o]]);e["a"]=a}});