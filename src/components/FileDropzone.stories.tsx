import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileDropzone, type FileDropzoneFile } from "./FileDropzone";

const meta: Meta<typeof FileDropzone> = {
  title: "Components/Forms/FileDropzone",
  component: FileDropzone,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FileDropzone>;

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const Interactive: Story = {
  render: () => {
    function Demo() {
      const [files, setFiles] = useState<FileDropzoneFile[]>([]);
      return (
        <FileDropzone
          label="Course materials"
          accept=".pdf,.docx,.txt"
          multiple
          hintLabel="PDF, DOCX, or TXT"
          files={files}
          onAddFile={(file) =>
            setFiles((cur) => [
              ...cur,
              { name: file.name, size: formatSize(file.size) },
            ])
          }
          onRemoveFile={(index) =>
            setFiles((cur) => cur.filter((_, i) => i !== index))
          }
        />
      );
    }
    return <Demo />;
  },
};

export const WithFiles: Story = {
  args: {
    label: "Attachments",
    files: [
      { name: "syllabus.pdf", size: "1.2 MB" },
      { name: "reading-week-3.docx", size: "340 KB" },
    ],
    onAddFile: () => {},
    onRemoveFile: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: "Course materials",
    disabled: true,
    onAddFile: () => {},
  },
};
