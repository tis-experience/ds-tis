import { Copy, Settings, Trash2 } from 'lucide';
import { createElement, useState } from 'react';

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIndicator,
  MenuItemText,
  MenuPortal,
  MenuPositioner,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
  MenuTriggerIndicator,
} from '../ark/menu.jsx';
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

function Icon({ icon }) {
  return (
    <svg aria-hidden="true" className="ds-menu__icon ds-icon" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      {icon.map(([tag, attributes], index) => createElement(tag, { ...attributes, key: index }))}
    </svg>
  );
}

function MenuExample({ disabledItem = true, size = 'md' }) {
  const [pinned, setPinned] = useState(false);
  const [density, setDensity] = useState('comfortable');

  return (
    <Menu positioning={{ gutter: 8, placement: 'bottom-start' }}>
      <MenuTrigger size={size}>
        <span className="ds-button__label">Ações do projeto</span>
        <MenuTriggerIndicator />
      </MenuTrigger>
      <MenuPortal>
        <MenuPositioner>
          <MenuContent aria-label="Ações do projeto" size={size}>
            <MenuGroup id="project-actions">
              <MenuGroupLabel>Ações</MenuGroupLabel>
              <MenuItem value="edit">
                <Icon icon={Settings} />
                <MenuItemText>Editar detalhes</MenuItemText>
                <MenuShortcut>⌘E</MenuShortcut>
              </MenuItem>
              <MenuItem value="duplicate">
                <Icon icon={Copy} />
                <MenuItemText>Duplicar projeto</MenuItemText>
              </MenuItem>
              <MenuItem disabled={disabledItem} value="admin">
                <Icon icon={Settings} />
                <MenuItemText>Configuração administrativa</MenuItemText>
              </MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuCheckboxItem checked={pinned} closeOnSelect={false} onCheckedChange={setPinned} value="pinned">
              <MenuItemIndicator />
              <MenuItemText>Fixar projeto</MenuItemText>
            </MenuCheckboxItem>
            <MenuRadioGroup id="density" onValueChange={(details) => setDensity(details.value)} value={density}>
              <MenuGroupLabel>Densidade</MenuGroupLabel>
              <MenuRadioItem closeOnSelect={false} value="comfortable">
                <MenuItemIndicator />
                <MenuItemText>Confortável</MenuItemText>
              </MenuRadioItem>
              <MenuRadioItem closeOnSelect={false} value="compact">
                <MenuItemIndicator />
                <MenuItemText>Compacta</MenuItemText>
              </MenuRadioItem>
            </MenuRadioGroup>
            <MenuSeparator />
            <MenuItem destructive value="delete">
              <Icon icon={Trash2} />
              <MenuItemText>Excluir projeto</MenuItemText>
            </MenuItem>
          </MenuContent>
        </MenuPositioner>
      </MenuPortal>
    </Menu>
  );
}

export default {
  id: 'ark-menu',
  title: 'Outputs/Ark + Zag/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Adapter Menu independente. Ark UI fornece as parts, Zag mantém abertura, foco, typeahead e teclado, e o DS TIS preserva visual e tokens.',
      },
    },
  },
  args: { disabledItem: true, size: 'md' },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Densidade dos itens.', options: ['sm', 'md', 'lg'] }),
    disabledItem: storyArg({ control: 'boolean', defaultValue: true, description: 'Mantém uma ação administrativa desabilitada.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><MenuExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas><StoryRow>{['sm', 'md', 'lg'].map((size) => <MenuExample disabledItem={false} key={size} size={size} />)}</StoryRow></StoryCanvas> };
export const States = { render: () => <StoryCanvas><MenuExample disabledItem /></StoryCanvas> };
