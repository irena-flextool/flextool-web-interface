(function(e){function t(t){for(var r,a,u=t[0],i=t[1],l=t[2],s=0,f=[];s<u.length;s++)a=u[s],Object.prototype.hasOwnProperty.call(o,a)&&o[a]&&f.push(o[a][0]),o[a]=0;for(r in i)Object.prototype.hasOwnProperty.call(i,r)&&(e[r]=i[r]);d&&d(t);while(f.length)f.shift()();return c.push.apply(c,l||[]),n()}function n(){for(var e,t=0;t<c.length;t++){for(var n=c[t],r=!0,u=1;u<n.length;u++){var i=n[u];0!==o[i]&&(r=!1)}r&&(c.splice(t--,1),e=a(a.s=n[0]))}return e}var r={},o={edit:0},c=[];function a(t){if(r[t])return r[t].exports;var n=r[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,a),n.l=!0,n.exports}a.m=e,a.c=r,a.d=function(e,t,n){a.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},a.t=function(e,t){if(1&t&&(e=a(e)),8&t)return e;if(4&t&&"object"===typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(a.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var r in e)a.d(n,r,function(t){return e[t]}.bind(null,r));return n},a.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return a.d(t,"a",t),t},a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},a.p="";var u=window["webpackJsonp"]=window["webpackJsonp"]||[],i=u.push.bind(u);u.push=t,u=u.slice();for(var l=0;l<u.length;l++)t(u[l]);var d=i;c.push([2,"chunk-vendors"]),n()})({2:function(e,t,n){e.exports=n("8fc9")},"8fc9":function(e,t,n){"use strict";n.r(t);n("e260"),n("e6cf"),n("cca6"),n("a79d");var r=n("f2bf"),o=n("5333"),c=n("7a23"),a=Object(c["j"])("Save");function u(e,t,n,r,o,u){var i=Object(c["G"])("n-button"),l=Object(c["G"])("n-space"),d=Object(c["G"])("n-layout-header"),s=Object(c["G"])("object-tree"),f=Object(c["G"])("n-layout-sider"),b=Object(c["G"])("parameter-value-table"),p=Object(c["G"])("n-layout-content"),h=Object(c["G"])("n-layout");return Object(c["z"])(),Object(c["h"])(h,null,{default:Object(c["N"])((function(){return[Object(c["k"])(d,null,{default:Object(c["N"])((function(){return[Object(c["k"])(l,{justify:"end"},{default:Object(c["N"])((function(){return[Object(c["k"])(i,{onClick:r.commitSession},{default:Object(c["N"])((function(){return[a]})),_:1},8,["onClick"])]})),_:1})]})),_:1}),Object(c["k"])(h,{"has-sider":""},{default:Object(c["N"])((function(){return[Object(c["k"])(f,null,{default:Object(c["N"])((function(){return[Object(c["k"])(s,{"model-url":n.modelUrl,"project-id":n.projectId,onObjectClassSelected:r.showParametersForObjectClass},null,8,["model-url","project-id","onObjectClassSelected"])]})),_:1}),Object(c["k"])(p,null,{default:Object(c["N"])((function(){return[Object(c["k"])(b,{"model-url":n.modelUrl,"project-id":n.projectId,"class-id":r.currentObjectClassId,onValueUpdated:r.addUpdatedValue},null,8,["model-url","project-id","class-id","onValueUpdated"])]})),_:1})]})),_:1})]})),_:1})}var i=n("3835"),l=n("b85c"),d=n("d4ec"),s=n("bee2"),f=n("d5e4"),b=n("5364"),p=n("9bd1"),h=(n("4ec9"),n("d3b7"),n("3ca3"),n("ddb0"),n("e9c4"),n("a9e3"),n("10d1"),n("7317"));function j(e,t,n,r,o,a){var u=Object(c["G"])("n-tree");return Object(c["z"])(),Object(c["h"])(u,{remote:"",selectable:"",data:r.data,"on-load":r.fetchChildren,"expanded-keys":r.expandedKeys,"onUpdate:expandedKeys":r.handleExpandedKeysChange,"selected-keys":r.selectedKeys,"onUpdate:selectedKeys":r.handleSelectedKeysChange},null,8,["data","on-load","expanded-keys","onUpdate:expandedKeys","selected-keys","onUpdate:selectedKeys"])}n("8ba4"),n("ac1f"),n("1276"),n("b0c0"),n("99af");var y=n("9406");function v(e,t){return y["k"]("object classes?",e,t).then((function(e){return e.classes}))}function O(e,t,n){return y["k"]("objects?",t,n,{object_class_id:e}).then((function(e){return e.objects}))}var m={props:{modelUrl:String,projectId:Number},emit:["objectClassSelected:classId"],setup:function(e,t){var n=Object(r["e"])([{label:"Classes",key:-1,isLeaf:!1}]),o=Object(r["e"])([-1]),c=Object(r["e"])([]);return{data:n,expandedKeys:o,handleExpandedKeysChange:function(e){o.value=e},selectedKeys:c,handleSelectedKeysChange:function(e,n){var r=e[0];if(-1===r)c.value.length=0;else if(Number.isInteger(r))c.value=e,t.emit("objectClassSelected",r);else{var o=n[0],a=o.key.split(":"),u=parseInt(a[0]);c.value.length&&u===c.value[0]||(c.value=[u],t.emit("objectClassSelected",u))}},fetchChildren:function(t){return-1===t.key?v(e.projectId,e.modelUrl).then((function(e){var n,r=[],o=Object(l["a"])(e);try{for(o.s();!(n=o.n()).done;){var c=n.value;r.push({label:c.name,key:c.id,isLeaf:!1})}}catch(a){o.e(a)}finally{o.f()}t.children=r})):O(t.key,e.projectId,e.modelUrl).then((function(e){var n,r=[],o=Object(l["a"])(e);try{for(o.s();!(n=o.n()).done;){var c=n.value;r.push({label:c.name,key:"".concat(t.key,":").concat(c.id),isLeaf:!0})}}catch(a){o.e(a)}finally{o.f()}t.children=r}))}}}},k=n("6b0d"),g=n.n(k);const w=g()(m,[["render",j]]);var x=w;function S(e,t,n,r,o,a){var u=Object(c["G"])("n-data-table");return Object(c["z"])(),Object(c["h"])(u,{size:"small",columns:r.columns,data:r.data,loading:r.loading,"row-key":r.rowKey,"max-height":400},null,8,["columns","data","loading","row-key"])}var N=n("53ca"),C=(n("159b"),n("21e1")),U=n("b6e9"),_=n("48f1");function I(e){var t={title:"Class",key:"object_class_name"},n={title:"Object",key:"object_name"},o={title:"Parameter",key:"parameter_name"},c={title:"Alternative",key:"alternative_name"},a={title:"Value",key:"value",render:function(t){if(!t.type){var n=Object(N["a"])(t.value);return"number"==n?Object(r["c"])(C["a"],{showButton:!1,defaultValue:t.value}):Object(r["c"])(U["a"],{defaultValue:t.value,onChange:function(n){return e("valueUpdated",{value:n,id:t.id})}})}return Object(r["c"])(_["a"],{italic:!0},{default:function(){return t.type}})}};return[t,n,o,c,a]}function F(e,t,n){return y["k"]("object parameter values?",t,n,{object_class_id:e}).then((function(e){var t=e.values;return t.forEach((function(e){e.value=JSON.parse(e.value)})),t}))}var E={props:{modelUrl:String,projectId:Number,classId:Number},emit:["valueUpdated:data"],setup:function(e,t){var n=Object(r["e"])([]),o=Object(r["e"])(!1),c=Object(r["e"])(I(t.emit)),a=Object(r["f"])(e).classId;return Object(r["g"])(a,(function(){n.value.length=0,o.value=!0,F(a.value,e.projectId,e.modelUrl).then((function(e){n.value=e,o.value=!1}))})),{data:n,columns:c,loading:o,rowKey:function(e){return e.id}}}};const J=g()(E,[["render",S]]);var P=J,K=new WeakMap,G=new WeakMap,V=function(){function e(){Object(d["a"])(this,e),Object(f["a"])(this,K,{writable:!0,value:void 0}),Object(f["a"])(this,G,{writable:!0,value:void 0}),Object(p["a"])(this,K,new Map),Object(p["a"])(this,G,!1)}return Object(s["a"])(e,[{key:"commit",value:function(e,t,n){if(Object(b["a"])(this,G))alert("Database commit in progress. Please try again later.");else{Object(p["a"])(this,G,!0);var r,o=y["m"](),c=[],a=Object(l["a"])(Object(b["a"])(this,K));try{for(a.s();!(r=a.n()).done;){var u=Object(i["a"])(r.value,2),d=u[0],s=u[1];c.push({id:d,value:s})}}catch(h){a.e(h)}finally{a.f()}o["body"]=JSON.stringify({type:"update values",projectId:e,updates:c});var f=this;fetch(t,o).then((function(e){if(f.commitFinished(),!e.ok)return e.text().then((function(e){throw new Error("Failed to save parameter values: ".concat(e))}));f.clearPendingUpdates(),n.success("Parameter values committed successfully.")})).catch((function(e){n.error(e.message)}))}}},{key:"commitFinished",value:function(){Object(p["a"])(this,G,!1)}},{key:"clearPendingUpdates",value:function(){Object(b["a"])(this,K).clear()}},{key:"updateValue",value:function(e,t){Object(b["a"])(this,K).set(e,t)}}]),e}(),M=new V,T={props:{modelUrl:String,projectId:Number},setup:function(e){var t=Object(h["a"])(),n=Object(r["e"])();return{currentObjectClassId:n,addUpdatedValue:function(e){M.updateValue(e.id,e.value)},commitSession:function(){M.commit(e.projectId,e.modelUrl,t)},showParametersForObjectClass:function(e){n.value=e}}},components:{"object-tree":x,"parameter-value-table":P}};const z=g()(T,[["render",u]]);var L=z,R=r["b"]({});R.use(o["a"]),R.component("editor-app",L),R.mount("#edit-app")},9406:function(e,t,n){"use strict";n.d(t,"m",(function(){return a})),n.d(t,"k",(function(){return d})),n.d(t,"l",(function(){return u})),n.d(t,"c",(function(){return i})),n.d(t,"e",(function(){return l})),n.d(t,"g",(function(){return s})),n.d(t,"b",(function(){return f})),n.d(t,"d",(function(){return b})),n.d(t,"f",(function(){return p})),n.d(t,"a",(function(){return h})),n.d(t,"h",(function(){return y})),n.d(t,"j",(function(){return j})),n.d(t,"i",(function(){return v}));var r=n("5530");n("ac1f"),n("1276"),n("498a"),n("e9c4"),n("d3b7"),n("99af");function o(e){var t=null;if(document.cookie&&""!==document.cookie)for(var n=document.cookie.split(";"),r=0;r<n.length;r++){var o=n[r].trim();if(o.substring(0,e.length+1)===e+"="){t=decodeURIComponent(o.substring(e.length+1));break}}return t}var c=o("csrftoken");function a(){return{method:"POST",credentials:"same-origin",headers:{"X-CSRFToken":c,"Content-Type":"application/json"}}}function u(e){var t=a();return t["body"]=JSON.stringify({type:"project list?"}),fetch(e,t).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load project list: ".concat(e))}))}))}function i(e,t){var n=a();return n["body"]=JSON.stringify({type:"create project?",name:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create project: ".concat(e))}))}))}function l(e,t){var n=a();return n["body"]=JSON.stringify({type:"destroy project?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete project: ".concat(e))}))}))}function d(e,t,n){var o=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},c=a();return c["body"]=JSON.stringify(Object(r["a"])({type:e,projectId:t},o)),fetch(n,c).then((function(t){return t.ok?t.json():t.text().then((function(t){throw new Error("Failed to fetch ".concat(e,": ").concat(t))}))}))}function s(e,t){var n=a();return n.body=JSON.stringify({type:"execution list?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to load solve list: ".concat(e))}))}))}function f(e,t){var n=a();return n.body=JSON.stringify({type:"create execution?",projectId:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to create solve: ".concat(e))}))}))}function b(e,t){var n=a();return n["body"]=JSON.stringify({type:"destroy execution?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to delete execution: ".concat(e))}))}))}function p(e,t){var n=a();return n["body"]=JSON.stringify({type:"execute?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execute: ".concat(e))}))}))}function h(e,t){var n=a();return n["body"]=JSON.stringify({type:"abort?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to abort execution: ".concat(e))}))}))}function j(e,t){var n=a();return n["body"]=JSON.stringify({type:"updates?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to execution updates: ".concat(e))}))}))}function y(e,t){var n=a();return n["body"]=JSON.stringify({type:"log?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to get log: ".concat(e))}))}))}function v(e,t){var n=a();return n["body"]=JSON.stringify({type:"status?",id:e}),fetch(t,n).then((function(e){return e.ok?e.json():e.text().then((function(e){throw new Error("Failed to get execution status: ".concat(e))}))}))}}});