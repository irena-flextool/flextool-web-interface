import{_ as l,a as r,o as n,b as s,C as o}from"./_plugin-vue_export-helper-0666fbf1.js";const c={props:{state:{type:String,required:!0},errorMessage:{type:String,required:!1,default:""}},state:{loading:"loading",waiting:"waiting",ready:"ready",error:"error"}};function d(t,_,e,u,g,p){const a=r("n-spin"),i=r("n-result");return e.state==="loading"?(n(),s(a,{key:0})):e.state==="error"?(n(),s(i,{key:1,status:"error",title:"Error",description:e.errorMessage},null,8,["description"])):e.state==="waiting"?o(t.$slots,"waiting",{key:2}):o(t.$slots,"default",{key:3})}const y=l(c,[["render",d]]);export{y as F};