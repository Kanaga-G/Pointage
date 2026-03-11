import React from 'react';
import { cn } from '../../utils/cn';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
  onRowClick?: (record: T, index: number) => void;
  striped?: boolean;
  hover?: boolean;
  stickyHeader?: boolean;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  empty,
  className,
  onRowClick,
  striped = true,
  hover = true,
  stickyHeader = true
}: TableProps<T>) => {
  const renderCell = (column: TableColumn<T>, record: T, index: number) => {
    const value = record[column.key];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value;
  };

  const getAlignmentClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  if (loading) {
    return (
      <div className="bg-surface rounded-lg shadow-card border border-border overflow-hidden">
        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent">
            <span className="sr-only">Chargement...</span>
          </div>
          <p className="mt-2 text-sm text-text-secondary">Chargement des données...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-card border border-border overflow-hidden">
        <div className="p-8 text-center">
          {empty || (
            <>
              <svg
                className="mx-auto h-12 w-12 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-text-primary">Aucune donnée</h3>
              <p className="mt-2 text-sm text-text-secondary">
                Il n'y a pas de données à afficher pour le moment.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-surface rounded-lg shadow-card border border-border overflow-hidden',
      className
    )}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className={cn(
            'bg-secondary-50 border-b border-border',
            stickyHeader && 'sticky top-0 z-10'
          )}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-xs font-medium text-text-secondary uppercase tracking-wider',
                    getAlignmentClass(column.align),
                    column.className
                  )}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <svg
                        className="w-3 h-3 text-text-muted"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-border">
            {data.map((record, index) => (
              <tr
                key={index}
                className={cn(
                  'transition-colors',
                  hover && 'hover:bg-secondary-50',
                  striped && index % 2 === 1 && 'bg-secondary-25',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(record, index)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      'px-6 py-4 text-sm text-text-primary whitespace-nowrap',
                      getAlignmentClass(column.align),
                      column.className
                    )}
                  >
                    {renderCell(column, record, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
