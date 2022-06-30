(function(e){function t(t){for(var n,o,u=t[0],i=t[1],l=t[2],d=0,f=[];d<u.length;d++)o=u[d],Object.prototype.hasOwnProperty.call(a,o)&&a[o]&&f.push(a[o][0]),a[o]=0;for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(e[n]=i[n]);s&&s(t);while(f.length)f.shift()();return c.push.apply(c,l||[]),r()}function r(){for(var e,t=0;t<c.length;t++){for(var r=c[t],n=!0,u=1;u<r.length;u++){var i=r[u];0!==a[i]&&(n=!1)}n&&(c.splice(t--,1),e=o(o.s=r[0]))}return e}var n={},a={results:0},c=[];function o(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.m=e,o.c=n,o.d=function(e,t,r){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},o.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,t){if(1&t&&(e=o(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(o.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var n in e)o.d(r,n,function(t){return e[t]}.bind(null,n));return r},o.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="";var u=window["webpackJsonp"]=window["webpackJsonp"]||[],i=u.push.bind(u);u.push=t,u=u.slice();for(var l=0;l<u.length;l++)t(u[l]);var s=i;c.push([6,"chunk-vendors"]),r()})({"0274":function(e,t,r){"use strict";var n=r("7a23");function a(e,t,r,a,c,o){var u=Object(n["N"])("n-spin"),i=Object(n["N"])("n-result");return"loading"===r.state?(Object(n["G"])(),Object(n["i"])(u,{key:0})):"error"===r.state?(Object(n["G"])(),Object(n["i"])(i,{key:1,status:"error",title:"Error",description:r.errorMessage},null,8,["description"])):"waiting"===r.state?Object(n["M"])(e.$slots,"waiting",{key:2}):Object(n["M"])(e.$slots,"default",{key:3})}var c={props:{state:{type:String,required:!0},errorMessage:{type:String,required:!1,default:""}},state:{loading:"loading",waiting:"waiting",ready:"ready",error:"error"}},o=r("6b0d"),u=r.n(o);const i=u()(c,[["render",a]]);t["a"]=i},2225:function(e,t,r){"use strict";r("a2d1")},2880:function(e,t,r){"use strict";r.r(t);r("e260"),r("e6cf"),r("cca6"),r("a79d");var n=r("f2bf"),a=r("5333"),c=r("7a23");function o(e,t,r,n,a,o){var u=Object(c["N"])("page-path"),i=Object(c["N"])("results-scenario-list"),l=Object(c["N"])("n-layout-sider"),s=Object(c["N"])("results-summary"),d=Object(c["N"])("results-output-directory"),f=Object(c["N"])("results-plots"),b=Object(c["N"])("n-layout-content"),j=Object(c["N"])("n-layout"),p=Object(c["N"])("page");return Object(c["G"])(),Object(c["i"])(p,{name:"Results","index-url":r.indexUrl,"project-url":r.projectUrl,"edit-url":r.editUrl,"run-url":r.runUrl,"results-url":r.resultsUrl,"logout-url":r.logoutUrl,"logo-url":r.logoUrl},{header:Object(c["V"])((function(){return[Object(c["n"])(u,{path:[{name:"Projects",url:r.indexUrl},{name:r.projectName,url:r.projectUrl}],"leaf-name":"Results"},null,8,["path"])]})),default:Object(c["V"])((function(){return[Object(c["n"])(j,{id:"main-layout","has-sider":"",position:"absolute"},{default:Object(c["V"])((function(){return[Object(c["n"])(l,null,{default:Object(c["V"])((function(){return[Object(c["n"])(i,{"project-id":r.projectId,"run-url":r.runUrl,"summary-url":r.summaryUrl,onScenarioSelect:n.loadResults},null,8,["project-id","run-url","summary-url","onScenarioSelect"])]})),_:1}),Object(c["n"])(b,{"content-style":"margin-left: 1em; margin-right: 1em"},{default:Object(c["V"])((function(){return[Object(c["n"])(s,{"project-id":r.projectId,"summary-url":r.summaryUrl,ref:"summary"},null,8,["project-id","summary-url"]),Object(c["n"])(d,{"project-id":r.projectId,"summary-url":r.summaryUrl,ref:"outputDirectory"},null,8,["project-id","summary-url"]),Object(c["n"])(f,{"project-id":r.projectId,"analysis-url":r.analysisUrl,"summary-url":r.summaryUrl,ref:"plots"},null,8,["project-id","analysis-url","summary-url"])]})),_:1})]})),_:1})]})),_:1},8,["index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])}r("a9e3");var u=r("9973"),i=r("c46e"),l=Object(c["m"])("No data to show.");function s(e,t,r,n,a,o){var u=Object(c["N"])("plot-figure"),i=Object(c["N"])("keyed-card"),s=Object(c["N"])("n-grid-item"),d=Object(c["N"])("n-grid"),f=Object(c["N"])("n-text"),b=Object(c["N"])("fetchable");return Object(c["G"])(),Object(c["i"])(b,{state:n.state,"error-message":n.errorMessage},{default:Object(c["V"])((function(){return[n.plotBoxes.length>0?(Object(c["G"])(),Object(c["i"])(d,{key:0,cols:"1 l:2",responsive:"screen"},{default:Object(c["V"])((function(){return[(Object(c["G"])(!0),Object(c["k"])(c["b"],null,Object(c["L"])(n.plotBoxes,(function(e,t){return Object(c["G"])(),Object(c["i"])(s,{key:t},{default:Object(c["V"])((function(){return[Object(c["n"])(i,{title:e.title,fingerprint:t,onClose:n.dropPlot},{default:Object(c["V"])((function(){return[Object(c["n"])(u,{identifier:t,"data-table":e.data,"index-names":e.indexNames,"entity-class":e.entityClass,"parameter-name":e.parameterName,"project-id":r.projectId,"analysis-url":r.analysisUrl},null,8,["identifier","data-table","index-names","entity-class","parameter-name","project-id","analysis-url"])]})),_:2},1032,["title","fingerprint","onClose"])]})),_:2},1024)})),128))]})),_:1})):(Object(c["G"])(),Object(c["i"])(f,{key:1},{default:Object(c["V"])((function(){return[l]})),_:1}))]})),_:1},8,["state","error-message"])}var d=r("c7eb"),f=r("3835"),b=r("2909"),j=r("b85c"),p=r("1da1"),O=(r("a434"),r("d3b7"),r("ddb0"),r("4ec9"),r("3ca3"),r("d81d"),r("b0c0"),r("99af"),r("53ca"));r("d9e2");function y(e){return e.data.map((function(e,t){return[t+1,e]}))}function m(e,t,r){if(null===r||"object"!==Object(O["a"])(r))e.push([t,r]);else{var n,a=v(r.data),c=Object(j["a"])(a);try{for(c.s();!(n=c.n()).done;){var o=n.value;e.push([t].concat(Object(b["a"])(o)))}}catch(u){c.e(u)}finally{c.f()}}}function v(e){var t=new Array;if(Array.isArray(e)){var r,n=Object(j["a"])(e);try{for(n.s();!(r=n.n()).done;){var a=r.value,c=a[0],o=a[1];m(t,c,o)}}catch(l){n.e(l)}finally{n.f()}}else for(var u in e){var i=e[u];m(t,u,i)}return t}function h(e){return v(e.data)}function g(e){return void 0!==e.index_name?[e.index_name]:["x"]}function x(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if(r+=1,t.length<r&&t.push(void 0!==e.index_name?e.index_name:"x"),Array.isArray(e.data)){var n,a=Object(j["a"])(e.data);try{for(a.s();!(n=a.n()).done;){var c=n.value,o=c[1];null!==o&&"object"===Object(O["a"])(o)&&(t=x(o,t,r))}}catch(l){a.e(l)}finally{a.f()}}else for(var u in e.data){var i=e.data[u];null!==i&&"object"===Object(O["a"])(i)&&(t=x(i,t,r))}return t}function N(e,t){if("array"===t)return{indexNames:g(e),table:y(e)};if("map"===t)return{indexNames:x(e),table:h(e)};throw new Error("Unknown parameter value type.")}var w=r("315d"),S=(r("a4d3"),r("e01a"),Symbol("object class type")),U=Symbol("object class type");function k(e){switch(e){case 1:return S;case 2:return U;default:throw Error("Unknown entity class type id")}}var _=r("0274");function V(e,t,r,n,a,o){var u=Object(c["N"])("n-card");return Object(c["G"])(),Object(c["i"])(u,{closable:"",title:r.title,onClose:n.emitClose},{default:Object(c["V"])((function(){return[Object(c["M"])(e.$slots,"default")]})),_:3},8,["title","onClose"])}var q={props:{fingerprint:{type:[Number,String],required:!0},title:{type:String,required:!1}},emits:["close"],setup:function(e,t){return{emitClose:function(){t.emit("close",e.fingerprint)}}}},I=r("6b0d"),E=r.n(I);const G=E()(q,[["render",V]]);var M=G,C=Object(c["m"])(" Download CSV "),T=["id"];function D(e,t,r,n,a,o){var u=Object(c["N"])("n-select"),i=Object(c["N"])("n-button"),l=Object(c["N"])("n-space");return Object(c["G"])(),Object(c["i"])(l,{vertical:""},{default:Object(c["V"])((function(){return[Object(c["n"])(l,null,{default:Object(c["V"])((function(){return[Object(c["n"])(u,{value:n.plotType,"onUpdate:value":[t[0]||(t[0]=function(e){return n.plotType=e}),n.replot],options:n.plotTypeOptions,"consistent-menu-width":!1,size:"small"},null,8,["value","options","onUpdate:value"]),Object(c["n"])(i,{onClick:n.prepareDownload,loading:n.preparingDownload,disabled:n.downloadButtonDisabled,size:"small"},{default:Object(c["V"])((function(){return[C]})),_:1},8,["onClick","loading","disabled"])]})),_:1}),Object(c["l"])("div",{id:n.plotId},null,8,T)]})),_:1})}var P=r("7317"),J=r("1c68"),F=r.n(J);r("fb6a"),r("a15b"),r("cb29"),r("6062"),r("159b"),r("33d1"),r("ea98");function A(e,t){var r=e.slice(0,t),n=e.slice(t+1,-1);return r.concat(n).join(" | ")}function R(e,t){var r=new Map,n=new Set,a=new Set;return e.forEach((function(e){var c=e.at(-1),o=e[t];a.add(o);var u=A(e,t);n.add(u);var i=r.get(o);void 0===i&&(i=new Map,r.set(o,i)),i.set(u,c)})),{namesSize:n.size,xSize:a.size,grouped:r}}function z(e,t,r){var n=R(e,t),a=new Map;return n.grouped.forEach((function(e,t){e.forEach((function(e,n){var c=a.get(n);void 0===c&&(c={x:[],y:[],name:n,type:r},a.set(n,c)),c.x.push(t),c.y.push(e)}))})),Object(b["a"])(a.values())}function L(e,t,r){var n=0;e&&(n=e[0].length-2);var a=z(e,n,"scatter"),c={xaxis:{title:t[t.length-1]}},o={responsive:!0};F.a.newPlot(r,a,c,o)}function B(e,t,r){var n=0;e&&(n=e[0].length-2);var a=z(e,n,"bar"),c={xaxis:{title:t[t.length-1]}},o={responsive:!0};F.a.newPlot(r,a,c,o)}function $(e,t,r){var n=0;e&&(n=e[0].length-2);var a=z(e,n,"bar"),c={xaxis:{title:t[t.length-1]},barmode:"stack"},o={responsive:!0};F.a.newPlot(r,a,c,o)}function K(e,t,r){return H.apply(this,arguments)}function H(){return H=Object(p["a"])(Object(d["a"])().mark((function e(t,r,n){var a;return Object(d["a"])().wrap((function(e){while(1)switch(e.prev=e.next){case 0:if(t.type!==U){e.next=7;break}return e.next=3,Object(w["h"])("relationship class object classes?",r,n,{relationship_class_id:t.id});case 3:return a=e.sent,e.abrupt("return",a.object_classes);case 7:return e.abrupt("return",[t.name]);case 8:case"end":return e.stop()}}),e)}))),H.apply(this,arguments)}function W(e,t,r,n){switch(e.value){case"bar":B(t,r,n);break;case"stacked bar":$(t,r,n);break;case"scatter":L(t,r,n);break;default:throw Error("Unknown plot type '".concat(e.value,"'"))}}var X={props:{identifier:{type:[String,Number],required:!0},dataTable:{type:Array,required:!0},indexNames:{type:Array,required:!0},entityClass:{type:Object,required:!0},parameterName:{type:String,required:!0},projectId:{type:Number,required:!0},analysisUrl:{type:String,required:!0}},setup:function(e){var t="plot-".concat(e.identifier),a=Object(n["f"])("scatter"),c=[{label:"Scatter",value:"scatter"},{label:"Bars",value:"bar"},{label:"Stacked bars",value:"stacked bar"}],o=Object(n["f"])(!1),u=Object(P["a"])();return Object(n["e"])((function(){W(a,e.dataTable,e.indexNames,t)})),{plotId:t,plotType:a,plotTypeOptions:c,preparingDownload:o,downloadButtonDisabled:Object(n["a"])((function(){return o.value})),prepareDownload:function(){o.value=!0,K(e.entityClass,e.projectId,e.analysisUrl).then((function(t){var n=r("094f").createArrayCsvStringifier,a=n({header:[].concat(Object(b["a"])(t),Object(b["a"])(e.indexNames),["y"])}),c=a.getHeaderString(),o=a.stringifyRecords(e.dataTable),u=document.createElement("a");u.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(c+o)),u.setAttribute("download","".concat(e.entityClass.name,"_").concat(e.parameterName,".csv")),u.style.display="none",document.body.appendChild(u),u.click(),document.body.removeChild(u)})).catch((function(e){u.error(e.message)})).finally((function(){o.value=!1}))},replot:function(){W(a,e.dataTable,e.indexNames,t)}}}};const Y=E()(X,[["render",D]]);var Q=Y;function Z(e,t,r,n,a,c,o,u){return ee.apply(this,arguments)}function ee(){return ee=Object(p["a"])(Object(d["a"])().mark((function e(t,r,n,a,c,o,u,i){return Object(d["a"])().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.prev=0,e.delegateYield(Object(d["a"])().mark((function e(){var u,i,l,s,p,O,y,m,v,h,g,x,w,S,U,k,_,V,q,I,E,G,M,C,T,D,P,J,F,A,R,z,L;return Object(d["a"])().wrap((function(e){while(1)switch(e.prev=e.next){case 0:return e.next=2,t;case 2:return u=e.sent,e.next=5,r;case 5:return i=e.sent,e.next=8,n;case 8:return l=e.sent,e.next=11,a;case 11:return s=e.sent,e.next=14,c;case 14:p=e.sent,O=new Map,y=Object(j["a"])(p);try{for(y.s();!(m=y.n()).done;){v=m.value,h=O.get(v.entity_class_id),void 0===h&&(h=new Map,O.set(v.entity_class_id,h)),g=s.get(v.parameter_definition_id),x=h.get(g),void 0===x&&(x={indexNames:void 0,table:[]},h.set(g,x)),w=v.object_id,S=void 0,null===w?(U=l.get(v.relationship_id),S=U.map((function(e){return i.get(e)}))):S=[i.get(w)],k=JSON.parse(v.value),_=void 0,_=null!==v.type?N(k,v.type):{indexNames:[],table:[[k]]},V=Object(j["a"])(_.table);try{for(V.s();!(q=V.n()).done;)I=q.value,x.table.push([].concat(Object(b["a"])(S),Object(b["a"])(I)))}catch(d){V.e(d)}finally{V.f()}x.indexNames=_.indexNames}}catch(d){y.e(d)}finally{y.f()}E=Object(j["a"])(O);try{for(E.s();!(G=E.n()).done;){M=Object(f["a"])(G.value,2),C=M[0],T=M[1],D=u.get(C),P={id:C,name:D.name,type:D.type},J=Object(j["a"])(T);try{for(J.s();!(F=J.n()).done;)A=Object(f["a"])(F.value,2),R=A[0],z=A[1],L="".concat(D.name," - ").concat(R),o.value.push({title:L,entityClass:P,parameterName:R,indexNames:z.indexNames,data:z.table})}catch(d){J.e(d)}finally{J.f()}}}catch(d){E.e(d)}finally{E.f()}case 20:case"end":return e.stop()}}),e)}))(),"t0",2);case 2:e.next=9;break;case 4:return e.prev=4,e.t1=e["catch"](0),u.value=_["a"].state.error,i.value=e.t1.message,e.abrupt("return");case 9:u.value=_["a"].state.ready;case 10:case"end":return e.stop()}}),e,null,[[0,4]])}))),ee.apply(this,arguments)}var te={props:{projectId:{type:Number,required:!0},analysisUrl:{type:String,required:!0},summaryUrl:{type:String,required:!0}},components:{fetchable:_["a"],"keyed-card":M,"plot-figure":Q},setup:function(e){var t=Object(n["f"])([]),r=Object(n["f"])(_["a"].state.waiting),a=Object(n["f"])("");return{plotBoxes:t,state:r,errorMessage:a,dropPlot:function(e){t.value.splice(e,1)},loadPlots:function(n){r.value=_["a"].state.loading,t.value.length=0;var c=Object(w["m"])(e.projectId,e.summaryUrl,n.scenarioExecutionId).then((function(t){return null===t.alternative_id?{values:[]}:Object(w["h"])("parameter values?",e.projectId,e.analysisUrl,{alternative_id:t.alternative_id})})).then((function(e){return e.values})),o=Object(w["h"])("entity classes?",e.projectId,e.analysisUrl).then((function(e){return new Map(e.classes.map((function(e){var t={name:e.name,type:k(e.type_id)};return[e.id,t]})))})),u=Object(w["h"])("objects?",e.projectId,e.analysisUrl).then((function(e){return new Map(e.objects.map((function(e){return[e.id,e.name]})))})),i=Object(w["h"])("relationships?",e.projectId,e.analysisUrl).then((function(e){var t,r=new Map,n=Object(j["a"])(e.relationships);try{for(n.s();!(t=n.n()).done;){var a=t.value,c=r.get(a.id);void 0===c&&(c=[],r.set(a.id,c)),c.push(a.object_id)}}catch(o){n.e(o)}finally{n.f()}return r})),l=Object(w["h"])("parameter definitions?",e.projectId,e.analysisUrl).then((function(e){return new Map(e.definitions.map((function(e){return[e.id,e.name]})))}));Z(o,u,i,l,c,t,r,a)}}}};const re=E()(te,[["render",s]]);var ne=re,ae=Object(c["m"])(" No scenario results found. Go to the "),ce=Object(c["m"])("Run page"),oe=Object(c["m"])(" to solve the model. ");function ue(e,t,r,n,a,o){var u=Object(c["N"])("n-a"),i=Object(c["N"])("n-p"),l=Object(c["N"])("n-tree"),s=Object(c["N"])("n-thing"),d=Object(c["N"])("n-list-item"),f=Object(c["N"])("n-list"),b=Object(c["N"])("fetchable");return Object(c["G"])(),Object(c["i"])(b,{state:n.state,"error-message":n.errorMessage},{default:Object(c["V"])((function(){return[n.hasScenarios?(Object(c["G"])(),Object(c["i"])(f,{key:1},{default:Object(c["V"])((function(){return[(Object(c["G"])(!0),Object(c["k"])(c["b"],null,Object(c["L"])(n.scenarios,(function(e,t){return Object(c["G"])(),Object(c["i"])(d,{key:t},{default:Object(c["V"])((function(){return[Object(c["n"])(s,{title:e.name},{default:Object(c["V"])((function(){return[Object(c["n"])(l,{data:e.executions,selectable:"","selected-keys":e.selected,"onUpdate:selectedKeys":n.emitScenarioSelect},null,8,["data","selected-keys","onUpdate:selectedKeys"])]})),_:2},1032,["title"])]})),_:2},1024)})),128))]})),_:1})):(Object(c["G"])(),Object(c["i"])(i,{key:0},{default:Object(c["V"])((function(){return[ae,Object(c["n"])(u,{href:r.runUrl},{default:Object(c["V"])((function(){return[ce]})),_:1},8,["href"]),oe]})),_:1}))]})),_:1},8,["state","error-message"])}var ie={props:{projectId:{type:Number,required:!0},runUrl:{type:String,required:!0},summaryUrl:{type:String,required:!0}},emits:["scenarioSelect"],components:{fetchable:_["a"]},setup:function(e,t){var r=Object(n["f"])([]),a=Object(n["f"])(_["a"].state.loading),c=Object(n["f"])(""),o=Object(n["a"])((function(){return r.value.length>0}));return Object(n["e"])((function(){Object(w["i"])(e.projectId,e.summaryUrl).then((function(e){var t=Intl.DateTimeFormat([],{dateStyle:"short",timeStyle:"short"});for(var n in e.scenarios){var c,o=[],u=Object(j["a"])(e.scenarios[n]);try{for(u.s();!(c=u.n()).done;){var i=c.value;o.push({timeStamp:new Date(i.time_stamp),scenarioExecutionId:i.scenario_execution_id})}}catch(O){u.e(O)}finally{u.f()}for(var l=[],s=0;s<o.length;++s){var d=o[s],f=t.format(d.timeStamp),b=0==s?f.concat(" (latest)"):f;l.push({label:b,key:d.scenarioExecutionId,scenario:n})}var p={name:n,executions:l,selected:[]};r.value.push(p)}a.value=_["a"].state.ready})).catch((function(e){c.value=e.message,a.value=_["a"].state.error}))})),{scenarios:r,hasScenarios:o,state:a,errorMessage:c,emitScenarioSelect:function(e,n){if(0!==e.length){var a,c=Object(j["a"])(r.value);try{for(c.s();!(a=c.n()).done;){var o,u=a.value,i=!1,l=Object(j["a"])(u.executions);try{for(l.s();!(o=l.n()).done;){var s=o.value;if(s.key===e[0]){u.selected=[e[0]],i=!0;break}}}catch(f){l.e(f)}finally{l.f()}i||(u.selected.length=0)}}catch(f){c.e(f)}finally{c.f()}var d=n[0];t.emit("scenarioSelect",{scenario:d.scenario,scenarioExecutionId:d.key})}}}}};const le=E()(ie,[["render",ue]]);var se=le;function de(e,t,r,n,a,o){var u=Object(c["N"])("n-text"),i=Object(c["N"])("n-th"),l=Object(c["N"])("n-tr"),s=Object(c["N"])("n-thead"),d=Object(c["N"])("n-td"),f=Object(c["N"])("n-tbody"),b=Object(c["N"])("n-table"),j=Object(c["N"])("n-list-item"),p=Object(c["N"])("n-list"),O=Object(c["N"])("n-space"),y=Object(c["N"])("fetchable");return Object(c["G"])(),Object(c["i"])(y,{state:n.state,"error-message":n.errorMessage},{default:Object(c["V"])((function(){return[Object(c["n"])(O,{vertical:""},{default:Object(c["V"])((function(){return[Object(c["n"])(u,{strong:""},{default:Object(c["V"])((function(){return[Object(c["m"])(Object(c["O"])(n.title),1)]})),_:1}),Object(c["n"])(p,null,{default:Object(c["V"])((function(){return[(Object(c["G"])(!0),Object(c["k"])(c["b"],null,Object(c["L"])(n.tables,(function(e,t){return Object(c["G"])(),Object(c["i"])(j,{key:t},{default:Object(c["V"])((function(){return[Object(c["n"])(u,{type:"info"},{default:Object(c["V"])((function(){return[Object(c["m"])(Object(c["O"])(e.title),1)]})),_:2},1024),Object(c["n"])(b,{bordered:!1,size:"small"},{default:Object(c["V"])((function(){return[Object(c["W"])(Object(c["n"])(s,null,{default:Object(c["V"])((function(){return[Object(c["n"])(l,null,{default:Object(c["V"])((function(){return[(Object(c["G"])(!0),Object(c["k"])(c["b"],null,Object(c["L"])(e.header,(function(e,t){return Object(c["G"])(),Object(c["i"])(i,{key:t},{default:Object(c["V"])((function(){return[Object(c["m"])(Object(c["O"])(e),1)]})),_:2},1024)})),128))]})),_:2},1024)]})),_:2},1536),[[c["S"],null!==e.header]]),Object(c["n"])(f,null,{default:Object(c["V"])((function(){return[(Object(c["G"])(!0),Object(c["k"])(c["b"],null,Object(c["L"])(e.rows,(function(e,t){return Object(c["G"])(),Object(c["i"])(l,{key:t},{default:Object(c["V"])((function(){return[(Object(c["G"])(!0),Object(c["k"])(c["b"],null,Object(c["L"])(e,(function(e,t){return Object(c["G"])(),Object(c["i"])(d,{key:t},{default:Object(c["V"])((function(){return[Object(c["m"])(Object(c["O"])(e),1)]})),_:2},1024)})),128))]})),_:2},1024)})),128))]})),_:2},1024)]})),_:2},1024)]})),_:2},1024)})),128))]})),_:1})]})),_:1})]})),_:1},8,["state","error-message"])}function fe(e,t){var r=function(e,t){var r=new Array(t-e.length);r.fill(""),e.splice.apply(e,[e.length,0].concat(r))};null!==e.header&&e.header.length<t&&r(e.header,t);var n,a=Object(j["a"])(e.rows);try{for(a.s();!(n=a.n()).done;){var c=n.value;c.length<t&&r(c,t)}}catch(o){a.e(o)}finally{a.f()}}function be(e){var t,r=function(){return{title:"",header:[""],rows:[]}},n=[],a=null,c=0,o=-1,u=Object(j["a"])(e);try{for(u.s();!(t=u.n()).done;){var i=t.value;if(0!==i.length){var l;if(0===c)if(a.title=i[0],i.length>1)(l=a.header).splice.apply(l,[a.header.length,0].concat(Object(b["a"])(i.slice(1))));else a.header=null;else a.rows.push(i);o=Math.max(o,i.length),++c}else null!==a&&fe(a,o),a=r(),n.push(a),c=0}}catch(s){u.e(s)}finally{u.f()}return null!==a&&fe(a,o),n}var je={props:{projectId:{type:Number,required:!0},summaryUrl:{type:String,required:!0}},components:{fetchable:_["a"]},setup:function(e){var t=Object(n["f"])(""),r=Object(n["f"])([]),a=Object(n["f"])(_["a"].state.waiting),c=Object(n["f"])("");return{title:t,tables:r,state:a,errorMessage:c,loadSummary:function(n){a.value=_["a"].state.loading,Object(w["n"])(e.projectId,e.summaryUrl,n.scenarioExecutionId).then((function(e){var n=e.summary;if(0!==n.length){var a=n.splice(0,1);t.value=a[0][0],0!==n.length&&(r.value=be(n))}})).catch((function(e){c.value=e.message,a.value=_["a"].state.error})).finally((function(){a.value===_["a"].state.loading&&(a.value=_["a"].state.ready)}))}}}};const pe=E()(je,[["render",de]]);var Oe=pe,ye=Object(c["m"])(" Copy to clipboard ");function me(e,t,r,n,a,o){var u=Object(c["N"])("n-text"),i=Object(c["N"])("n-button"),l=Object(c["N"])("n-space"),s=Object(c["N"])("n-thing"),d=Object(c["N"])("fetchable");return Object(c["G"])(),Object(c["i"])(d,{state:n.state,"error-message":n.errorMessage},{default:Object(c["V"])((function(){return[Object(c["n"])(s,{title:"Output directory for .csv files"},{default:Object(c["V"])((function(){return[Object(c["n"])(l,null,{default:Object(c["V"])((function(){return[Object(c["n"])(u,{code:""},{default:Object(c["V"])((function(){return[Object(c["m"])(Object(c["O"])(n.outputDirectory),1)]})),_:1}),Object(c["n"])(i,{size:"tiny",onClick:n.copyDirectoryToClipboard},{default:Object(c["V"])((function(){return[ye]})),_:1},8,["onClick"])]})),_:1})]})),_:1})]})),_:1},8,["state","error-message"])}function ve(e,t,r,n,a,c){a.value=_["a"].state.loading,Object(w["k"])(e,t,r).then((function(e){n.value=e.directory,a.value=_["a"].state.ready})).catch((function(e){a.value=_["a"].state.error,c.value=e.message}))}var he={props:{projectId:{type:Number,required:!0},summaryUrl:{type:String,required:!0}},components:{fetchable:_["a"]},setup:function(e){var t=Object(n["f"])(null),r=Object(n["f"])(_["a"].state.waiting),a=Object(n["f"])("");return{outputDirectory:t,state:r,errorMessage:a,copyDirectoryToClipboard:function(){navigator.clipboard.writeText(t.value)},loadDirectory:function(n){ve(e.projectId,e.summaryUrl,n.scenarioExecutionId,t,r,a)}}}};const ge=E()(he,[["render",me]]);var xe=ge,Ne={props:{indexUrl:{type:String,required:!0},editUrl:{type:String,required:!0},projectName:{type:String,required:!0},projectUrl:{type:String,required:!0},projectId:{type:Number,required:!0},runUrl:{type:String,required:!0},resultsUrl:{type:String,required:!0},analysisUrl:{type:String,required:!0},summaryUrl:{type:String,required:!0},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{page:u["a"],"page-path":i["a"],"results-plots":ne,"results-scenario-list":se,"results-summary":Oe,"results-output-directory":xe},setup:function(){var e=Object(n["f"])(null),t=Object(n["f"])(null),r=Object(n["f"])(null);return{summary:e,outputDirectory:t,plots:r,loadResults:function(n){e.value.loadSummary(n),t.value.loadDirectory(n),r.value.loadPlots(n)}}}};r("71aa");const we=E()(Ne,[["render",o]]);var Se=we,Ue=n["b"]({});Ue.use(a["a"]),Ue.component("results-app",Se),Ue.mount("#results-app")},"315d":function(e,t,r){"use strict";r.d(t,"d",(function(){return c})),r.d(t,"h",(function(){return s})),r.d(t,"b",(function(){return d})),r.d(t,"l",(function(){return u})),r.d(t,"c",(function(){return i})),r.d(t,"e",(function(){return l})),r.d(t,"g",(function(){return f})),r.d(t,"f",(function(){return b})),r.d(t,"a",(function(){return j})),r.d(t,"j",(function(){return p})),r.d(t,"i",(function(){return m})),r.d(t,"n",(function(){return O})),r.d(t,"k",(function(){return y})),r.d(t,"m",(function(){return v}));var n=r("5530");r("ac1f"),r("1276"),r("498a"),r("e9c4"),r("d3b7"),r("d9e2"),r("99af");function a(e){var t=null;if(document.cookie&&""!==document.cookie)for(var r=document.cookie.split(";"),n=0;n<r.length;n++){var a=r[n].trim();if(a.substring(0,e.length+1)===e+"="){t=decodeURIComponent(a.substring(e.length+1));break}}return t}var c=a("csrftoken");function o(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":c,"Content-Type":"application/json"}}}function u(e){var t=o();return t["body"]=JSON.stringify({type:"project list?"}),fetch(e,t).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load project list: ".concat(e))}))}))}function i(e,t){var r=o();return r["body"]=JSON.stringify({type:"create project?",name:e}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create project: ".concat(e))}))}))}function l(e,t){var r=o();return r["body"]=JSON.stringify({type:"destroy project?",id:e}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete project: ".concat(e))}))}))}function s(e,t,r){var a=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},c=o();return c["body"]=JSON.stringify(Object(n["a"])({type:e,projectId:t},a)),fetch(r,c).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch ".concat(e,": ").concat(t))}))}))}function d(e,t,r,a){var c=o();return c.body=JSON.stringify(Object(n["a"])({type:"commit",projectId:r,message:t},e)),fetch(a,c).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error(e)}))}))}function f(e,t){var r=o();return r.body=JSON.stringify({type:"current execution?",projectId:e}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch current run: ".concat(e))}))}))}function b(e,t,r){var n=o();return n["body"]=JSON.stringify({type:"execute?",projectId:e,scenarios:r}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execute: ".concat(e))}))}))}function j(e,t){var r=o();return r["body"]=JSON.stringify({type:"abort?",projectId:e}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to abort execution: ".concat(e))}))}))}function p(e,t){var r=o();return r["body"]=JSON.stringify({type:"briefing?",projectId:e}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to fetch execution status: ".concat(e))}))}))}function O(e,t,r){var n=o();return n.body=JSON.stringify({type:"summary?",projectId:e,scenarioExecutionId:r}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load summary: ".concat(e))}))}))}function y(e,t,r){var n=o();return n.body=JSON.stringify({type:"output directory?",projectId:e,scenarioExecutionId:r}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load output directory path: ".concat(e))}))}))}function m(e,t){var r=o();return r.body=JSON.stringify({type:"scenario list?",projectId:e}),fetch(t,r).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load scenarios: ".concat(e))}))}))}function v(e,t,r){var n=o();return n.body=JSON.stringify({type:"result alternative?",projectId:e,scenarioExecutionId:r}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to result alternative: ".concat(e))}))}))}},"40c7":function(e,t,r){},6:function(e,t,r){e.exports=r("2880")},"71aa":function(e,t,r){"use strict";r("40c7")},9973:function(e,t,r){"use strict";r("b0c0");var n=r("7a23"),a={class:"page-content"},c={class:"page-content"};function o(e,t,r,o,u,i){var l=Object(n["N"])("navigation-menu"),s=Object(n["N"])("n-card"),d=Object(n["N"])("n-layout-header"),f=Object(n["N"])("n-layout");return Object(n["G"])(),Object(n["i"])(f,{position:"absolute"},{default:Object(n["V"])((function(){return[Object(n["n"])(d,null,{default:Object(n["V"])((function(){return[Object(n["n"])(s,{size:"small"},{default:Object(n["V"])((function(){return[Object(n["n"])(l,{current:r.name,"index-url":r.indexUrl,"project-url":r.projectUrl,"edit-url":r.editUrl,"run-url":r.runUrl,"results-url":r.resultsUrl,"logout-url":r.logoutUrl,"logo-url":r.logoUrl},null,8,["current","index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])]})),_:1}),Object(n["l"])("div",a,[Object(n["M"])(e.$slots,"header")])]})),_:3}),Object(n["l"])("div",c,[Object(n["M"])(e.$slots,"default")])]})),_:3})}var u=Object(n["m"])("User guide"),i=Object(n["m"])(" Log out ");function l(e,t,r,a,c,o){var l=Object(n["N"])("n-image"),s=Object(n["N"])("n-menu"),d=Object(n["N"])("n-space"),f=Object(n["N"])("n-a"),b=Object(n["N"])("n-divider"),j=Object(n["N"])("n-button");return Object(n["G"])(),Object(n["i"])(d,{justify:"space-between",align:"baseline"},{default:Object(n["V"])((function(){return[Object(n["n"])(d,{align:"start"},{default:Object(n["V"])((function(){return[Object(n["n"])(l,{src:r.logoUrl,alt:"FlexTool",width:90,"preview-disabled":""},null,8,["src"]),Object(n["n"])(s,{"default-value":r.current,mode:"horizontal",options:a.links},null,8,["default-value","options"])]})),_:1}),Object(n["n"])(d,{align:"baseline"},{default:Object(n["V"])((function(){return[Object(n["n"])(f,{href:"https://irena-flextool.github.io/flextool/"},{default:Object(n["V"])((function(){return[u]})),_:1}),Object(n["n"])(b,{vertical:""}),Object(n["n"])(j,{onClick:a.logout},{default:Object(n["V"])((function(){return[i]})),_:1},8,["onClick"])]})),_:1})]})),_:1})}var s=r("f2bf"),d=r("ac88");function f(e,t){return function(){return Object(s["c"])(d["a"],{href:t},(function(){return e}))}}function b(e){var t={Projects:e.indexUrl,"Manage project":e.projectUrl,"Edit model":e.editUrl,Run:e.runUrl,Results:e.resultsUrl},r=[];for(var n in t){var a=t[n],c=null!==a,o=c?f(n,a):n;r.push({label:o,key:n,disabled:!c})}return r}var j={props:{current:{type:String,required:!0},indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!1,default:null},editUrl:{type:String,required:!1,default:null},runUrl:{type:String,required:!1,default:null},resultsUrl:{type:String,required:!1,default:null},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},setup:function(e){var t=Object(s["f"])(b(e)),r=Object(s["f"])(null);return{links:t,activeKey:r,logout:function(){location.assign(e.logoutUrl)}}}},p=r("6b0d"),O=r.n(p);const y=O()(j,[["render",l]]);var m=y,v={props:{name:{type:String,required:!0},indexUrl:{type:String,required:!0},projectUrl:{type:String,required:!1,default:null},editUrl:{type:String,required:!1,default:null},runUrl:{type:String,required:!1,default:null},resultsUrl:{type:String,required:!1,default:null},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{"navigation-menu":m}};r("2225");const h=O()(v,[["render",o]]);t["a"]=h},a2d1:function(e,t,r){},c46e:function(e,t,r){"use strict";r("b0c0");var n=r("7a23");function a(e,t,r,a,c,o){var u=Object(n["N"])("n-breadcrumb-item"),i=Object(n["N"])("n-breadcrumb");return Object(n["G"])(),Object(n["i"])(i,null,{default:Object(n["V"])((function(){return[(Object(n["G"])(!0),Object(n["k"])(n["b"],null,Object(n["L"])(r.path,(function(e,t){return Object(n["G"])(),Object(n["i"])(u,{href:e.url,key:t},{default:Object(n["V"])((function(){return[Object(n["m"])(Object(n["O"])(e.name),1)]})),_:2},1032,["href"])})),128)),Object(n["n"])(u,null,{default:Object(n["V"])((function(){return[Object(n["m"])(Object(n["O"])(r.leafName),1)]})),_:1})]})),_:1})}var c={props:{path:Array,leafName:String}},o=r("6b0d"),u=r.n(o);const i=u()(c,[["render",a]]);t["a"]=i}});