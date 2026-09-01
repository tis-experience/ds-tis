import { CopyIcon, SettingsIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import {
  Menu,
  MenuCheckboxIndicator,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemText,
  MenuPortal,
  MenuPositioner,
  MenuRadioGroup,
  MenuRadioIndicator,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
  MenuTriggerIndicator,
} from '../../../../registry/tis/menu.tsx';
import { StoryCanvas, StoryRow, storyArg } from './_shared.jsx';

function MenuExample({ disabledItem = true, size = 'md' }) {
  const [pinned, setPinned] = useState(false);
  const [density, setDensity] = useState('comfortable');

  return (
    <Menu>
      <MenuTrigger size={size}>
        <span className="ds-button__label">Ações do projeto</span>
        <MenuTriggerIndicator />
      </MenuTrigger>
      <MenuPortal>
        <MenuPositioner>
          <MenuContent aria-label="Ações do projeto" size={size}>
            <MenuGroup>
              <MenuGroupLabel>Ações</MenuGroupLabel>
              <MenuItem>
                <SettingsIcon aria-hidden="true" className="ds-menu__icon ds-icon" />
                <MenuItemText>Editar detalhes</MenuItemText>
                <MenuShortcut>⌘E</MenuShortcut>
              </MenuItem>
              <MenuItem>
                <CopyIcon aria-hidden="true" className="ds-menu__icon ds-icon" />
                <MenuItemText>Duplicar projeto</MenuItemText>
              </MenuItem>
              <MenuItem disabled={disabledItem}>
                <SettingsIcon aria-hidden="true" className="ds-menu__icon ds-icon" />
                <MenuItemText>Configuração administrativa</MenuItemText>
              </MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuCheckboxItem checked={pinned} closeOnClick={false} onCheckedChange={setPinned}>
              <MenuCheckboxIndicator />
              <MenuItemText>Fixar projeto</MenuItemText>
            </MenuCheckboxItem>
            <MenuRadioGroup onValueChange={setDensity} value={density}>
              <MenuGroupLabel>Densidade</MenuGroupLabel>
              <MenuRadioItem closeOnClick={false} value="comfortable">
                <MenuRadioIndicator />
                <MenuItemText>Confortável</MenuItemText>
              </MenuRadioItem>
              <MenuRadioItem closeOnClick={false} value="compact">
                <MenuRadioIndicator />
                <MenuItemText>Compacta</MenuItemText>
              </MenuRadioItem>
            </MenuRadioGroup>
            <MenuSeparator />
            <MenuItem destructive>
              <Trash2Icon aria-hidden="true" className="ds-menu__icon ds-icon" />
              <MenuItemText>Excluir projeto</MenuItemText>
            </MenuItem>
          </MenuContent>
        </MenuPositioner>
      </MenuPortal>
    </Menu>
  );
}

export default {
  id: 'react-menu',
  title: 'Components/Navigation/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: { docs: { description: { component: 'Lista de comandos contextuais com comportamento Base UI e visual do Menu TIS.' } } },
  args: { disabledItem: true, size: 'md' },
  argTypes: {
    size: storyArg({ control: 'radio', defaultValue: 'md', description: 'Densidade dos itens.', options: ['sm', 'md', 'lg'] }),
    disabledItem: storyArg({ control: 'boolean', defaultValue: true, description: 'Mantém uma ação administrativa desabilitada.' }),
  },
};

export const Playground = { render: (args) => <StoryCanvas><MenuExample {...args} /></StoryCanvas> };
export const Sizes = { render: () => <StoryCanvas><StoryRow>{['sm', 'md', 'lg'].map((size) => <MenuExample disabledItem={false} key={size} size={size} />)}</StoryRow></StoryCanvas> };
export const States = { render: () => <StoryCanvas><MenuExample disabledItem /></StoryCanvas> };
