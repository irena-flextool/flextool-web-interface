import{_,c as C,a as l,o as u,b as m,w as i,d as f,e as d,t as v,r as g,f as y,u as N}from"./_plugin-vue_export-helper-4a5a23ee.js";function z(e){e?addEventListener("beforeunload",h,{capture:!0}):removeEventListener("beforeunload",h,{capture:!0})}function h(e){return e.preventDefault(),e.returnValue="There are uncommitted changes."}const k={props:{hasPendingChanges:{type:Boolean,required:!0},committing:{type:Boolean,required:!0},errorMessage:{type:String,required:!1,default:""}},emit:["commitRequest"],setup(e,n){return{buttonDisabled:C(()=>!e.hasPendingChanges||e.errorMessage.length!==0),emitCommitRequest(){n.emit("commitRequest")}}}};function D(e,n,a,t,r,o){const s=l("n-button"),c=l("n-text"),p=l("n-space");return u(),m(p,{align:"baseline"},{default:i(()=>[f(s,{disabled:t.buttonDisabled,loading:a.committing,onClick:t.emitCommitRequest},{default:i(()=>[d(" Commit ")]),_:1},8,["disabled","loading","onClick"]),a.errorMessage?(u(),m(c,{key:0,type:"error"},{default:i(()=>[d(v(a.errorMessage),1)]),_:1})):a.hasPendingChanges?(u(),m(c,{key:1},{default:i(()=>[d(" There are pending changes. ")]),_:1})):(u(),m(c,{key:2},{default:i(()=>[d(" Nothing to commit. ")]),_:1}))]),_:1})}const E=_(k,[["render",D]]),$={props:{name:String},emits:["accept","cancel"],setup(e,n){const a=g(e.name),t=g(null);return y(function(){var r;(r=t.value)==null||r.select()}),{instance:t,value:a,cancel(){a.value=e.name,n.emit("cancel")},handleKey(r){const o=a.value.trim();switch(r.key){case"Enter":o&&o!==e.name?n.emit("accept",o):(a.value=e.name,n.emit("cancel"));break;case"Escape":a.value=e.name,n.emit("cancel");break}}}}};function q(e,n,a,t,r,o){const s=l("n-input");return u(),m(s,{value:t.value,"onUpdate:value":n[0]||(n[0]=c=>t.value=c),ref:"instance",onBlur:t.cancel,onKeydown:t.handleKey,maxlength:"155",size:"small",clearable:""},null,8,["value","onBlur","onKeydown"])}const I=_($,[["render",q]]),w={props:{emblem:{type:[String,Array],required:!0}},emits:["delete"],setup(e,n){return{emitDelete(){n.emit("delete",e.emblem)}}}};function x(e,n,a,t,r,o){const s=l("n-button");return u(),m(s,{size:"tiny",onClick:t.emitDelete},{default:i(()=>[d("Delete")]),_:1},8,["onClick"])}const R=_(w,[["render",x]]),B={props:{itemName:{type:String,required:!0}},emits:["create"],setup(e,n){const a=g(""),t=`Enter ${e.itemName} name`,r=N();return{currentName:a,placeholder:t,emitCreate(){const o=new String(a.value).trim();if(!o){r.error(`Please enter name for the new ${e.itemName}.`);return}if(/[,]/.test(o)){const c=e.itemName.charAt(0).toUpperCase()+e.itemName.slice(1);r.error(`${c} name contains invalid special characters.`);return}n.emit("create",o),a.value=""}}}};function M(e,n,a,t,r,o){const s=l("n-input"),c=l("n-button"),p=l("n-space");return u(),m(p,null,{default:i(()=>[f(s,{clearable:"",placeholder:t.placeholder,value:t.currentName,"onUpdate:value":n[0]||(n[0]=b=>t.currentName=b),size:"tiny"},null,8,["placeholder","value"]),f(c,{onClick:t.emitCreate,size:"tiny"},{default:i(()=>[d(" Create ")]),_:1},8,["onClick"])]),_:1})}const K=_(B,[["render",M]]);export{E as C,R as D,I,K as N,z as u};