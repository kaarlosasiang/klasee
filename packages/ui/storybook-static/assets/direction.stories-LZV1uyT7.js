import{j as e}from"./iframe-D4FPlWOh.js";import{D as s}from"./index-DtzbVd0L.js";import{d as n}from"./storybook-support-CsbcOoqw.js";import"./preload-helper-PPVm8Dsz.js";function t({dir:o,direction:i,children:d}){return e.jsx(s,{dir:i??o,children:d})}t.__docgenInfo={description:"",methods:[],displayName:"DirectionProvider",props:{direction:{required:!1,tsType:{name:'ReactComponentProps["dir"]',raw:'React.ComponentProps<typeof Direction.DirectionProvider>["dir"]'},description:""}}};const p={title:"Components/Direction",component:t,tags:["autodocs"]},r={render:()=>e.jsxs(n,{className:"max-w-3xl",children:[e.jsx(t,{dir:"ltr",children:e.jsxs("div",{className:"rounded-xl border p-4 text-sm",children:[e.jsx("div",{className:"font-medium",children:"Left to right"}),e.jsx("p",{className:"mt-2 text-muted-foreground",children:"Controls and layout flow read the default direction."})]})}),e.jsx(t,{dir:"rtl",children:e.jsxs("div",{className:"rounded-xl border p-4 text-right text-sm",children:[e.jsx("div",{className:"font-medium",children:"Right to left"}),e.jsx("p",{className:"mt-2 text-muted-foreground",children:"This wrapper lets components opt into mirrored direction safely."})]})})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <StoryGrid className="max-w-3xl">
        <DirectionProvider dir="ltr">
          <div className="rounded-xl border p-4 text-sm">
            <div className="font-medium">Left to right</div>
            <p className="mt-2 text-muted-foreground">Controls and layout flow read the default direction.</p>
          </div>
        </DirectionProvider>
        <DirectionProvider dir="rtl">
          <div className="rounded-xl border p-4 text-right text-sm">
            <div className="font-medium">Right to left</div>
            <p className="mt-2 text-muted-foreground">This wrapper lets components opt into mirrored direction safely.</p>
          </div>
        </DirectionProvider>
      </StoryGrid>
}`,...r.parameters?.docs?.source}}};const x=["Default"];export{r as Default,x as __namedExportsOrder,p as default};
