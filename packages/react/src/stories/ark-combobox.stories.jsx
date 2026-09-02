import {
  Combobox,
  ComboboxAnchor,
  ComboboxChevron,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxLeadingIcon,
  ComboboxPositioner,
  useListCollection,
} from '../ark/combobox.jsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Brasil', value: 'br' },
  { label: 'Chile', value: 'cl' },
  { disabled: true, label: 'Indisponível', value: 'disabled' },
  { label: 'Portugal', value: 'pt' },
];

function ComboboxExample({ disabled = false, invalid = false, readOnly = false, size = 'md' }) {
  const { collection, filter } = useListCollection({
    initialItems: countries,
    isItemDisabled: (item) => Boolean(item.disabled),
    itemToString: (item) => item.label,
    itemToValue: (item) => item.value,
    filter: (label, query) => label.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')),
  });

  return (
    <Combobox
      collection={collection}
      disabled={disabled}
      invalid={invalid}
      onInputValueChange={({ inputValue }) => filter(inputValue)}
      readOnly={readOnly}
    >
      <ComboboxLabel>
        País<span className="ds-field__required" aria-hidden="true">*</span>
      </ComboboxLabel>
      <ComboboxAnchor>
        <ComboboxControl disabled={disabled} invalid={invalid} readOnly={readOnly} size={size}>
          <ComboboxLeadingIcon />
          <ComboboxInput aria-describedby={invalid ? 'ark-combobox-error' : 'ark-combobox-helper'} placeholder="Busque um país" />
          <ComboboxClear />
          <ComboboxChevron />
        </ComboboxControl>
        <ComboboxPositioner>
          <ComboboxContent>
            {collection.items.map((item) => (
              <ComboboxItem item={item} key={item.value}>
                <ComboboxItemText>{item.label}</ComboboxItemText>
              </ComboboxItem>
            ))}
          </ComboboxContent>
        </ComboboxPositioner>
      </ComboboxAnchor>
      {invalid
        ? <span className="ds-field__error" id="ark-combobox-error">Selecione um país válido.</span>
        : <span className="ds-field__helper" id="ark-combobox-helper">Digite para filtrar as opções.</span>}
    </Combobox>
  );
}

export default {
  id: 'ark-combobox',
  title: 'Outputs/Ark + Zag/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter React independente da saída Ark/Zag. Ark UI fornece as parts, Zag mantém filtro, seleção, foco e teclado, e o DS TIS preserva anatomia e tokens.',
      },
    },
  },
  args: { disabled: false, invalid: false, readOnly: false, size: 'md' },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Altura e densidade do controle.', options: ['sm', 'md', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede interação.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Aplica estado de erro.' }),
    readOnly: storyArg({ control: 'boolean', defaultValue: false, description: 'Preserva o valor sem edição.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><ComboboxExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <ComboboxExample key={size} size={size} />)}</StoryStack></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack><ComboboxExample invalid /><ComboboxExample disabled /><ComboboxExample readOnly /></StoryStack></StoryCanvas> };
