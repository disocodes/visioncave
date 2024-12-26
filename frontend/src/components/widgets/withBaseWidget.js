import React from 'react';
import BaseWidget from './BaseWidget';

const withBaseWidget = (WrappedComponent, defaultConfig = {}) => {
  const WithBaseWidget = ({ title, onDelete, config = {}, ...props }) => {
    // Merge default config with provided config
    const mergedConfig = { ...defaultConfig, ...config };

    return (
      <BaseWidget
        title={title}
        onDelete={onDelete}
        configurable={true}
        expandable={true}
      >
        <WrappedComponent config={mergedConfig} {...props} />
      </BaseWidget>
    );
  };

  // Set display name for debugging
  WithBaseWidget.displayName = `withBaseWidget(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithBaseWidget;
};

export default withBaseWidget;
