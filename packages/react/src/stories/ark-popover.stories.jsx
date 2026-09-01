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
} from '../ark/popover.jsx';
import { StoryCanvas } from './_shared.jsx';

export default {
  id: 'ark-popover',
  title: 'Outputs/Ark + Zag/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Adapter React da saída Ark/Zag. Ark UI fornece as parts e Zag fornece o comportamento, sem importar Base UI ou o registry shadcn.' } } },
};

export const Playground = {
  render: () => (
    <StoryCanvas>
      <div className="ds-story-overlay-stage ds-story-popover-stage">
        <Popover placement="bottom">
          <PopoverTrigger asChild><Button size="sm" variant="outline">Abrir popover</Button></PopoverTrigger>
          <PopoverContent>
            <PopoverHeader><PopoverTitle>Detalhes da ação</PopoverTitle></PopoverHeader>
            <PopoverClose label="Fechar popover" />
            <PopoverDescription>Conteúdo breve associado ao trigger.</PopoverDescription>
            <PopoverActions>
              <PopoverClose asChild><Button size="sm" variant="toned">Cancelar</Button></PopoverClose>
              <PopoverClose asChild><Button size="sm">Confirmar</Button></PopoverClose>
            </PopoverActions>
          </PopoverContent>
        </Popover>
      </div>
    </StoryCanvas>
  ),
};

export const ContentSlot = {
  render: () => (
    <StoryCanvas>
      <div className="ds-story-overlay-stage ds-story-popover-stage">
        <Popover placement="bottom">
          <PopoverTrigger asChild><Button size="sm" variant="outline">Renomear</Button></PopoverTrigger>
          <PopoverContent>
            <PopoverHeader><PopoverTitle>Renomear item</PopoverTitle></PopoverHeader>
            <PopoverClose label="Fechar popover" />
            <PopoverBody>
              <p>Informe um nome curto e descritivo.</p>
              <div className="ds-popover__content">
                <div className="ds-field">
                  <label className="ds-field__label" htmlFor="ark-popover-name">Nome</label>
                  <div className="ds-input ds-input--md">
                    <input className="ds-input__field" id="ark-popover-name" type="text" defaultValue="Relatório mensal" />
                  </div>
                </div>
              </div>
            </PopoverBody>
            <PopoverActions>
              <PopoverClose asChild><Button size="sm" variant="toned">Cancelar</Button></PopoverClose>
              <PopoverClose asChild><Button size="sm">Salvar</Button></PopoverClose>
            </PopoverActions>
          </PopoverContent>
        </Popover>
      </div>
    </StoryCanvas>
  ),
};

export const Placements = {
  render: () => (
    <StoryCanvas>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {['top', 'right', 'bottom', 'left'].map((placement) => (
          <Popover key={placement} placement={placement}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">{placement}</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader><PopoverTitle>Placement {placement}</PopoverTitle></PopoverHeader>
              <PopoverClose label="Fechar popover" />
              <PopoverDescription>Posicionamento controlado pelo Root Ark/Zag.</PopoverDescription>
            </PopoverContent>
          </Popover>
        ))}
      </div>
    </StoryCanvas>
  ),
};
