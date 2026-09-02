import { useEffect, useState } from 'react';

import {
  ToastProvider,
  dismissToast,
  showToast,
} from '../../../../registry/tis/toast.tsx';
import { StoryCanvas, storyArg } from './_shared.jsx';

function ToastExample({ action = true, style = 'subtle', type = 'success' }) {
  const [actionCount, setActionCount] = useState(0);
  useEffect(() => () => dismissToast(), []);

  return (
    <ToastProvider>
      <StoryCanvas>
        <button
          className="ds-button ds-button--brand ds-button--md"
          onClick={() => showToast({
            actionLabel: action ? 'Desfazer' : undefined,
            description: 'As alterações já estão disponíveis para esta conta.',
            onAction: () => setActionCount((count) => count + 1),
            style,
            title: 'Preferências salvas',
            type,
          })}
          type="button"
        >
          <span className="ds-button__label">Mostrar Toast</span>
        </button>
        <p aria-live="polite">Actions executadas: {actionCount}</p>
      </StoryCanvas>
    </ToastProvider>
  );
}

export default {
  id: 'react-toast',
  title: 'Components/Feedback and status/Toast',
  component: ToastProvider,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Feedback transitório com manager Base UI, composição shadcn e visual do Toast TIS.',
      },
    },
  },
  args: { action: true, style: 'subtle', type: 'success' },
  argTypes: {
    action: storyArg({ control: 'boolean', defaultValue: true, description: 'Inclui action e mantém o Toast até dismiss.' }),
    style: storyArg({ control: 'radio', defaultValue: 'subtle', description: 'Estilo visual.', options: ['subtle', 'solid'] }),
    type: storyArg({ control: 'select', defaultValue: 'success', description: 'Tipo semântico.', options: ['success', 'warning', 'error', 'info'] }),
  },
};

export const Playground = {
  render: (args) => <ToastExample {...args} />,
};

export const SolidError = {
  name: 'Solid error',
  render: () => <ToastExample action={false} style="solid" type="error" />,
};

export const WithoutAction = {
  name: 'Without action',
  render: () => <ToastExample action={false} type="info" />,
};
