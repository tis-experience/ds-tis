import { useRef, useState } from 'react';
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import { Alert, AlertActions, AlertClose, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '../ark/alert.jsx';
import { Button } from '../ark/button.jsx';
import { StoryCanvas, StoryRow, StoryStack, storyArg } from './_shared.jsx';

const icons = { info: InfoIcon, success: CircleCheckIcon, warning: TriangleAlertIcon, error: TriangleAlertIcon };
function Message({ tone = 'info', variant = 'subtle', title = 'Atualização disponível', description = 'Consulte os detalhes antes de continuar.', onClose, children }) {
  const Icon = icons[tone];
  return <Alert tone={tone} variant={variant} role={tone === 'error' ? 'alert' : 'status'}>
    <AlertIcon><Icon /></AlertIcon>
    <AlertContent><AlertTitle>{title}</AlertTitle><AlertDescription>{description}</AlertDescription>{children}</AlertContent>
    {onClose && <AlertClose aria-label="Dispensar alerta" onClick={onClose}><XIcon /></AlertClose>}
  </Alert>;
}
function InteractiveMessage(props) {
  const [visible, setVisible] = useState(true);
  const [action, setAction] = useState(false);
  const restoreRef = useRef(null);
  return <StoryStack>
    <StoryRow><Button ref={restoreRef} onClick={() => setVisible(true)} variant="outline">Mostrar alerta</Button></StoryRow>
    {visible && <Message {...props} onClose={() => { setVisible(false); restoreRef.current?.focus(); }}>
      <AlertActions><Button size="sm" variant="ghost" onClick={() => setAction(true)}>Ver detalhes</Button></AlertActions>
    </Message>}
    <output data-slot="ark-alert-result" aria-live="polite">{action ? 'Detalhes solicitados.' : ''}</output>
  </StoryStack>;
}
export default {
  id: 'ark-alert', title: 'Outputs/Ark + Zag/Alert', component: Alert, tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Mensagem persistente no fluxo. Ark Factory preserva elementos nativos e tokens TIS; a aplicação controla fechamento e urgência da live region.' } } },
  args: { tone: 'success', variant: 'subtle', title: 'Configuração salva', description: 'As preferências já estão disponíveis.' },
  argTypes: {
    tone: storyArg({ control: 'select', defaultValue: 'success', description: 'Intenção visual.', options: ['info', 'success', 'warning', 'error'] }),
    variant: storyArg({ control: 'radio', defaultValue: 'subtle', description: 'Ênfase visual.', options: ['subtle', 'solid'] }),
    title: storyArg({ control: 'text', defaultValue: 'Configuração salva', description: 'Título da mensagem.' }),
    description: storyArg({ control: 'text', defaultValue: 'As preferências já estão disponíveis.', description: 'Detalhe e orientação.' }),
  },
};
export const Playground = { render: (args) => <StoryCanvas><InteractiveMessage {...args} /></StoryCanvas> };
export const Subtle = { render: () => <StoryCanvas><StoryStack>{Object.keys(icons).map((tone) => <Message key={tone} tone={tone} title={tone} />)}</StoryStack></StoryCanvas> };
export const Solid = { render: () => <StoryCanvas><StoryStack>{Object.keys(icons).map((tone) => <Message key={tone} tone={tone} variant="solid" title={tone} />)}</StoryStack></StoryCanvas> };
