import * as React from 'react';
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, XIcon } from 'lucide-react';

import { Alert, AlertActions, AlertClose, AlertContent, AlertDescription, AlertIcon, AlertTitle } from '../../../../registry/tis/alert.tsx';
import { Button } from '../../../../registry/tis/button.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

const toneIcons = { info: InfoIcon, success: CircleCheckIcon, warning: TriangleAlertIcon, error: TriangleAlertIcon };

function AlertExample({ description, dismissible = false, title, tone, variant }) {
  const [visible, setVisible] = React.useState(true);
  const Icon = toneIcons[tone] || InfoIcon;
  if (!visible) return <p role="status" data-slot="alert-result">Alerta dispensado.</p>;
  return (
    <Alert role={tone === 'error' ? 'alert' : 'status'} tone={tone} variant={variant}>
      <AlertIcon><Icon /></AlertIcon>
      <AlertContent><AlertTitle>{title}</AlertTitle><AlertDescription>{description}</AlertDescription></AlertContent>
      {dismissible ? <AlertClose aria-label="Dispensar alerta" onClick={() => setVisible(false)}><XIcon /></AlertClose> : null}
    </Alert>
  );
}

export default {
  id: 'react-alert',
  title: 'Components/Feedback and status/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Comunica informação, confirmação, atenção ou erro dentro do fluxo atual.' } } },
  args: { title: 'Configuração salva', description: 'As preferências já estão disponíveis.', tone: 'success', variant: 'subtle', dismissible: true },
  argTypes: {
    title: storyArg({ control: 'text', defaultValue: 'Configuração salva', description: 'Título curto da mensagem.' }),
    description: storyArg({ control: 'text', defaultValue: 'As preferências já estão disponíveis.', description: 'Detalhe que explica a mensagem ou próximo passo.' }),
    tone: storyArg({ control: 'select', defaultValue: 'success', description: 'Intenção semântica do alerta.', options: ['info', 'success', 'warning', 'error'] }),
    variant: storyArg({ control: 'select', defaultValue: 'subtle', description: 'Ênfase visual do alerta.', options: ['subtle', 'solid'] }),
    dismissible: storyArg({ control: 'boolean', defaultValue: true, description: 'Exibe uma ação para dispensar a mensagem.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><AlertExample {...args} /></StoryCanvas> };
export const Tones = { render: () => <StoryCanvas><StoryStack>{['info', 'success', 'warning', 'error'].map((tone) => <AlertExample key={tone} tone={tone} variant="subtle" title={tone} description={`Mensagem de ${tone}.`} />)}</StoryStack></StoryCanvas> };
export const WithAction = { name: 'With action', render: () => <StoryCanvas><Alert tone="info" variant="solid"><AlertIcon><InfoIcon /></AlertIcon><AlertContent><AlertTitle>Nova versão disponível</AlertTitle><AlertDescription>Atualize quando concluir a tarefa atual.</AlertDescription><AlertActions><Button size="sm" variant="ghost">Ver detalhes</Button></AlertActions></AlertContent></Alert></StoryCanvas> };
