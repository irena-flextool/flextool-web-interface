(function(e){function t(t){for(var r,u,i=t[0],a=t[1],l=t[2],f=0,d=[];f<i.length;f++)u=i[f],Object.prototype.hasOwnProperty.call(o,u)&&o[u]&&d.push(o[u][0]),o[u]=0;for(r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r]);s&&s(t);while(d.length)d.shift()();return c.push.apply(c,l||[]),n()}function n(){for(var e,t=0;t<c.length;t++){for(var n=c[t],r=!0,i=1;i<n.length;i++){var a=n[i];0!==o[a]&&(r=!1)}r&&(c.splice(t--,1),e=u(u.s=n[0]))}return e}var r={},o={solve:0},c=[];function u(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.m=e,u.c=r,u.d=function(e,t,n){u.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},u.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},u.t=function(e,t){if(1&t&&(e=u(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)u.d(n,r,function(t){return e[t]}.bind(null,r));return n},u.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return u.d(t,"a",t),t},u.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},u.p="";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],a=i.push.bind(i);i.push=t,i=i.slice();for(var l=0;l<i.length;l++)t(i[l]);var s=a;c.push([5,"chunk-vendors"]),n()})({"315d":function(e,t,n){"use strict";n.d(t,"l",(function(){return s})),n.d(t,"b",(function(){return f})),n.d(t,"m",(function(){return i})),n.d(t,"d",(function(){return a})),n.d(t,"f",(function(){return l})),n.d(t,"h",(function(){return d})),n.d(t,"c",(function(){return b})),n.d(t,"e",(function(){return j})),n.d(t,"g",(function(){return O})),n.d(t,"a",(function(){return h})),n.d(t,"i",(function(){return y})),n.d(t,"k",(function(){return p})),n.d(t,"j",(function(){return v}));var r=n("5530");n("ac1f"),n("1276"),n("498a"),n("e9c4"),n("d3b7"),n("d9e2"),n("99af");function o(e){var t=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var o=n[r].trim();if(o.substring(0,e.length+1)===e+"="){t=decodeURIComponent(o.substring(e.length+1));break}}return t}var c=o("csrftoken");function u(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":c,"Content-Type":"application/json"}}}function i(e){var t=u();return t["body"]=JSON.stringify({type:"project list?"}),fetch(e,t).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load project list: ".concat(e))}))}))}function a(e,t){var n=u();return n["body"]=JSON.stringify({type:"create project?",name:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create project: ".concat(e))}))}))}function l(e,t){var n=u();return n["body"]=JSON.stringify({type:"destroy project?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete project: ".concat(e))}))}))}function s(e,t,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},c=u();return c["body"]=JSON.stringify(Object(r["a"])({type:e,projectId:t},o)),fetch(n,c).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch ".concat(e,": ").concat(t))}))}))}function f(e,t,n,o){var c=u();return c.body=JSON.stringify(Object(r["a"])({type:"commit",projectId:n,message:t},e)),fetch(o,c).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error(e)}))}))}function d(e,t){var n=u();return n.body=JSON.stringify({type:"execution list?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load solve list: ".concat(e))}))}))}function b(e,t){var n=u();return n.body=JSON.stringify({type:"create execution?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create solve: ".concat(e))}))}))}function j(e,t){var n=u();return n["body"]=JSON.stringify({type:"destroy execution?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete execution: ".concat(e))}))}))}function O(e,t){var n=u();return n["body"]=JSON.stringify({type:"execute?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execute: ".concat(e))}))}))}function h(e,t){var n=u();return n["body"]=JSON.stringify({type:"abort?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to abort execution: ".concat(e))}))}))}function p(e,t){var n=u();return n["body"]=JSON.stringify({type:"updates?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execution updates: ".concat(e))}))}))}function y(e,t){var n=u();return n["body"]=JSON.stringify({type:"log?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to get log: ".concat(e))}))}))}function v(e,t){var n=u();return n["body"]=JSON.stringify({type:"status?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to get execution status: ".concat(e))}))}))}},5:function(e,t,n){e.exports=n("fa4a")},c46e:function(e,t,n){"use strict";n("b0c0");var r=n("7a23");function o(e,t,n,o,c,u){var i=Object(r["K"])("n-breadcrumb-item"),a=Object(r["K"])("n-breadcrumb");return Object(r["D"])(),Object(r["h"])(a,null,{default:Object(r["R"])((function(){return[(Object(r["D"])(!0),Object(r["j"])(r["b"],null,Object(r["I"])(n.path,(function(e,t){return Object(r["D"])(),Object(r["h"])(i,{href:e.url,key:t},{default:Object(r["R"])((function(){return[Object(r["l"])(Object(r["L"])(e.name),1)]})),_:2},1032,["href"])})),128)),Object(r["m"])(i,null,{default:Object(r["R"])((function(){return[Object(r["l"])(Object(r["L"])(n.leafName),1)]})),_:1})]})),_:1})}var c={props:{path:Array,leafName:String}},u=n("6b0d"),i=n.n(u);const a=i()(c,[["render",o]]);t["a"]=a},fa4a:function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("f2bf"),o=n("5333"),c=n("7a23"),u=Object(c["l"])("New solve");function i(e,t,n,r,o,i){var a=Object(c["K"])("page-path"),l=Object(c["K"])("execution-row"),s=Object(c["K"])("n-list-item"),f=Object(c["K"])("n-button"),d=Object(c["K"])("n-list");return Object(c["D"])(),Object(c["j"])(c["b"],null,[Object(c["m"])(a,{path:[{name:"Projects",url:n.indexUrl},{name:n.projectName,url:n.projectUrl}],"leaf-name":"Solve"},null,8,["path"]),Object(c["m"])(d,null,{footer:Object(c["R"])((function(){return[Object(c["m"])(f,{onClick:r.createSolve,loading:r.newSolveButtonBusy,disabled:r.newSolveButtonBusy},{default:Object(c["R"])((function(){return[u]})),_:1},8,["onClick","loading","disabled"])]})),default:Object(c["R"])((function(){return[(Object(c["D"])(!0),Object(c["j"])(c["b"],null,Object(c["I"])(r.executions,(function(e){return Object(c["D"])(),Object(c["h"])(s,{key:e.id},{default:Object(c["R"])((function(){return[Object(c["m"])(l,{onDestroyed:r.deleteExecution,"execution-id":e.id,"executions-url":n.executionsUrl,"results-url":"https://www.google.com"},null,8,["onDestroyed","execution-id","executions-url"])]})),_:2},1024)})),128))]})),_:1})],64)}n("a9e3"),n("d3b7"),n("c740"),n("d9e2"),n("a434");var a=n("7317"),l=n("c46e"),s=Object(c["l"])("Execute"),f=Object(c["l"])("Abort"),d=Object(c["l"])("Delete"),b=Object(c["l"])("View results");function j(e,t,n,r,o,u){var i=Object(c["K"])("n-h1"),a=Object(c["K"])("n-p"),l=Object(c["K"])("n-button"),j=Object(c["K"])("n-a"),O=Object(c["K"])("n-space"),h=Object(c["K"])("n-log");return Object(c["D"])(),Object(c["h"])(O,{vertical:""},{default:Object(c["R"])((function(){return[Object(c["m"])(i,null,{default:Object(c["R"])((function(){return[Object(c["l"])("Solve "+Object(c["L"])(n.executionId),1)]})),_:1}),Object(c["m"])(a,null,{default:Object(c["R"])((function(){return[Object(c["l"])(Object(c["L"])(r.status),1)]})),_:1}),Object(c["m"])(O,null,{default:Object(c["R"])((function(){return[Object(c["m"])(l,{onClick:r.execute,loading:r.busyExecuting,disabled:r.busyDestroying||r.busyExecuting},{default:Object(c["R"])((function(){return[s]})),_:1},8,["onClick","loading","disabled"]),Object(c["m"])(l,{onClick:r.abort,loading:r.busyAborting,disabled:!r.busyExecuting||r.busyAborting},{default:Object(c["R"])((function(){return[f]})),_:1},8,["onClick","loading","disabled"]),Object(c["m"])(l,{onClick:r.destroy,loading:r.busyDestroying,disabled:r.busyDestroying||r.busyExecuting},{default:Object(c["R"])((function(){return[d]})),_:1},8,["onClick","loading","disabled"]),Object(c["m"])(j,{href:n.resultsUrl},{default:Object(c["R"])((function(){return[b]})),_:1},8,["href"])]})),_:1}),Object(c["m"])(h,{lines:r.logLines,rows:20},null,8,["lines"])]})),_:1})}var O=n("2909"),h=n("315d");function p(e){switch(e){case"YS":return"Click 'Execute' to start.";case"OK":return"Solved successfully.";case"RU":return"In progress...";case"ER":return"Error.";case"AB":return"Aborted. Click 'Execute' to try again.";default:return"In unknown state."}}function y(e,t,n,r,o,c,u){var i=window.setInterval((function(){Object(h["k"])(e,t).then((function(e){var t,u=e.updates;"newLogLines"in u&&(t=n.value).push.apply(t,Object(O["a"])(u.newLogLines));"newStatus"in u&&(r.value=p(u.newStatus),o.value=!1,c.value=!1,window.clearInterval(i))})).catch((function(e){window.clearInterval(i),o.value=!1,c.value=!1,u.error(e.message)}))}),500)}var v={props:{executionId:Number,executionsUrl:String,resultsUrl:String},emits:["destroyed"],setup:function(e,t){var n=Object(r["e"])(""),o=Object(r["e"])(!1),c=Object(r["e"])(!1),u=Object(r["e"])(!1),i=Object(r["e"])([]),l=Object(a["a"])();return Object(r["d"])((function(){Object(h["i"])(e.executionId,e.executionsUrl).then((function(e){i.value=e.log})).catch((function(e){l.error(e.message)})),Object(h["j"])(e.executionId,e.executionsUrl).then((function(t){n.value=p(t.status),"RU"===t.status&&(o.value=!0,y(e.executionId,e.executionsUrl,i,n,o,c,l))})).catch((function(e){n.value="Failed to fetch status.",l.error(e.message)}))})),{status:n,busyExecuting:o,busyAborting:c,busyDestroying:u,logLines:i,execute:function(){o.value=!0,i.value.length=0,n.value=p("RU"),Object(h["g"])(e.executionId,e.executionsUrl).then((function(){y(e.executionId,e.executionsUrl,i,n,o,c,l)})).catch((function(e){l.error(e.message)}))},abort:function(){c.value=!0,Object(h["a"])(e.executionId,e.executionsUrl).catch((function(e){l.error(e.message)}))},destroy:function(){u.value=!0,Object(h["e"])(e.executionId,e.executionsUrl).then((function(e){t.emit("destroyed",e.id)})).catch((function(e){l.error(e.message)})).finally((function(){u.value=!1}))}}}},g=n("6b0d"),x=n.n(g);const w=x()(v,[["render",j]]);var m=w,S={props:{indexUrl:String,projectUrl:String,projectName:String,projectId:Number,executionsUrl:String},setup:function(e){var t=Object(r["e"])([]),n=Object(r["e"])(!1),o=Object(a["a"])();return Object(r["d"])((function(){Object(h["h"])(e.projectId,String(e.executionsUrl)).then((function(e){t.value=e.executions})).catch((function(e){o.error(e.message)}))})),{executions:t,newSolveButtonBusy:n,createSolve:function(){n.value=!0,Object(h["c"])(e.projectId,String(e.executionsUrl)).then((function(e){t.value.push(e.execution)})).catch((function(e){o.error(e.message)})).finally((function(){n.value=!1}))},deleteExecution:function(e){var n=t.value.findIndex((function(t){return t.id===e}));if(n<0)throw new Error("Execution id ".concat(e," not found while deleting execution."));t.value.splice(n,1)}}},components:{"page-path":l["a"],"execution-row":m}};const k=x()(S,[["render",i]]);var E=k,I=r["b"]({});I.use(o["a"]),I.component("solve-app",E),I.mount("#solve-app")}});