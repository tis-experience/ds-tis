import {
  Select,
  SelectContent,
  SelectControl,
  SelectHiddenSelect,
  SelectIndicator,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectLeadingIcon,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
  createListCollection,
} from '../ark/select.jsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Brasil', value: 'br' },
  { label: 'Chile', value: 'cl' },
  { disabled: true, label: 'Indisponível', value: 'disabled' },
  { label: 'Portugal', value: 'pt' },
];

const countryCollection = createListCollection({
  items: countries,
  isItemDisabled: (item) => Boolean(item.disabled),
  itemToString: (item) => item.label,
  itemToValue: (item) => item.value,
});

function SelectExample({ disabled = false, filled = false, invalid = false, readOnly = false, size = 'md' }) {
  const suffix = `${size}-${disabled ? 'disabled' : invalid ? 'invalid' : readOnly ? 'readonly' : filled ? 'filled' : 'default'}`;
  const messageId = `ark-select-${suffix}-message`;

  return (
    <Select
      collection={countryCollection}
      defaultValue={filled ? ['br'] : []}
      disabled={disabled}
      invalid={invalid}
      name={`country-${suffix}`}
      readOnly={readOnly}
    >
      <SelectLabel>
        País<span className="ds-field__required" aria-hidden="true">*</span>
      </SelectLabel>
      <SelectControl>
        <SelectTrigger aria-describedby={messageId} size={size}>
          <SelectLeadingIcon />
          <SelectValue placeholder="Selecione um país" />
          <SelectIndicator />
        </SelectTrigger>
      </SelectControl>
      <SelectPortal>
        <SelectPositioner>
          <SelectContent>
            {countryCollection.items.map((item) => (
              <SelectItem item={item} key={item.value}>
                <SelectItemIndicator />
                <SelectItemText>{item.label}</SelectItemText>
              </SelectItem>
            ))}
          </SelectContent>
        </SelectPositioner>
      </SelectPortal>
      <SelectHiddenSelect />
      <span className={invalid ? 'ds-field__error' : 'ds-field__helper'} id={messageId}>
        {invalid ? 'Selecione um país.' : 'Escolha uma opção da lista.'}
      </span>
    </Select>
  );
}

export default {
  id: 'ark-select',
  title: 'Outputs/Ark + Zag/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter Select independente. Ark UI fornece a anatomia React, Zag mantém valor, typeahead, foco e teclado, e o DS TIS preserva visual e tokens.',
      },
    },
  },
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
