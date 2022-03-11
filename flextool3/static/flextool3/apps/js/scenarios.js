(function(e){function t(t){for(var r,c,o=t[0],u=t[1],l=t[2],d=0,f=[];d<o.length;d++)c=o[d],Object.prototype.hasOwnProperty.call(a,c)&&a[c]&&f.push(a[c][0]),a[c]=0;for(r in u)Object.prototype.hasOwnProperty.call(u,r)&&(e[r]=u[r]);s&&s(t);while(f.length)f.shift()();return i.push.apply(i,l||[]),n()}function n(){for(var e,t=0;t<i.length;t++){for(var n=i[t],r=!0,o=1;o<n.length;o++){var u=n[o];0!==a[u]&&(r=!1)}r&&(i.splice(t--,1),e=c(c.s=n[0]))}return e}var r={},a={scenarios:0},i=[];function c(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,c),n.l=!0,n.exports}c.m=e,c.c=r,c.d=function(e,t,n){c.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},c.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},c.t=function(e,t){if(1&t&&(e=c(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(c.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)c.d(n,r,function(t){return e[t]}.bind(null,r));return n},c.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return c.d(t,"a",t),t},c.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},c.p="";var o=window["webpackJsonp"]=window["webpackJsonp"]||[],u=o.push.bind(o);o.push=t,o=o.slice();for(var l=0;l<o.length;l++)t(o[l]);var s=u;i.push([4,"chunk-vendors"]),n()})({"0b10":function(e,t,n){"use strict";var r=n("7a23"),a=Object(r["l"])(" Commit "),i=Object(r["l"])(" Cancel ");function c(e,t,n,c,o,u){var l=Object(r["K"])("n-input"),s=Object(r["K"])("n-button"),d=Object(r["K"])("n-space"),f=Object(r["K"])("n-card");return Object(r["D"])(),Object(r["h"])(f,{title:"Commit changes",closable:"",onClose:c.cancel},{footer:Object(r["R"])((function(){return[Object(r["m"])(d,{justify:"end"},{default:Object(r["R"])((function(){return[Object(r["m"])(s,{disabled:!c.commitMessage,type:"primary",onClick:c.commit},{default:Object(r["R"])((function(){return[a]})),_:1},8,["disabled","onClick"]),Object(r["m"])(s,{onClick:c.cancel},{default:Object(r["R"])((function(){return[i]})),_:1},8,["onClick"])]})),_:1})]})),default:Object(r["R"])((function(){return[Object(r["m"])(l,{type:"textarea",placeholder:"Type commit message",value:c.commitMessage,"onUpdate:value":c.updateCommitMessage},null,8,["value","onUpdate:value"])]})),_:1},8,["onClose"])}var o=n("f2bf"),u={emits:["commit","cancel"],setup:function(e,t){var n=Object(o["e"])("");return{commitMessage:n,cancel:function(){t.emit("cancel")},commit:function(){t.emit("commit",n.value)},updateCommitMessage:function(e){n.value=e}}}},l=n("6b0d"),s=n.n(l);const d=s()(u,[["render",c]]);t["a"]=d},"1d6d":function(e,t,n){"use strict";var r=n("7a23");function a(e,t,n,a,i,c){var o=Object(r["K"])("n-input");return Object(r["D"])(),Object(r["h"])(o,{value:a.value,ref:"instance","onUpdate:value":a.updateValue,onBlur:a.cancel,onKeydown:a.handleKey,maxlength:"155",size:"small",clearable:""},null,8,["value","onUpdate:value","onBlur","onKeydown"])}n("b0c0"),n("498a");var i=n("f2bf"),c={props:{name:String},emits:["accept","cancel"],setup:function(e,t){var n=Object(i["e"])(e.name),r=Object(i["e"])(null);return Object(i["d"])((function(){var e;null===(e=r.value)||void 0===e||e.select()})),{instance:r,value:n,cancel:function(){n.value=e.name,t.emit("cancel")},updateValue:function(e){n.value=e},handleKey:function(r){var a=n.value.trim();switch(r.key){case"Enter":a&&a!==e.name?t.emit("accept",a):(n.value=e.name,t.emit("cancel"));break;case"Escape":n.value=e.name,t.emit("cancel");break}}}}},o=n("6b0d"),u=n.n(o);const l=u()(c,[["render",a]]);t["a"]=l},"315d":function(e,t,n){"use strict";n.d(t,"l",(function(){return s})),n.d(t,"b",(function(){return d})),n.d(t,"m",(function(){return o})),n.d(t,"d",(function(){return u})),n.d(t,"f",(function(){return l})),n.d(t,"h",(function(){return f})),n.d(t,"c",(function(){return b})),n.d(t,"e",(function(){return v})),n.d(t,"g",(function(){return m})),n.d(t,"a",(function(){return j})),n.d(t,"i",(function(){return h})),n.d(t,"k",(function(){return p})),n.d(t,"j",(function(){return O}));var r=n("5530");n("ac1f"),n("1276"),n("498a"),n("e9c4"),n("d3b7"),n("d9e2"),n("99af");function a(e){var t=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var a=n[r].trim();if(a.substring(0,e.length+1)===e+"="){t=decodeURIComponent(a.substring(e.length+1));break}}return t}var i=a("csrftoken");function c(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":i,"Content-Type":"application/json"}}}function o(e){var t=c();return t["body"]=JSON.stringify({type:"project list?"}),fetch(e,t).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load project list: ".concat(e))}))}))}function u(e,t){var n=c();return n["body"]=JSON.stringify({type:"create project?",name:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create project: ".concat(e))}))}))}function l(e,t){var n=c();return n["body"]=JSON.stringify({type:"destroy project?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete project: ".concat(e))}))}))}function s(e,t,n){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},i=c();return i["body"]=JSON.stringify(Object(r["a"])({type:e,projectId:t},a)),fetch(n,i).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch ".concat(e,": ").concat(t))}))}))}function d(e,t,n,a){var i=c();return i.body=JSON.stringify(Object(r["a"])({type:"commit",projectId:n,message:t},e)),fetch(a,i).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error(e)}))}))}function f(e,t){var n=c();return n.body=JSON.stringify({type:"execution list?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load solve list: ".concat(e))}))}))}function b(e,t){var n=c();return n.body=JSON.stringify({type:"create execution?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create solve: ".concat(e))}))}))}function v(e,t){var n=c();return n["body"]=JSON.stringify({type:"destroy execution?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete execution: ".concat(e))}))}))}function m(e,t){var n=c();return n["body"]=JSON.stringify({type:"execute?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execute: ".concat(e))}))}))}function j(e,t){var n=c();return n["body"]=JSON.stringify({type:"abort?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to abort execution: ".concat(e))}))}))}function p(e,t){var n=c();return n["body"]=JSON.stringify({type:"updates?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execution updates: ".concat(e))}))}))}function h(e,t){var n=c();return n["body"]=JSON.stringify({type:"log?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to get log: ".concat(e))}))}))}function O(e,t){var n=c();return n["body"]=JSON.stringify({type:"status?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to get execution status: ".concat(e))}))}))}},4:function(e,t,n){e.exports=n("8a3d")},"8a3d":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("f2bf"),a=n("5333"),i=n("7a23"),c=Object(i["l"])("Alternatives"),o=Object(i["l"])("Scenarios"),u={type:"error"};function l(e,t,n,r,a,l){var s=Object(i["K"])("page-path"),d=Object(i["K"])("commit-button"),f=Object(i["K"])("n-h1"),b=Object(i["K"])("alternative-list"),v=Object(i["K"])("n-space"),m=Object(i["K"])("n-grid-item"),j=Object(i["K"])("scenarios-table"),p=Object(i["K"])("n-grid"),h=Object(i["K"])("commit-message-editor"),O=Object(i["K"])("n-modal");return Object(i["D"])(),Object(i["j"])(i["b"],null,[Object(i["m"])(s,{path:[{name:"Projects",url:n.indexUrl},{name:n.projectName,url:n.projectUrl},{name:"Model",url:n.editUrl}],"leaf-name":"scenarios"},null,8,["path"]),Object(i["m"])(d,{"has-pending-changes":r.hasPendingChanges,committing:r.committing,onCommitRequest:r.startCommitting},null,8,["has-pending-changes","committing","onCommitRequest"]),Object(i["m"])(p,{cols:3},{default:Object(i["R"])((function(){return[Object(i["m"])(m,null,{default:Object(i["R"])((function(){return[Object(i["m"])(v,{vertical:""},{default:Object(i["R"])((function(){return[Object(i["m"])(f,null,{default:Object(i["R"])((function(){return[c]})),_:1}),Object(i["m"])(b,{"project-id":n.projectId,"model-url":n.modelUrl,inserted:r.insertedAlternatives,onAvailableAlternativesChange:r.updateAvailableAlternatives,onAlternativeInsert:r.storeAlternativeInsertion,onAlternativeUpdate:r.storeAlternativeUpdate,onAlternativeDelete:r.storeAlternativeDeletion},null,8,["project-id","model-url","inserted","onAvailableAlternativesChange","onAlternativeInsert","onAlternativeUpdate","onAlternativeDelete"])]})),_:1})]})),_:1}),Object(i["m"])(m,{span:2},{default:Object(i["R"])((function(){return[Object(i["m"])(v,{vertical:""},{default:Object(i["R"])((function(){return[Object(i["m"])(f,null,{default:Object(i["R"])((function(){return[o]})),_:1}),Object(i["m"])(j,{ref:"scenariosTable","project-id":n.projectId,"model-url":n.modelUrl,onScenarioFetch:r.setOriginalScenarios,onScenarioUpdate:r.updateScenarios,onDuplicateScenario:r.setScenarioIssues},null,8,["project-id","model-url","onScenarioFetch","onScenarioUpdate","onDuplicateScenario"]),Object(i["k"])("text",u,Object(i["L"])(r.scenarioIssues),1)]})),_:1})]})),_:1})]})),_:1}),Object(i["m"])(O,{show:r.showCommitMessageEditor,"onUpdate:show":r.updateShowCommitMessageEditor},{default:Object(i["R"])((function(){return[Object(i["k"])("div",null,[Object(i["m"])(h,{onCommit:r.commit,onCancel:t[0]||(t[0]=function(e){return r.showCommitMessageEditor=!1})},null,8,["onCommit"])])]})),_:1},8,["show","onUpdate:show"])],64)}var s=n("3835"),d=n("b85c"),f=(n("d3b7"),n("6062"),n("3ca3"),n("ddb0"),n("99af"),n("a9e3"),n("159b"),n("b0c0"),n("4ec9"),n("d81d"),n("7317")),b=n("4d91"),v=n("2909"),m=n("d5e4"),j=n("5364"),p=n("9bd1"),h=n("bee2"),O=n("d4ec"),g=(n("a4d3"),n("e01a"),n("10d1"),Symbol("insert action")),y=Symbol("delete action"),w=Symbol("update action"),k=Object(h["a"])((function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0;Object(O["a"])(this,e),this.action=t,this.originalName=n,this.id=r})),S=Object(h["a"])((function e(t){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0;Object(O["a"])(this,e),this.action=t,this.id=n,this.scenarioAlternatives=void 0})),C=new WeakMap,A=new WeakMap,N=function(){function e(){Object(O["a"])(this,e),Object(m["a"])(this,C,{writable:!0,value:void 0}),Object(m["a"])(this,A,{writable:!0,value:void 0}),Object(p["a"])(this,C,new Map),Object(p["a"])(this,A,new Map)}return Object(h["a"])(e,[{key:"makeCommitData",value:function(){var e=[],t=[],n=[];Object(j["a"])(this,C).forEach((function(r,a){var i=r.action;i===g?e.push({name:a}):i===w?t.push({id:r.id,name:a}):i===y&&n.push(r.id)}));var r=[],a=[],i=[];return Object(j["a"])(this,A).forEach((function(e,t){e.action===g?(r.push({name:t}),e.scenarioAlternatives&&(void 0!==e.id&&a.push(e.id),e.scenarioAlternatives.forEach((function(e,n){i.push({scenario_name:t,alternative_name:e,rank:n})})))):e.action===y&&a.push(e.id)})),{insertions:{alternative:e,scenario:r,scenario_alternative:i},updates:{alternative:t},deletions:{alternative:n,scenario:a}}}},{key:"isPending",value:function(){return Object(j["a"])(this,C).size>0||Object(j["a"])(this,A).size>0}},{key:"clearPending",value:function(){Object(j["a"])(this,C).clear(),Object(j["a"])(this,A).clear()}},{key:"insertAlternative",value:function(e){Object(j["a"])(this,C).set(e,new k(g))}},{key:"updateAlternative",value:function(e,t,n){var r=Object(j["a"])(this,C).get(e);void 0===r?r=new k(w,e,t):Object(j["a"])(this,C).delete(e),n!==r.originalName&&Object(j["a"])(this,C).set(n,r)}},{key:"deleteAlternative",value:function(e,t){var n=Object(j["a"])(this,C).get(t);if(void 0===n)Object(j["a"])(this,C).set(t,new k(y,t,e));else if(n.action===g)Object(j["a"])(this,C).delete(t);else{Object(j["a"])(this,C).delete(t);var r=n.originalName;Object(j["a"])(this,C).set(r,new k(y,r,e))}}},{key:"deleteScenario",value:function(e,t){var n=Object(j["a"])(this,A).get(t);void 0!==n?void 0===n.id?Object(j["a"])(this,A).delete(t):(n.action=y,n.id=e,n.scenarioAlternatives=void 0):Object(j["a"])(this,A).set(t,new S(y,e))}},{key:"insertScenarioAlternatives",value:function(e,t,n){var r=Object(j["a"])(this,A).get(t);void 0===r?(r=new S(g,e),Object(j["a"])(this,A).set(t,r)):r.action=g,r.scenarioAlternatives=Object(v["a"])(n)}}]),e}();n("ac1f"),n("1276"),n("498a"),n("d9e2"),n("a15b");function x(e){var t=new Map;return e.split("\n").forEach((function(e){if(e=e.trim(),e){var n=e.split(/\s+/),r=n.shift();if(t.has(r))throw new Error("Duplicate scenario '".concat(r,"'"));t.set(r,n)}})),t}function I(e){var t=[];return e.forEach((function(e){var n=e.scenarioName+" "+e.scenarioAlternatives.join(" ");t.push(n)})),t.join("\n")}function K(e,t){var n=new Map;t.forEach((function(e){n.set(e.scenarioName,e)}));var r=[];e.forEach((function(e,t){var a=n.get(t);if(void 0===a)e?r.push({scenarioName:t,scenarioAlternatives:e}):r.push({name:t});else{var i=!1;e.length===a.scenarioAlternatives.length&&(i=e.every((function(e,t){return e==a.scenarioAlternatives[t]}))),i||r.push({scenarioName:t,scenarioId:a.scenarioId,scenarioAlternatives:e})}}));var a,i=[],c=Object(d["a"])(t);try{for(c.s();!(a=c.n()).done;){var o=a.value;e.has(o.scenarioName)||i.push({scenarioId:o.scenarioId,scenarioName:o.scenarioName})}}catch(u){c.e(u)}finally{c.f()}return{inserted:r,deleted:i}}var _=n("315d"),D=n("f77a"),R=n("0b10");function U(e,t,n,r,a,c){var o=Object(i["K"])("n-spin"),u=Object(i["K"])("n-result"),l=Object(i["K"])("n-tree"),s=Object(i["K"])("new-named-item-row"),d=Object(i["K"])("n-space");return"loading"===r.state?(Object(i["D"])(),Object(i["h"])(o,{key:0})):"error"===r.state?(Object(i["D"])(),Object(i["h"])(u,{key:1,status:"error",title:"Error",description:r.errorMessage},null,8,["description"])):(Object(i["D"])(),Object(i["h"])(d,{key:2,vertical:""},{default:Object(i["R"])((function(){return[Object(i["m"])(l,{"block-line":"",data:r.alternativeList,"render-label":r.renderLabel,"render-suffix":r.renderSuffix},null,8,["data","render-label","render-suffix"]),Object(i["m"])(s,{"item-name":"alternative",onCreate:r.addAlternative},null,8,["onCreate"])]})),_:1}))}n("7db0"),n("c740"),n("a434");function E(e,t,n,r,a,c){var o=Object(i["K"])("n-text"),u=Object(i["K"])("item-name-input"),l=Object(i["K"])("n-space");return Object(i["D"])(),Object(i["h"])(l,{align:"baseline"},{default:Object(i["R"])((function(){return[r.editing?(Object(i["D"])(),Object(i["h"])(u,{key:1,name:n.alternativeName,onAccept:r.emitRename,onCancel:r.hideInput},null,8,["name","onAccept","onCancel"])):(Object(i["D"])(),Object(i["h"])(o,{key:0,onDblclick:r.showInput},{default:Object(i["R"])((function(){return[Object(i["l"])(Object(i["L"])(n.alternativeName),1)]})),_:1},8,["onDblclick"]))]})),_:1})}var M=n("1d6d"),q={props:{alternativeName:{type:String,required:!0},alternativeId:{type:Number,required:!1}},emits:["rename"],components:{"item-name-input":M["a"]},setup:function(e,t){var n=Object(r["e"])(!1),a=Object(r["e"])(e.alternativeName),i=Object(r["e"])(null);return{editing:n,editValue:a,inputInstance:i,showInput:function(){n.value=!0},hideInput:function(){n.value=!1},emitRename:function(r){n.value=!1,t.emit("rename",{id:e.alternativeId,previousName:e.alternativeName,name:r})}}}},P=n("6b0d"),F=n.n(P);const J=F()(q,[["render",E]]);var T=J,L=n("8e39"),z=n("d6ec");function B(e,t,n,r,a,i){_["l"]("alternatives?",e,t).then((function(e){var t=e.alternatives,a=[];t.forEach((function(e){a.push({label:e.name,key:e.name,id:e.id})})),n.value=a,r.value="ready",V(n,i)})).catch((function(e){a.value=e.message,r.value="error"}))}function V(e,t){var n=new Set(e.value.map((function(e){return e.label})));t("availableAlternativesChange",n)}var W={props:{projectId:{type:Number,required:!0},modelUrl:{type:String,required:!0},inserted:{type:Object,required:!1}},emits:["availableAlternativesChange","alternativeInsert","alternativeUpdate","alternativeDelete"],components:{"new-named-item-row":z["a"]},setup:function(e,t){var n=Object(r["e"])("loading"),a=Object(r["e"])(""),i=Object(r["e"])([]),c=Object(b["a"])(),o=function(e){var n=i.value.find((function(t){return e.name===t.label}));if(n)c.error({title:"Cannot rename",content:"An alternative with the same name already exists."});else{var r=i.value.find((function(t){return e.previousName===t.label}));r.label=e.name,r.key=e.name,t.emit("alternativeUpdate",e),V(i,t.emit)}},u=function(e){var n=i.value.findIndex((function(t){return t.label===e})),r=i.value[n].id;i.value.splice(n,1),t.emit("alternativeDelete",{id:r,name:e}),V(i,t.emit)};return Object(r["d"])((function(){B(e.projectId,e.modelUrl,i,n,a,t.emit)})),Object(r["g"])(Object(r["f"])(e).inserted,(function(e){e&&i.value.forEach((function(t){var n=e[t.label];void 0!==n&&(t.id=n)}))})),{state:n,errorMessage:a,alternativeList:i,addAlternative:function(e){var n=i.value.find((function(t){return e===t.label}));if(n)c.error({title:"Cannot create",content:"An alternative with the same name already exists."});else{var r={label:e,key:e},a=i.value.findIndex((function(t){return e<t.label}));i.value.splice(a>=0?a:i.value.length,0,r),t.emit("alternativeInsert",e),V(i,t.emit)}},renderLabel:function(e){return Object(r["c"])(T,{alternativeName:e.option.label,alternativeId:e.option.id,onRename:o})},renderSuffix:function(e){return Object(r["c"])(L["a"],{emblem:e.option.label,onDelete:u})}}}};const X=F()(W,[["render",U]]);var G=X,H=n("c46e"),Q=Object(i["l"])("scenario alternative_1 alternative_2…");function Y(e,t,n,r,a,c){var o=Object(i["K"])("n-text"),u=Object(i["K"])("n-spin"),l=Object(i["K"])("n-result"),s=Object(i["K"])("n-input"),d=Object(i["K"])("n-space");return Object(i["D"])(),Object(i["h"])(d,{vertical:""},{default:Object(i["R"])((function(){return[Object(i["m"])(o,null,{default:Object(i["R"])((function(){return[Q]})),_:1}),"loading"===r.state?(Object(i["D"])(),Object(i["h"])(u,{key:0})):"error"===r.state?(Object(i["D"])(),Object(i["h"])(l,{key:1,status:"error",title:"Error",description:r.errorMessage},null,8,["description"])):(Object(i["D"])(),Object(i["h"])(s,{key:2,type:"textarea",value:r.text,placeholder:"Input scenarios and scenario alternatives",rows:r.rowCount,"onUpdate:value":r.parseUpdatedText},null,8,["value","rows","onUpdate:value"]))]})),_:1})}n("466d");function Z(e,t,n,r,a,i,c){_["l"]("scenarios?",e,t).then((function(e){var t=[];e.scenarios.forEach((function(e){t.push({scenarioId:e.scenario_id,scenarioName:e.scenario_name,scenarioAlternatives:e.scenario_alternatives})})),c("scenarioFetch",t),n.value=I(t),r.value=Math.max(10,(n.value.match(/\n/g)||"").length+3),a.value="ready"})).catch((function(e){i.value=e.message,a.value="error"}))}var $={props:{projectId:{type:Number,required:!0},modelUrl:{type:String,required:!0}},emits:["scenarioFetch","scenarioUpdate","duplicateScenario"],setup:function(e,t){var n=Object(r["e"])(""),a=Object(r["e"])(10),i=Object(r["e"])("loading"),c=Object(r["e"])("");return Object(r["d"])((function(){Z(e.projectId,e.modelUrl,n,a,i,c,t.emit)})),{text:n,rowCount:a,state:i,errorMessage:c,parseUpdatedText:function(e){n.value=e;var r=null;try{r=x(e)}catch(a){return void t.emit("duplicateScenario",a.message)}t.emit("scenarioUpdate",r)},fetchScenarios:function(){Z(e.projectId,e.modelUrl,n,a,i,c,t.emit)}}}};const ee=F()($,[["render",Y]]);var te=ee;function ne(e,t,n){if(null!==e&&null!==t){var r,a=Object(d["a"])(e);try{for(a.s();!(r=a.n()).done;){var i=Object(s["a"])(r.value,2),c=i[0],o=i[1];if(!o)return void(n.value="Alternatives missing for scenario '".concat(c,"'"));var u,l=new Set,f=Object(d["a"])(o);try{for(f.s();!(u=f.n()).done;){var b=u.value;if(!t.has(b))return void(n.value="Unknown alternative '".concat(b,"' in scenario '").concat(c,"'"));if(l.has(b))return void(n.value="Duplicate alternative '".concat(b,"' in scenario '").concat(c,"'"));l.add(b)}}catch(v){f.e(v)}finally{f.f()}}}catch(v){a.e(v)}finally{a.f()}n.value=""}}function re(e,t){if(null===e||null===t)return!1;if(e.size!=t.length)return!0;var n,r=Object(d["a"])(t);try{for(r.s();!(n=r.n()).done;){var a=n.value;if(!e.has(a.scenarioName))return!0;var i=e.get(a.scenarioName);if(i.length!=a.scenarioAlternatives.length)return!0;for(var c=0;c!=i.length;++c)if(i[c]!=a.scenarioAlternatives[c])return!0}}catch(o){r.e(o)}finally{r.f()}return!1}function ae(e,t,n,r){return e.isPending()||!r.value&&re(t,n)}var ie={props:{indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!0},projectName:{type:String,required:!0},projectId:{type:Number,required:!0},editUrl:{type:String,required:!0},modelUrl:{type:String,required:!0}},components:{"commit-button":D["a"],"commit-message-editor":R["a"],"alternative-list":G,"page-path":H["a"],"scenarios-table":te},setup:function(e){var t=Object(r["e"])(!1),n=Object(r["e"])(!1),a=Object(r["e"])(!1),i=Object(r["e"])([]),c=Object(r["e"])(""),o=Object(r["e"])(null),u=new N,l=null,s=null,d=null,v=Object(f["a"])(),m=Object(b["a"])();return{hasPendingChanges:t,committing:n,showCommitMessageEditor:a,insertedAlternatives:i,scenarioIssues:c,scenariosTable:o,startCommitting:function(){if(c.value)m.warning({title:"Cannot commit",content:"Scenarios have issues that must be solved first."});else{if(null!==d){var e=K(d,s);e.deleted.forEach((function(e){u.deleteScenario(e.scenarioId,e.scenarioName)})),e.inserted.forEach((function(e){u.insertScenarioAlternatives(e.scenarioId,e.scenarioName,e.scenarioAlternatives)}))}a.value=!0}},commit:function(r){a.value=!1,n.value=!0;var c=u.makeCommitData();_["b"](c,r,e.projectId,e.modelUrl).then((function(e){e.inserted&&e.inserted.alternative&&(i.value=e.inserted.alternative),o.value.fetchScenarios(),v.success("Commit successful."),t.value=!1})).catch((function(e){m.error({title:"Commit failure",content:e.message})})).finally((function(){u.clearPending(),n.value=!1}))},updateShowCommitMessageEditor:function(e){a.value=e},updateAvailableAlternatives:function(e){l=e,ne(d,e,c),t.value=ae(u,d,s,c)},storeAlternativeInsertion:function(e){u.insertAlternative(e),t.value=ae(u,d,s,c)},storeAlternativeUpdate:function(e){u.updateAlternative(e.previousName,e.id,e.name),t.value=ae(u,d,s,c)},storeAlternativeDeletion:function(e){u.deleteAlternative(e.id,e.name),t.value=ae(u,d,s,c)},setOriginalScenarios:function(e){s=e,d=new Map(e.map((function(e){return[e.scenarioName,e.scenarioAlternatives]})))},setScenarioIssues:function(e){c.value=e,t.value=ae(u,d,s,c)},updateScenarios:function(e){ne(e,l,c),d=e,t.value=ae(u,d,s,c)}}}};const ce=F()(ie,[["render",l]]);var oe=ce,ue=r["b"]({});ue.use(a["a"]),ue.component("scenarios-app",oe),ue.mount("#scenarios-app")},"8e39":function(e,t,n){"use strict";var r=n("7a23"),a=Object(r["l"])("Delete");function i(e,t,n,i,c,o){var u=Object(r["K"])("n-button");return Object(r["D"])(),Object(r["h"])(u,{size:"tiny",onClick:i.emitDelete},{default:Object(r["R"])((function(){return[a]})),_:1},8,["onClick"])}var c={props:{emblem:{type:[String,Array],required:!0}},emits:["delete"],setup:function(e,t){return{emitDelete:function(){t.emit("delete",e.emblem)}}}},o=n("6b0d"),u=n.n(o);const l=u()(c,[["render",i]]);t["a"]=l},c46e:function(e,t,n){"use strict";n("b0c0");var r=n("7a23");function a(e,t,n,a,i,c){var o=Object(r["K"])("n-breadcrumb-item"),u=Object(r["K"])("n-breadcrumb");return Object(r["D"])(),Object(r["h"])(u,null,{default:Object(r["R"])((function(){return[(Object(r["D"])(!0),Object(r["j"])(r["b"],null,Object(r["I"])(n.path,(function(e,t){return Object(r["D"])(),Object(r["h"])(o,{href:e.url,key:t},{default:Object(r["R"])((function(){return[Object(r["l"])(Object(r["L"])(e.name),1)]})),_:2},1032,["href"])})),128)),Object(r["m"])(o,null,{default:Object(r["R"])((function(){return[Object(r["l"])(Object(r["L"])(n.leafName),1)]})),_:1})]})),_:1})}var i={props:{path:Array,leafName:String}},c=n("6b0d"),o=n.n(c);const u=o()(i,[["render",a]]);t["a"]=u},d6ec:function(e,t,n){"use strict";var r=n("7a23"),a=Object(r["l"])(" Create ");function i(e,t,n,i,c,o){var u=Object(r["K"])("n-input"),l=Object(r["K"])("n-button"),s=Object(r["K"])("n-space");return Object(r["D"])(),Object(r["h"])(s,null,{default:Object(r["R"])((function(){return[Object(r["m"])(u,{clearable:"",placeholder:i.placeholder,value:i.currentName,"onUpdate:value":t[0]||(t[0]=function(e){return i.currentName=e}),size:"small"},null,8,["placeholder","value"]),Object(r["m"])(l,{onClick:i.emitCreate,size:"small"},{default:Object(r["R"])((function(){return[a]})),_:1},8,["onClick"])]})),_:1})}n("498a"),n("ac1f"),n("00b4"),n("fb6a");var c=n("f2bf"),o=n("7317"),u={props:{itemName:{type:String,required:!0}},emits:["create"],setup:function(e,t){var n=Object(c["e"])(""),r=Object(c["a"])((function(){return"Enter ".concat(e.itemName," name")})),a=Object(o["a"])();return{currentName:n,placeholder:r,emitCreate:function(){var r=new String(n.value).trim();if(r){var i=/[,]/;if(i.test(r)){var c=e.itemName.charAt(0).toUpperCase()+e.itemName.slice(1);a.error("".concat(c," name contains invalid special characters."))}else t.emit("create",r),n.value=""}else a.error("Please enter name for the new ".concat(e.itemName,"."))}}}},l=n("6b0d"),s=n.n(l);const d=s()(u,[["render",i]]);t["a"]=d},f77a:function(e,t,n){"use strict";var r=n("7a23"),a=Object(r["l"])(" Commit "),i=Object(r["l"])(" There are pending changes. "),c=Object(r["l"])(" Nothing to commit. ");function o(e,t,n,o,u,l){var s=Object(r["K"])("n-button"),d=Object(r["K"])("n-text"),f=Object(r["K"])("n-space");return Object(r["D"])(),Object(r["h"])(f,{align:"baseline"},{default:Object(r["R"])((function(){return[Object(r["m"])(s,{disabled:!n.hasPendingChanges,loading:n.committing,onClick:o.emitCommitRequest},{default:Object(r["R"])((function(){return[a]})),_:1},8,["disabled","loading","onClick"]),n.hasPendingChanges?(Object(r["D"])(),Object(r["h"])(d,{key:0},{default:Object(r["R"])((function(){return[i]})),_:1})):(Object(r["D"])(),Object(r["h"])(d,{key:1},{default:Object(r["R"])((function(){return[c]})),_:1}))]})),_:1})}var u={props:{hasPendingChanges:{type:Boolean,required:!0},committing:{type:Boolean,required:!0}},emit:["commitRequest"],setup:function(e,t){return{emitCommitRequest:function(){t.emit("commitRequest")}}}},l=n("6b0d"),s=n.n(l);const d=s()(u,[["render",o]]);t["a"]=d}});