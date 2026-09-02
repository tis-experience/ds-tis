import { Button } from '../../../../registry/tis/button.tsx';
import {
  Popover,
  PopoverActions,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '../../../../registry/tis/popover.tsx';
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

function PopoverExample({ align, description, showArrow, side, title }) {
  return (
    <Popover>
      <PopoverTrigger render={<Button size="sm" variant="outline" />}>Abrir popover</PopoverTrigger>
      <PopoverContent align={align} showArrow={showArrow} side={side}>
        <PopoverHeader><PopoverTitle>{title}</PopoverTitle></PopoverHeader>
        <PopoverClose label="Fechar popover" />
        <PopoverDescription>{description}</PopoverDescription>
        <PopoverActions>
          <PopoverClose render={<Button size="sm" variant="toned" />}>Cancelar</PopoverClose>
          <PopoverClose render={<Button size="sm" />}>Confirmar</PopoverClose>
        </PopoverActions>
      </PopoverContent>
    </Popover>
  );
}

export default {
  id: 'react-popover',
  title: 'Components/Overlay and disclosure/Popover',
  component: Popover,
  tags: ['autodocs'],
  args: { align: 'center', description: 'Conteúdo breve associado ao trigger.', showArrow: true, side: 'bottom', title: 'Detalhes da ação' },
  argTypes: {
    align: storyArg({ control: 'radio', defaultValue: 'center', options: ['start', 'center', 'end'], description: 'Alinhamento em relação ao trigger.' }),
    description: storyArg({ control: 'text', defaultValue: 'Conteúdo breve associado ao trigger.', description: 'Descrição acessível.' }),
    showArrow: storyArg({ control: 'boolean', defaultValue: true, description: 'Exibe a seta de ancoragem.' }),
    side: storyArg({ control: 'radio', defaultValue: 'bottom', options: ['bottom', 'top', 'left', 'right'], description: 'Lado preferencial.' }),
    title: storyArg({ control: 'text', defaultValue: 'Detalhes da ação', description: 'Título acessível.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><div className="ds-story-overlay-stage ds-story-popover-stage"><PopoverExample {...args} /></div></StoryCanvas> };
export const ContentSlot = {
  render: () => (
    <StoryCanvas>
      <div className="ds-story-overlay-stage ds-story-popover-stage">
        <Popover>
          <PopoverTrigger render={<Button size="sm" variant="outline" />}>Renomear</PopoverTrigger>
          <PopoverContent align="center" showArrow side="bottom">
            <PopoverHeader><PopoverTitle>Renomear item</PopoverTitle></PopoverHeader>
            <PopoverClose label="Fechar popover" />
            <PopoverBody>
              <p>Informe um nome curto e descritivo.</p>
              <div className="ds-popover__content">
                <div className="ds-field">
                  <label className="ds-field__label" htmlFor="react-popover-name">Nome</label>
                  <div className="ds-input ds-input--md">
                    <input className="ds-input__field" id="react-popover-name" type="text" defaultValue="Relatório mensal" />
                  </div>
                </div>
              </div>
            </PopoverBody>
            <PopoverActions>
              <PopoverClose render={<Button size="sm" variant="toned" />}>Cancelar</PopoverClose>
              <PopoverClose render={<Button size="sm" />}>Salvar</PopoverClose>
            </PopoverActions>
          </PopoverContent>
        </Popover>
      </div>
    </StoryCanvas>
  ),
};
export const Placements = { render: () => <StoryCanvas><StoryRow>{['bottom', 'top', 'left', 'right'].map((side) => <PopoverExample key={side} side={side} align="center" description={`Posicionamento ${side}.`} showArrow title={side} />)}</StoryRow></StoryCanvas> };
export const WithoutArrow = { render: () => <StoryCanvas><PopoverExample align="start" description="A seta pode ser omitida quando a relação espacial permanece clara." showArrow={false} side="bottom" title="Sem seta" /></StoryCanvas> };
