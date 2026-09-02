import { Tabs as ArkTabs, useTabsContext } from '@ark-ui/react/tabs';

import './tabs.css';

function joinClasses(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function Tabs({
  activationMode = 'automatic',
  className = '',
  loopFocus = true,
  orientation = 'horizontal',
  ...props
}) {
  return (
    <ArkTabs.Root
      {...props}
      activationMode={activationMode}
      className={joinClasses('ds-tabs-root', className)}
      loopFocus={loopFocus}
      orientation={orientation}
    />
  );
}

export function TabsList({ className = '', ...props }) {
  return (
    <ArkTabs.List
      {...props}
      className={joinClasses('ds-tabs', 'ds-ark-tabs__list', className)}
    />
  );
}

export function TabsTrigger({ className = '', value, ...props }) {
  const tabs = useTabsContext();
  const active = tabs.value === value;

  return (
    <ArkTabs.Trigger
      {...props}
      className={joinClasses('ds-tab', 'ds-ark-tabs__trigger', active && 'ds-tab--active', className)}
      value={value}
    />
  );
}

export function TabsContent({ className = '', ...props }) {
  return (
    <ArkTabs.Content
      {...props}
      className={joinClasses('ds-tab-panel', className)}
    />
  );
}
