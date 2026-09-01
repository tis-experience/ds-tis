import {
  Select,
  SelectContent,
  SelectField,
  SelectIndicator,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectLeadingIcon,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from '../../../../registry/tis/select.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Brasil', value: 'br' },
  { label: 'Chile', value: 'cl' },
  { disabled: true, label: 'Indisponível', value: 'disabled' },
  { label: 'Portugal', value: 'pt' },
];

function SelectExample({ disabled = false, filled = false, invalid = false, readOnly = false, size = 'md' }) {
  const suffix = `${size}-${disabled ? 'disabled' : invalid ? 'invalid' : readOnly ? 'readonly' : filled ? 'filled' : 'default'}`;
  const messageId = `react-select-${suffix}-message`;

  return (
    <Select
      defaultValue={filled ? countries[1] : null}
      disabled={disabled}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => item.value}
      items={countries}
      name={`country-${suffix}`}
      readOnly={readOnly}
    >
      <SelectField invalid={invalid}>
        <SelectLabel>
          País<span className="ds-field__required" aria-hidden="true">*</span>
        </SelectLabel>
        <SelectTrigger aria-describedby={messageId} invalid={invalid} size={size}>
          <SelectLeadingIcon />
          <SelectValue placeholder="Selecione um país" />
          <SelectIndicator />
        </SelectTrigger>
        <SelectPortal>
          <SelectPositioner>
            <SelectContent>
              <SelectList>
                {countries.map((item) => (
                  <SelectItem disabled={item.disabled} key={item.value} value={item}>
                    <SelectItemIndicator />
                    <SelectItemText>{item.label}</SelectItemText>
                  </SelectItem>
                ))}
              </SelectList>
            </SelectContent>
          </SelectPositioner>
        </SelectPortal>
        <span className={invalid ? 'ds-field__error' : 'ds-field__helper'} id={messageId}>
          {invalid ? 'Selecione um país.' : 'Escolha uma opção da lista.'}
        </span>
      </SelectField>
    </Select>
  );
}

export default {
  id: 'react-select',
  title: 'Components/Input and selection/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Seleciona um valor com comportamento Base UI e visual do Select TIS.' } } },
  args: { disabled: false, filled: false, invalid: false, readOnly: false, size: 'md' },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Altura e densidade do trigger.', options: ['sm', 'md', 'lg'] }),
    filled: storyArg({ control: 'boolean', defaultValue: false, description: 'Inicia com Brasil selecionado.' }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede interação.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Aplica estado e mensagem de erro.' }),
    readOnly: storyArg({ control: 'boolean', defaultValue: false, description: 'Preserva o valor sem permitir alteração.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><SelectExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <SelectExample filled key={size} size={size} />)}</StoryStack></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack><SelectExample filled /><SelectExample invalid /><SelectExample disabled /><SelectExample filled readOnly /></StoryStack></StoryCanvas> };
