(function(t){function e(e){for(var r,u,i=e[0],l=e[1],a=e[2],f=0,s=[];f<i.length;f++)u=i[f],Object.prototype.hasOwnProperty.call(o,u)&&o[u]&&s.push(o[u][0]),o[u]=0;for(r in l)Object.prototype.hasOwnProperty.call(l,r)&&(t[r]=l[r]);d&&d(e);while(s.length)s.shift()();return c.push.apply(c,a||[]),n()}function n(){for(var t,e=0;e<c.length;e++){for(var n=c[e],r=!0,i=1;i<n.length;i++){var l=n[i];0!==o[l]&&(r=!1)}r&&(c.splice(e--,1),t=u(u.s=n[0]))}return t}var r={},o={index:0},c=[];function u(e){if(r[e])return r[e].exports;var n=r[e]={i:e,l:!1,exports:{}};return t[e].call(n.exports,n,n.exports,u),n.l=!0,n.exports}u.m=t,u.c=r,u.d=function(t,e,n){u.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},u.r=function(t){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},u.t=function(t,e){if(1&e&&(t=u(t)),8&e)return t;if(4&e&&"object"===typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(u.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)u.d(n,r,function(e){return t[e]}.bind(null,r));return n},u.n=function(t){var e=t&&t.__esModule?function(){return t["default"]}:function(){return t};return u.d(e,"a",e),e},u.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},u.p="";var i=window["webpackJsonp"]=window["webpackJsonp"]||[],l=i.push.bind(i);i.push=e,i=i.slice();for(var a=0;a<i.length;a++)e(i[a]);var d=l;c.push([0,"chunk-vendors"]),n()})({0:function(t,e,n){t.exports=n("b635")},2225:function(t,e,n){"use strict";n("810a")},"315d":function(t,e,n){"use strict";n.d(e,"e",(function(){return c})),n.d(e,"j",(function(){return d})),n.d(e,"c",(function(){return f})),n.d(e,"o",(function(){return i})),n.d(e,"d",(function(){return l})),n.d(e,"f",(function(){return a})),n.d(e,"i",(function(){return s})),n.d(e,"h",(function(){return j})),n.d(e,"a",(function(){return b})),n.d(e,"m",(function(){return p})),n.d(e,"l",(function(){return h})),n.d(e,"q",(function(){return O})),n.d(e,"n",(function(){return y})),n.d(e,"p",(function(){return g})),n.d(e,"g",(function(){return v})),n.d(e,"k",(function(){return m})),n.d(e,"b",(function(){return w}));var r=n("0312");n("ca00"),n("8261"),n("0151"),n("4254"),n("4f18"),n("dad8"),n("b2a6");function o(t){var e=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var o=n[r].trim();if(o.substring(0,t.length+1)===t+"="){e=decodeURIComponent(o.substring(t.length+1));break}}return e}var c=o("csrftoken");function u(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":c,"Content-Type":"application/json"}}}function i(t){var e=u();return e["body"]=JSON.stringify({type:"project list?"}),fetch(t,e).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to load project list: ".concat(t))}))}))}function l(t,e){var n=u();return n["body"]=JSON.stringify({type:"create project?",name:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to create project: ".concat(t))}))}))}function a(t,e){var n=u();return n["body"]=JSON.stringify({type:"destroy project?",id:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to delete project: ".concat(t))}))}))}function d(t,e,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},c=u();return c["body"]=JSON.stringify(Object(r["a"])({type:t,projectId:e},o)),fetch(n,c).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch ".concat(t,": ").concat(e))}))}))}function f(t,e,n,o){var c=u();return c.body=JSON.stringify(Object(r["a"])({type:"commit",projectId:n,message:e},t)),fetch(o,c).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error(t)}))}))}function s(t,e){var n=u();return n.body=JSON.stringify({type:"current execution?",projectId:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch current run: ".concat(t))}))}))}function j(t,e,n){var r=u();return r["body"]=JSON.stringify({type:"execute?",projectId:t,scenarios:n}),fetch(e,r).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to execute: ".concat(t))}))}))}function b(t,e){var n=u();return n["body"]=JSON.stringify({type:"abort?",projectId:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to abort execution: ".concat(t))}))}))}function p(t,e){var n=u();return n["body"]=JSON.stringify({type:"briefing?",projectId:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch execution status: ".concat(t))}))}))}function O(t,e,n){var r=u();return r.body=JSON.stringify({type:"summary?",projectId:t,scenarioExecutionId:n}),fetch(e,r).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to load summary: ".concat(t))}))}))}function y(t,e,n){var r=u();return r.body=JSON.stringify({type:"output directory?",projectId:t,scenarioExecutionId:n}),fetch(e,r).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to load output directory path: ".concat(t))}))}))}function h(t,e){var n=u();return n.body=JSON.stringify({type:"scenario list?",projectId:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to load scenarios: ".concat(t))}))}))}function g(t,e,n){var r=u();return r.body=JSON.stringify({type:"result alternative?",projectId:t,scenarioExecutionId:n}),fetch(e,r).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch result alternative: ".concat(t))}))}))}function v(t,e,n){var r=u();return r.body=JSON.stringify({type:"destroy execution?",projectId:t,scenarioExecutionId:n}),fetch(e,r).then((function(t){if(!t.ok)return t.text().then((function(t){throw new Error("Failed to destroy scenario execution: ".concat(t))}))}))}function m(t,e){var n=u();return n["body"]=JSON.stringify({type:"example list?",projectId:t}),fetch(e,n).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to load example list: ".concat(t))}))}))}function w(t,e,n){var r=u();return r["body"]=JSON.stringify({type:"add to model",name:n,projectId:t}),fetch(e,r).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to add example to model: ".concat(t))}))}))}},5372:function(t,e,n){"use strict";n("d55c")},"810a":function(t,e,n){},9973:function(t,e,n){"use strict";n("a01d");var r=n("649f"),o={class:"page-content"},c={class:"page-content"};function u(t,e,n,u,i,l){var a=Object(r["N"])("navigation-menu"),d=Object(r["N"])("n-card"),f=Object(r["N"])("n-layout-header"),s=Object(r["N"])("n-layout");return Object(r["G"])(),Object(r["i"])(s,{position:"absolute"},{default:Object(r["V"])((function(){return[Object(r["n"])(f,null,{default:Object(r["V"])((function(){return[Object(r["n"])(d,{size:"small"},{default:Object(r["V"])((function(){return[Object(r["n"])(a,{current:n.name,"index-url":n.indexUrl,"project-url":n.projectUrl,"edit-url":n.editUrl,"run-url":n.runUrl,"results-url":n.resultsUrl,"logout-url":n.logoutUrl,"logo-url":n.logoUrl},null,8,["current","index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])]})),_:1}),Object(r["l"])("div",o,[Object(r["M"])(t.$slots,"header")])]})),_:3}),Object(r["l"])("div",c,[Object(r["M"])(t.$slots,"default")])]})),_:3})}var i=Object(r["m"])("User guide"),l=Object(r["m"])(" Log out ");function a(t,e,n,o,c,u){var a=Object(r["N"])("n-image"),d=Object(r["N"])("n-menu"),f=Object(r["N"])("n-space"),s=Object(r["N"])("n-a"),j=Object(r["N"])("n-divider"),b=Object(r["N"])("n-button");return Object(r["G"])(),Object(r["i"])(f,{justify:"space-between",align:"baseline"},{default:Object(r["V"])((function(){return[Object(r["n"])(f,{align:"start"},{default:Object(r["V"])((function(){return[Object(r["n"])(a,{src:n.logoUrl,alt:"FlexTool",width:90,"preview-disabled":""},null,8,["src"]),Object(r["n"])(d,{"default-value":n.current,mode:"horizontal",options:o.links},null,8,["default-value","options"])]})),_:1}),Object(r["n"])(f,{align:"baseline"},{default:Object(r["V"])((function(){return[Object(r["n"])(s,{href:"https://irena-flextool.github.io/flextool/"},{default:Object(r["V"])((function(){return[i]})),_:1}),Object(r["n"])(j,{vertical:""}),Object(r["n"])(b,{onClick:o.logout},{default:Object(r["V"])((function(){return[l]})),_:1},8,["onClick"])]})),_:1})]})),_:1})}var d=n("a8ce"),f=n("d70b");function s(t,e){return function(){return Object(d["c"])(f["a"],{href:e},(function(){return t}))}}function j(t){var e={Projects:t.indexUrl,"Manage project":t.projectUrl,"Edit model":t.editUrl,Run:t.runUrl,Results:t.resultsUrl},n=[];for(var r in e){var o=e[r],c=null!==o,u=c?s(r,o):r;n.push({label:u,key:r,disabled:!c})}return n}var b={props:{current:{type:String,required:!0},indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!1,default:null},editUrl:{type:String,required:!1,default:null},runUrl:{type:String,required:!1,default:null},resultsUrl:{type:String,required:!1,default:null},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},setup:function(t){var e=j(t),n=Object(d["f"])(null);return{links:e,activeKey:n,logout:function(){location.assign(t.logoutUrl)}}}},p=n("e582"),O=n.n(p);const y=O()(b,[["render",a]]);var h=y,g={props:{name:{type:String,required:!0},indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!1,default:null},editUrl:{type:String,required:!1,default:null},runUrl:{type:String,required:!1,default:null},resultsUrl:{type:String,required:!1,default:null},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{"navigation-menu":h}};n("2225");const v=O()(g,[["render",u]]);e["a"]=v},b635:function(t,e,n){"use strict";n.r(e);n("b2c9"),n("2ae8"),n("b75d"),n("ce9f");var r=n("a8ce"),o=n("937e"),c=n("649f");function u(t,e,n,r,o,u){var i=Object(c["N"])("page-path"),l=Object(c["N"])("project-list"),a=Object(c["N"])("page");return Object(c["G"])(),Object(c["i"])(a,{name:"Projects","index-url":n.indexUrl,"logout-url":n.logoutUrl,"logo-url":n.logoUrl},{header:Object(c["V"])((function(){return[Object(c["n"])(i,{"leaf-name":"Projects"})]})),default:Object(c["V"])((function(){return[Object(c["n"])(l,{id:"project-list","projects-url":n.projectsUrl},null,8,["projects-url"])]})),_:1},8,["index-url","logout-url","logo-url"])}var i=n("9973"),l=n("c46e");n("a01d");function a(t,e,n,r,o,u){var i=Object(c["N"])("project-row"),l=Object(c["N"])("n-list-item"),a=Object(c["N"])("new-project-row"),d=Object(c["N"])("n-list");return Object(c["G"])(),Object(c["i"])(d,null,{footer:Object(c["V"])((function(){return[Object(c["n"])(a,{onCreated:r.appendProject,"projects-url":n.projectsUrl},null,8,["onCreated","projects-url"])]})),default:Object(c["V"])((function(){return[(Object(c["G"])(!0),Object(c["k"])(c["b"],null,Object(c["L"])(r.projects,(function(t){return Object(c["G"])(),Object(c["i"])(l,{key:t.id},{default:Object(c["V"])((function(){return[Object(c["n"])(i,{onDestroyed:r.deleteProject,"project-id":t.id,"project-name":t.name,url:t.url,"projects-url":n.projectsUrl},null,8,["onDestroyed","project-id","project-name","url","projects-url"])]})),_:2},1024)})),128))]})),_:1})}n("c6fb"),n("dad8"),n("4d96");var d=n("315d"),f=Object(c["m"])("Create");function s(t,e,n,r,o,u){var i=Object(c["N"])("n-input"),l=Object(c["N"])("n-button"),a=Object(c["N"])("n-space");return Object(c["G"])(),Object(c["i"])(a,{justify:"space-between"},{default:Object(c["V"])((function(){return[Object(c["n"])(i,{type:"text",placeholder:"Enter project name...",clearable:"",maxlength:"60",onInput:r.updateProjectName,value:r.projectName,disabled:r.busy},null,8,["onInput","value","disabled"]),Object(c["n"])(l,{onClick:r.create,loading:r.busy,disabled:r.buttonDisabled},{default:Object(c["V"])((function(){return[f]})),_:1},8,["onClick","loading","disabled"])]})),_:1})}n("4f18");var j=n("a253"),b={props:{projectsUrl:String},emit:["created:project"],setup:function(t,e){var n=e.emit,o=Object(r["f"])(""),c=Object(r["f"])(!1),u=Object(j["a"])(),i=Object(r["a"])((function(){return!(0!==o.value.length&&!c.value)}));return{buttonDisabled:i,projectName:o,busy:c,updateProjectName:function(t){o.value=t},create:function(){c.value=!0,Object(d["d"])(o.value,String(t.projectsUrl)).then((function(t){n("created",t.project),o.value=""})).catch((function(t){u.error(t.message)})).finally((function(){c.value=!1}))}}}},p=n("e582"),O=n.n(p);const y=O()(b,[["render",s]]);var h=y,g=Object(c["m"])("Delete");function v(t,e,n,r,o,u){var i=Object(c["N"])("n-a"),l=Object(c["N"])("n-button"),a=Object(c["N"])("n-space");return Object(c["G"])(),Object(c["i"])(a,{justify:"space-between",align:"baseline"},{default:Object(c["V"])((function(){return[r.busy?(Object(c["G"])(),Object(c["i"])(i,{key:1},{default:Object(c["V"])((function(){return[Object(c["m"])(Object(c["O"])(n.projectName),1)]})),_:1})):(Object(c["G"])(),Object(c["i"])(i,{key:0,href:n.url},{default:Object(c["V"])((function(){return[Object(c["m"])(Object(c["O"])(n.projectName),1)]})),_:1},8,["href"])),Object(c["n"])(l,{onClick:r.destroy,loading:r.busy,disabled:r.busy},{default:Object(c["V"])((function(){return[g]})),_:1},8,["onClick","loading","disabled"])]})),_:1})}n("f2d5");var m={props:{projectId:Number,projectName:String,url:String,projectsUrl:String},emits:["destroyed"],setup:function(t,e){var n=Object(r["f"])(!1),o=Object(j["a"])();return{busy:n,destroy:function(){n.value=!0,Object(d["f"])(t.projectId,String(t.projectsUrl)).then((function(t){e.emit("destroyed",t.id)})).catch((function(t){o.error(t.message)})).finally((function(){n.value=!1}))}}}};const w=O()(m,[["render",v]]);var x=w,S={props:{projectsUrl:String},setup:function(t){var e=Object(r["f"])([]),n=Object(r["f"])(!1);return Object(r["e"])((function(){Object(d["o"])(String(t.projectsUrl)).then((function(t){e.value=t.projects}))})),{projects:e,newProjectRowBusy:n,appendProject:function(t){e.value.push(t)},deleteProject:function(t){var n=e.value.findIndex((function(e){return e.id===t}));if(n<0)throw new Error("Project id ".concat(t," not found while deleting project."));e.value.splice(n,1)}}},components:{"new-project-row":h,"project-row":x}};const N=O()(S,[["render",a]]);var U=N,k={props:{indexUrl:{type:String,required:!0},projectsUrl:{type:String,required:!0},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{page:i["a"],"page-path":l["a"],"project-list":U}};n("5372");const _=O()(k,[["render",u]]);var E=_,I=r["b"]({});I.use(o["a"]),I.component("index-app",E),I.mount("#index-app")},c46e:function(t,e,n){"use strict";n("a01d");var r=n("649f");function o(t,e,n,o,c,u){var i=Object(r["N"])("n-breadcrumb-item"),l=Object(r["N"])("n-breadcrumb");return Object(r["G"])(),Object(r["i"])(l,null,{default:Object(r["V"])((function(){return[(Object(r["G"])(!0),Object(r["k"])(r["b"],null,Object(r["L"])(n.path,(function(t,e){return Object(r["G"])(),Object(r["i"])(i,{href:t.url,key:e},{default:Object(r["V"])((function(){return[Object(r["m"])(Object(r["O"])(t.name),1)]})),_:2},1032,["href"])})),128)),Object(r["n"])(i,null,{default:Object(r["V"])((function(){return[Object(r["m"])(Object(r["O"])(n.leafName),1)]})),_:1})]})),_:1})}var c={props:{path:Array,leafName:String}},u=n("e582"),i=n.n(u);const l=i()(c,[["render",o]]);e["a"]=l},d55c:function(t,e,n){}});