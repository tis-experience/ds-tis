import { RadioGroup, RadioGroupContent, RadioGroupDescription, RadioGroupError, RadioGroupItem, RadioGroupLabel, RadioGroupLegend, RadioGroupOption } from '../../../../registry/tis/radio-group.tsx';
import { StoryCanvas, StoryStack, storyArg } from './_shared.jsx';

function RadioExample({ disabled, invalid, size }) {
  return (
    <RadioGroup defaultValue="email" invalid={invalid} name={`contact-${size}-${invalid ? 'invalid' : 'valid'}`}>
      <RadioGroupLegend>Preferência de contato</RadioGroupLegend>
      <RadioGroupOption><RadioGroupItem value="email" size={size} /><RadioGroupContent><RadioGroupLabel>E-mail</RadioGroupLabel><RadioGroupDescription>Resposta em até um dia útil.</RadioGroupDescription></RadioGroupContent></RadioGroupOption>
      <RadioGroupOption><RadioGroupItem value="sms" size={size} disabled={disabled} /><RadioGroupContent><RadioGroupLabel>SMS</RadioGroupLabel></RadioGroupContent></RadioGroupOption>
      {invalid ? <RadioGroupError>Escolha uma opção válida.</RadioGroupError> : null}
    </RadioGroup>
  );
}

export default {
  id: 'react-radio',
  title: 'Components/Input and selection/Radio',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Permite escolher uma única opção entre alternativas visíveis e relacionadas.' } } },
  args: { size: 'md', disabled: false, invalid: false },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Tamanho dos controles do grupo.', options: ['sm', 'md', 'lg'] }),
    disabled: storyArg({ control: 'boolean', defaultValue: false, description: 'Desabilita a segunda opção do exemplo.', name: 'Disable second option' }),
    invalid: storyArg({ control: 'boolean', defaultValue: false, description: 'Exibe estado e mensagem de erro do grupo.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas narrow><RadioExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas narrow><StoryStack>{['sm', 'md', 'lg'].map((size) => <RadioExample key={size} size={size} />)}</StoryStack></StoryCanvas> };
export const Invalid = { render: () => <StoryCanvas narrow><RadioExample invalid /></StoryCanvas> };
