var E=(i,n,e)=>{if(!n.has(i))throw TypeError("Cannot "+e)};var d=(i,n,e)=>(E(i,n,"read from private field"),e?e.call(i):n.get(i)),k=(i,n,e)=>{if(n.has(i))throw TypeError("Cannot add the same private member more than once");n instanceof WeakSet?n.add(i):n.set(i,e)},M=(i,n,e,t)=>(E(i,n,"write to private field"),t?t.call(i,e):n.set(i,e),e);import{_ as D,r as g,a as m,o as N,b as x,w as p,e as q,t as V,l as z,f as O,m as W,p as H,j as L,d as v,u as J,s as K,i as Q,n as X}from"./assets/_plugin-vue_export-helper-0666fbf1.js";import{k as G,P as Y,a as Z,l as $}from"./assets/communication-ed06992e.js";import{N as ee,D as te,C as ne,u as ae}from"./assets/NewNamedItemRow-e38ece02.js";import{F as I}from"./assets/Fetchable-59ae5fbd.js";import{I as ie}from"./assets/ItemNameInput-672f3faa.js";const U=Symbol("insert action"),w=Symbol("delete action"),R=Symbol("update action");class C{constructor(n,e=void 0,t=void 0){this.action=n,this.originalName=e,this.id=t}}class F{constructor(n,e=void 0){this.action=n,this.id=e,this.scenarioAlternatives=void 0}}var h,b;class re{constructor(){k(this,h,void 0);k(this,b,void 0);M(this,h,new Map),M(this,b,new Map)}makeCommitData(){const n=[],e=[],t=[];d(this,h).forEach(function(c,r){const o=c.action;o===U?n.push({name:r}):o===R?e.push({id:c.id,name:r}):o===w&&t.push(c.id)});const a=[],l=[],s=[];return d(this,b).forEach(function(c,r){c.action===U?(a.push({name:r}),c.scenarioAlternatives&&(c.id!==void 0&&l.push(c.id),c.scenarioAlternatives.forEach(function(o,f){s.push({scenario_name:r,alternative_name:o,rank:f})}))):c.action===w&&l.push(c.id)}),{insertions:{alternative:n,scenario:a,scenario_alternative:s},updates:{alternative:e},deletions:{alternative:t,scenario:l}}}isPending(){return d(this,h).size>0||d(this,b).size>0}clearPending(){d(this,h).clear(),d(this,b).clear()}insertAlternative(n){d(this,h).set(n,new C(U))}updateAlternative(n,e,t){let a=d(this,h).get(n);a===void 0?a=new C(R,n,e):d(this,h).delete(n),t!==a.originalName&&d(this,h).set(t,a)}deleteAlternative(n,e){const t=d(this,h).get(e);if(t===void 0)d(this,h).set(e,new C(w,e,n));else if(t.action===U)d(this,h).delete(e);else{d(this,h).delete(e);const a=t.originalName;d(this,h).set(a,new C(w,a,n))}}deleteScenario(n,e){const t=d(this,b).get(e);t!==void 0?t.id===void 0?d(this,b).delete(e):(t.action=w,t.id=n,t.scenarioAlternatives=void 0):d(this,b).set(e,new F(w,n))}insertScenarioAlternatives(n,e,t){let a=d(this,b).get(e);a===void 0?(a=new F(U,n),d(this,b).set(e,a)):a.action=U,a.scenarioAlternatives=[...t]}}h=new WeakMap,b=new WeakMap;function se(i){const n=new Map;return i.split(`
`).forEach(function(e){if(e=e.trim(),e){const t=e.split(/\s+/),a=t.shift();if(n.has(a))throw new Error(`Duplicate scenario '${a}'`);n.set(a,t)}}),n}function oe(i){const n=[];return i.forEach(function(e){const t=e.scenarioName+" "+e.scenarioAlternatives.join(" ");n.push(t)}),n.join(`
`)}function le(i,n){const e=new Map;n.forEach(function(l){e.set(l.scenarioName,l)});const t=[];i.forEach(function(l,s){const c=e.get(s);if(c===void 0)l?t.push({scenarioName:s,scenarioAlternatives:l}):t.push({name:s});else{let r=!1;l.length===c.scenarioAlternatives.length&&(r=l.every(function(o,f){return o==c.scenarioAlternatives[f]})),r||t.push({scenarioName:s,scenarioId:c.scenarioId,scenarioAlternatives:l})}});const a=[];for(const l of n)i.has(l.scenarioName)||a.push({scenarioId:l.scenarioId,scenarioName:l.scenarioName});return{inserted:t,deleted:a}}const ce={props:{alternativeName:{type:String,required:!0},alternativeId:{type:Number,required:!1}},emits:["rename"],components:{"item-name-input":ie},setup(i,n){const e=g(!1),t=g(i.alternativeName),a=g(null);return{editing:e,editValue:t,inputInstance:a,showInput(){e.value=!0},hideInput(){e.value=!1},emitRename(l){e.value=!1,n.emit("rename",{id:i.alternativeId,previousName:i.alternativeName,name:l})}}}};function ue(i,n,e,t,a,l){const s=m("n-text"),c=m("item-name-input"),r=m("n-space");return N(),x(r,{align:"baseline"},{default:p(()=>[t.editing?(N(),x(c,{key:1,name:e.alternativeName,onAccept:t.emitRename,onCancel:t.hideInput},null,8,["name","onAccept","onCancel"])):(N(),x(s,{key:0,onDblclick:t.showInput},{default:p(()=>[q(V(e.alternativeName),1)]),_:1},8,["onDblclick"]))]),_:1})}const de=D(ce,[["render",ue]]);function me(i,n,e,t,a,l){G("alternatives?",i,n).then(function(s){const c=s.alternatives,r=[];c.forEach(function(o){r.push({label:o.name,key:o.name,id:o.id})}),e.value=r,t.value=I.state.ready,j(e,l)}).catch(function(s){a.value=s.message,t.value=I.state.error})}function j(i,n){const e=new Set(i.value.map(t=>t.label));n("availableAlternativesChange",e)}const fe={props:{projectId:{type:Number,required:!0},modelUrl:{type:String,required:!0},inserted:{type:Object,required:!1}},emits:["availableAlternativesChange","alternativeInsert","alternativeUpdate","alternativeDelete"],components:{fetchable:I,"new-named-item-row":ee},setup(i,n){const e=g(I.state.loading),t=g(""),a=g([]),l=z(),s=function(r){if(a.value.find(_=>r.name===_.label)){l.error({title:"Cannot rename",content:"An alternative with the same name already exists."});return}const f=a.value.find(_=>r.previousName===_.label);f.label=r.name,f.key=r.name,n.emit("alternativeUpdate",r),j(a,n.emit)},c=function(r){const o=a.value.findIndex(_=>_.label===r),f=a.value[o].id;a.value.splice(o,1),n.emit("alternativeDelete",{id:f,name:r}),j(a,n.emit)};return O(function(){me(i.projectId,i.modelUrl,a,e,t,n.emit)}),W(H(i).inserted,function(r){r&&a.value.forEach(function(o){const f=r[o.label];f!==void 0&&(o.id=f)})}),{state:e,errorMessage:t,alternativeList:a,addAlternative(r){if(a.value.find(function(u){return r===u.label})){l.error({title:"Cannot create",content:"An alternative with the same name already exists."});return}const f={label:r,key:r},_=a.value.findIndex(u=>r<u.label);a.value.splice(_>=0?_:a.value.length,0,f),n.emit("alternativeInsert",r),j(a,n.emit)},renderLabel(r){return L(de,{alternativeName:r.option.label,alternativeId:r.option.id,onRename:s})},renderSuffix(r){return L(te,{emblem:r.option.label,onDelete:c})}}}};function ve(i,n,e,t,a,l){const s=m("n-tree"),c=m("new-named-item-row"),r=m("n-space"),o=m("fetchable");return N(),x(o,{state:t.state,"error-message":t.errorMessage},{default:p(()=>[v(r,{vertical:""},{default:p(()=>[v(s,{"block-line":"",data:t.alternativeList,"render-label":t.renderLabel,"render-suffix":t.renderSuffix,selectable:!1},null,8,["data","render-label","render-suffix"]),v(c,{"item-name":"alternative",onCreate:t.addAlternative},null,8,["onCreate"])]),_:1})]),_:1},8,["state","error-message"])}const he=D(fe,[["render",ve]]);function T(i,n,e,t,a,l,s){G("scenarios?",i,n).then(function(c){const r=[];c.scenarios.forEach(function(o){r.push({scenarioId:o.scenario_id,scenarioName:o.scenario_name,scenarioAlternatives:o.scenario_alternatives})}),s("scenarioFetch",r),e.value=oe(r),t.value=Math.max(10,(e.value.match(/\n/g)||"").length+3),a.value=I.state.ready}).catch(function(c){l.value=c.message,a.value=I.state.error})}const pe={props:{projectId:{type:Number,required:!0},modelUrl:{type:String,required:!0}},emits:["scenarioFetch","scenarioUpdate","duplicateScenario"],components:{fetchable:I},setup(i,n){const e=g(""),t=g(10),a=g(I.state.loading),l=g("");return O(function(){T(i.projectId,i.modelUrl,e,t,a,l,n.emit)}),{text:e,rowCount:t,state:a,errorMessage:l,parseUpdatedText(s){e.value=s;let c=null;try{c=se(s)}catch(r){n.emit("duplicateScenario",r.message);return}n.emit("scenarioUpdate",c)},fetchScenarios(){T(i.projectId,i.modelUrl,e,t,a,l,n.emit)}}}};function ge(i,n,e,t,a,l){const s=m("n-text"),c=m("n-input"),r=m("fetchable"),o=m("n-space");return N(),x(o,{vertical:""},{default:p(()=>[v(s,null,{default:p(()=>[q("scenario alternative_1 alternative_2…")]),_:1}),v(r,{state:t.state,"error-message":t.errorMessage},{default:p(()=>[v(c,{type:"textarea",value:t.text,placeholder:"Input scenarios and scenario alternatives",rows:t.rowCount,"onUpdate:value":t.parseUpdatedText},null,8,["value","rows","onUpdate:value"])]),_:1},8,["state","error-message"])]),_:1})}const _e=D(pe,[["render",ge]]);function B(i,n,e){if(!(i===null||n===null)){for(const[t,a]of i){if(!a){e.value=`Alternatives missing for scenario '${t}'`;return}const l=new Set;for(const s of a){if(!n.has(s)){e.value=`Unknown alternative '${s}' in scenario '${t}'`;return}if(l.has(s)){e.value=`Duplicate alternative '${s}' in scenario '${t}'`;return}l.add(s)}}e.value=""}}function Ae(i,n){if(i===null||n===null)return!1;if(i.size!=n.length)return!0;for(const e of n){if(!i.has(e.scenarioName))return!0;const t=i.get(e.scenarioName);if(t.length!=e.scenarioAlternatives.length)return!0;for(let a=0;a!=t.length;++a)if(t[a]!=e.scenarioAlternatives[a])return!0}return!1}function y(i,n,e,t){return i.isPending()||!t.value&&Ae(n,e)}const be={props:{indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!0},projectName:{type:String,required:!0},projectId:{type:Number,required:!0},editUrl:{type:String,required:!0},runUrl:{type:String,required:!0},resultsUrl:{type:String,required:!0},modelUrl:{type:String,required:!0},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{"commit-button":ne,"alternative-list":he,page:Y,"page-path":Z,"scenarios-table":_e},setup(i){const n=g(!1),e=g(!1),t=g([]),a=g(""),l=g(null),s=new re;let c=null,r=null,o=null;const f=J(),_=z();return W(n,ae),{hasPendingChanges:n,committing:e,insertedAlternatives:t,scenarioIssues:a,scenariosTable:l,commit(){if(e.value=!0,a.value){_.warning({title:"Cannot commit",content:"Scenarios have issues that must be solved first."}),e.value=!1;return}if(o!==null){const A=le(o,r);A.deleted.forEach(function(S){s.deleteScenario(S.scenarioId,S.scenarioName)}),A.inserted.forEach(function(S){s.insertScenarioAlternatives(S.scenarioId,S.scenarioName,S.scenarioAlternatives)})}const u=s.makeCommitData();$(u,"Modified alternatives and scenarios.",i.projectId,i.modelUrl).then(function(A){A.inserted&&A.inserted.alternative&&(t.value=A.inserted.alternative),l.value.fetchScenarios(),f.success("Commit successful."),n.value=!1}).catch(function(A){_.error({title:"Commit failure",content:A.message})}).finally(function(){s.clearPending(),e.value=!1})},updateAvailableAlternatives(u){c=u,B(o,u,a),n.value=y(s,o,r,a)},storeAlternativeInsertion(u){s.insertAlternative(u),n.value=y(s,o,r,a)},storeAlternativeUpdate(u){s.updateAlternative(u.previousName,u.id,u.name),n.value=y(s,o,r,a)},storeAlternativeDeletion(u){s.deleteAlternative(u.id,u.name),n.value=y(s,o,r,a)},setOriginalScenarios(u){r=u,o=new Map(u.map(A=>[A.scenarioName,A.scenarioAlternatives]))},setScenarioIssues(u){a.value=u,n.value=y(s,o,r,a)},updateScenarios(u){B(u,c,a),o=u,n.value=y(s,o,r,a)}}}},Se={type:"error"};function Ie(i,n,e,t,a,l){const s=m("page-path"),c=m("commit-button"),r=m("n-h1"),o=m("alternative-list"),f=m("n-space"),_=m("n-grid-item"),u=m("scenarios-table"),A=m("n-grid"),S=m("page");return N(),x(S,{name:"Edit model","index-url":e.indexUrl,"project-url":e.projectUrl,"edit-url":e.editUrl,"run-url":e.runUrl,"results-url":e.resultsUrl,"logout-url":e.logoutUrl,"logo-url":e.logoUrl},{header:p(()=>[v(s,{path:[{name:"Projects",url:e.indexUrl},{name:e.projectName,url:e.projectUrl},{name:"Model",url:e.editUrl}],"leaf-name":"scenarios"},null,8,["path"]),v(c,{"has-pending-changes":t.hasPendingChanges,committing:t.committing,onCommitRequest:t.commit},null,8,["has-pending-changes","committing","onCommitRequest"])]),default:p(()=>[v(A,{cols:"1 s:2 m:3 l:4 xl:6",responsive:"screen"},{default:p(()=>[v(_,null,{default:p(()=>[v(f,{vertical:""},{default:p(()=>[v(r,null,{default:p(()=>[q("Alternatives")]),_:1}),v(o,{"project-id":e.projectId,"model-url":e.modelUrl,inserted:t.insertedAlternatives,onAvailableAlternativesChange:t.updateAvailableAlternatives,onAlternativeInsert:t.storeAlternativeInsertion,onAlternativeUpdate:t.storeAlternativeUpdate,onAlternativeDelete:t.storeAlternativeDeletion},null,8,["project-id","model-url","inserted","onAvailableAlternativesChange","onAlternativeInsert","onAlternativeUpdate","onAlternativeDelete"])]),_:1})]),_:1}),v(_,{span:"1 m:2 l:3 xl:5"},{default:p(()=>[v(f,{vertical:""},{default:p(()=>[v(r,null,{default:p(()=>[q("Scenarios")]),_:1}),v(u,{ref:"scenariosTable","project-id":e.projectId,"model-url":e.modelUrl,onScenarioFetch:t.setOriginalScenarios,onScenarioUpdate:t.updateScenarios,onDuplicateScenario:t.setScenarioIssues},null,8,["project-id","model-url","onScenarioFetch","onScenarioUpdate","onDuplicateScenario"]),K("text",Se,V(t.scenarioIssues),1)]),_:1})]),_:1})]),_:1})]),_:1},8,["index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])}const Ue=D(be,[["render",Ie]]),P=Q({});P.use(X);P.component("scenarios-app",Ue);P.mount("#scenarios-app");
