import { mkdir, readdir, writeFile } from "node:fs/promises"
import { basename, extname, join, resolve } from "node:path"

const root = resolve(import.meta.dirname, "..")
const componentsDir = join(root, "src/components")
const storiesDir = join(root, "src/stories/generated")

const complexStories = {
  accordion: {
    imports: [
      "Accordion",
      "AccordionContent",
      "AccordionItem",
      "AccordionTrigger",
    ],
    component: "Accordion",
    render: `
      <StorySurface className="w-[28rem]">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="overview">
            <AccordionTrigger>What ships with this package?</AccordionTrigger>
            <AccordionContent>
              Buttons, overlays, data display components, and the composable patterns that support them.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="story">
            <AccordionTrigger>Why a Storybook baseline?</AccordionTrigger>
            <AccordionContent>
              It gives every component a living sandbox for variants, states, and docs.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </StorySurface>
    `,
  },
  "alert-dialog": {
    imports: [
      "AlertDialog",
      "AlertDialogAction",
      "AlertDialogCancel",
      "AlertDialogContent",
      "AlertDialogDescription",
      "AlertDialogFooter",
      "AlertDialogHeader",
      "AlertDialogTitle",
      "AlertDialogTrigger",
    ],
    component: "AlertDialog",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Archive draft</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive this draft?</AlertDialogTitle>
              <AlertDialogDescription>
                The item will be hidden from the active queue but can still be restored later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Archive</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </StorySurface>
    `,
  },
  alert: {
    imports: ["Alert", "AlertAction", "AlertDescription", "AlertTitle"],
    component: "Alert",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface className="w-[28rem]">
        <Alert>
          <AlertTitle>Team space updated</AlertTitle>
          <AlertDescription>
            Your component inventory and docs now share the same visual source of truth.
          </AlertDescription>
          <AlertAction asChild>
            <Button size="sm">Review</Button>
          </AlertAction>
        </Alert>
      </StorySurface>
    `,
  },
  "aspect-ratio": {
    imports: ["AspectRatio"],
    component: "AspectRatio",
    render: `
      <StorySurface className="w-[26rem]">
        <AspectRatio ratio={16 / 9} className="w-full overflow-hidden rounded-xl border bg-muted">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary">
            <span className="text-sm font-medium text-muted-foreground">16:9 media slot</span>
          </div>
        </AspectRatio>
      </StorySurface>
    `,
  },
  avatar: {
    imports: [
      "Avatar",
      "AvatarBadge",
      "AvatarFallback",
      "AvatarGroup",
      "AvatarGroupCount",
      "AvatarImage",
    ],
    component: "Avatar",
    render: `
      <StoryStack className="items-center">
        <Avatar>
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" alt="Avery" />
          <AvatarFallback>AV</AvatarFallback>
          <AvatarBadge className="bg-emerald-500" />
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>AK</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>JW</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>MN</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </StoryStack>
    `,
  },
  badge: {
    imports: ["Badge"],
    component: "Badge",
    render: `
      <StorySurface className="gap-3">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
      </StorySurface>
    `,
  },
  breadcrumb: {
    imports: [
      "Breadcrumb",
      "BreadcrumbEllipsis",
      "BreadcrumbItem",
      "BreadcrumbLink",
      "BreadcrumbList",
      "BreadcrumbPage",
      "BreadcrumbSeparator",
    ],
    component: "Breadcrumb",
    render: `
      <StorySurface className="w-[30rem]">
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
    `,
  },
  "button-group": {
    imports: ["ButtonGroup", "ButtonGroupSeparator", "ButtonGroupText"],
    component: "ButtonGroup",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <ButtonGroup>
          <Button variant="outline">Back</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">Preview</Button>
          <ButtonGroupText>Status: Draft</ButtonGroupText>
        </ButtonGroup>
      </StorySurface>
    `,
  },
  button: {
    imports: ["Button"],
    component: "Button",
    render: `
      <StorySurface className="gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </StorySurface>
    `,
  },
  calendar: {
    imports: ["Calendar"],
    component: "Calendar",
    render: `
      <StorySurface className="w-[22rem]">
        <Calendar mode="single" selected={new Date("2026-04-27")} className="rounded-xl border bg-background p-3" />
      </StorySurface>
    `,
  },
  card: {
    imports: [
      "Card",
      "CardContent",
      "CardDescription",
      "CardFooter",
      "CardHeader",
      "CardTitle",
    ],
    component: "Card",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface className="w-[24rem]">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>UI package</CardTitle>
            <CardDescription>Reusable primitives for forms, navigation, and overlays.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Storybook gives the package one place to browse and validate each state.
            </p>
          </CardContent>
          <CardFooter className="justify-end">
            <Button size="sm">Open docs</Button>
          </CardFooter>
        </Card>
      </StorySurface>
    `,
  },
  carousel: {
    imports: [
      "Carousel",
      "CarouselContent",
      "CarouselItem",
      "CarouselNext",
      "CarouselPrevious",
    ],
    component: "Carousel",
    render: `
      <StorySurface className="w-[30rem]">
        <Carousel className="w-full max-w-sm">
          <CarouselContent>
            {["Overview", "States", "Variants"].map((label) => (
              <CarouselItem key={label}>
                <div className="flex aspect-[4/3] items-center justify-center rounded-xl border bg-muted font-medium">
                  {label}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </StorySurface>
    `,
  },
  chart: {
    imports: ["ChartContainer", "ChartTooltip", "ChartTooltipContent"],
    component: "ChartContainer",
    extraImports: [
      `import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"`,
    ],
    render: `
      <StorySurface className="w-[34rem]">
        <ChartContainer
          className="min-h-[16rem] w-full"
          config={{
            signups: {
              label: "Signups",
              color: "var(--color-primary)",
            },
          }}
        >
          <AreaChart
            accessibilityLayer
            data={[
              { day: "Mon", signups: 12 },
              { day: "Tue", signups: 18 },
              { day: "Wed", signups: 15 },
              { day: "Thu", signups: 22 },
              { day: "Fri", signups: 19 },
            ]}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="signups"
              fill="var(--color-signups)"
              fillOpacity={0.25}
              stroke="var(--color-signups)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </StorySurface>
    `,
  },
  checkbox: {
    imports: ["Checkbox"],
    component: "Checkbox",
    render: `
      <StorySurface>
        <div className="flex items-center gap-3">
          <Checkbox id="storybook-checkbox" defaultChecked />
          <label htmlFor="storybook-checkbox" className="text-sm font-medium">
            Include component stories in the review checklist
          </label>
        </div>
      </StorySurface>
    `,
  },
  collapsible: {
    imports: ["Collapsible", "CollapsibleContent", "CollapsibleTrigger"],
    component: "Collapsible",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface className="w-[28rem]">
        <Collapsible defaultOpen className="w-full rounded-xl border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium">Release notes</h3>
              <p className="text-sm text-muted-foreground">A quick summary of the UI package changes.</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">Toggle</Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="pt-4 text-sm text-muted-foreground">
            Storybook setup, generated starter stories, and a preview shell tuned for your shared styles.
          </CollapsibleContent>
        </Collapsible>
      </StorySurface>
    `,
  },
  combobox: {
    imports: [
      "Combobox",
      "ComboboxContent",
      "ComboboxEmpty",
      "ComboboxGroup",
      "ComboboxInput",
      "ComboboxItem",
      "ComboboxList",
    ],
    component: "Combobox",
    render: `
      <StorySurface className="w-[24rem]">
        <Combobox>
          <ComboboxInput placeholder="Pick a dependency" />
          <ComboboxContent>
            <ComboboxEmpty>No match found.</ComboboxEmpty>
            <ComboboxList>
              <ComboboxGroup>
                <ComboboxItem value="React">React</ComboboxItem>
                <ComboboxItem value="Next.js">Next.js</ComboboxItem>
                <ComboboxItem value="Storybook">Storybook</ComboboxItem>
                <ComboboxItem value="Radix">Radix</ComboboxItem>
              </ComboboxGroup>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </StorySurface>
    `,
  },
  command: {
    imports: [
      "Command",
      "CommandEmpty",
      "CommandGroup",
      "CommandInput",
      "CommandItem",
      "CommandList",
      "CommandSeparator",
      "CommandShortcut",
    ],
    component: "Command",
    render: `
      <StorySurface className="w-[28rem]">
        <Command className="w-full rounded-xl border">
          <CommandInput placeholder="Search a component..." />
          <CommandList>
            <CommandEmpty>No component found.</CommandEmpty>
            <CommandGroup heading="Common">
              <CommandItem>
                Button
                <CommandShortcut>B</CommandShortcut>
              </CommandItem>
              <CommandItem>
                Dialog
                <CommandShortcut>D</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Data">
              <CommandItem>Table</CommandItem>
              <CommandItem>Chart</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </StorySurface>
    `,
  },
  "context-menu": {
    imports: [
      "ContextMenu",
      "ContextMenuContent",
      "ContextMenuItem",
      "ContextMenuSeparator",
      "ContextMenuTrigger",
    ],
    component: "ContextMenu",
    render: `
      <StorySurface className="w-[22rem]">
        <ContextMenu>
          <ContextMenuTrigger className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            Right click this surface
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem>Rename</ContextMenuItem>
            <ContextMenuItem>Duplicate</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Archive</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </StorySurface>
    `,
  },
  dialog: {
    imports: [
      "Dialog",
      "DialogContent",
      "DialogDescription",
      "DialogFooter",
      "DialogHeader",
      "DialogTitle",
      "DialogTrigger",
    ],
    component: "Dialog",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Component details</DialogTitle>
              <DialogDescription>
                Storybook stories are a good place to exercise visible states and composition rules.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </StorySurface>
    `,
  },
  direction: {
    imports: ["DirectionProvider"],
    component: "DirectionProvider",
    render: `
      <StoryGrid className="max-w-3xl">
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
    `,
  },
  drawer: {
    imports: [
      "Drawer",
      "DrawerContent",
      "DrawerDescription",
      "DrawerFooter",
      "DrawerHeader",
      "DrawerTitle",
      "DrawerTrigger",
    ],
    component: "Drawer",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Open drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Publish checklist</DrawerTitle>
              <DrawerDescription>
                Review docs, accessibility notes, and the key component states before shipping.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button>Continue</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </StorySurface>
    `,
  },
  "dropdown-menu": {
    imports: [
      "DropdownMenu",
      "DropdownMenuContent",
      "DropdownMenuGroup",
      "DropdownMenuItem",
      "DropdownMenuSeparator",
      "DropdownMenuTrigger",
    ],
    component: "DropdownMenu",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Open menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>View docs</DropdownMenuItem>
              <DropdownMenuItem>Copy import</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Archive component</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </StorySurface>
    `,
  },
  empty: {
    imports: [
      "Empty",
      "EmptyContent",
      "EmptyDescription",
      "EmptyHeader",
      "EmptyMedia",
      "EmptyTitle",
    ],
    component: "Empty",
    render: `
      <StorySurface className="w-[28rem]">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">+</EmptyMedia>
            <EmptyTitle>No story selected</EmptyTitle>
            <EmptyDescription>
              Choose a component from the sidebar to inspect it in isolation.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            This pattern is handy for dashboards, inboxes, and filtered views with no results.
          </EmptyContent>
        </Empty>
      </StorySurface>
    `,
  },
  field: {
    imports: [
      "Field",
      "FieldContent",
      "FieldDescription",
      "FieldError",
      "FieldGroup",
      "FieldLabel",
    ],
    component: "Field",
    extraImports: [`import { Input } from "@workspace/ui/components/input"`],
    render: `
      <StorySurface className="w-[28rem]">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="storybook-field">Component owner</FieldLabel>
            <FieldContent>
              <Input id="storybook-field" placeholder="Design systems team" />
              <FieldDescription>The team responsible for the long-term API and docs.</FieldDescription>
            </FieldContent>
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="storybook-slug">Package slug</FieldLabel>
            <FieldContent>
              <Input id="storybook-slug" aria-invalid defaultValue="@workspace/ui" />
              <FieldError>Use a public-facing package label without special symbols.</FieldError>
            </FieldContent>
          </Field>
        </FieldGroup>
      </StorySurface>
    `,
  },
  "hover-card": {
    imports: ["HoverCard", "HoverCardContent", "HoverCardTrigger"],
    component: "HoverCard",
    render: `
      <StorySurface>
        <HoverCard openDelay={0}>
          <HoverCardTrigger asChild>
            <a href="/" className="text-sm font-medium underline underline-offset-4">
              Hover for team details
            </a>
          </HoverCardTrigger>
          <HoverCardContent className="w-72">
            <div className="flex flex-col gap-2">
              <div className="font-medium">Design system maintainers</div>
              <p className="text-sm text-muted-foreground">
                The shared UI package is maintained by product design and frontend platform together.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </StorySurface>
    `,
  },
  "input-group": {
    imports: [
      "InputGroup",
      "InputGroupAddon",
      "InputGroupInput",
      "InputGroupText",
    ],
    component: "InputGroup",
    render: `
      <StorySurface className="w-[26rem]">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="storybook.acme.dev" />
        </InputGroup>
      </StorySurface>
    `,
  },
  "input-otp": {
    imports: ["InputOTP", "InputOTPGroup", "InputOTPSeparator", "InputOTPSlot"],
    component: "InputOTP",
    render: `
      <StorySurface>
        <InputOTP maxLength={6} defaultValue="482913">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </StorySurface>
    `,
  },
  input: {
    imports: ["Input"],
    component: "Input",
    render: `
      <StorySurface className="w-[22rem]">
        <Input placeholder="Search components" />
      </StorySurface>
    `,
  },
  item: {
    imports: [
      "Item",
      "ItemActions",
      "ItemContent",
      "ItemDescription",
      "ItemFooter",
      "ItemHeader",
      "ItemTitle",
    ],
    component: "Item",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface className="w-[30rem]">
        <Item className="w-full">
          <ItemContent>
            <ItemHeader>
              <ItemTitle>Sidebar</ItemTitle>
              <ItemActions>
                <Button variant="ghost" size="sm">Inspect</Button>
              </ItemActions>
            </ItemHeader>
            <ItemDescription>Responsive navigation primitive with mobile sheet support and keyboard toggle.</ItemDescription>
            <ItemFooter>
              <span className="text-xs text-muted-foreground">Updated for Storybook</span>
              <span className="text-xs font-medium">Ready</span>
            </ItemFooter>
          </ItemContent>
        </Item>
      </StorySurface>
    `,
  },
  kbd: {
    imports: ["Kbd", "KbdGroup"],
    component: "Kbd",
    render: `
      <StorySurface className="gap-2">
        <KbdGroup>
          <Kbd>Shift</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <Kbd>Esc</Kbd>
      </StorySurface>
    `,
  },
  label: {
    imports: ["Label"],
    component: "Label",
    render: `
      <StorySurface>
        <div className="flex items-center gap-3">
          <Label htmlFor="label-demo">Project name</Label>
          <input id="label-demo" className="rounded-md border px-2 py-1 text-sm" defaultValue="UI package" />
        </div>
      </StorySurface>
    `,
  },
  menubar: {
    imports: [
      "Menubar",
      "MenubarContent",
      "MenubarItem",
      "MenubarMenu",
      "MenubarSeparator",
      "MenubarTrigger",
    ],
    component: "Menubar",
    render: `
      <StorySurface>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>File</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>New story</MenubarItem>
              <MenubarItem>Duplicate</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Archive</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </StorySurface>
    `,
  },
  "native-select": {
    imports: ["NativeSelect", "NativeSelectOptGroup", "NativeSelectOption"],
    component: "NativeSelect",
    render: `
      <StorySurface className="w-[22rem]">
        <NativeSelect defaultValue="storybook">
          <NativeSelectOptGroup label="Tooling">
            <NativeSelectOption value="storybook">Storybook</NativeSelectOption>
            <NativeSelectOption value="vite">Vite</NativeSelectOption>
            <NativeSelectOption value="turbo">Turborepo</NativeSelectOption>
          </NativeSelectOptGroup>
        </NativeSelect>
      </StorySurface>
    `,
  },
  "navigation-menu": {
    imports: [
      "NavigationMenu",
      "NavigationMenuContent",
      "NavigationMenuIndicator",
      "NavigationMenuItem",
      "NavigationMenuLink",
      "NavigationMenuList",
      "NavigationMenuTrigger",
    ],
    component: "NavigationMenu",
    render: `
      <StorySurface className="w-[36rem]">
        <NavigationMenu viewport={false}>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-1 p-1 md:w-[22rem]">
                  <NavigationMenuLink href="/">Button</NavigationMenuLink>
                  <NavigationMenuLink href="/">Dialog</NavigationMenuLink>
                  <NavigationMenuLink href="/">Table</NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/">Docs</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuIndicator />
        </NavigationMenu>
      </StorySurface>
    `,
  },
  pagination: {
    imports: [
      "Pagination",
      "PaginationContent",
      "PaginationEllipsis",
      "PaginationItem",
      "PaginationLink",
      "PaginationNext",
      "PaginationPrevious",
    ],
    component: "Pagination",
    render: `
      <StorySurface>
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
    `,
  },
  popover: {
    imports: [
      "Popover",
      "PopoverContent",
      "PopoverDescription",
      "PopoverHeader",
      "PopoverTitle",
      "PopoverTrigger",
    ],
    component: "Popover",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open popover</Button>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <PopoverHeader>
              <PopoverTitle>Review status</PopoverTitle>
              <PopoverDescription>
                Stories are generated, but a few advanced components may still want richer hand-authored scenarios.
              </PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </StorySurface>
    `,
  },
  progress: {
    imports: ["Progress"],
    component: "Progress",
    render: `
      <StorySurface className="w-[24rem]">
        <Progress value={68} className="w-full" />
      </StorySurface>
    `,
  },
  "radio-group": {
    imports: ["RadioGroup", "RadioGroupItem"],
    component: "RadioGroup",
    render: `
      <StorySurface>
        <RadioGroup defaultValue="team" className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="team" />
            Team
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="workspace" />
            Workspace
          </label>
        </RadioGroup>
      </StorySurface>
    `,
  },
  resizable: {
    imports: ["ResizableHandle", "ResizablePanel", "ResizablePanelGroup"],
    component: "ResizablePanelGroup",
    render: `
      <StorySurface className="w-[34rem]">
        <ResizablePanelGroup direction="horizontal" className="min-h-[14rem] overflow-hidden rounded-xl border">
          <ResizablePanel defaultSize={35}>
            <div className="flex h-full items-center justify-center bg-muted text-sm font-medium">Sidebar</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65}>
            <div className="flex h-full items-center justify-center text-sm font-medium">Preview canvas</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </StorySurface>
    `,
  },
  "scroll-area": {
    imports: ["ScrollArea", "ScrollBar"],
    component: "ScrollArea",
    render: `
      <StorySurface className="w-[24rem]">
        <ScrollArea className="h-40 w-full rounded-xl border">
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 10 }, (_, index) => (
              <div key={index} className="rounded-lg border p-3 text-sm">
                Component state #{index + 1}
              </div>
            ))}
          </div>
          <ScrollBar />
        </ScrollArea>
      </StorySurface>
    `,
  },
  select: {
    imports: [
      "Select",
      "SelectContent",
      "SelectGroup",
      "SelectItem",
      "SelectLabel",
      "SelectTrigger",
      "SelectValue",
    ],
    component: "Select",
    render: `
      <StorySurface>
        <Select defaultValue="storybook">
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Pick a tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tooling</SelectLabel>
              <SelectItem value="storybook">Storybook</SelectItem>
              <SelectItem value="vite">Vite</SelectItem>
              <SelectItem value="turbo">Turborepo</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </StorySurface>
    `,
  },
  separator: {
    imports: ["Separator"],
    component: "Separator",
    render: `
      <StorySurface className="w-[22rem]">
        <div className="flex w-full flex-col gap-4">
          <div className="text-sm font-medium">Above the fold</div>
          <Separator />
          <div className="text-sm text-muted-foreground">Below the fold</div>
        </div>
      </StorySurface>
    `,
  },
  sheet: {
    imports: [
      "Sheet",
      "SheetContent",
      "SheetDescription",
      "SheetFooter",
      "SheetHeader",
      "SheetTitle",
      "SheetTrigger",
    ],
    component: "Sheet",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Inspect component</SheetTitle>
              <SheetDescription>
                Side panels are useful for docs, metadata, and secondary workflows.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <Button>Save changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </StorySurface>
    `,
  },
  sidebar: {
    imports: [
      "Sidebar",
      "SidebarContent",
      "SidebarFooter",
      "SidebarGroup",
      "SidebarGroupContent",
      "SidebarGroupLabel",
      "SidebarHeader",
      "SidebarInset",
      "SidebarMenu",
      "SidebarMenuButton",
      "SidebarMenuItem",
      "SidebarProvider",
      "SidebarTrigger",
    ],
    component: "Sidebar",
    render: `
      <StorySurface className="h-[28rem] w-[42rem] items-stretch p-0">
        <SidebarProvider defaultOpen>
          <Sidebar collapsible="icon">
            <SidebarHeader className="border-b p-2">
              <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Library</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>Overview</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Components</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>Accessibility</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-2 text-xs text-muted-foreground">
              Shared UI package
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex items-center justify-center border-l">
            <div className="text-sm text-muted-foreground">Main content area</div>
          </SidebarInset>
        </SidebarProvider>
      </StorySurface>
    `,
    parameters: { layout: "fullscreen" },
  },
  skeleton: {
    imports: ["Skeleton"],
    component: "Skeleton",
    render: `
      <StorySurface className="w-[26rem]">
        <div className="flex w-full flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </StorySurface>
    `,
  },
  slider: {
    imports: ["Slider"],
    component: "Slider",
    render: `
      <StorySurface className="w-[24rem]">
        <Slider defaultValue={[35]} max={100} step={5} className="w-full" />
      </StorySurface>
    `,
  },
  sonner: {
    imports: ["Toaster"],
    component: "Toaster",
    extraImports: [
      `import { toast } from "sonner"`,
      `import { Button } from "@workspace/ui/components/button"`,
    ],
    render: `
      <StorySurface>
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => toast.success("Storybook toast preview is live.")}>
            Trigger toast
          </Button>
          <Toaster richColors />
        </div>
      </StorySurface>
    `,
  },
  spinner: {
    imports: ["Spinner"],
    component: "Spinner",
    render: `
      <StorySurface>
        <Spinner />
      </StorySurface>
    `,
  },
  switch: {
    imports: ["Switch"],
    component: "Switch",
    render: `
      <StorySurface>
        <div className="flex items-center gap-3">
          <Switch id="storybook-switch" defaultChecked />
          <label htmlFor="storybook-switch" className="text-sm font-medium">
            Enable review mode
          </label>
        </div>
      </StorySurface>
    `,
  },
  table: {
    imports: [
      "Table",
      "TableBody",
      "TableCaption",
      "TableCell",
      "TableHead",
      "TableHeader",
      "TableRow",
    ],
    component: "Table",
    render: `
      <StorySurface className="w-[34rem]">
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
    `,
  },
  tabs: {
    imports: ["Tabs", "TabsContent", "TabsList", "TabsTrigger"],
    component: "Tabs",
    render: `
      <StorySurface className="w-[30rem]">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-4 rounded-xl border p-4 text-sm">
            Primary usage guidance and composition hints live here.
          </TabsContent>
          <TabsContent value="states" className="mt-4 rounded-xl border p-4 text-sm">
            Focus, hover, empty, error, disabled, and loading states.
          </TabsContent>
          <TabsContent value="notes" className="mt-4 rounded-xl border p-4 text-sm">
            Add richer interactions later for components that need them.
          </TabsContent>
        </Tabs>
      </StorySurface>
    `,
  },
  textarea: {
    imports: ["Textarea"],
    component: "Textarea",
    render: `
      <StorySurface className="w-[26rem]">
        <Textarea defaultValue="Storybook stories make visual regressions easier to spot before they land in the app." />
      </StorySurface>
    `,
  },
  "toggle-group": {
    imports: ["ToggleGroup", "ToggleGroupItem"],
    component: "ToggleGroup",
    render: `
      <StorySurface>
        <ToggleGroup type="single" defaultValue="preview">
          <ToggleGroupItem value="preview">Preview</ToggleGroupItem>
          <ToggleGroupItem value="docs">Docs</ToggleGroupItem>
          <ToggleGroupItem value="tests">Tests</ToggleGroupItem>
        </ToggleGroup>
      </StorySurface>
    `,
  },
  toggle: {
    imports: ["Toggle"],
    component: "Toggle",
    render: `
      <StorySurface>
        <Toggle defaultPressed>Bold</Toggle>
      </StorySurface>
    `,
  },
  tooltip: {
    imports: ["Tooltip", "TooltipContent", "TooltipProvider", "TooltipTrigger"],
    component: "Tooltip",
    extraImports: [`import { Button } from "@workspace/ui/components/button"`],
    render: `
      <StorySurface>
        <TooltipProvider>
          <Tooltip open>
            <TooltipTrigger asChild>
              <Button variant="outline">Hover target</Button>
            </TooltipTrigger>
            <TooltipContent>Helpful context lives here.</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </StorySurface>
    `,
  },
}

const fallbackStories = {
  component: (name) => `
      <StorySurface>
        <${name} />
      </StorySurface>
    `,
}

const toPascalCase = (value) =>
  value
    .split(/[-_]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")

function normalizeBlock(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => line.replace(/\s+$/g, ""))
    .join("\n")
}

function buildStorySource({ storyName, importPath, definition }) {
  const imports = [...definition.imports]
  const component = definition.component
  const title = `Components/${toPascalCase(storyName)}`
  const extraImports = definition.extraImports ?? []
  const helperImports = ["StorySurface", "StoryStack", "StoryGrid"].filter(
    (helper) => definition.render.includes(helper)
  )
  const parameters =
    definition.parameters == null
      ? ""
      : `,\n  parameters: ${JSON.stringify(definition.parameters, null, 2).replace(/"([^"]+)":/g, "$1:")}`

  return `${normalizeBlock(`
    import type { Meta, StoryObj } from "@storybook/react-vite"

    import { ${imports.join(", ")} } from "${importPath}"
    import { ${helperImports.join(", ")} } from "../storybook-support"
    ${extraImports.join("\n")}

    const meta = {
      title: "${title}",
      component: ${component},
      tags: ["autodocs"]${parameters}
    } satisfies Meta<typeof ${component}>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
        ${normalizeBlock(definition.render)}
      ),
    }
  `)}
`
}

function createFallbackDefinition(fileName, exportName) {
  return {
    imports: [exportName],
    component: exportName,
    render: fallbackStories.component(exportName),
  }
}

async function main() {
  await mkdir(storiesDir, { recursive: true })

  const files = (await readdir(componentsDir))
    .filter((file) => extname(file) === ".tsx")
    .sort()

  for (const file of files) {
    const storyName = basename(file, ".tsx")
    const definition =
      complexStories[storyName] ??
      createFallbackDefinition(file, toPascalCase(storyName))

    const importPath = `../../components/${storyName}`
    const output = buildStorySource({
      storyName,
      importPath,
      definition,
    })

    await writeFile(join(storiesDir, `${storyName}.stories.tsx`), output)
  }
}

main().catch((error) => {
  console.error(error)
  globalThis.process.exitCode = 1
})
