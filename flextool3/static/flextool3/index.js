import{_ as g,r as j,u as h,c as P,a as r,o as l,b as p,w as a,d,e as m,t as y,f as x,g as v,h as U,F as S,i as N,n as k}from"./assets/_plugin-vue_export-helper-0666fbf1.js";import{c as C,d as D,f as I,P as B,a as q}from"./assets/communication-2a568822.js";const R={props:{projectsUrl:String},emit:["created:project"],setup(s,{emit:o}){const t=j(""),e=j(!1),c=h();return{buttonDisabled:P(function(){return!!(t.value.length===0||e.value)}),projectName:t,busy:e,updateProjectName(n){t.value=n},create(){e.value=!0,C(t.value,String(s.projectsUrl)).then(function(n){o("created",n.project),t.value=""}).catch(function(n){c.error(n.message)}).finally(function(){e.value=!1})}}}};function A(s,o,t,e,c,_){const n=r("n-input"),u=r("n-button"),i=r("n-space");return l(),p(i,{justify:"space-between"},{default:a(()=>[d(n,{type:"text",placeholder:"Enter project name...",clearable:"",maxlength:"60",onInput:e.updateProjectName,value:e.projectName,disabled:e.busy},null,8,["onInput","value","disabled"]),d(u,{onClick:e.create,loading:e.busy,disabled:e.buttonDisabled},{default:a(()=>[m("Create")]),_:1},8,["onClick","loading","disabled"])]),_:1})}const E=g(R,[["render",A]]),L={props:{projectId:Number,projectName:String,url:String,projectsUrl:String},emits:["destroyed"],setup(s,o){const t=j(!1),e=h();return{busy:t,destroy(){t.value=!0,D(s.projectId,String(s.projectsUrl)).then(function(c){o.emit("destroyed",c.id)}).catch(function(c){e.error(c.message)}).finally(function(){t.value=!1})}}}};function F(s,o,t,e,c,_){const n=r("n-a"),u=r("n-button"),i=r("n-space");return l(),p(i,{justify:"space-between",align:"baseline"},{default:a(()=>[e.busy?(l(),p(n,{key:1},{default:a(()=>[m(y(t.projectName),1)]),_:1})):(l(),p(n,{key:0,href:t.url},{default:a(()=>[m(y(t.projectName),1)]),_:1},8,["href"])),d(u,{onClick:e.destroy,loading:e.busy,disabled:e.busy},{default:a(()=>[m("Delete")]),_:1},8,["onClick","loading","disabled"])]),_:1})}const M=g(L,[["render",F]]),V={props:{projectsUrl:String},setup(s){const o=j([]),t=j(!1);return x(function(){I(String(s.projectsUrl)).then(function(e){o.value=e.projects})}),{projects:o,newProjectRowBusy:t,appendProject:function(e){o.value.push(e)},deleteProject:function(e){const c=o.value.findIndex(function(_){return _.id===e});if(c<0)throw new Error(`Project id ${e} not found while deleting project.`);o.value.splice(c,1)}}},components:{"new-project-row":E,"project-row":M}};function T(s,o,t,e,c,_){const n=r("project-row"),u=r("n-list-item"),i=r("new-project-row"),w=r("n-list");return l(),p(w,null,{footer:a(()=>[d(i,{onCreated:e.appendProject,"projects-url":t.projectsUrl},null,8,["onCreated","projects-url"])]),default:a(()=>[(l(!0),v(S,null,U(e.projects,f=>(l(),p(u,{key:f.id},{default:a(()=>[d(n,{onDestroyed:e.deleteProject,"project-id":f.id,"project-name":f.name,url:f.url,"projects-url":t.projectsUrl},null,8,["onDestroyed","project-id","project-name","url","projects-url"])]),_:2},1024))),128))]),_:1})}const $=g(V,[["render",T]]);const z={props:{indexUrl:{type:String,required:!0},projectsUrl:{type:String,required:!0},logoutUrl:{type:String,required:!0},logoUrl:{type:String,required:!0}},components:{page:B,"page-path":q,"project-list":$}};function G(s,o,t,e,c,_){const n=r("page-path"),u=r("project-list"),i=r("page");return l(),p(i,{name:"Projects","index-url":t.indexUrl,"logout-url":t.logoutUrl,"logo-url":t.logoUrl},{header:a(()=>[d(n,{"leaf-name":"Projects"})]),default:a(()=>[d(u,{id:"project-list","projects-url":t.projectsUrl},null,8,["projects-url"])]),_:1},8,["index-url","logout-url","logo-url"])}const H=g(z,[["render",G]]),b=N({});b.use(k);b.component("index-app",H);b.mount("#index-app");
