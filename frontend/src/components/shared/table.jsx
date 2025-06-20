// Table.jsx
import React from "react";

export const Table = ({ children, className = "" }) => (
  <table
    className={`min-w-full divide-y divide-gray-200 bg-white text-gray-800 dark:divide-gray-700 dark:bg-gray-800 dark:text-gray-200 ${className}`}
  >
    {children}
  </table>
);

export const TableHeader = ({ children, className = "" }) => (
  <thead className={className}>{children}</thead>
);

export const TableRow = ({ children, className = "" }) => (
  <tr
    className={`border-b border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${className}`}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = "" }) => (
  <th
    className={`px-6 py-3 bg-white text-left text-xs font-medium text-[#3f51b5] uppercase tracking-wider dark:bg-gray-800 dark:text-blue-100 ${className}`}
  >
    {children}
  </th>
);

export const TableBody = ({ children, className = "" }) => (
  <tbody className={className}>{children}</tbody>
);

export const TableCell = ({ children, className = "" }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
    {children}
  </td>
);

// export { TableHeader, TableHead, TableRow, TableBody, TableCell };
export const TableFooter = ({ children, className = "" }) => (
  <tfoot className={className}>{children}</tfoot>
);
export const TableFooterRow = ({ children, className = "" }) => (
  <tr className={`border-t border-gray-700 ${className}`}>{children}</tr>
);
