import React from 'react';

const Table = ({ headers, children, emptyMessage = "No data found", variant = "striped" }) => {
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className={`py-3 px-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200 whitespace-nowrap ${idx === 0 ? 'pl-6' : ''}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {children}
        </tbody>
      </table>
      {(!children || React.Children.count(children) === 0) && (
        <div className="text-center py-12 text-gray-500 text-sm italic bg-gray-50">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default Table;
