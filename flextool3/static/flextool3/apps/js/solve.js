(function(e){function t(t){for(var r,u,i=t[0],l=t[1],a=t[2],s=0,d=[];s<i.length;s++)u=i[s],Object.prototype.hasOwnProperty.call(o,u)&&o[u]&&d.push(o[u][0]),o[u]=0;for(r in l)Object.prototype.hasOwnProperty.call(l,r)&&(e[r]=l[r]);f&&f(t);while(d.length)d.shift()();return c.push.apply(c,a||[]),n()}function n(){for(var e,t=0;t<c.length;t++){for(var n=c[t],r=!0,i=1;i<n.length;i++){var l=n[i];0!==o[l]&&(r=!1)}r&&(c.splice(t--,1),e=u(u.s=n[0]))}return e}var r={},o={solve:0},c=[];function u(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.m=e,u.c=r,u.d=function(e,t,n){u.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},u.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,t){if(1&t&&(e=u(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)u.d(n,r,function(t){return e[t]}.bind(null,r));return n},u.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return u.d(t,"a",t),t},u.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},u.p="";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],l=i.push.bind(i);i.push=t,i=i.slice();for(var a=0;a<i.length;a++)t(i[a]);var f=l;c.push([2,"chunk-vendors"]),n()})({2:function(e,t,n){e.exports=n("fa4a")},9406:function(e,t,n){"use strict";n.d(t,"h",(function(){return u})),n.d(t,"f",(function(){return f})),n.d(t,"g",(function(){return i})),n.d(t,"b",(function(){return l})),n.d(t,"d",(function(){return a})),n.d(t,"e",(function(){return s})),n.d(t,"a",(function(){return d})),n.d(t,"c",(function(){return b}));var r=n("5530");n("ac1f"),n("1276"),n("498a"),n("e9c4"),n("d3b7"),n("99af");function o(e){var t=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var o=n[r].trim();if(o.substring(0,e.length+1)===e+"="){t=decodeURIComponent(o.substring(e.length+1));break}}return t}var c=o("csrftoken");function u(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":c,"Content-Type":"application/json"}}}function i(e){var t=u();return t["body"]=JSON.stringify({type:"project list?"}),fetch(e,t).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load project list: ".concat(e))}))}))}function l(e,t){var n=u();return n["body"]=JSON.stringify({type:"create project?",name:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create project: ".concat(e))}))}))}function a(e,t){var n=u();return n["body"]=JSON.stringify({type:"destroy project?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete project: ".concat(e))}))}))}function f(e,t,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},c=u();return c["body"]=JSON.stringify(Object(r["a"])({type:e,projectId:t},o)),fetch(n,c).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch ".concat(e,": ").concat(t))}))}))}function s(e,t){var n=u();return n.body=JSON.stringify({type:"execution list?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load solve list: ".concat(e))}))}))}function d(e,t){var n=u();return n.body=JSON.stringify({type:"create execution?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create solve: ".concat(e))}))}))}function b(e,t){var n=u();return n["body"]=JSON.stringify({type:"destroy execution?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete execution: ".concat(e))}))}))}},fa4a:function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("f2bf"),o=n("5333"),c=n("7a23"),u=Object(c["j"])("New solve");function i(e,t,n,r,o,i){var l=Object(c["G"])("execution-row"),a=Object(c["G"])("n-list-item"),f=Object(c["G"])("n-button"),s=Object(c["G"])("n-list");return Object(c["z"])(),Object(c["h"])(s,null,{footer:Object(c["N"])((function(){return[Object(c["k"])(f,{onClick:r.createSolve,loading:r.newSolveButtonBusy,disabled:r.newSolveButtonBusy},{default:Object(c["N"])((function(){return[u]})),_:1},8,["onClick","loading","disabled"])]})),default:Object(c["N"])((function(){return[(Object(c["z"])(!0),Object(c["i"])(c["b"],null,Object(c["E"])(r.executions,(function(e){return Object(c["z"])(),Object(c["h"])(a,{key:e.id},{default:Object(c["N"])((function(){return[Object(c["k"])(l,{onDestroyed:r.deleteExecution,"execution-id":e.id,"executions-url":n.executionsUrl,"results-url":"https://www.google.com"},null,8,["onDestroyed","execution-id","executions-url"])]})),_:2},1024)})),128))]})),_:1})}n("a9e3"),n("d3b7"),n("c740"),n("a434");var l=n("7317"),a=Object(c["j"])("Execute"),f=Object(c["j"])("Delete"),s=Object(c["j"])("View results");function d(e,t,n,r,o,u){var i=Object(c["G"])("n-h1"),l=Object(c["G"])("n-button"),d=Object(c["G"])("n-a"),b=Object(c["G"])("n-log");return Object(c["z"])(),Object(c["i"])(c["b"],null,[Object(c["k"])(i,null,{default:Object(c["N"])((function(){return[Object(c["j"])("Solve "+Object(c["H"])(n.executionId),1)]})),_:1}),Object(c["k"])(l,null,{default:Object(c["N"])((function(){return[a]})),_:1}),Object(c["k"])(l,{onClick:r.destroy,loading:r.busyDestroying,disabled:r.busyDestroying},{default:Object(c["N"])((function(){return[f]})),_:1},8,["onClick","loading","disabled"]),Object(c["k"])(d,{href:n.resultsUrl},{default:Object(c["N"])((function(){return[s]})),_:1},8,["href"]),Object(c["k"])(b,{rows:20})],64)}var b=n("9406"),j={props:{executionId:Number,executionsUrl:String,resultsUrl:String},emit:["destroyed:executionId"],setup:function(e,t){var n=Object(r["e"])(!1),o=Object(l["a"])();return{busyDestroying:n,destroy:function(){n.value=!0,Object(b["c"])(e.executionId,e.executionsUrl).then((function(e){t.emit("destroyed",e.id)})).catch((function(e){o.error(e.message)})).finally((function(){n.value=!1}))}}}},p=n("6b0d"),h=n.n(p);const O=h()(j,[["render",d]]);var v=O,y={props:{projectId:Number,executionsUrl:String},setup:function(e){var t=Object(r["e"])([]),n=Object(r["e"])(!1),o=Object(l["a"])();return Object(r["d"])((function(){Object(b["e"])(e.projectId,String(e.executionsUrl)).then((function(e){t.value=e.executions})).catch((function(e){o.error(e.message)}))})),{executions:t,newSolveButtonBusy:n,createSolve:function(){n.value=!0,Object(b["a"])(e.projectId,String(e.executionsUrl)).then((function(e){t.value.push(e.execution)})).catch((function(e){o.error(e.message)})).finally((function(){n.value=!1}))},deleteExecution:function(e){var n=t.value.findIndex((function(t){return t.id===e}));if(n<0)throw new Error("Execution id ".concat(e," not found while deleting execution."));t.value.splice(n,1)}}},components:{"execution-row":v}};const g=h()(y,[["render",i]]);var x=g,w=r["b"]({});w.use(o["a"]),w.component("solve-app",x),w.mount("#solve-app")}});