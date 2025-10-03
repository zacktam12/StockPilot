// table.jsx
import React from "react";

export const Table = ({ children, className = "" }) => (
  <table
    className={`min-w-full bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-200 border-spacing-0 border-collapse ${className}`}
  >
    {children}
  </table>
);

export const TableHeader = ({ children, className = "" }) => (
  <thead className={`${className}`}>{children}</thead>
);

export const TableRow = ({ children, className = "", onClick, ...props }) => (
  <tr
    className={`${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = "" }) => (
  <th
    className={`px-3 py-3 text-left text-sm font-semibold text-gray-900 bg-gray-50 border-b border-gray-200 ${className}`}
  >
    {children}
  </th>
);

export const TableBody = ({ children, className = "" }) => (
  <tbody className={className}>{children}</tbody>
);

export const TableCell = ({ children, className = "" }) => (
  <td className={`px-3 py-3 text-sm text-gray-900 whitespace-nowrap ${className}`}>
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