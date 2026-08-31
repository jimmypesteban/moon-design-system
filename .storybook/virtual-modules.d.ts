// The virtual module lastUpdatedPlugin serves. Declared so TypeScript knows the
// shape; the values are produced at build time from `git log`.
declare module 'virtual:mo-last-updated' {
  export const lastUpdated: {
    date: string | null;
    author: string | null;
    changes: {
      date: string;
      who: string;
      why: string;
      parts: { kind: 'added' | 'removed' | 'updated'; label: string }[];
    }[];
    historyTruncated: boolean;
  };
}


