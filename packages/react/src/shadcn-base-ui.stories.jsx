import { SettingsIcon } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTitle,
  AccordionTrigger,
} from '../../../registry/tis/accordion.tsx';
import { Button } from '../../../registry/tis/button.tsx';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../registry/tis/dialog.tsx';

export default {
  id: 'vnext-shadcn-base-ui-pilot',
  title: 'vNext/shadcn + Base UI pilot',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Integração React beta distribuída como código pelo registry shadcn. Base UI fornece comportamento; classes e tokens públicos do DS TIS preservam o contrato visual.',
      },
    },
  },
};

export const AccordionBaseUi = {
  name: 'Accordion · Base UI',
  render: () => (
    <div className="vnext-provider">
      <Accordion defaultValue={['billing']}>
        <AccordionItem value="billing">
          <AccordionTrigger>
            <SettingsIcon
              aria-hidden="true"
              className="ds-accordion__leading-icon ds-icon"
              data-icon="inline-start"
            />
            <AccordionTitle>Faturamento</AccordionTitle>
          </AccordionTrigger>
          <AccordionContent>
            <p>Gerencie forma de pagamento e dados fiscais.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="security">
          <AccordionTrigger>Segurança</AccordionTrigger>
          <AccordionContent>
            <p>Configure autenticação e sessões ativas.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem disabled value="disabled">
          <AccordionTrigger>Configuração bloqueada</AccordionTrigger>
          <AccordionContent>
            <p>Este conteúdo não está disponível.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};

export const DialogBaseUi = {
  name: 'Dialog · Base UI',
  render: () => (
    <div className="vnext-provider">
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Abrir modal
        </DialogTrigger>
        <DialogContent closeLabel="Fechar modal" size="sm">
          <DialogHeader>
            <DialogTitle>Excluir projeto</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>
              O projeto e seus dados associados serão removidos permanentemente.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button variant="destructive">Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  ),
};
