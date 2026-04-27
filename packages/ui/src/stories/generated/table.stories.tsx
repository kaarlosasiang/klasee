import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../../components/table"
    import { StorySurface } from "../storybook-support"


    const meta = {
      title: "Components/Table",
      component: Table,
      tags: ["autodocs"]
    } satisfies Meta<typeof Table>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
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
      ),
    }
