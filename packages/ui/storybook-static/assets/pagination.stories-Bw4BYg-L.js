import{j as n}from"./iframe-D4FPlWOh.js";import{c as t,S as u}from"./storybook-support-CsbcOoqw.js";import{B as f}from"./button-BeqyZ1PH.js";import{C as x}from"./chevron-left-BfXdtJAC.js";import{E as P}from"./ellipsis-DJ05ELoQ.js";import{C as h}from"./chevron-right-BZrPgR-U.js";import"./preload-helper-PPVm8Dsz.js";import"./index-5lkIbytk.js";import"./index-BJBaJUyv.js";import"./createLucideIcon-68HxqfTd.js";function l({className:i,...a}){return n.jsx("nav",{role:"navigation","aria-label":"pagination","data-slot":"pagination",className:t("mx-auto flex w-full justify-center",i),...a})}function d({className:i,...a}){return n.jsx("ul",{"data-slot":"pagination-content",className:t("flex items-center gap-0.5",i),...a})}function e({...i}){return n.jsx("li",{"data-slot":"pagination-item",...i})}function s({className:i,isActive:a,size:o="icon",...g}){return n.jsx(f,{asChild:!0,variant:a?"outline":"ghost",size:o,className:t(i),children:n.jsx("a",{"aria-current":a?"page":void 0,"data-slot":"pagination-link","data-active":a,...g})})}function c({className:i,text:a="Previous",...o}){return n.jsxs(s,{"aria-label":"Go to previous page",size:"default",className:t("pl-1.5!",i),...o,children:[n.jsx(x,{"data-icon":"inline-start"}),n.jsx("span",{className:"hidden sm:block",children:a})]})}function m({className:i,text:a="Next",...o}){return n.jsxs(s,{"aria-label":"Go to next page",size:"default",className:t("pr-1.5!",i),...o,children:[n.jsx("span",{className:"hidden sm:block",children:a}),n.jsx(h,{"data-icon":"inline-end"})]})}function p({className:i,...a}){return n.jsxs("span",{"aria-hidden":!0,"data-slot":"pagination-ellipsis",className:t("flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",i),...a,children:[n.jsx(P,{}),n.jsx("span",{className:"sr-only",children:"More pages"})]})}l.__docgenInfo={description:"",methods:[],displayName:"Pagination"};d.__docgenInfo={description:"",methods:[],displayName:"PaginationContent"};p.__docgenInfo={description:"",methods:[],displayName:"PaginationEllipsis"};e.__docgenInfo={description:"",methods:[],displayName:"PaginationItem"};s.__docgenInfo={description:"",methods:[],displayName:"PaginationLink",props:{isActive:{required:!1,tsType:{name:"boolean"},description:""},size:{defaultValue:{value:'"icon"',computed:!1},required:!1}}};m.__docgenInfo={description:"",methods:[],displayName:"PaginationNext",props:{text:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Next"',computed:!1}}}};c.__docgenInfo={description:"",methods:[],displayName:"PaginationPrevious",props:{text:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:'"Previous"',computed:!1}}}};const L={title:"Components/Pagination",component:l,tags:["autodocs"]},r={render:()=>n.jsx(u,{children:n.jsx(l,{children:n.jsxs(d,{children:[n.jsx(e,{children:n.jsx(c,{href:"/"})}),n.jsx(e,{children:n.jsx(s,{href:"/",isActive:!0,children:"1"})}),n.jsx(e,{children:n.jsx(s,{href:"/",children:"2"})}),n.jsx(e,{children:n.jsx(p,{})}),n.jsx(e,{children:n.jsx(m,{href:"/"})})]})})})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <StorySurface>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="/" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </StorySurface>
}`,...r.parameters?.docs?.source}}};const b=["Default"];export{r as Default,b as __namedExportsOrder,L as default};
