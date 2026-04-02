import React from "react";

export default function DataTable({ columns, rows, rowKey = "id", actions }) {
  return (
    <div className="data-table-shell">
      <table className="data-table">
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.width, minWidth: column.minWidth }} />
          ))}
          {actions ? <col style={{ width: "320px", minWidth: "320px" }} /> : null}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.headerClassName}>
                {column.title}
              </th>
            ))}
            {actions ? <th className="data-table-actions-head">操作</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]}>
              {columns.map((column) => (
                <td key={column.key} className={column.cellClassName}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions ? <td className="data-table-actions-cell">{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
