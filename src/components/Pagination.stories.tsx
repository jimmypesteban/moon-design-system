import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Components/Navigation/Pagination",
  component: Pagination,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

function PaginationDemo() {
  const [page, setPage] = useState(5);
  return <Pagination page={page} totalPages={12} onPageChange={setPage} />;
}

export const Default: Story = {
  render: () => <PaginationDemo />,
};

export const FewPages: Story = {
  args: { page: 2, totalPages: 4, onPageChange: () => {} },
};

export const FirstPage: Story = {
  args: { page: 1, totalPages: 10, onPageChange: () => {} },
};

export const LastPage: Story = {
  args: { page: 10, totalPages: 10, onPageChange: () => {} },
};

/**
 * With `total`/`pageSize` (+ optional `onPageSizeChange`), Pagination also
 * renders the "Showing X–Y of N" summary and page-size selector — the
 * pattern used on the admin Submissions, Activity Submissions, Curriculum
 * Enrollments, and Classes lists, previously copy-pasted per page.
 */
function WithSummaryDemo() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  return (
    <Pagination
      page={page}
      totalPages={10}
      total={241}
      pageSize={pageSize}
      onPageChange={setPage}
      onPageSizeChange={setPageSize}
      itemLabel="classes"
    />
  );
}

export const WithSummaryAndPageSize: Story = {
  render: () => <WithSummaryDemo />,
};
