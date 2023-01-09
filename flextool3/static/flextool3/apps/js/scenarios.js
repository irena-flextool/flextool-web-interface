(function(e){function t(t){for(var r,c,o=t[0],u=t[1],l=t[2],d=0,f=[];d<o.length;d++)c=o[d],Object.prototype.hasOwnProperty.call(a,c)&&a[c]&&f.push(a[c][0]),a[c]=0;for(r in u)Object.prototype.hasOwnProperty.call(u,r)&&(e[r]=u[r]);s&&s(t);while(f.length)f.shift()();return i.push.apply(i,l||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],r=!0,o=1;o<n.length;o++){var u=n[o];0!==a[u]&&(r=!1)}r&&(i.splice(t--,1),e=c(c.s=n[0]))}return e}var r={},a={scenarios:0},i=[];function c(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,c),n.l=!0,n.exports}c.m=e,c.c=r,c.d=function(e,t,n){c.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},c.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(e,t){if(1&t&&(e=c(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(c.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)c.d(n,r,function(t){return e[t]}.bind(null,r));return n},c.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return c.d(t,"a",t),t},c.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},c.p="";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],u=o.push.bind(o);o.push=t,o=o.slice();for(var l=0;l<o.length;l++)t(o[l]);var s=u;i.push([4,"chunk-vendors"]),n()})({"0274":function(e,t,n){"use strict";var r=n("649f");function a(e,t,n,a,i,c){var o=Object(r["N"])("n-spin"),u=Object(r["N"])("n-result");return"loading"===n.state?(Object(r["G"])(),Object(r["i"])(o,{key:0})):"error"===n.state?(Object(r["G"])(),Object(r["i"])(u,{key:1,status:"error",title:"Error",description:n.errorMessage},null,8,["description"])):"waiting"===n.state?Object(r["M"])(e.$slots,"waiting",{key:2}):Object(r["M"])(e.$slots,"default",{key:3})}var i={props:{state:{type:String,required:!0},errorMessage:{type:String,required:!1,default:""}},state:{loading:"loading",waiting:"waiting",ready:"ready",error:"error"}},c=n("e582"),o=n.n(c);const u=o()(i,[["render",a]]);t["a"]=u},1865:function(e,t,n){"use strict";n("d17b")},"1d6d":function(e,t,n){"use strict";var r=n("649f");function a(e,t,n,a,i,c){var o=Object(r["N"])("n-input");return Object(r["G"])(),Object(r["i"])(o,{value:a.value,"onUpdate:value":t[0]||(t[0]=function(e){return a.value=e}),ref:"instance",onBlur:a.cancel,onKeydown:a.handleKey,maxlength:"155",size:"small",clearable:""},null,8,["value","onBlur","onKeydown"])}n("a01d"),n("0151");var i=n("a8ce"),c={props:{name:String},emits:["accept","cancel"],setup:function(e,t){var n=Object(i["f"])(e.name),r=Object(i["f"])(null);return Object(i["e"])((function(){var e;null===(e=r.value)||void 0===e||e.select()})),{instance:r,value:n,cancel:function(){n.value=e.name,t.emit("cancel")},handleKey:function(r){var a=n.value.trim();switch(r.key){case"Enter":a&&a!==e.name?t.emit("accept",a):(n.value=e.name,t.emit("cancel"));break;case"Escape":n.value=e.name,t.emit("cancel");break}}}}},o=n("e582"),u=n.n(o);const l=u()(c,[["render",a]]);t["a"]=l},"315d":function(e,t,n){"use strict";n.d(t,"e",(function(){return i})),n.d(t,"j",(function(){return s})),n.d(t,"c",(function(){return d})),n.d(t,"p",(function(){return o})),n.d(t,"d",(function(){return u})),n.d(t,"f",(function(){return l})),n.d(t,"i",(function(){return f})),n.d(t,"h",(function(){return b})),n.d(t,"a",(function(){return v})),n.d(t,"m",(function(){return p})),n.d(t,"l",(function(){return O})),n.d(t,"v",(function(){return j})),n.d(t,"n",(function(){return m})),n.d(t,"g",(function(){return h})),n.d(t,"r",(function(){return g})),n.d(t,"q",(function(){return y})),n.d(t,"u",(function(){return N})),n.d(t,"s",(function(){return w})),n.d(t,"t",(function(){return S})),n.d(t,"o",(function(){return x})),n.d(t,"w",(function(){return k})),n.d(t,"k",(function(){return U})),n.d(t,"b",(function(){return I}));var r=n("0312");n("ca00"),n("8261"),n("0151"),n("4254"),n("4f18"),n("dad8"),n("b2a6");function a(e){var t=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var a=n[r].trim();if(a.substring(0,e.length+1)===e+"="){t=decodeURIComponent(a.substring(e.length+1));break}}return t}var i=a("csrftoken");function c(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":i,"Content-Type":"application/json"}}}function o(e){var t=c();return t["body"]=JSON.stringify({type:"project list?"}),fetch(e,t).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load project list: ".concat(e))}))}))}function u(e,t){var n=c();return n["body"]=JSON.stringify({type:"create project?",name:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create project: ".concat(e))}))}))}function l(e,t){var n=c();return n["body"]=JSON.stringify({type:"destroy project?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete project: ".concat(e))}))}))}function s(e,t,n){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},i=c();return i["body"]=JSON.stringify(Object(r["a"])({type:e,projectId:t},a)),fetch(n,i).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch ".concat(e,": ").concat(t))}))}))}function d(e,t,n,a){var i=c();return i.body=JSON.stringify(Object(r["a"])({type:"commit",projectId:n,message:t},e)),fetch(a,i).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error(e)}))}))}function f(e,t){var n=c();return n.body=JSON.stringify({type:"current execution?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch current run: ".concat(e))}))}))}function b(e,t,n){var r=c();return r["body"]=JSON.stringify({type:"execute?",projectId:e,scenarios:n}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execute: ".concat(e))}))}))}function v(e,t){var n=c();return n["body"]=JSON.stringify({type:"abort?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to abort execution: ".concat(e))}))}))}function p(e,t){var n=c();return n["body"]=JSON.stringify({type:"briefing?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch execution status: ".concat(e))}))}))}function j(e,t,n){var r=c();return r.body=JSON.stringify({type:"summary?",projectId:e,scenarioExecutionId:n}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load summary: ".concat(e))}))}))}function m(e,t,n){var r=c();return r.body=JSON.stringify({type:"output directory?",projectId:e,scenarioExecutionId:n}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load output directory path: ".concat(e))}))}))}function O(e,t){var n=c();return n.body=JSON.stringify({type:"scenario list?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load scenarios: ".concat(e))}))}))}function h(e,t,n){var r=c();return r.body=JSON.stringify({type:"destroy execution?",projectId:e,scenarioExecutionId:n}),fetch(t,r).then((function(e){if(!e.ok)return e.text().then((function(e){throw new Error("Failed to destroy scenario execution: ".concat(e))}))}))}function g(e,t){var n=c();return n.body=JSON.stringify({type:"entity classes?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch entity classes: ".concat(e))}))}))}function y(e,t,n){var r=c();return r.body=JSON.stringify({type:"entities?",projectId:e,classes:n}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch entities: ".concat(e))}))}))}function N(e,t,n){var r=c();return r.body=JSON.stringify({type:"parameters?",projectId:e,classes:n}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch parameters: ".concat(e))}))}))}function w(e,t,n,r,a){var i=c();return i.body=JSON.stringify({type:"value indexes?",projectId:e,scenarioExecutionIds:n,classes:r,parameters:a}),fetch(t,i).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch parameter value indexes: ".concat(e))}))}))}function S(e,t,n,r,a,i){var o=c();return o.body=JSON.stringify({type:"values?",projectId:e,scenarioExecutionIds:n,classes:r,objects:a,parameters:i}),fetch(t,o).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch parameter values: ".concat(e))}))}))}function x(e,t){var n=c();return n.body=JSON.stringify({type:"plot specification?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch plot specification: ".concat(e))}))}))}function k(e,t,n){var r=c();return r.body=JSON.stringify({type:"store plot specification",projectId:e,specification:n}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to store plot specification: ".concat(e))}))}))}function U(e,t){var n=c();return n["body"]=JSON.stringify({type:"example list?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load example list: ".concat(e))}))}))}function I(e,t,n){var r=c();return r["body"]=JSON.stringify({type:"add to model",name:n,projectId:e}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to add example to model: ".concat(e))}))}))}},4:function(e,t,n){e.exports=n("8a3d")},"703f":function(e,t,n){"use strict";function r(e){e?addEventListener("beforeunload",a,{capture:!0}):removeEventListener("beforeunload",a,{capture:!0})}function a(e){return e.preventDefault(),e.returnValue="There are uncommitted changes."}n.d(t,"a",(function(){return r}))},"8a3d":function(e,t,n){"use strict";n.r(t);n("b2c9"),n("2ae8"),n("b75d"),n("ce9f");var r=n("a8ce"),a=n("937e"),i=n("649f"),c=Object(i["m"])("Alternatives"),o=Object(i["m"])("Scenarios"),u={type:"error"};function l(e,t,n,r,a,l){var s=Object(i["N"])("page-path"),d=Object(i["N"])("commit-button"),f=Object(i["N"])("n-h1"),b=Object(i["N"])("alternative-list"),v=Object(i["N"])("n-space"),p=Object(i["N"])("n-grid-item"),j=Object(i["N"])("scenarios-table"),m=Object(i["N"])("n-grid"),O=Object(i["N"])("page");return Object(i["G"])(),Object(i["i"])(O,{name:"Edit model","index-url":n.indexUrl,"project-url":n.projectUrl,"edit-url":n.editUrl,"run-url":n.runUrl,"results-url":n.resultsUrl,"logout-url":n.logoutUrl,"logo-url":n.logoUrl},{header:Object(i["V"])((function(){return[Object(i["n"])(s,{path:[{name:"Projects",url:n.indexUrl},{name:n.projectName,url:n.projectUrl},{name:"Model",url:n.editUrl}],"leaf-name":"scenarios"},null,8,["path"]),Object(i["n"])(d,{"has-pending-changes":r.hasPendingChanges,committing:r.committing,onCommitRequest:r.commit},null,8,["has-pending-changes","committing","onCommitRequest"])]})),default:Object(i["V"])((function(){return[Object(i["n"])(m,{cols:"1 s:2 m:3 l:4 xl:6",responsive:"screen"},{default:Object(i["V"])((function(){return[Object(i["n"])(p,null,{default:Object(i["V"])((function(){return[Object(i["n"])(v,{vertical:""},{default:Object(i["V"])((function(){return[Object(i["n"])(f,null,{default:Object(i["V"])((function(){return[c]})),_:1}),Object(i["n"])(b,{"project-id":n.projectId,"model-url":n.modelUrl,inserted:r.insertedAlternatives,onAvailableAlternativesChange:r.updateAvailableAlternatives,onAlternativeInsert:r.storeAlternativeInsertion,onAlternativeUpdate:r.storeAlternativeUpdate,onAlternativeDelete:r.storeAlternativeDeletion},null,8,["project-id","model-url","inserted","onAvailableAlternativesChange","onAlternativeInsert","onAlternativeUpdate","onAlternativeDelete"])]})),_:1})]})),_:1}),Object(i["n"])(p,{span:"1 m:2 l:3 xl:5"},{default:Object(i["V"])((function(){return[Object(i["n"])(v,{vertical:""},{default:Object(i["V"])((function(){return[Object(i["n"])(f,null,{default:Object(i["V"])((function(){return[o]})),_:1}),Object(i["n"])(j,{ref:"scenariosTable","project-id":n.projectId,"model-url":n.modelUrl,onScenarioFetch:r.setOriginalScenarios,onScenarioUpdate:r.updateScenarios,onDuplicateScenario:r.setScenarioIssues},null,8,["project-id","model-url","onScenarioFetch","onScenarioUpdate","onDuplicateScenario"]),Object(i["l"])("text",u,Object(i["O"])(r.scenarioIssues),1)]})),_:1})]})),_:1})]})),_:1})]})),_:1},8,["index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])}var s=n("3fed"),d=n("8f57"),f=(n("4f18"),n("26cf"),n("5ee3"),n("66a1"),n("b2a6"),n("f2d5"),n("3865"),n("a01d"),n("4c87"),n("cf64"),n("a253")),b=n("274c"),v=n("51c8"),p=n("2341"),j=n("e83a"),m=n("cc33"),O=n("6f2c"),h=n("1f45"),g=(n("d6a1"),n("5385"),n("ff84"),Symbol("insert action")),y=Symbol("delete action"),N=Symbol("update action"),w=Object(O["a"])((function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0;Object(h["a"])(this,e),this.action=t,this.originalName=n,this.id=r})),S=Object(O["a"])((function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0;Object(h["a"])(this,e),this.action=t,this.id=n,this.scenarioAlternatives=void 0})),x=new WeakMap,k=new WeakMap,U=function(){function e(){Object(h["a"])(this,e),Object(p["a"])(this,x,{writable:!0,value:void 0}),Object(p["a"])(this,k,{writable:!0,value:void 0}),Object(m["a"])(this,x,new Map),Object(m["a"])(this,k,new Map)}return Object(O["a"])(e,[{key:"makeCommitData",value:function(){var e=[],t=[],n=[];Object(j["a"])(this,x).forEach((function(r,a){var i=r.action;i===g?e.push({name:a}):i===N?t.push({id:r.id,name:a}):i===y&&n.push(r.id)}));var r=[],a=[],i=[];return Object(j["a"])(this,k).forEach((function(e,t){e.action===g?(r.push({name:t}),e.scenarioAlternatives&&(void 0!==e.id&&a.push(e.id),e.scenarioAlternatives.forEach((function(e,n){i.push({scenario_name:t,alternative_name:e,rank:n})})))):e.action===y&&a.push(e.id)})),{insertions:{alternative:e,scenario:r,scenario_alternative:i},updates:{alternative:t},deletions:{alternative:n,scenario:a}}}},{key:"isPending",value:function(){return Object(j["a"])(this,x).size>0||Object(j["a"])(this,k).size>0}},{key:"clearPending",value:function(){Object(j["a"])(this,x).clear(),Object(j["a"])(this,k).clear()}},{key:"insertAlternative",value:function(e){Object(j["a"])(this,x).set(e,new w(g))}},{key:"updateAlternative",value:function(e,t,n){var r=Object(j["a"])(this,x).get(e);void 0===r?r=new w(N,e,t):Object(j["a"])(this,x).delete(e),n!==r.originalName&&Object(j["a"])(this,x).set(n,r)}},{key:"deleteAlternative",value:function(e,t){var n=Object(j["a"])(this,x).get(t);if(void 0===n)Object(j["a"])(this,x).set(t,new w(y,t,e));else if(n.action===g)Object(j["a"])(this,x).delete(t);else{Object(j["a"])(this,x).delete(t);var r=n.originalName;Object(j["a"])(this,x).set(r,new w(y,r,e))}}},{key:"deleteScenario",value:function(e,t){var n=Object(j["a"])(this,k).get(t);void 0!==n?void 0===n.id?Object(j["a"])(this,k).delete(t):(n.action=y,n.id=e,n.scenarioAlternatives=void 0):Object(j["a"])(this,k).set(t,new S(y,e))}},{key:"insertScenarioAlternatives",value:function(e,t,n){var r=Object(j["a"])(this,k).get(t);void 0===r?(r=new S(g,e),Object(j["a"])(this,k).set(t,r)):r.action=g,r.scenarioAlternatives=Object(v["a"])(n)}}]),e}();n("ca00"),n("8261"),n("0151"),n("dad8"),n("cf25");function I(e){var t=new Map;return e.split("\n").forEach((function(e){if(e=e.trim(),e){var n=e.split(/\s+/),r=n.shift();if(t.has(r))throw new Error("Duplicate scenario '".concat(r,"'"));t.set(r,n)}})),t}function A(e){var t=[];return e.forEach((function(e){var n=e.scenarioName+" "+e.scenarioAlternatives.join(" ");t.push(n)})),t.join("\n")}function E(e,t){var n=new Map;t.forEach((function(e){n.set(e.scenarioName,e)}));var r=[];e.forEach((function(e,t){var a=n.get(t);if(void 0===a)e?r.push({scenarioName:t,scenarioAlternatives:e}):r.push({name:t});else{var i=!1;e.length===a.scenarioAlternatives.length&&(i=e.every((function(e,t){return e==a.scenarioAlternatives[t]}))),i||r.push({scenarioName:t,scenarioId:a.scenarioId,scenarioAlternatives:e})}}));var a,i=[],c=Object(d["a"])(t);try{for(c.s();!(a=c.n()).done;){var o=a.value;e.has(o.scenarioName)||i.push({scenarioId:o.scenarioId,scenarioName:o.scenarioName})}}catch(u){c.e(u)}finally{c.f()}return{inserted:r,deleted:i}}var _=n("315d"),q=n("703f"),C=n("f77a");function V(e,t,n,r,a,c){var o=Object(i["N"])("n-tree"),u=Object(i["N"])("new-named-item-row"),l=Object(i["N"])("n-space"),s=Object(i["N"])("fetchable");return Object(i["G"])(),Object(i["i"])(s,{state:r.state,"error-message":r.errorMessage},{default:Object(i["V"])((function(){return[Object(i["n"])(l,{vertical:""},{default:Object(i["V"])((function(){return[Object(i["n"])(o,{"block-line":"",data:r.alternativeList,"render-label":r.renderLabel,"render-suffix":r.renderSuffix,selectable:!1},null,8,["data","render-label","render-suffix"]),Object(i["n"])(u,{"item-name":"alternative",onCreate:r.addAlternative},null,8,["onCreate"])]})),_:1})]})),_:1},8,["state","error-message"])}n("e014"),n("c6fb"),n("4d96");var M=n("0274");function F(e,t,n,r,a,c){var o=Object(i["N"])("n-text"),u=Object(i["N"])("item-name-input"),l=Object(i["N"])("n-space");return Object(i["G"])(),Object(i["i"])(l,{align:"baseline"},{default:Object(i["V"])((function(){return[r.editing?(Object(i["G"])(),Object(i["i"])(u,{key:1,name:n.alternativeName,onAccept:r.emitRename,onCancel:r.hideInput},null,8,["name","onAccept","onCancel"])):(Object(i["G"])(),Object(i["i"])(o,{key:0,onDblclick:r.showInput},{default:Object(i["V"])((function(){return[Object(i["m"])(Object(i["O"])(n.alternativeName),1)]})),_:1},8,["onDblclick"]))]})),_:1})}var J=n("1d6d"),D={props:{alternativeName:{type:String,required:!0},alternativeId:{type:Number,required:!1}},emits:["rename"],components:{"item-name-input":J["a"]},setup:function(e,t){var n=Object(r["f"])(!1),a=Object(r["f"])(e.alternativeName),i=Object(r["f"])(null);return{editing:n,editValue:a,inputInstance:i,showInput:function(){n.value=!0},hideInput:function(){n.value=!1},emitRename:function(r){n.value=!1,t.emit("rename",{id:e.alternativeId,previousName:e.alternativeName,name:r})}}}},G=n("e582"),P=n.n(G);const R=P()(D,[["render",F]]);var T=R,z=n("8e39"),L=n("d6ec");function K(e,t,n,r,a,i){_["j"]("alternatives?",e,t).then((function(e){var t=e.alternatives,a=[];t.forEach((function(e){a.push({label:e.name,key:e.name,id:e.id})})),n.value=a,r.value=M["a"].state.ready,B(n,i)})).catch((function(e){a.value=e.message,r.value=M["a"].state.error}))}function B(e,t){var n=new Set(e.value.map((function(e){return e.label})));t("availableAlternativesChange",n)}var $={props:{projectId:{type:Number,required:!0},modelUrl:{type:String,required:!0},inserted:{type:Object,required:!1}},emits:["availableAlternativesChange","alternativeInsert","alternativeUpdate","alternativeDelete"],components:{fetchable:M["a"],"new-named-item-row":L["a"]},setup:function(e,t){var n=Object(r["f"])(M["a"].state.loading),a=Object(r["f"])(""),i=Object(r["f"])([]),c=Object(b["a"])(),o=function(e){var n=i.value.find((function(t){return e.name===t.label}));if(n)c.error({title:"Cannot rename",content:"An alternative with the same name already exists."});else{var r=i.value.find((function(t){return e.previousName===t.label}));r.label=e.name,r.key=e.name,t.emit("alternativeUpdate",e),B(i,t.emit)}},u=function(e){var n=i.value.findIndex((function(t){return t.label===e})),r=i.value[n].id;i.value.splice(n,1),t.emit("alternativeDelete",{id:r,name:e}),B(i,t.emit)};return Object(r["e"])((function(){K(e.projectId,e.modelUrl,i,n,a,t.emit)})),Object(r["i"])(Object(r["h"])(e).inserted,(function(e){e&&i.value.forEach((function(t){var n=e[t.label];void 0!==n&&(t.id=n)}))})),{state:n,errorMessage:a,alternativeList:i,addAlternative:function(e){var n=i.value.find((function(t){return e===t.label}));if(n)c.error({title:"Cannot create",content:"An alternative with the same name already exists."});else{var r={label:e,key:e},a=i.value.findIndex((function(t){return e<t.label}));i.value.splice(a>=0?a:i.value.length,0,r),t.emit("alternativeInsert",e),B(i,t.emit)}},renderLabel:function(e){return Object(r["c"])(T,{alternativeName:e.option.label,alternativeId:e.option.id,onRename:o})},renderSuffix:function(e){return Object(r["c"])(z["a"],{emblem:e.option.label,onDelete:u})}}}};const W=P()($,[["render",V]]);var X=W,H=n("9973"),Q=n("c46e"),Y=Object(i["m"])("scenario alternative_1 alternative_2…");function Z(e,t,n,r,a,c){var o=Object(i["N"])("n-text"),u=Object(i["N"])("n-input"),l=Object(i["N"])("fetchable"),s=Object(i["N"])("n-space");return Object(i["G"])(),Object(i["i"])(s,{vertical:""},{default:Object(i["V"])((function(){return[Object(i["n"])(o,null,{default:Object(i["V"])((function(){return[Y]})),_:1}),Object(i["n"])(l,{state:r.state,"error-message":r.errorMessage},{default:Object(i["V"])((function(){return[Object(i["n"])(u,{type:"textarea",value:r.text,placeholder:"Input scenarios and scenario alternatives",rows:r.rowCount,"onUpdate:value":r.parseUpdatedText},null,8,["value","rows","onUpdate:value"])]})),_:1},8,["state","error-message"])]})),_:1})}n("7de8");function ee(e,t,n,r,a,i,c){_["j"]("scenarios?",e,t).then((function(e){var t=[];e.scenarios.forEach((function(e){t.push({scenarioId:e.scenario_id,scenarioName:e.scenario_name,scenarioAlternatives:e.scenario_alternatives})})),c("scenarioFetch",t),n.value=A(t),r.value=Math.max(10,(n.value.match(/\n/g)||"").length+3),a.value=M["a"].state.ready})).catch((function(e){i.value=e.message,a.value=M["a"].state.error}))}var te={props:{projectId:{type:Number,required:!0},modelUrl:{type:String,required:!0}},emits:["scenarioFetch","scenarioUpdate","duplicateScenario"],components:{fetchable:M["a"]},setup:function(e,t){var n=Object(r["f"])(""),a=Object(r["f"])(10),i=Object(r["f"])(M["a"].state.loading),c=Object(r["f"])("");return Object(r["e"])((function(){ee(e.projectId,e.modelUrl,n,a,i,c,t.emit)})),{text:n,rowCount:a,state:i,errorMessage:c,parseUpdatedText:function(e){n.value=e;var r=null;try{r=I(e)}catch(a){return void t.emit("duplicateScenario",a.message)}t.emit("scenarioUpdate",r)},fetchScenarios:function(){ee(e.projectId,e.modelUrl,n,a,i,c,t.emit)}}}};const ne=P()(te,[["render",Z]]);var re=ne;function ae(e,t,n){if(null!==e&&null!==t){var r,a=Object(d["a"])(e);try{for(a.s();!(r=a.n()).done;){var i=Object(s["a"])(r.value,2),c=i[0],o=i[1];if(!o)return void(n.value="Alternatives missing for scenario '".concat(c,"'"));var u,l=new Set,f=Object(d["a"])(o);try{for(f.s();!(u=f.n()).done;){var b=u.value;if(!t.has(b))return void(n.value="Unknown alternative '".concat(b,"' in scenario '").concat(c,"'"));if(l.has(b))return void(n.value="Duplicate alternative '".concat(b,"' in scenario '").concat(c,"'"));l.add(b)}}catch(v){f.e(v)}finally{f.f()}}}catch(v){a.e(v)}finally{a.f()}n.value=""}}function ie(e,t){if(null===e||null===t)return!1;if(e.size!=t.length)return!0;var n,r=Object(d["a"])(t);try{for(r.s();!(n=r.n()).done;){var a=n.value;if(!e.has(a.scenarioName))return!0;var i=e.get(a.scenarioName);if(i.length!=a.scenarioAlternatives.length)return!0;for(var c=0;c!=i.length;++c)if(i[c]!=a.scenarioAlternatives[c])return!0}}catch(o){r.e(o)}finally{r.f()}return!1}function ce(e,t,n,r){return e.isPending()||!r.value&&ie(t,n)}var oe={props:{indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!0},projectName:{type:String,required:!0},projectId:{type:Number,required:!0},editUrl:{type:String,required:!0},runUrl:{type:String,required:!0},resultsUrl:{type:String,required:!0},modelUrl:{type:String,required:!0},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{"commit-button":C["a"],"alternative-list":X,page:H["a"],"page-path":Q["a"],"scenarios-table":re},setup:function(e){var t=Object(r["f"])(!1),n=Object(r["f"])(!1),a=Object(r["f"])([]),i=Object(r["f"])(""),c=Object(r["f"])(null),o=new U,u=null,l=null,s=null,d=Object(f["a"])(),v=Object(b["a"])();return Object(r["i"])(t,q["a"]),{hasPendingChanges:t,committing:n,insertedAlternatives:a,scenarioIssues:i,scenariosTable:c,commit:function(){if(n.value=!0,i.value)return v.warning({title:"Cannot commit",content:"Scenarios have issues that must be solved first."}),void(n.value=!1);if(null!==s){var r=E(s,l);r.deleted.forEach((function(e){o.deleteScenario(e.scenarioId,e.scenarioName)})),r.inserted.forEach((function(e){o.insertScenarioAlternatives(e.scenarioId,e.scenarioName,e.scenarioAlternatives)}))}var u=o.makeCommitData();_["c"](u,"Modified alternatives and scenarios.",e.projectId,e.modelUrl).then((function(e){e.inserted&&e.inserted.alternative&&(a.value=e.inserted.alternative),c.value.fetchScenarios(),d.success("Commit successful."),t.value=!1})).catch((function(e){v.error({title:"Commit failure",content:e.message})})).finally((function(){o.clearPending(),n.value=!1}))},updateAvailableAlternatives:function(e){u=e,ae(s,e,i),t.value=ce(o,s,l,i)},storeAlternativeInsertion:function(e){o.insertAlternative(e),t.value=ce(o,s,l,i)},storeAlternativeUpdate:function(e){o.updateAlternative(e.previousName,e.id,e.name),t.value=ce(o,s,l,i)},storeAlternativeDeletion:function(e){o.deleteAlternative(e.id,e.name),t.value=ce(o,s,l,i)},setOriginalScenarios:function(e){l=e,s=new Map(e.map((function(e){return[e.scenarioName,e.scenarioAlternatives]})))},setScenarioIssues:function(e){i.value=e,t.value=ce(o,s,l,i)},updateScenarios:function(e){ae(e,u,i),s=e,t.value=ce(o,s,l,i)}}}};const ue=P()(oe,[["render",l]]);var le=ue,se=r["b"]({});se.use(a["a"]),se.component("scenarios-app",le),se.mount("#scenarios-app")},"8e39":function(e,t,n){"use strict";var r=n("649f"),a=Object(r["m"])("Delete");function i(e,t,n,i,c,o){var u=Object(r["N"])("n-button");return Object(r["G"])(),Object(r["i"])(u,{size:"tiny",onClick:i.emitDelete},{default:Object(r["V"])((function(){return[a]})),_:1},8,["onClick"])}var c={props:{emblem:{type:[String,Array],required:!0}},emits:["delete"],setup:function(e,t){return{emitDelete:function(){t.emit("delete",e.emblem)}}}},o=n("e582"),u=n.n(o);const l=u()(c,[["render",i]]);t["a"]=l},9973:function(e,t,n){"use strict";n("a01d");var r=n("649f"),a={class:"page-content"},i={class:"page-content"};function c(e,t,n,c,o,u){var l=Object(r["N"])("navigation-menu"),s=Object(r["N"])("n-card"),d=Object(r["N"])("n-layout-header"),f=Object(r["N"])("n-layout");return Object(r["G"])(),Object(r["i"])(f,{position:"absolute"},{default:Object(r["V"])((function(){return[Object(r["n"])(d,null,{default:Object(r["V"])((function(){return[Object(r["n"])(s,{size:"small"},{default:Object(r["V"])((function(){return[Object(r["n"])(l,{current:n.name,"index-url":n.indexUrl,"project-url":n.projectUrl,"edit-url":n.editUrl,"run-url":n.runUrl,"results-url":n.resultsUrl,"logout-url":n.logoutUrl,"logo-url":n.logoUrl},null,8,["current","index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])]})),_:1}),Object(r["l"])("div",a,[Object(r["M"])(e.$slots,"header")])]})),_:3}),Object(r["l"])("div",i,[Object(r["M"])(e.$slots,"default")])]})),_:3})}var o=Object(r["m"])("User guide"),u=Object(r["m"])(" Log out ");function l(e,t,n,a,i,c){var l=Object(r["N"])("n-image"),s=Object(r["N"])("n-menu"),d=Object(r["N"])("n-space"),f=Object(r["N"])("n-a"),b=Object(r["N"])("n-divider"),v=Object(r["N"])("n-button");return Object(r["G"])(),Object(r["i"])(d,{justify:"space-between",align:"baseline"},{default:Object(r["V"])((function(){return[Object(r["n"])(d,{align:"start"},{default:Object(r["V"])((function(){return[Object(r["n"])(l,{src:n.logoUrl,alt:"FlexTool",width:90,"preview-disabled":""},null,8,["src"]),Object(r["n"])(s,{"default-value":n.current,mode:"horizontal",options:a.links},null,8,["default-value","options"])]})),_:1}),Object(r["n"])(d,{align:"baseline"},{default:Object(r["V"])((function(){return[Object(r["n"])(f,{href:"https://irena-flextool.github.io/flextool/"},{default:Object(r["V"])((function(){return[o]})),_:1}),Object(r["n"])(b,{vertical:""}),Object(r["n"])(v,{onClick:a.logout},{default:Object(r["V"])((function(){return[u]})),_:1},8,["onClick"])]})),_:1})]})),_:1})}var s=n("a8ce"),d=n("d70b");function f(e,t){return function(){return Object(s["c"])(d["a"],{href:t},(function(){return e}))}}function b(e){var t={Projects:e.indexUrl,"Manage project":e.projectUrl,"Edit model":e.editUrl,Run:e.runUrl,Results:e.resultsUrl},n=[];for(var r in t){var a=t[r],i=null!==a,c=i?f(r,a):r;n.push({label:c,key:r,disabled:!i})}return n}var v={props:{current:{type:String,required:!0},indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!1,default:null},editUrl:{type:String,required:!1,default:null},runUrl:{type:String,required:!1,default:null},resultsUrl:{type:String,required:!1,default:null},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},setup:function(e){var t=b(e),n=Object(s["f"])(null);return{links:t,activeKey:n,logout:function(){location.assign(e.logoutUrl)}}}},p=n("e582"),j=n.n(p);const m=j()(v,[["render",l]]);var O=m,h={props:{name:{type:String,required:!0},indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!1,default:null},editUrl:{type:String,required:!1,default:null},runUrl:{type:String,required:!1,default:null},resultsUrl:{type:String,required:!1,default:null},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{"navigation-menu":O}};n("1865");const g=j()(h,[["render",c]]);t["a"]=g},c46e:function(e,t,n){"use strict";n("a01d");var r=n("649f");function a(e,t,n,a,i,c){var o=Object(r["N"])("n-breadcrumb-item"),u=Object(r["N"])("n-breadcrumb");return Object(r["G"])(),Object(r["i"])(u,null,{default:Object(r["V"])((function(){return[(Object(r["G"])(!0),Object(r["k"])(r["b"],null,Object(r["L"])(n.path,(function(e,t){return Object(r["G"])(),Object(r["i"])(o,{href:e.url,key:t},{default:Object(r["V"])((function(){return[Object(r["m"])(Object(r["O"])(e.name),1)]})),_:2},1032,["href"])})),128)),Object(r["n"])(o,null,{default:Object(r["V"])((function(){return[Object(r["m"])(Object(r["O"])(n.leafName),1)]})),_:1})]})),_:1})}var i={props:{path:Array,leafName:String}},c=n("e582"),o=n.n(c);const u=o()(i,[["render",a]]);t["a"]=u},d17b:function(e,t,n){},d6ec:function(e,t,n){"use strict";var r=n("649f"),a=Object(r["m"])(" Create ");function i(e,t,n,i,c,o){var u=Object(r["N"])("n-input"),l=Object(r["N"])("n-button"),s=Object(r["N"])("n-space");return Object(r["G"])(),Object(r["i"])(s,null,{default:Object(r["V"])((function(){return[Object(r["n"])(u,{clearable:"",placeholder:i.placeholder,value:i.currentName,"onUpdate:value":t[0]||(t[0]=function(e){return i.currentName=e}),size:"tiny"},null,8,["placeholder","value"]),Object(r["n"])(l,{onClick:i.emitCreate,size:"tiny"},{default:Object(r["V"])((function(){return[a]})),_:1},8,["onClick"])]})),_:1})}n("0151"),n("ca00"),n("3cef"),n("b581");var c=n("a8ce"),o=n("a253"),u={props:{itemName:{type:String,required:!0}},emits:["create"],setup:function(e,t){var n=Object(c["f"])(""),r="Enter ".concat(e.itemName," name"),a=Object(o["a"])();return{currentName:n,placeholder:r,emitCreate:function(){var r=new String(n.value).trim();if(r){var i=/[,]/;if(i.test(r)){var c=e.itemName.charAt(0).toUpperCase()+e.itemName.slice(1);a.error("".concat(c," name contains invalid special characters."))}else t.emit("create",r),n.value=""}else a.error("Please enter name for the new ".concat(e.itemName,"."))}}}},l=n("e582"),s=n.n(l);const d=s()(u,[["render",i]]);t["a"]=d},f77a:function(e,t,n){"use strict";var r=n("649f"),a=Object(r["m"])(" Commit "),i=Object(r["m"])(" There are pending changes. "),c=Object(r["m"])(" Nothing to commit. ");function o(e,t,n,o,u,l){var s=Object(r["N"])("n-button"),d=Object(r["N"])("n-text"),f=Object(r["N"])("n-space");return Object(r["G"])(),Object(r["i"])(f,{align:"baseline"},{default:Object(r["V"])((function(){return[Object(r["n"])(s,{disabled:o.buttonDisabled,loading:n.committing,onClick:o.emitCommitRequest},{default:Object(r["V"])((function(){return[a]})),_:1},8,["disabled","loading","onClick"]),n.errorMessage?(Object(r["G"])(),Object(r["i"])(d,{key:0,type:"error"},{default:Object(r["V"])((function(){return[Object(r["m"])(Object(r["O"])(n.errorMessage),1)]})),_:1})):n.hasPendingChanges?(Object(r["G"])(),Object(r["i"])(d,{key:1},{default:Object(r["V"])((function(){return[i]})),_:1})):(Object(r["G"])(),Object(r["i"])(d,{key:2},{default:Object(r["V"])((function(){return[c]})),_:1}))]})),_:1})}var u=n("a8ce"),l={props:{hasPendingChanges:{type:Boolean,required:!0},committing:{type:Boolean,required:!0},errorMessage:{type:String,required:!1,default:""}},emit:["commitRequest"],setup:function(e,t){var n=Object(u["a"])((function(){return!e.hasPendingChanges||0!==e.errorMessage.length}));return{buttonDisabled:n,emitCommitRequest:function(){t.emit("commitRequest")}}}},s=n("e582"),d=n.n(s);const f=d()(l,[["render",o]]);t["a"]=f}});