import{j as r}from"./iframe-D4FPlWOh.js";import{c as s,S as b}from"./storybook-support-CsbcOoqw.js";import{C as f}from"./chevron-right-BZrPgR-U.js";import{E as B}from"./ellipsis-DJ05ELoQ.js";import{S as x}from"./index-BJBaJUyv.js";import"./preload-helper-PPVm8Dsz.js";import"./createLucideIcon-68HxqfTd.js";function m({className:e,...a}){return r.jsx("nav",{"aria-label":"breadcrumb","data-slot":"breadcrumb",className:s(e),...a})}function i({className:e,...a}){return r.jsx("ol",{"data-slot":"breadcrumb-list",className:s("flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground",e),...a})}function n({className:e,...a}){return r.jsx("li",{"data-slot":"breadcrumb-item",className:s("inline-flex items-center gap-1",e),...a})}function d({asChild:e,className:a,...c}){const p=e?x:"a";return r.jsx(p,{"data-slot":"breadcrumb-link",className:s("transition-colors hover:text-foreground",a),...c})}function u({className:e,...a}){return r.jsx("span",{"data-slot":"breadcrumb-page",role:"link","aria-disabled":"true","aria-current":"page",className:s("font-normal text-foreground",e),...a})}function o({children:e,className:a,...c}){return r.jsx("li",{"data-slot":"breadcrumb-separator",role:"presentation","aria-hidden":"true",className:s("[&>svg]:size-3.5",a),...c,children:e??r.jsx(f,{})})}function l({className:e,...a}){return r.jsxs("span",{"data-slot":"breadcrumb-ellipsis",role:"presentation","aria-hidden":"true",className:s("flex size-5 items-center justify-center [&>svg]:size-4",e),...a,children:[r.jsx(B,{}),r.jsx("span",{className:"sr-only",children:"More"})]})}m.__docgenInfo={description:"",methods:[],displayName:"Breadcrumb"};i.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbList"};n.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbItem"};d.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbLink",props:{asChild:{required:!1,tsType:{name:"boolean"},description:""}}};u.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbPage"};o.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbSeparator"};l.__docgenInfo={description:"",methods:[],displayName:"BreadcrumbEllipsis"};const y={title:"Components/Breadcrumb",component:m,tags:["autodocs"]},t={render:()=>r.jsx(b,{className:"w-[30rem]",children:r.jsx(m,{children:r.jsxs(i,{children:[r.jsx(n,{children:r.jsx(d,{href:"/",children:"Workspace"})}),r.jsx(o,{}),r.jsx(n,{children:r.jsx(l,{})}),r.jsx(o,{}),r.jsx(n,{children:r.jsx(d,{href:"/components",children:"Components"})}),r.jsx(o,{}),r.jsx(n,{children:r.jsx(u,{children:"Storybook"})})]})})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <StorySurface className="w-[30rem]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Workspace</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/components">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Storybook</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </StorySurface>
}`,...t.parameters?.docs?.source}}};const k=["Default"];export{t as Default,k as __namedExportsOrder,y as default};
