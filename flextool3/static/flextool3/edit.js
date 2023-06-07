import{_ as M,r as g,f as k,a as l,o as p,b as U,w as t,d as r,g as S,h as v,e as o,t as h,F as x,i as I,n as N}from"./assets/_plugin-vue_export-helper-7747d506.js";import{k as P,P as C,a as w}from"./assets/communication-322045da.js";import{F as y}from"./assets/Fetchable-3244e941.js";const E={props:{classType:{type:String,required:!0},projectId:{type:Number,required:!0},modelUrl:{type:String,required:!0}},components:{fetchable:y},setup(_){const f=g([]),e=g(new Map),n=g(y.state.loading),m=g("");return k(function(){const j=_.classType==="physical"?"physical classes?":"model classes?";P(j,_.projectId,_.modelUrl).then(function(a){const s=new Map;for(const[u,c]of Object.entries(a.relationshipClasses))s[parseInt(u)]=c;e.value=s,f.value=a.objectClasses,n.value=y.state.ready,m.value=""}).catch(function(a){m.value=a.message,n.value=y.state.error})}),{objectClasses:f,relationshipClasses:e,state:n,errorMessage:m}}};function F(_,f,e,n,m,j){const a=l("n-a"),s=l("n-li"),u=l("n-ul"),c=l("fetchable");return p(),U(c,{state:n.state,"error-message":n.errorMessage},{default:t(()=>[r(u,null,{default:t(()=>[(p(!0),S(x,null,v(n.objectClasses,i=>(p(),U(s,{key:i.id},{default:t(()=>[r(a,{href:i.entitiesUrl},{default:t(()=>[o(h(i.name),1)]),_:2},1032,["href"]),o(" "+h(i.description)+" ",1),r(u,null,{default:t(()=>[(p(!0),S(x,null,v(n.relationshipClasses[i.id],d=>(p(),U(s,{key:d.id},{default:t(()=>[r(a,{href:d.entitiesUrl},{default:t(()=>[o(h(d.name),1)]),_:2},1032,["href"]),o(" "+h(d.description),1)]),_:2},1024))),128))]),_:2},1024)]),_:2},1024))),128))]),_:1})]),_:1},8,["state","error-message"])}const T=M(E,[["render",F]]),B={props:{indexUrl:{type:String,required:!0},editUrl:{type:String,required:!0},projectUrl:{type:String,required:!0},projectName:{type:String,required:!0},modelUrl:{type:String,required:!0},projectId:{type:Number,required:!0},runUrl:{type:String,required:!0},resultsUrl:{type:String,required:!0},scenariosUrl:{type:String,required:!0},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{"class-list":T,page:C,"page-path":w}};function A(_,f,e,n,m,j){const a=l("page-path"),s=l("n-h1"),u=l("class-list"),c=l("n-space"),i=l("n-a"),d=l("n-p"),b=l("page");return p(),U(b,{name:"Edit model","index-url":e.indexUrl,"project-url":e.projectUrl,"edit-url":e.editUrl,"run-url":e.runUrl,"results-url":e.resultsUrl,"logout-url":e.logoutUrl,"logo-url":e.logoUrl},{header:t(()=>[r(a,{path:[{name:"Projects",url:e.indexUrl},{name:e.projectName,url:e.projectUrl}],"leaf-name":"Model editor"},null,8,["path"])]),default:t(()=>[r(c,null,{default:t(()=>[r(c,{vertical:""},{default:t(()=>[r(s,null,{default:t(()=>[o("Physical classes")]),_:1}),r(u,{"class-type":"physical","project-id":e.projectId,"model-url":e.modelUrl},null,8,["project-id","model-url"])]),_:1}),r(c,{vertical:""},{default:t(()=>[r(s,null,{default:t(()=>[o("Scenarios")]),_:1}),r(d,null,{default:t(()=>[r(i,{href:e.scenariosUrl},{default:t(()=>[o(" Edit alternatives and scenarios ")]),_:1},8,["href"])]),_:1}),r(s,null,{default:t(()=>[o("Model classes")]),_:1}),r(u,{"class-type":"model","project-id":e.projectId,"model-url":e.modelUrl},null,8,["project-id","model-url"])]),_:1})]),_:1})]),_:1},8,["index-url","project-url","edit-url","run-url","results-url","logout-url","logo-url"])}const D=M(B,[["render",A]]),q=I({});q.use(N);q.component("editor-app",D);q.mount("#edit-app");
