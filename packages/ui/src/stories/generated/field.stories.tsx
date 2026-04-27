import type { Meta, StoryObj } from "@storybook/react-vite"

    import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "../../components/field"
    import { StorySurface } from "../storybook-support"
    import { Input } from "@workspace/ui/components/input"

    const meta = {
      title: "Components/Field",
      component: Field,
      tags: ["autodocs"]
    } satisfies Meta<typeof Field>

    export default meta

    type Story = StoryObj<typeof meta>

    export const Default: Story = {
      render: () => (
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
      ),
    }
