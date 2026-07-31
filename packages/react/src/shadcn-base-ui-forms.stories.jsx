import * as React from 'react';
import { MailIcon } from 'lucide-react';

import { Button } from '../../../registry/tis/button.tsx';
import {
  Checkbox,
  CheckboxContent,
  CheckboxDescription,
  CheckboxLabel,
  CheckboxTitle,
} from '../../../registry/tis/checkbox.tsx';
import {
  Field,
  FieldCounter,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLabelRow,
  FieldRequired,
} from '../../../registry/tis/field.tsx';
import { Input } from '../../../registry/tis/input.tsx';
import {
  RadioGroup,
  RadioGroupContent,
  RadioGroupDescription,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupLegend,
  RadioGroupOption,
} from '../../../registry/tis/radio-group.tsx';
import {
  Switch,
  SwitchContent,
  SwitchDescription,
  SwitchLabel,
  SwitchTitle,
} from '../../../registry/tis/switch.tsx';
import { Textarea } from '../../../registry/tis/textarea.tsx';

export default {
  id: 'vnext-shadcn-base-ui-forms',
  title: 'vNext/shadcn + Base UI forms',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Onda 1 do registry beta: Form Field, Input, Textarea, Checkbox, Radio Group e Switch usando o contrato visual público do DS TIS.',
      },
    },
  },
};

function FieldsExample() {
  return (
    <div className="vnext-provider">
      <FieldGroup>
        <Field>
          <FieldLabelRow>
            <FieldLabel htmlFor="tis-email">E-mail</FieldLabel>
            <FieldRequired />
          </FieldLabelRow>
          <Input
            id="tis-email"
            name="email"
            type="email"
            placeholder="nome@empresa.com"
            leadingIcon={<MailIcon />}
            aria-describedby="tis-email-helper"
            required
          />
          <FieldDescription id="tis-email-helper">
            Use seu e-mail corporativo.
          </FieldDescription>
        </Field>

        <Field invalid>
          <FieldLabelRow>
            <FieldLabel htmlFor="tis-code">Código</FieldLabel>
          </FieldLabelRow>
          <Input
            id="tis-code"
            defaultValue="inválido"
            aria-describedby="tis-code-error"
            aria-invalid="true"
          />
          <FieldError id="tis-code-error">Revise o código informado.</FieldError>
        </Field>

        <Field>
          <FieldLabelRow>
            <FieldLabel htmlFor="tis-message">Mensagem</FieldLabel>
          </FieldLabelRow>
          <Textarea
            id="tis-message"
            name="message"
            placeholder="Descreva sua solicitação…"
            aria-describedby="tis-message-helper tis-message-counter"
          />
          <FieldDescription id="tis-message-helper">
            Máximo de 500 caracteres.
          </FieldDescription>
          <FieldCounter id="tis-message-counter">0/500</FieldCounter>
        </Field>
      </FieldGroup>
    </div>
  );
}

function SelectionControlsExample() {
  return (
    <div className="vnext-provider">
      <FieldGroup>
        <CheckboxLabel>
          <Checkbox id="tis-news" name="news" defaultChecked />
          <CheckboxContent>
            <CheckboxTitle>Receber novidades</CheckboxTitle>
            <CheckboxDescription>
              Enviaremos apenas atualizações relevantes.
            </CheckboxDescription>
          </CheckboxContent>
        </CheckboxLabel>

        <RadioGroup name="contact" defaultValue="email">
          <RadioGroupLegend>Preferência de contato</RadioGroupLegend>
          <RadioGroupOption>
            <RadioGroupItem id="tis-contact-email" value="email" />
            <RadioGroupContent>
              <RadioGroupLabel>E-mail</RadioGroupLabel>
              <RadioGroupDescription>Resposta em até um dia útil.</RadioGroupDescription>
            </RadioGroupContent>
          </RadioGroupOption>
          <RadioGroupOption>
            <RadioGroupItem id="tis-contact-sms" value="sms" />
            <RadioGroupContent>
              <RadioGroupLabel>SMS</RadioGroupLabel>
            </RadioGroupContent>
          </RadioGroupOption>
        </RadioGroup>

        <SwitchLabel>
          <Switch id="tis-alerts" name="alerts" defaultChecked />
          <SwitchContent>
            <SwitchTitle>Alertas de segurança</SwitchTitle>
            <SwitchDescription>
              Ativa notificações sobre acessos suspeitos.
            </SwitchDescription>
          </SwitchContent>
        </SwitchLabel>
      </FieldGroup>
    </div>
  );
}

function StatesExample() {
  return (
    <div className="vnext-provider">
      <FieldGroup>
        <Input aria-label="Input pequeno" size="sm" placeholder="Small" />
        <Input aria-label="Input médio preenchido" size="md" defaultValue="Medium" filled />
        <Input aria-label="Input grande desabilitado" size="lg" defaultValue="Large" disabled />
        <Textarea aria-label="Textarea somente leitura" defaultValue="Conteúdo somente leitura" readOnly />
        <CheckboxLabel>
          <Checkbox indeterminate />
          <CheckboxContent>
            <CheckboxTitle>Seleção parcial</CheckboxTitle>
          </CheckboxContent>
        </CheckboxLabel>
        <CheckboxLabel>
          <Checkbox defaultChecked disabled />
          <CheckboxContent>
            <CheckboxTitle>Selecionado indisponível</CheckboxTitle>
          </CheckboxContent>
        </CheckboxLabel>
        <SwitchLabel>
          <Switch size="sm" />
          <SwitchContent><SwitchTitle>Small</SwitchTitle></SwitchContent>
        </SwitchLabel>
        <SwitchLabel>
          <Switch size="lg" defaultChecked disabled />
          <SwitchContent><SwitchTitle>Large indisponível</SwitchTitle></SwitchContent>
        </SwitchLabel>
      </FieldGroup>
    </div>
  );
}

function FormSubmissionExample() {
  const [result, setResult] = React.useState('Ainda não enviado.');

  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setResult(JSON.stringify(values));
  }

  return (
    <div className="vnext-provider">
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabelRow>
              <FieldLabel htmlFor="tis-form-name">Nome</FieldLabel>
            </FieldLabelRow>
            <Input id="tis-form-name" name="name" defaultValue="Ana" />
          </Field>
          <CheckboxLabel>
            <Checkbox id="tis-form-terms" name="terms" value="accepted" defaultChecked />
            <CheckboxContent><CheckboxTitle>Aceitar termos</CheckboxTitle></CheckboxContent>
          </CheckboxLabel>
          <RadioGroup name="channel" defaultValue="email">
            <RadioGroupLegend>Canal</RadioGroupLegend>
            <RadioGroupOption>
              <RadioGroupItem id="tis-form-email" value="email" />
              <RadioGroupContent><RadioGroupLabel>E-mail</RadioGroupLabel></RadioGroupContent>
            </RadioGroupOption>
            <RadioGroupOption>
              <RadioGroupItem id="tis-form-sms" value="sms" />
              <RadioGroupContent><RadioGroupLabel>SMS</RadioGroupLabel></RadioGroupContent>
            </RadioGroupOption>
          </RadioGroup>
          <SwitchLabel>
            <Switch id="tis-form-alerts" name="alerts" value="enabled" defaultChecked />
            <SwitchContent><SwitchTitle>Ativar alertas</SwitchTitle></SwitchContent>
          </SwitchLabel>
          <Button type="submit">Enviar</Button>
          <output aria-live="polite" data-slot="form-result">{result}</output>
        </FieldGroup>
      </form>
    </div>
  );
}

export const Fields = {
  name: 'Fields · Input + Textarea',
  render: () => <FieldsExample />,
};

export const SelectionControls = {
  name: 'Selection · Checkbox + Radio + Switch',
  render: () => <SelectionControlsExample />,
};

export const States = {
  name: 'Sizes and states',
  render: () => <StatesExample />,
};

export const FormSubmission = {
  name: 'Native form submission',
  render: () => <FormSubmissionExample />,
};
