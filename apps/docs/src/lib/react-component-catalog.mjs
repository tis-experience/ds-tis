import fs from 'node:fs';
import path from 'node:path';

const ROOT = findRepoRoot(process.env.INIT_CWD || process.cwd());
const COMPONENTS_API = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'docs', 'api', 'components.json'), 'utf8'),
);
const REGISTRY = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'registry.json'), 'utf8'),
);

const COMPONENT_DOCS = {
  accordion: {
    summary: {
      pt: 'Organiza conteúdo relacionado em seções que podem ser expandidas ou recolhidas.',
      en: 'Organizes related content into sections that can be expanded or collapsed.',
    },
    anatomy: {
      pt: ['Item', 'Trigger', 'Ícone de estado', 'Painel de conteúdo'],
      en: ['Item', 'Trigger', 'State icon', 'Content panel'],
    },
    useWhen: {
      pt: ['há grupos de conteúdo relacionados que não precisam permanecer visíveis ao mesmo tempo.'],
      en: ['related content groups do not need to remain visible at the same time.'],
    },
    avoidWhen: {
      pt: ['o conteúdo é curto, crítico ou precisa ser comparado simultaneamente.'],
      en: ['content is short, critical, or must be compared simultaneously.'],
    },
    storyId: 'react-accordion--playground',
    usage: `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

<Accordion defaultValue={["billing"]}>
  <AccordionItem value="billing">
    <AccordionTrigger>Faturamento</AccordionTrigger>
    <AccordionContent>Gerencie os dados de cobrança.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    accessibility: {
      pt: 'Preserve a navegação por setas, Home e End, além da relação entre trigger e painel.',
      en: 'Preserve Arrow, Home, and End navigation and the relationship between each trigger and panel.',
    },
  },
  alert: {
    summary: {
      pt: 'Comunica informação, confirmação, atenção ou erro dentro do fluxo atual.',
      en: 'Communicates information, confirmation, warning, or error within the current flow.',
    },
    anatomy: {
      pt: ['Ícone', 'Título', 'Descrição', 'Ações opcionais', 'Fechar opcional'],
      en: ['Icon', 'Title', 'Description', 'Optional actions', 'Optional close control'],
    },
    useWhen: {
      pt: ['uma mensagem precisa permanecer associada ao contexto que a originou.'],
      en: ['a message must remain associated with the context that produced it.'],
    },
    avoidWhen: {
      pt: ['a confirmação é transitória e não precisa ocupar espaço no fluxo.'],
      en: ['confirmation is transient and does not need to occupy space in the flow.'],
    },
    storyId: 'react-alert--playground',
    usage: `import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"

<Alert tone="success" variant="subtle" role="status">
  <AlertContent>
    <AlertTitle>Configuração salva</AlertTitle>
    <AlertDescription>As preferências já estão disponíveis.</AlertDescription>
  </AlertContent>
</Alert>`,
    accessibility: {
      pt: 'Escolha role="alert" apenas para mensagens urgentes; use status ou nenhuma live region para conteúdo menos prioritário.',
      en: 'Use role="alert" only for urgent messages; use status or no live region for lower-priority content.',
    },
  },
  badge: {
    summary: {
      pt: 'Identifica status ou metadados curtos próximos ao conteúdo relacionado.',
      en: 'Identifies status or short metadata next to related content.',
    },
    anatomy: { pt: ['Container', 'Label'], en: ['Container', 'Label'] },
    useWhen: {
      pt: ['um estado ou atributo curto precisa ser reconhecido rapidamente.'],
      en: ['a short state or attribute must be recognized quickly.'],
    },
    avoidWhen: {
      pt: ['o conteúdo exige explicação, interação ou anúncio por live region.'],
      en: ['content requires explanation, interaction, or a live-region announcement.'],
    },
    storyId: 'react-badge--playground',
    usage: `import { Badge } from "@/components/ui/badge"

<Badge tone="success" variant="subtle">
  Aprovado
</Badge>`,
    accessibility: {
      pt: 'O texto deve comunicar o estado sem depender apenas da cor; Badge não substitui uma live region.',
      en: 'Text must communicate status without relying on color alone; Badge does not replace a live region.',
    },
  },
  button: {
    summary: {
      pt: 'Dispara ações, confirma decisões e avança processos com hierarquia clara.',
      en: 'Triggers actions, confirms decisions, and advances processes with clear hierarchy.',
    },
    anatomy: {
      pt: ['Container', 'Ícone opcional', 'Label', 'Indicador de loading opcional'],
      en: ['Container', 'Optional icon', 'Label', 'Optional loading indicator'],
    },
    useWhen: {
      pt: ['a pessoa precisa executar uma ação imediata e identificável.'],
      en: ['a person needs to perform an immediate, identifiable action.'],
    },
    avoidWhen: {
      pt: ['o destino é uma navegação; nesse caso, use um link semântico.'],
      en: ['the destination is navigation; use a semantic link instead.'],
    },
    storyId: 'react-button--playground',
    usage: `import { Button } from "@/components/ui/button"

<Button type="submit">Salvar alterações</Button>`,
    accessibility: {
      pt: 'Forneça nome acessível, declare type dentro de formulários e preserve disabled, loading e focus ring.',
      en: 'Provide an accessible name, declare type in forms, and preserve disabled, loading, and focus-ring states.',
    },
  },
  card: {
    summary: {
      pt: 'Agrupa conteúdo e ações relacionadas em uma superfície delimitada.',
      en: 'Groups related content and actions within a bounded surface.',
    },
    anatomy: {
      pt: ['Container', 'Header opcional', 'Título', 'Conteúdo', 'Footer opcional'],
      en: ['Container', 'Optional header', 'Title', 'Content', 'Optional footer'],
    },
    useWhen: {
      pt: ['informações relacionadas formam uma unidade reutilizável ou comparável.'],
      en: ['related information forms a reusable or comparable unit.'],
    },
    avoidWhen: {
      pt: ['a superfície não acrescenta agrupamento ou hierarquia ao conteúdo.'],
      en: ['the surface adds no grouping or hierarchy to the content.'],
    },
    storyId: 'react-card--playground',
    usage: `import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

<Card variant="outlined">
  <CardHeader>
    <CardTitle>Uso da organização</CardTitle>
  </CardHeader>
  <CardContent>128 licenças ativas.</CardContent>
</Card>`,
    accessibility: {
      pt: 'Cards clicáveis devem ser links ou buttons semânticos; o estado selected precisa da semântica adequada ao padrão hospedeiro.',
      en: 'Clickable cards must be semantic links or buttons; selected state needs semantics appropriate to the owning pattern.',
    },
  },
  checkbox: {
    summary: {
      pt: 'Permite selecionar zero, uma ou várias opções independentes.',
      en: 'Allows selecting zero, one, or multiple independent options.',
    },
    anatomy: {
      pt: ['Controle', 'Indicador', 'Label', 'Descrição ou helper opcional', 'Input de formulário'],
      en: ['Control', 'Indicator', 'Label', 'Optional description or helper', 'Form input'],
    },
    useWhen: {
      pt: ['cada opção pode ser ativada ou desativada independentemente.'],
      en: ['each option can be enabled or disabled independently.'],
    },
    avoidWhen: {
      pt: ['apenas uma opção do grupo pode ser escolhida.'],
      en: ['only one option in the group can be selected.'],
    },
    storyId: 'react-checkbox--playground',
    usage: `import {
  Checkbox,
  CheckboxContent,
  CheckboxLabel,
  CheckboxTitle,
} from "@/components/ui/checkbox"

<CheckboxLabel>
  <Checkbox name="summary" />
  <CheckboxContent>
    <CheckboxTitle>Receber resumo semanal</CheckboxTitle>
  </CheckboxContent>
</CheckboxLabel>`,
    accessibility: {
      pt: 'Associe label e controle, preserve checked/indeterminate e não remova o input de formulário fornecido pela Base UI.',
      en: 'Associate label and control, preserve checked/indeterminate, and keep the form input provided by Base UI.',
    },
  },
  combobox: {
    summary: {
      pt: 'Filtra uma lista de opções e permite selecionar um valor pelo teclado ou ponteiro.',
      en: 'Filters a list of options and lets people select a value with keyboard or pointer.',
    },
    anatomy: {
      pt: ['Label', 'Controle de busca', 'Ação de limpar', 'Indicador de abertura', 'Lista de opções'],
      en: ['Label', 'Search control', 'Clear action', 'Open indicator', 'Options list'],
    },
    useWhen: {
      pt: ['há muitas opções e buscar reduz o esforço de encontrar uma delas.'],
      en: ['there are many options and searching reduces the effort required to find one.'],
    },
    avoidWhen: {
      pt: ['há poucas opções visíveis ou o usuário pode informar qualquer valor livre.'],
      en: ['there are only a few visible options or the user may enter any free-form value.'],
    },
    storyId: 'react-combobox--playground',
    usage: `import {
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
  ComboboxList,
  ComboboxPortal,
  ComboboxPositioner,
} from "@/components/ui/combobox"

<Combobox items={countries} itemToStringLabel={(item) => item.label}>
  <ComboboxField>
    <ComboboxLabel htmlFor="country">País</ComboboxLabel>
    <ComboboxAnchor>
      <ComboboxControl>
        <ComboboxInput id="country" placeholder="Busque um país" />
        <ComboboxClear />
        <ComboboxChevron />
      </ComboboxControl>
      <ComboboxPortal>
        <ComboboxPositioner>
          <ComboboxContent>
            <ComboboxList>
              {(item, index) => (
                <ComboboxItem key={item.value} index={index} value={item}>
                  {item.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </ComboboxPositioner>
      </ComboboxPortal>
    </ComboboxAnchor>
  </ComboboxField>
</Combobox>`,
    accessibility: {
      pt: 'Preserve a relação entre input e listbox, o item ativo, a seleção, Escape, setas e Enter fornecidos pela Base UI. Opções indisponíveis devem usar disabled.',
      en: 'Preserve the input-listbox relationship, active item, selection, Escape, arrow, and Enter behavior provided by Base UI. Unavailable options must use disabled.',
    },
  },
  select: {
    summary: {
      pt: 'Seleciona um único valor de uma lista conhecida sem campo de busca.',
      en: 'Selects a single value from a known list without a search field.',
    },
    anatomy: {
      pt: ['Label', 'Trigger', 'Valor ou placeholder', 'Indicador de abertura', 'Lista de opções'],
      en: ['Label', 'Trigger', 'Value or placeholder', 'Open indicator', 'Options list'],
    },
    useWhen: {
      pt: ['há cinco ou mais opções conhecidas e apenas uma deve ser escolhida.'],
      en: ['there are five or more known options and exactly one must be chosen.'],
    },
    avoidWhen: {
      pt: ['há poucas opções visíveis, múltipla seleção ou necessidade de busca.'],
      en: ['there are only a few visible options, multiple selection, or a need to search.'],
    },
    storyId: 'react-select--playground',
    usage: `import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectList,
  SelectPortal,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

<Select items={countries} name="country">
  <SelectLabel>País</SelectLabel>
  <SelectTrigger>
    <SelectValue placeholder="Selecione um país" />
  </SelectTrigger>
  <SelectPortal>
    <SelectPositioner>
      <SelectContent>
        <SelectList>
          {countries.map((item) => (
            <SelectItem key={item.value} value={item}>
              <SelectItemIndicator />
              <SelectItemText>{item.label}</SelectItemText>
            </SelectItem>
          ))}
        </SelectList>
      </SelectContent>
    </SelectPositioner>
  </SelectPortal>
</Select>`,
    accessibility: {
      pt: 'Preserve label, valor de formulário, typeahead, setas, Home/End, Enter/Space e Escape fornecidos pela Base UI. Use disabled em opções indisponíveis.',
      en: 'Preserve the label, form value, typeahead, arrow keys, Home/End, Enter/Space, and Escape provided by Base UI. Use disabled for unavailable options.',
    },
  },
  divider: {
    summary: {
      pt: 'Separa regiões de conteúdo sem introduzir uma nova superfície.',
      en: 'Separates content regions without introducing a new surface.',
    },
    anatomy: { pt: ['Linha de separação'], en: ['Separator line'] },
    useWhen: {
      pt: ['a proximidade não é suficiente para distinguir grupos relacionados.'],
      en: ['proximity alone is not enough to distinguish related groups.'],
    },
    avoidWhen: {
      pt: ['espaçamento ou um heading já comunica claramente a separação.'],
      en: ['spacing or a heading already communicates separation clearly.'],
    },
    storyId: 'react-divider--playground',
    usage: `import { Separator } from "@/components/ui/separator"

<Separator />`,
    accessibility: {
      pt: 'Use o hr semântico por padrão; marque decorative apenas quando a linha não representar uma separação de conteúdo.',
      en: 'Use the semantic hr by default; mark it decorative only when the line does not represent a content separation.',
    },
  },
  'form-field': {
    summary: {
      pt: 'Compõe label, controle, ajuda e erro em um campo acessível.',
      en: 'Composes label, control, help, and error content into an accessible field.',
    },
    anatomy: {
      pt: ['Label', 'Slot do controle', 'Descrição opcional', 'Mensagem de erro opcional'],
      en: ['Label', 'Control slot', 'Optional description', 'Optional error message'],
    },
    useWhen: {
      pt: ['um controle de formulário precisa de contexto, ajuda ou validação.'],
      en: ['a form control needs context, help, or validation.'],
    },
    avoidWhen: {
      pt: ['o componente hospedeiro já entrega a composição completa do campo.'],
      en: ['the host component already provides the complete field composition.'],
    },
    relatedItems: ['input'],
    storyId: 'react-form-field--playground',
    usage: `import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

<Field>
  <FieldLabel htmlFor="email">E-mail</FieldLabel>
  <Input id="email" name="email" />
  <FieldDescription>Use seu e-mail corporativo.</FieldDescription>
</Field>`,
    accessibility: {
      pt: 'Mantenha label, helper e error associados ao controle por IDs; estado invalid também exige aria-invalid no controle.',
      en: 'Associate label, helper, and error with the control using IDs; invalid state also requires aria-invalid on the control.',
    },
  },
  input: {
    summary: {
      pt: 'Coleta texto curto, dados estruturados ou valores de uma única linha.',
      en: 'Collects short text, structured data, or single-line values.',
    },
    anatomy: { pt: ['Container', 'Input nativo'], en: ['Container', 'Native input'] },
    useWhen: {
      pt: ['a pessoa precisa informar um valor curto ou previsível.'],
      en: ['a person needs to enter a short or predictable value.'],
    },
    avoidWhen: {
      pt: ['o conteúdo exige múltiplas linhas ou uma seleção entre opções conhecidas.'],
      en: ['content requires multiple lines or selection among known options.'],
    },
    storyId: 'react-input--playground',
    usage: `import { Input } from "@/components/ui/input"

<Input
  id="email"
  name="email"
  type="email"
  aria-label="E-mail"
  placeholder="nome@empresa.com"
/>`,
    accessibility: {
      pt: 'Forneça label visível sempre que possível e conecte helper/error com aria-describedby e aria-invalid.',
      en: 'Provide a visible label whenever possible and connect helper/error text with aria-describedby and aria-invalid.',
    },
  },
  modal: {
    summary: {
      pt: 'Interrompe o fluxo para uma decisão ou tarefa que exige atenção concentrada.',
      en: 'Interrupts the flow for a decision or task requiring focused attention.',
    },
    anatomy: {
      pt: ['Trigger', 'Overlay', 'Painel', 'Título', 'Descrição ou body', 'Ações', 'Fechar'],
      en: ['Trigger', 'Overlay', 'Panel', 'Title', 'Description or body', 'Actions', 'Close control'],
    },
    useWhen: {
      pt: ['uma decisão curta deve ser concluída antes de retornar ao contexto anterior.'],
      en: ['a short decision must be completed before returning to the previous context.'],
    },
    avoidWhen: {
      pt: ['a tarefa é longa, navegável ou precisa coexistir com o conteúdo da página.'],
      en: ['the task is long, navigable, or must coexist with page content.'],
    },
    relatedItems: ['button'],
    storyId: 'react-modal--playground',
    usage: `import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

<Dialog>
  <DialogTrigger render={<Button type="button" />}>Abrir modal</DialogTrigger>
  <DialogContent closeLabel="Fechar modal">
    <DialogHeader>
      <DialogTitle>Revisar alterações</DialogTitle>
      <DialogDescription>Confirme antes de continuar.</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`,
    accessibility: {
      pt: 'Preserve título e descrição acessíveis, foco contido, retorno de foco, Escape e label contextual do botão de fechar.',
      en: 'Preserve accessible title and description, focus containment and return, Escape, and a contextual close label.',
    },
  },
  menu: {
    summary: {
      pt: 'Oferece uma lista curta de comandos contextuais a partir de um Button.',
      en: 'Offers a short list of contextual commands from a Button.',
    },
    anatomy: {
      pt: ['Trigger', 'Positioner', 'Surface', 'Item', 'Ícone ou check', 'Label', 'Shortcut', 'Separator'],
      en: ['Trigger', 'Positioner', 'Surface', 'Item', 'Icon or check', 'Label', 'Shortcut', 'Separator'],
    },
    useWhen: {
      pt: ['ações relacionadas precisam permanecer disponíveis sem ocupar espaço contínuo na interface.'],
      en: ['related actions must remain available without permanently occupying interface space.'],
    },
    avoidWhen: {
      pt: ['a pessoa precisa selecionar um valor de formulário, buscar opções ou navegar pela estrutura principal.'],
      en: ['a person must select a form value, search options, or navigate the primary structure.'],
    },
    storyId: 'react-menu--playground',
    usage: `import {
  Menu,
  MenuContent,
  MenuItem,
  MenuItemText,
  MenuPortal,
  MenuPositioner,
  MenuTrigger,
  MenuTriggerIndicator,
} from "@/components/ui/menu"

<Menu>
  <MenuTrigger>
    <span className="ds-button__label">Ações</span>
    <MenuTriggerIndicator />
  </MenuTrigger>
  <MenuPortal>
    <MenuPositioner>
      <MenuContent aria-label="Ações do projeto">
        <MenuItem><MenuItemText>Editar detalhes</MenuItemText></MenuItem>
      </MenuContent>
    </MenuPositioner>
  </MenuPortal>
</Menu>`,
    accessibility: {
      pt: 'Preserve aria-haspopup/expanded, foco composto, setas, Home/End, typeahead, Escape, itens disabled focusable e retorno ao trigger.',
      en: 'Preserve aria-haspopup/expanded, composite focus, Arrow keys, Home/End, typeahead, Escape, focusable disabled items, and focus return to the trigger.',
    },
  },
  popover: {
    summary: {
      pt: 'Exibe conteúdo contextual breve ancorado a um trigger, sem interromper o restante da página.',
      en: 'Displays concise contextual content anchored to a trigger without interrupting the rest of the page.',
    },
    anatomy: {
      pt: ['Trigger', 'Positioner', 'Painel', 'Seta opcional', 'Título', 'Descrição ou body', 'Ações', 'Fechar'],
      en: ['Trigger', 'Positioner', 'Panel', 'Optional arrow', 'Title', 'Description or body', 'Actions', 'Close control'],
    },
    useWhen: {
      pt: ['a pessoa precisa de contexto ou de uma ação curta sem perder a referência do elemento de origem.'],
      en: ['a person needs context or a short action without losing the relationship to the originating element.'],
    },
    avoidWhen: {
      pt: ['a tarefa exige foco modal, navegação longa ou conteúdo essencial que deve permanecer sempre visível.'],
      en: ['the task requires modal focus, long navigation, or essential content that must remain visible.'],
    },
    relatedItems: ['button'],
    storyId: 'react-popover--playground',
    usage: `import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

<Popover>
  <PopoverTrigger render={<Button variant="outline" />}>Detalhes</PopoverTrigger>
  <PopoverContent>
    <PopoverHeader><PopoverTitle>Detalhes da ação</PopoverTitle></PopoverHeader>
    <PopoverClose label="Fechar popover" />
    <PopoverDescription>Conteúdo breve associado ao trigger.</PopoverDescription>
  </PopoverContent>
</Popover>`,
    accessibility: {
      pt: 'Use título e descrição acessíveis, preserve Escape, click externo e retorno de foco; Popover é não modal e não deve prender o foco.',
      en: 'Use an accessible title and description, preserve Escape, outside click, and focus return; Popover is non-modal and must not trap focus.',
    },
  },
  tooltip: {
    summary: {
      pt: 'Exibe um label visual breve quando um trigger recebe hover ou focus.',
      en: 'Displays a brief visual label when a trigger receives hover or focus.',
    },
    anatomy: {
      pt: ['Trigger', 'Positioner', 'Surface', 'Seta opcional'],
      en: ['Trigger', 'Positioner', 'Surface', 'Optional arrow'],
    },
    useWhen: {
      pt: ['um controle, especialmente icon-only, precisa de um label visual complementar.'],
      en: ['a control, especially an icon-only control, needs a supplementary visual label.'],
    },
    avoidWhen: {
      pt: ['a informação é essencial, longa ou exige links, buttons ou outros controles.'],
      en: ['information is essential, lengthy, or requires links, buttons, or other controls.'],
    },
    relatedItems: ['button', 'popover'],
    storyId: 'react-tooltip--playground',
    usage: `import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button aria-label="Editar projeto" variant="outline" />}>
      Editar
    </TooltipTrigger>
    <TooltipContent>Editar projeto</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    accessibility: {
      pt: 'Dê um nome acessível ao trigger, mantenha o conteúdo complementar e sem foco, preserve hover/focus, Escape e aria-describedby.',
      en: 'Give the trigger an accessible name, keep content supplementary and non-focusable, and preserve hover/focus, Escape, and aria-describedby.',
    },
  },
  radio: {
    summary: {
      pt: 'Permite escolher exatamente uma opção entre alternativas relacionadas.',
      en: 'Allows choosing exactly one option among related alternatives.',
    },
    anatomy: {
      pt: ['Grupo', 'Legend', 'Opção', 'Controle', 'Indicador', 'Label'],
      en: ['Group', 'Legend', 'Option', 'Control', 'Indicator', 'Label'],
    },
    useWhen: {
      pt: ['todas as opções precisam permanecer visíveis e apenas uma pode ser escolhida.'],
      en: ['all options should remain visible and only one can be selected.'],
    },
    avoidWhen: {
      pt: ['há muitas opções ou o espaço disponível é limitado.'],
      en: ['there are many options or available space is limited.'],
    },
    storyId: 'react-radio--playground',
    usage: `import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupLegend,
  RadioGroupOption,
} from "@/components/ui/radio-group"

<RadioGroup name="channel" defaultValue="email">
  <RadioGroupLegend>Canal</RadioGroupLegend>
  <RadioGroupOption>
    <RadioGroupItem value="email" />
    <RadioGroupLabel>E-mail</RadioGroupLabel>
  </RadioGroupOption>
</RadioGroup>`,
    accessibility: {
      pt: 'Use uma legend para o grupo, labels para as opções e preserve o teclado e o input de formulário da Base UI.',
      en: 'Use a legend for the group, labels for options, and preserve Base UI keyboard and form-input behavior.',
    },
  },
  skeleton: {
    summary: {
      pt: 'Representa temporariamente a estrutura do conteúdo durante o carregamento.',
      en: 'Temporarily represents content structure while data is loading.',
    },
    anatomy: { pt: ['Forma de placeholder'], en: ['Placeholder shape'] },
    useWhen: {
      pt: ['a estrutura final é conhecida e o carregamento pode ser percebido.'],
      en: ['the final structure is known and loading may be perceptible.'],
    },
    avoidWhen: {
      pt: ['a operação é imediata ou não existe estrutura previsível para representar.'],
      en: ['the operation is immediate or no predictable structure can be represented.'],
    },
    storyId: 'react-skeleton--playground',
    usage: `import { Skeleton } from "@/components/ui/skeleton"

<div role="status" aria-busy="true" aria-label="Carregando perfil">
  <Skeleton variant="circle" />
  <Skeleton variant="text" />
</div>`,
    accessibility: {
      pt: 'Mantenha Skeleton silencioso com aria-hidden e anuncie o carregamento uma única vez no container.',
      en: 'Keep Skeleton silent with aria-hidden and announce loading once on the containing region.',
    },
  },
  spinner: {
    summary: {
      pt: 'Indica progresso indeterminado para uma operação em andamento.',
      en: 'Indicates indeterminate progress for an operation in progress.',
    },
    anatomy: { pt: ['Track', 'Indicador'], en: ['Track', 'Indicator'] },
    useWhen: {
      pt: ['a duração é desconhecida e não há estrutura de conteúdo para antecipar.'],
      en: ['duration is unknown and there is no content structure to anticipate.'],
    },
    avoidWhen: {
      pt: ['o progresso pode ser medido ou um Skeleton comunica melhor a espera.'],
      en: ['progress can be measured or a Skeleton communicates the wait better.'],
    },
    storyId: 'react-spinner--playground',
    usage: `import { Spinner } from "@/components/ui/spinner"

<Spinner aria-label="Sincronizando preferências" size="md" />`,
    accessibility: {
      pt: 'Forneça aria-label contextual e evite múltiplos status concorrentes para o mesmo carregamento.',
      en: 'Provide a contextual aria-label and avoid multiple competing status regions for one loading operation.',
    },
  },
  tabs: {
    summary: {
      pt: 'Alterna painéis relacionados no mesmo contexto com seleção e teclado previsíveis.',
      en: 'Switches related panels in the same context with predictable selection and keyboard behavior.',
    },
    anatomy: {
      pt: ['Root', 'Lista de tabs', 'Tab', 'Indicador ativo', 'Painel'],
      en: ['Root', 'Tab list', 'Tab', 'Active indicator', 'Panel'],
    },
    useWhen: {
      pt: ['painéis irmãos precisam compartilhar o mesmo espaço e alternar sem mudar de página.'],
      en: ['sibling panels must share the same space and switch without navigating away.'],
    },
    avoidWhen: {
      pt: ['o conteúdo precisa ser comparado simultaneamente, representa etapas ou navega para outras páginas.'],
      en: ['content must be compared simultaneously, represents steps, or navigates to other pages.'],
    },
    storyId: 'react-tabs--playground',
    usage: `import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

<Tabs defaultValue="overview">
  <TabsList aria-label="Seções do projeto">
    <TabsTrigger value="overview">Visão geral</TabsTrigger>
    <TabsTrigger value="team">Equipe</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Resumo do projeto.</TabsContent>
  <TabsContent value="team">Equipe do projeto.</TabsContent>
</Tabs>`,
    accessibility: {
      pt: 'Preserve tablist/tab/tabpanel, aria-selected, roving tabindex, setas, Home/End, disabled ignorado e relações entre tabs e painéis.',
      en: 'Preserve tablist/tab/tabpanel, aria-selected, roving tabindex, Arrow keys, Home/End, skipped disabled tabs, and tab-panel relationships.',
    },
  },
  toast: {
    summary: {
      pt: 'Confirma resultados e comunica feedback transitório sem interromper o fluxo atual.',
      en: 'Confirms outcomes and communicates transient feedback without interrupting the current flow.',
    },
    anatomy: {
      pt: ['Região', 'Ícone', 'Título', 'Descrição opcional', 'Ação opcional', 'Fechar'],
      en: ['Region', 'Icon', 'Title', 'Optional description', 'Optional action', 'Close control'],
    },
    useWhen: {
      pt: ['uma ação concluída precisa de confirmação breve e não bloqueante.'],
      en: ['a completed action needs brief, non-blocking confirmation.'],
    },
    avoidWhen: {
      pt: ['a mensagem exige decisão, correção imediata ou precisa permanecer no contexto.'],
      en: ['the message requires a decision, immediate correction, or must remain in context.'],
    },
    storyId: 'react-toast--playground',
    usage: `import {
  ToastProvider,
  showToast,
} from "@/components/ui/toast"

function App() {
  return (
    <ToastProvider>
      <button onClick={() => showToast({
        type: "success",
        title: "Preferências salvas",
        description: "As alterações já estão disponíveis.",
      })}>
        Salvar preferências
      </button>
    </ToastProvider>
  )
}`,
    accessibility: {
      pt: 'Use prioridade alta apenas para erros urgentes, preserve pausa em hover/focus, action acessível, close, limite da fila e atalho F6 da Base UI.',
      en: 'Use high priority only for urgent errors; preserve hover/focus pause, an accessible action, close control, queue limit, and Base UI F6 shortcut.',
    },
  },
  textarea: {
    summary: {
      pt: 'Coleta texto livre que pode ocupar várias linhas.',
      en: 'Collects free-form text that may span multiple lines.',
    },
    anatomy: { pt: ['Container', 'Textarea nativa'], en: ['Container', 'Native textarea'] },
    useWhen: {
      pt: ['a resposta pode ser longa, narrativa ou conter múltiplos parágrafos.'],
      en: ['the response may be long, narrative, or contain multiple paragraphs.'],
    },
    avoidWhen: {
      pt: ['o valor é curto, estruturado ou pode ser escolhido entre opções.'],
      en: ['the value is short, structured, or can be selected from options.'],
    },
    storyId: 'react-textarea--playground',
    usage: `import { Textarea } from "@/components/ui/textarea"

<Textarea
  id="message"
  name="message"
  aria-label="Mensagem"
  placeholder="Descreva sua solicitação"
/>`,
    accessibility: {
      pt: 'Forneça label, preserve readonly/disabled e associe helper, contador e error por aria-describedby.',
      en: 'Provide a label, preserve readonly/disabled, and associate helper, counter, and error using aria-describedby.',
    },
  },
  toggle: {
    summary: {
      pt: 'Alterna imediatamente uma configuração entre ligada e desligada.',
      en: 'Immediately switches a setting between on and off.',
    },
    anatomy: {
      pt: ['Track', 'Thumb', 'Label', 'Descrição ou helper opcional', 'Input de formulário'],
      en: ['Track', 'Thumb', 'Label', 'Optional description or helper', 'Form input'],
    },
    useWhen: {
      pt: ['a mudança é binária e deve produzir efeito imediato.'],
      en: ['the change is binary and should take effect immediately.'],
    },
    avoidWhen: {
      pt: ['a escolha só será aplicada após o envio de um formulário.'],
      en: ['the choice will only apply after submitting a form.'],
    },
    storyId: 'react-toggle--playground',
    usage: `import {
  Switch,
  SwitchContent,
  SwitchLabel,
  SwitchTitle,
} from "@/components/ui/switch"

<SwitchLabel>
  <Switch name="alerts" defaultChecked />
  <SwitchContent>
    <SwitchTitle>Alertas de segurança</SwitchTitle>
  </SwitchContent>
</SwitchLabel>`,
    accessibility: {
      pt: 'Use um label que descreva o estado controlado e preserve role="switch", teclado, checked e disabled.',
      en: 'Use a label describing the controlled state and preserve role="switch", keyboard, checked, and disabled behavior.',
    },
  },
};

export function getReactComponents(locale = 'pt-br') {
  const language = locale === 'en' ? 'en' : 'pt';
  const collator = new Intl.Collator(language, { sensitivity: 'base' });
  const registryByName = new Map(REGISTRY.items.map((item) => [item.name, item]));
  const providerLabels = language === 'en'
    ? {}
    : {
        'Native React': 'React nativo',
        'React composition': 'Composição React',
        'React presentation': 'Apresentação React',
      };

  return COMPONENTS_API.components
    .filter((component) => component.implementations?.react?.status === 'beta')
    .map((component) => {
      const react = component.implementations.react;
      const docs = COMPONENT_DOCS[component.slug];
      const registryItem = registryByName.get(react.item);
      if (!docs) throw new Error(`${component.slug}: documentação React central ausente`);
      if (!registryItem) throw new Error(`${component.slug}: item ${react.item} ausente no registry`);

      const sourcePath = registryItem.files.find((file) => file.type === 'registry:ui')?.path;
      if (!sourcePath) throw new Error(`${component.slug}: source React ausente no registry`);

      return {
        ...component,
        accessibility: docs.accessibility[language],
        anatomy: docs.anatomy[language],
        avoidWhen: docs.avoidWhen[language],
        description: docs.summary[language],
        providerLabel: providerLabels[react.provider] || react.provider,
        providerRoleLabel: react.providerRole === 'output-provider'
          ? (language === 'en' ? 'React output provider' : 'Provider da saída React')
          : (language === 'en' ? 'Native or composition' : 'Nativo ou composição'),
        react,
        relatedItems: docs.relatedItems || [],
        sourcePath,
        sourceUrl: `https://github.com/tis-experience/ds-tis/blob/main/${sourcePath}`,
        storyId: docs.storyId,
        usage: docs.usage,
        useWhen: docs.useWhen[language],
      };
    })
    .sort((left, right) => collator.compare(left.name, right.name));
}

export function getReactComponentGroups(locale = 'pt-br') {
  const language = locale === 'en' ? 'en' : 'pt';
  const components = getReactComponents(locale);
  const groups = new Map();

  for (const component of components) {
    const category = component.category;
    if (!groups.has(category.id)) {
      groups.set(category.id, {
        id: category.id,
        label: category.label[language],
        description: category.description[language],
        order: category.order,
        components: [],
      });
    }
    groups.get(category.id).components.push(component);
  }

  return [...groups.values()].sort((left, right) => left.order - right.order);
}

export function getReactComponent(slug, locale = 'pt-br') {
  const component = getReactComponents(locale).find((entry) => entry.slug === slug);
  if (!component) throw new Error(`Componente React beta ausente: ${slug}`);
  return component;
}

function findRepoRoot(startDirectory) {
  let directory = path.resolve(startDirectory);

  while (true) {
    if (
      fs.existsSync(path.join(directory, 'package.json')) &&
      fs.existsSync(path.join(directory, 'registry.json')) &&
      fs.existsSync(path.join(directory, 'docs', 'api', 'components.json'))
    ) {
      return directory;
    }

    const parent = path.dirname(directory);
    if (parent === directory) {
      throw new Error(`Raiz do DS TIS não encontrada a partir de ${startDirectory}`);
    }
    directory = parent;
  }
}
