import { componentDescription, labeledSample, storyDescription } from './helpers.js';

function dividerMarkup({ orientation }) {
  return orientation === 'vertical'
    ? '<div class="sb-story-row"><span>Anterior</span><hr class="ds-divider ds-divider--vertical sb-story-divider-vertical"><span>Próximo</span></div>'
    : '<div class="sb-story-stack"><span>Conteúdo acima</span><hr class="ds-divider"><span>Conteúdo abaixo</span></div>';
}

export default {
  title: 'Components/Divider', tags: ['autodocs'],
  args: { orientation: 'horizontal' },
  argTypes: { orientation: { control: 'radio', options: ['horizontal', 'vertical'], description: 'Orientação visual do separador.' } },
  parameters: { docs: { description: { component: componentDescription('divider', 'Separador visual entre grupos de conteúdo relacionados, sem significado interativo.') } } },
  render: dividerMarkup,
};

export const Playground = {};
export const Contextos = {
  render: () => `<div class="sb-story-grid">${labeledSample('Lista', dividerMarkup({ orientation: 'horizontal' }))}${labeledSample('Toolbar', dividerMarkup({ orientation: 'vertical' }))}</div>`,
  parameters: storyDescription('Use hr para separação temática horizontal; a versão vertical permanece decorativa no contexto visual.'),
};
