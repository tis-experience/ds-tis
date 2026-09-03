import { Button } from '../../../../registry/tis/button.tsx';
import { Dialog, DialogBody, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../../registry/tis/dialog.tsx';
import { Field, FieldDescription, FieldLabel } from '../../../../registry/tis/field.tsx';
import { Input } from '../../../../registry/tis/input.tsx';
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

function ModalExample({ customBody = false, description, primaryLabel = 'Aplicar alterações', size, title, triggerLabel = 'Abrir modal' }) {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline" />}>{triggerLabel}</DialogTrigger>
      <DialogContent closeLabel="Fechar modal" size={size}>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
        <DialogBody>
          {customBody ? (
            <Field>
              <FieldLabel htmlFor="react-modal-email">E-mail</FieldLabel>
              <Input autoFocus id="react-modal-email" type="email" placeholder="nome@empresa.com" />
              <FieldDescription>Enviaremos um convite para este endereço.</FieldDescription>
            </Field>
          ) : <p>Revise as informações antes de continuar.</p>}
        </DialogBody>
        <DialogFooter><DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose><DialogClose render={<Button />}>{primaryLabel}</DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default {
  id: 'react-modal',
  title: 'Components/Overlay and disclosure/Modal',
  component: Dialog,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Concentra uma decisão curta, preservando foco, Escape, retorno de foco e semântica de dialog.' } } },
  args: { title: 'Revisar alterações', description: 'Confirme antes de continuar.', size: 'md' },
  argTypes: {
    title: storyArg({ control: 'text', defaultValue: 'Revisar alterações', description: 'Título que identifica a decisão solicitada.' }),
    description: storyArg({ control: 'text', defaultValue: 'Confirme antes de continuar.', description: 'Contexto e consequência da decisão.' }),
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Largura máxima do diálogo.', options: ['sm', 'md', 'lg'] }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><ModalExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas><StoryRow>{['sm', 'md', 'lg'].map((size) => <ModalExample key={size} size={size} title={`Modal ${size}`} description="Exemplo de tamanho." triggerLabel={`Abrir modal ${size}`} />)}</StoryRow></StoryCanvas> };
export const WithDescription = { render: () => <StoryCanvas><ModalExample size="md" title="Revisar alterações" description="Confira os dados antes de aplicar esta atualização reversível." /></StoryCanvas> };
export const CustomBody = { render: () => <StoryCanvas><ModalExample customBody size="md" title="Convidar pessoa" description="Informe os dados necessários para enviar o convite." primaryLabel="Enviar convite" triggerLabel="Convidar pessoa" /></StoryCanvas> };
