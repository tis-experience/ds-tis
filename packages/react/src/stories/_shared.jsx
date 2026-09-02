import * as React from 'react';

function formatDefaultValue(value) {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

export function storyArg({ control, defaultValue, description, name, options, type }) {
  const summary = type || (options
    ? options.map((option) => JSON.stringify(option)).join(' | ')
    : control === 'boolean'
      ? 'boolean'
      : 'string');
  return {
    control,
    description,
    ...(name ? { name } : {}),
    ...(options ? { options } : {}),
    table: {
      type: { summary },
      ...(defaultValue === undefined
        ? {}
        : { defaultValue: { summary: formatDefaultValue(defaultValue) } }),
    },
  };
}

export function StoryCanvas({ children, fluid = false, narrow = false }) {
  return (
    <div className={`ds-story-canvas${fluid ? ' ds-story-canvas--fluid' : ''}${narrow ? ' ds-story-canvas--narrow' : ''}`}>
      {children}
    </div>
  );
}

export function StoryStack({ children }) {
  return <div className="ds-story-stack">{children}</div>;
}

export function StoryRow({ children, className = '' }) {
  return <div className={`ds-story-row ${className}`.trim()}>{children}</div>;
}

export function StoryGrid({ children }) {
  return <div className="ds-story-grid">{children}</div>;
}

export function StorySection({ children, description, title }) {
  return (
    <section className="ds-story-section">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {children}
    </section>
  );
}
