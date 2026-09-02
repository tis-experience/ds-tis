import { Portal } from '@ark-ui/react/portal';
import { Tooltip as ArkTooltip } from '@ark-ui/react/tooltip';

import './tooltip.css';

export function Tooltip({
  closeDelay = 100,
  interactive = true,
  openDelay = 100,
  placement = 'top',
  positioning,
  ...props
}) {
  return (
    <ArkTooltip.Root
      closeDelay={closeDelay}
      interactive={interactive}
      openDelay={openDelay}
      positioning={{ placement, gutter: 8, ...positioning }}
      {...props}
    />
  );
}

export function TooltipTrigger(props) {
  return <ArkTooltip.Trigger {...props} />;
}

export function TooltipContent({
  children,
  className = '',
  portal = true,
  showArrow = true,
  ...props
}) {
  const content = (
    <ArkTooltip.Positioner className="ds-ark-tooltip__positioner">
      {showArrow ? (
        <ArkTooltip.Arrow className="ds-ark-tooltip__arrow">
          <ArkTooltip.ArrowTip className="ds-ark-tooltip__arrow-tip" />
        </ArkTooltip.Arrow>
      ) : null}
      <ArkTooltip.Content
        className={`ds-tooltip__content ds-ark-tooltip__content ${className}`.trim()}
        {...props}
      >
        {children}
      </ArkTooltip.Content>
    </ArkTooltip.Positioner>
  );

  return portal ? <Portal>{content}</Portal> : content;
}
