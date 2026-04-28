import{j as e}from"./iframe-D4FPlWOh.js";import{c as n,S as m}from"./storybook-support-CsbcOoqw.js";import"./preload-helper-PPVm8Dsz.js";function d({className:a,...l}){return e.jsx("div",{"data-slot":"table-container",className:"relative w-full overflow-x-auto",children:e.jsx("table",{"data-slot":"table",className:n("w-full caption-bottom text-sm",a),...l})})}function c({className:a,...l}){return e.jsx("thead",{"data-slot":"table-header",className:n("[&_tr]:border-b",a),...l})}function i({className:a,...l}){return e.jsx("tbody",{"data-slot":"table-body",className:n("[&_tr:last-child]:border-0",a),...l})}function o({className:a,...l}){return e.jsx("tr",{"data-slot":"table-row",className:n("border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",a),...l})}function r({className:a,...l}){return e.jsx("th",{"data-slot":"table-head",className:n("h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",a),...l})}function t({className:a,...l}){return e.jsx("td",{"data-slot":"table-cell",className:n("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",a),...l})}function b({className:a,...l}){return e.jsx("caption",{"data-slot":"table-caption",className:n("mt-4 text-sm text-muted-foreground",a),...l})}d.__docgenInfo={description:"",methods:[],displayName:"Table"};c.__docgenInfo={description:"",methods:[],displayName:"TableHeader"};i.__docgenInfo={description:"",methods:[],displayName:"TableBody"};r.__docgenInfo={description:"",methods:[],displayName:"TableHead"};o.__docgenInfo={description:"",methods:[],displayName:"TableRow"};t.__docgenInfo={description:"",methods:[],displayName:"TableCell"};b.__docgenInfo={description:"",methods:[],displayName:"TableCaption"};const p={title:"Components/Table",component:d,tags:["autodocs"]},s={render:()=>e.jsx(m,{className:"w-[34rem]",children:e.jsxs(d,{children:[e.jsx(b,{children:"Current component coverage in Storybook."}),e.jsx(c,{children:e.jsxs(o,{children:[e.jsx(r,{children:"Component"}),e.jsx(r,{children:"Status"}),e.jsx(r,{className:"text-right",children:"Stories"})]})}),e.jsxs(i,{children:[e.jsxs(o,{children:[e.jsx(t,{children:"Button"}),e.jsx(t,{children:"Ready"}),e.jsx(t,{className:"text-right",children:"3"})]}),e.jsxs(o,{children:[e.jsx(t,{children:"Dialog"}),e.jsx(t,{children:"Ready"}),e.jsx(t,{className:"text-right",children:"1"})]}),e.jsxs(o,{children:[e.jsx(t,{children:"Chart"}),e.jsx(t,{children:"Baseline"}),e.jsx(t,{className:"text-right",children:"1"})]})]})]})})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <StorySurface className="w-[34rem]">
        <Table>
          <TableCaption>Current component coverage in Storybook.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Stories</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Button</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell className="text-right">3</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Dialog</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell className="text-right">1</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Chart</TableCell>
              <TableCell>Baseline</TableCell>
              <TableCell className="text-right">1</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </StorySurface>
}`,...s.parameters?.docs?.source}}};const u=["Default"];export{s as Default,u as __namedExportsOrder,p as default};
