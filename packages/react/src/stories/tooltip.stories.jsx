import { Button } from '../../../../registry/tis/button.tsx';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../../registry/tis/tooltip.tsx';
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

function TooltipExample({ content, showArrow = true, side = 'top' }) {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button aria-label={content} size="sm" variant="outline" />}>Info</TooltipTrigger>
      <TooltipContent showArrow={showArrow} side={side}>{content}</TooltipContent>
    </Tooltip>
  );
}

export default {
  id: 'react-tooltip',
  title: 'Components/Overlay and disclosure/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  args: { content: 'Informações do projeto', showArrow: true, side: 'top' },
  argTypes: {
    content: storyArg({ control: 'text', defaultValue: 'Informações do projeto', description: 'Label breve e complementar.' }),
    showArrow: storyArg({ control: 'boolean', defaultValue: true, description: 'Exibe a seta de ancoragem.' }),
    side: storyArg({ control: 'radio', defaultValue: 'top', options: ['top', 'right', 'bottom', 'left'], description: 'Lado preferencial.' }),
  },
};

export const Playground = {
  render: (args) => <StoryCanvas><TooltipProvider><TooltipExample {...args} /></TooltipProvider></StoryCanvas>,
};

export const Placements = {
  render: () => (
    <StoryCanvas>
      <TooltipProvider>
        <StoryRow>
          {['top', 'right', 'bottom', 'left'].map((side) => (
            <TooltipExample key={side} content={`Tooltip ${side}`} side={side} />
          ))}
        </StoryRow>
      </TooltipProvider>
    </StoryCanvas>
  ),
};

export const WithoutArrow = {
  render: () => (
    <StoryCanvas>
      <TooltipProvider>
        <TooltipExample content="Tooltip sem seta" showArrow={false} />
      </TooltipProvider>
    </StoryCanvas>
  ),
};
