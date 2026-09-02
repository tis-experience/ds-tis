import {
  Combobox,
  ComboboxAnchor,
  ComboboxChevron,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxField,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxLeadingIcon,
  ComboboxList,
  ComboboxPortal,
  ComboboxPositioner,
} from '../../../../registry/tis/combobox.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Brasil', value: 'br' },
  { label: 'Chile', value: 'cl' },
  { disabled: true, label: 'Indisponível', value: 'disabled' },
  { label: 'Portugal', value: 'pt' },
];

function ComboboxExample({ disabled = false, invalid = false, readOnly = false, size = 'md' }) {
  const inputId = `react-combobox-${size}-${disabled ? 'disabled' : invalid ? 'invalid' : readOnly ? 'readonly' : 'default'}`;
  const messageId = `${inputId}-message`;

  return (
    <Combobox
      disabled={disabled}
      itemToStringLabel={(item) => item.label}
      items={countries}
      readOnly={readOnly}
    >
      <ComboboxField disabled={disabled} invalid={invalid}>
        <ComboboxLabel htmlFor={inputId}>
          País<span className="ds-field__required" aria-hidden="true">*</span>
        </ComboboxLabel>
        <ComboboxAnchor>
          <ComboboxControl invalid={invalid} size={size}>
            <ComboboxLeadingIcon />
            <ComboboxInput
              aria-describedby={messageId}
              aria-invalid={invalid || undefined}
              id={inputId}
              placeholder="Busque um país"
            />
            <ComboboxClear />
            <ComboboxChevron />
          </ComboboxControl>
          <ComboboxPortal>
            <ComboboxPositioner>
              <ComboboxContent>
                <ComboboxList>
                  {(item, index) => (
                    <ComboboxItem disabled={item.disabled} index={index} key={item.value} value={item}>
                      {item.label}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </ComboboxPositioner>
          </ComboboxPortal>
        </ComboboxAnchor>
        <span className={invalid ? 'ds-field__error' : 'ds-field__helper'} id={messageId}>
          {invalid ? 'Selecione um país válido.' : 'Digite para filtrar as opções.'}
        </span>
      </ComboboxField>
    </Combobox>
  );
}

export default {
  id: 'react-combobox',
  title: 'Components/Input and selection/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Filtra e seleciona uma opção com comportamento Base UI e visual do Combobox TIS.' } } },
  args: { disabled: false, invalid: false, readOnly: false, size: 'md' },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Altura e densidade do controle.', options: ['sm', 'md', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Impede interação.' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Aplica estado e mensagem de erro.' }),
    readOnly: storyArg({ control: 'boolean', defaultValue: false, description: 'Preserva o valor sem edição.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><ComboboxExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <ComboboxExample key={size} size={size} />)}</StoryStack></StoryCanvas> };
export const States = { render: () => <StoryCanvas narrow><StoryStack><ComboboxExample invalid /><ComboboxExample disabled /><ComboboxExample readOnly /></StoryStack></StoryCanvas> };
