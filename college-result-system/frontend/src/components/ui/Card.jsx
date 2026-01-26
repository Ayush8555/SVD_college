import React from 'react';

const Card = ({ children, className = '', title, subTitle, actions, noPadding = false }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div>
            {title && <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide">{title}</h3>}
            {subTitle && <p className="text-xs text-gray-500 mt-0.5">{subTitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
};

export default Card;
