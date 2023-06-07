import{_ as z,r as f,a as r,o as b,b as v,w as t,d as l,e as n,t as W,j as H,c as U,u as O,f as X,k as G,i as J,n as K}from"./assets/_plugin-vue_export-helper-7747d506.js";import{b as Q,e as Y,P as Z,a as $,g as ee,h as te,i as oe,j as le}from"./assets/communication-322045da.js";import{e as P,a as S,f as R}from"./assets/executions-db291609.js";import{F as q}from"./assets/Fetchable-3244e941.js";const ae={props:{example:{type:String,required:!0}},emits:["add"],setup(i,a){const o=f(!1),e=f(""),x=f("info"),c=u=>o.value=u,g=function(u){switch(u){case"ok":x.value="success",e.value="Added to model.";break;case"error":x.value="error",e.value="Failed to add.";break;case"failure":x.value="error",e.value="Network error.";break;default:x.value="warning",e.value="Unknown status."}};return{loading:o,statusMessage:e,messageType:x,emitAdd(){a.emit("add",{example:i.example,setLoading:c,setStatus:g})}}}};function ne(i,a,o,e,x,c){const g=r("n-text"),u=r("n-button"),p=r("n-space");return b(),v(p,{justify:"end",align:"baseline"},{default:t(()=>[l(g,{type:e.messageType},{default:t(()=>[n(W(e.statusMessage),1)]),_:1},8,["type"]),l(u,{onClick:e.emitAdd,disabled:e.loading,loading:e.loading,size:"small"},{default:t(()=>[n(" Add ")]),_:1},8,["onClick","disabled","loading"])]),_:1})}const re=z(ae,[["render",ne]]);const se={props:{projectId:{type:Number,required:!0},examplesUrl:{type:String,required:!0}},components:{fetchable:q},setup(i){const a=f([]),o=f(q.state.loading),e=f(""),x=function(c){c.setLoading(!0),Y(i.projectId,i.examplesUrl,c.example).then(function(g){c.setStatus(g.status)}).catch(function(){c.setStatus("failure")}).finally(function(){c.setLoading(!1)})};return Q(i.projectId,i.examplesUrl).then(function(c){const g=c.examples,u=[];for(const p of g)u.push({key:p,label:p,suffix:()=>H(re,{example:p,onAdd:x})});a.value=u,o.value=q.state.ready}).catch(function(c){e.value=c.message,o.value=q.state.error}),{examples:a,state:o,errorMessage:e}}};function ie(i,a,o,e,x,c){const g=r("n-tree"),u=r("fetchable");return b(),v(u,{state:e.state,"error-message":e.errorMessage},{default:t(()=>[l(g,{id:"example-list",data:e.examples,selectable:!1,"block-line":""},null,8,["data"])]),_:1},8,["state","error-message"])}const ue=z(se,[["render",ie]]),s={idle:Symbol("nothing ongoing"),uploading:Symbol("file is being uploaded"),importing:Symbol("file is being imported"),aborting:Symbol("aboring file import"),done:Symbol("file processed"),error:Symbol("upload failed")},h={none:Symbol("no file"),database:Symbol(".sqlite file"),excel:Symbol(".xlsx file")},ce={props:{projectName:{type:String,required:!0},projectId:{type:Number,required:!0},projectUrl:{type:String,required:!0},indexUrl:{type:String,required:!0},editUrl:{type:String,required:!0},runUrl:{type:String,required:!0},resultsUrl:{type:String,required:!0},examplesUrl:{type:String,required:!0},executionsUrl:{type:String,required:!0},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0},modelExportUrl:{type:String,required:!0},fileUploadUrl:{type:String,required:!0}},components:{examples:ue,page:Z,"page-path":$},setup(i){const a=f(s.idle),o=f(h.none),e=f(0),x=U(()=>a.value===s.uploading),c=U(()=>o.value===h.database&&a.value===s.done),g=U(()=>o.value===h.excel&&a.value===s.importing),u=U(()=>o.value===h.excel&&a.value===s.aborting),p=f([]),m=f(S.yetToStart),y=U(()=>a.value===s.done&&m.value===S.finished),I=U(()=>o.value===h.excel&&a.value===s.done&&m.value===S.error),C=U(()=>o.value===h.excel&&a.value===s.done&&m.value===S.aborted),k=f(!1),j=f(!1),w=U(()=>j.value||a.value!==s.idle&&a.value!==s.done&&a.value!==s.error),E=f(""),_=O(),A=function({file:d}){return a.value=s.uploading,d.name.toLowerCase().endsWith(".xlsx")?(E.value="excel_input",o.value=h.excel,m.value=S.yetToStart,!0):d.name.toLowerCase().endsWith(".sqlite")?(E.value="model_database",o.value=h.database,!0):(a.value=s.error,_.error("Can only upload .xlsx or .sqlite files."),!1)},D=function({file:d}){e.value=d.percentage},F=function({file:d}){return o.value===h.excel?(a.value=s.importing,oe(i.projectId,i.executionsUrl).then(function(T){T.status!=="busy"?R(i.projectId,i.executionsUrl,p,m,_,L):_.error("Another execution ongoing.")}).catch(function(T){_.error(T.message),a.value=s.error})):o.value===h.database?a.value=s.done:_.error("Unknown upload field name."),d},M=function(){_.error("Upload failed."),e.value=0,a.value=s.error},L=function(){a.value=s.done},N=function(){a.value=s.aborting,le(i.projectId,i.executionsUrl).catch(function(d){_.error(d.message)})},V=()=>k.value=!0;return X(function(){ee(i.projectId,i.executionsUrl).then(function(d){if(d.type!==P.importExcel&&d.status===S.running)switch(d.type){case P.solve:_.warning("Server is busy solving the model"),j.value=!0;break;default:_.error("Server is busy.")}else d.type===P.importExcel&&d.status===S.running&&(o.value=h.excel,a.value=s.importing,R(i.projectId,i.executionsUrl,p,m,_,L))}).catch(function(d){_.error(d.message),a.value=s.error})}),{uploadPercentage:e,isUploading:x,isDatabaseUploadSuccessful:c,isUploadDisabled:w,isImportingExcel:g,isAbortingExcelImport:u,isExcelImportSuccessful:y,isExcelImportFailure:I,isExcelImportAborted:C,isExcelImportLogDialogShown:k,excelImportLog:p,uploadFieldName:E,uploadHeaders(){return{"X-CSRFToken":te}},prepareUpload:A,updateUploadStatus:D,finalizeUpload:F,showUploadError:M,abortExcelInputImport:N,showImportLog:V}}};function de(i,a,o,e,x,c){const g=r("page-path"),u=r("n-h1"),p=r("n-a"),m=r("n-p"),y=r("n-space"),I=r("n-button"),C=r("n-tooltip"),k=r("n-upload"),j=r("n-progress"),w=r("n-alert"),E=r("n-text"),_=r("n-spin"),A=r("examples"),D=r("n-log"),F=r("n-card"),M=r("n-modal"),L=r("page");return b(),v(L,{name:"Manage project","index-url":o.indexUrl,"project-url":o.projectUrl,"edit-url":o.editUrl,"run-url":o.runUrl,"results-url":o.resultsUrl,"logout-url":o.logoutUrl,"logo-url":o.logoUrl},{header:t(()=>[l(g,{path:[{name:"Projects",url:o.indexUrl}],"leaf-name":o.projectName},null,8,["path","leaf-name"])]),default:t(()=>[l(y,null,{default:t(()=>[l(y,{vertical:""},{default:t(()=>[l(u,null,{default:t(()=>[n("Links")]),_:1}),l(y,{vertical:""},{default:t(()=>[l(m,null,{default:t(()=>[l(p,{href:o.editUrl},{default:t(()=>[n("Model editor")]),_:1},8,["href"]),n(" lets you to define the project's model.")]),_:1}),l(m,null,{default:t(()=>[l(p,{href:o.runUrl},{default:t(()=>[n("Run")]),_:1},8,["href"]),n(" page allows you to set up scenarios and solve the model.")]),_:1}),l(m,null,{default:t(()=>[l(p,{href:o.resultsUrl},{default:t(()=>[n("Results")]),_:1},8,["href"]),n(" shows results of solved scenarios.")]),_:1})]),_:1}),l(u,null,{default:t(()=>[n("Import or export model")]),_:1}),l(m,null,{default:t(()=>[n("Warning: importing will overwrite model data.")]),_:1}),l(m,null,{default:t(()=>[n("Download model database "),l(p,{href:o.modelExportUrl},{default:t(()=>[n("here")]),_:1},8,["href"]),n(".")]),_:1}),l(k,{name:e.uploadFieldName,action:o.fileUploadUrl,headers:e.uploadHeaders,accept:".sqlite,.xlsx,","show-file-list":!1,disabled:e.isUploadDisabled,onBeforeUpload:e.prepareUpload,onChange:e.updateUploadStatus,onFinish:e.finalizeUpload,onError:e.showUploadError},{default:t(()=>[l(C,null,{trigger:t(()=>[l(I,null,{default:t(()=>[n("Upload model")]),_:1})]),default:t(()=>[n(" Upload existing model database or import an Excel file. ")]),_:1})]),_:1},8,["name","action","headers","disabled","onBeforeUpload","onChange","onFinish","onError"]),e.isUploading?(b(),v(j,{key:0,type:"line",percentage:e.uploadPercentage,"show-indicator":!1},null,8,["percentage"])):e.isDatabaseUploadSuccessful?(b(),v(w,{key:1,title:"Database upload successful",type:"success"})):e.isImportingExcel?(b(),v(y,{key:2,vertical:""},{default:t(()=>[l(E,null,{default:t(()=>[n("Excel file uploaded.")]),_:1}),l(y,null,{default:t(()=>[l(_,{size:"small",description:"Importing Excel file..."}),l(I,{onClick:e.abortExcelInputImport},{default:t(()=>[n("Cancel")]),_:1},8,["onClick"])]),_:1})]),_:1})):e.isExcelImportSuccessful?(b(),v(w,{key:3,title:" Excel file import successful.",type:"success"},{default:t(()=>[l(I,{onClick:e.showImportLog},{default:t(()=>[n("Log...")]),_:1},8,["onClick"])]),_:1})):e.isExcelImportFailure?(b(),v(w,{key:4,title:"Excel import failed.",type:"error"},{default:t(()=>[l(I,{onClick:e.showImportLog},{default:t(()=>[n("Log...")]),_:1},8,["onClick"])]),_:1})):e.isAbortingExcelImport?(b(),v(E,{key:5},{default:t(()=>[n("Aborting...")]),_:1})):e.isExcelImportAborted?(b(),v(E,{key:6},{default:t(()=>[n("Aborted.")]),_:1})):G("",!0)]),_:1}),l(y,{vertical:""},{default:t(()=>[l(u,null,{default:t(()=>[n("Usage hints")]),_:1}),l(m,null,{default:t(()=>[n(" Links on these pages can be opened in different browser tabs or windows. It is possible to e.g. open two Model editors side-by-side to compare or copy data around. ")]),_:1}),l(u,null,{default:t(()=>[n("Example systems")]),_:1}),l(m,null,{default:t(()=>[n("Add example systems to the model from the list below.")]),_:1}),l(A,{"project-id":o.projectId,"examples-url":o.examplesUrl},null,8,["project-id","examples-url"])]),_:1})]),_:1}),l(M,{show:e.isExcelImportLogDialogShown,"onUpdate:show":a[0]||(a[0]=N=>e.isExcelImportLogDialogShown=N)},{default:t(()=>[l(F,{title:"Excel file import log"},{default:t(()=>[l(D,{lines:e.excelImportLog},null,8,["lines"])]),_:1})]),_:1},8,["show"])]),_:1},8,["index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])}const pe=z(ce,[["render",de]]),B=J({});B.use(K);B.component("detail-app",pe);B.mount("#detail-app");
