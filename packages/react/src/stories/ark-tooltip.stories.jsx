import { Button } from '../../../../registry/tis/button.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ark/tooltip.jsx';
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

function TooltipExample({ content, placement = 'top', showArrow = true }) {
  return (
    <Tooltip placement={placement}>
      <TooltipTrigger asChild>
        <Button aria-label={content} size="sm" variant="outline">Info</Button>
      </TooltipTrigger>
      <TooltipContent showArrow={showArrow}>{content}</TooltipContent>
    </Tooltip>
  );
}

export default {
  id: 'ark-tooltip',
  title: 'Outputs/Ark + Zag/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Informações do projeto', placement: 'top', showArrow: true },
  argTypes: {
    content: storyArg({ control: 'text', defaultValue: 'Informações do projeto', description: 'Label breve e complementar.' }),
    placement: storyArg({ control: 'radio', defaultValue: 'top', options: ['top', 'right', 'bottom', 'left'], description: 'Posição preferencial.' }),
    showArrow: storyArg({ control: 'boolean', defaultValue: true, description: 'Exibe a seta de ancoragem.' }),
  },
  parameters: { docs: { description: { component: 'Adapter React independente em que Ark UI fornece as parts e Zag mantém hover, focus, delays, posicionamento e Escape.' } } },
};

export const Playground = {
  render: (args) => <StoryCanvas><TooltipExample {...args} /></StoryCanvas>,
};

export const Placements = {
  render: () => (
    <StoryCanvas>
      <StoryRow>
        {['top', 'right', 'bottom', 'left'].map((placement) => (
          <TooltipExample key={placement} content={`Tooltip ${placement}`} placement={placement} />
        ))}
      </StoryRow>
    </StoryCanvas>
  ),
};

export const WithoutArrow = {
  render: () => <StoryCanvas><TooltipExample content="Tooltip sem seta" showArrow={false} /></StoryCanvas>,
};
