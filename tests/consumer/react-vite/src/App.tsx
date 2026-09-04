import { useState, type FormEvent } from "react"
import { ArrowUpDownIcon, CircleCheckIcon, InfoIcon, XIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion"
import {
  Alert,
  AlertClose,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "./components/ui/alert"
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card"
import {
  Checkbox,
  CheckboxContent,
  CheckboxDescription,
  CheckboxLabel,
  CheckboxTitle,
} from "./components/ui/checkbox"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLabelRow,
  FieldRequired,
} from "./components/ui/field"
import { Input } from "./components/ui/input"
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemText,
  MenuPortal,
  MenuPositioner,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
  MenuTriggerIndicator,
} from "./components/ui/menu"
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./components/ui/popover"
import {
  RadioGroup,
  RadioGroupContent,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupLegend,
  RadioGroupOption,
} from "./components/ui/radio-group"
import { Separator } from "./components/ui/separator"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
} from "./components/ui/table"
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
} from "./components/ui/select"
import { Skeleton } from "./components/ui/skeleton"
import { Spinner } from "./components/ui/spinner"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs"
import {
  Switch,
  SwitchContent,
  SwitchDescription,
  SwitchLabel,
  SwitchTitle,
} from "./components/ui/switch"
import { Textarea } from "./components/ui/textarea"
import {
  ToastProvider,
  showToast,
} from "./components/ui/toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./components/ui/tooltip"

const countries = [
  { label: "Argentina", value: "ar" },
  { label: "Brasil", value: "br" },
  { label: "Chile", value: "cl" },
  { disabled: true, label: "Indisponível", value: "disabled" },
  { label: "Portugal", value: "pt" },
]

export function App() {
  const [saved, setSaved] = useState(false)
  const [tableDescending, setTableDescending] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <ToastProvider>
    <main className="consumer-shell">
      <header className="consumer-header">
        <p className="consumer-kicker">Registry shadcn · beta</p>
        <h1>Preferências da conta</h1>
        <p>Vinte e três componentes React instalados como source, com o visual do DS TIS.</p>
        <div className="consumer-badge-row" aria-label="Estado da implementação">
          <Badge tone="info" variant="subtle">React beta</Badge>
          <Badge tone="success" variant="subtle">23 componentes validados</Badge>
        </div>
      </header>

      <Alert role="status" tone={saved ? "success" : "info"} variant="subtle">
        <AlertIcon>{saved ? <CircleCheckIcon /> : <InfoIcon />}</AlertIcon>
        <AlertContent>
          <AlertTitle>{saved ? "Preferências salvas" : "Revise antes de salvar"}</AlertTitle>
          <AlertDescription>
            {saved
              ? "As alterações já estão disponíveis para esta conta."
              : "As mudanças entram em vigor imediatamente após a confirmação."}
          </AlertDescription>
        </AlertContent>
        {saved ? (
          <AlertClose aria-label="Dispensar confirmação" onClick={() => setSaved(false)}>
            <XIcon />
          </AlertClose>
        ) : null}
      </Alert>

      <form className="consumer-form" onSubmit={handleSubmit}>
        <Card as="section" variant="outlined" aria-labelledby="profile-title">
          <CardHeader>
            <CardTitle as="h2" id="profile-title">Perfil</CardTitle>
            <CardDescription>Dados usados nas comunicações de serviço.</CardDescription>
          </CardHeader>
          <CardContent className="consumer-card-content">
            <FieldGroup>
              <Field>
                <FieldLabelRow>
                  <FieldLabel htmlFor="consumer-name">Nome</FieldLabel>
                  <FieldRequired />
                </FieldLabelRow>
                <Input id="consumer-name" name="name" defaultValue="Marcell" required />
                <FieldDescription id="consumer-name-help">
                  Use o nome pelo qual prefere ser chamado.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabelRow>
                  <FieldLabel htmlFor="consumer-bio">Resumo</FieldLabel>
                </FieldLabelRow>
                <Textarea id="consumer-bio" name="bio" defaultValue="Experience Engineering" />
                <FieldDescription>Até duas linhas sobre a sua função.</FieldDescription>
              </Field>

              <Select
                defaultValue={countries[1]}
                itemToStringLabel={(item) => item.label}
                itemToStringValue={(item) => item.value}
                items={countries}
                name="country"
              >
                <SelectField>
                  <SelectLabel>País</SelectLabel>
                  <SelectTrigger aria-describedby="consumer-country-help">
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
                  <span className="ds-field__helper" id="consumer-country-help">
                    Escolha o país associado à conta.
                  </span>
                </SelectField>
              </Select>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card as="section" variant="outlined" aria-labelledby="notifications-title">
          <CardHeader>
            <CardTitle as="h2" id="notifications-title">Notificações</CardTitle>
            <CardDescription>Escolha como e quando receber atualizações.</CardDescription>
          </CardHeader>
          <CardContent className="consumer-card-content">
            <CheckboxLabel>
              <Checkbox name="weekly-summary" />
              <CheckboxContent>
                <CheckboxTitle>Resumo semanal</CheckboxTitle>
                <CheckboxDescription>Receber uma síntese toda sexta-feira.</CheckboxDescription>
              </CheckboxContent>
            </CheckboxLabel>

            <RadioGroup defaultValue="email" name="channel">
              <RadioGroupLegend>Canal principal</RadioGroupLegend>
              <RadioGroupOption>
                <RadioGroupItem value="email" />
                <RadioGroupContent>
                  <RadioGroupLabel>E-mail</RadioGroupLabel>
                </RadioGroupContent>
              </RadioGroupOption>
              <RadioGroupOption>
                <RadioGroupItem value="sms" />
                <RadioGroupContent>
                  <RadioGroupLabel>SMS</RadioGroupLabel>
                </RadioGroupContent>
              </RadioGroupOption>
            </RadioGroup>

            <SwitchLabel>
              <Switch name="security-alerts" defaultChecked />
              <SwitchContent>
                <SwitchTitle>Alertas de segurança</SwitchTitle>
                <SwitchDescription>Manter avisos de novos acessos ativos.</SwitchDescription>
              </SwitchContent>
            </SwitchLabel>
          </CardContent>
        </Card>

        <Card as="section" variant="outlined" aria-labelledby="help-title">
          <CardHeader>
            <CardTitle as="h2" id="help-title">Ajuda e confirmação</CardTitle>
            <CardDescription>Comportamentos compostos instalados pelo mesmo registry.</CardDescription>
          </CardHeader>
          <CardContent className="consumer-card-content">
            <Accordion defaultValue={["privacy"]}>
              <AccordionItem value="privacy">
                <AccordionTrigger>Como os dados são usados?</AccordionTrigger>
                <AccordionContent>
                  <p>As preferências controlam apenas as comunicações desta conta.</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="changes">
                <AccordionTrigger>Quando a alteração entra em vigor?</AccordionTrigger>
                <AccordionContent>
                  <p>A atualização é aplicada imediatamente após salvar.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Separator />

            <Tabs defaultValue="overview">
              <TabsList aria-label="Seções da conta">
                <TabsTrigger value="overview">Visão geral</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
                <TabsTrigger disabled value="billing">Cobrança</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                Preferências gerais desta conta.
              </TabsContent>
              <TabsContent value="security">
                Alertas e acessos recentes.
              </TabsContent>
              <TabsContent value="billing">
                Plano e dados de cobrança.
              </TabsContent>
            </Tabs>

            <Table nowrap regionLabel="Contas recentes" size="md">
              <TableCaption>Contas recentes</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead aria-sort={tableDescending ? "descending" : "ascending"} sortable>
                    <TableSortButton
                      aria-label="Ordenar clientes"
                      onClick={() => setTableDescending((current) => !current)}
                    >
                      Cliente
                      <ArrowUpDownIcon aria-hidden="true" className="ds-table__sort-icon" />
                    </TableSortButton>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>E-mail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tableDescending
                  ? [
                      ["Bruno Lima", "Pendente", "bruno.lima@agt.ao"],
                      ["Ana Silva", "Ativo", "ana.silva@agt.ao"],
                    ]
                  : [
                      ["Ana Silva", "Ativo", "ana.silva@agt.ao"],
                      ["Bruno Lima", "Pendente", "bruno.lima@agt.ao"],
                    ]
                ).map(([name, status, email]) => (
                  <TableRow key={email} selected={status === "Pendente"}>
                    <TableCell>{name}</TableCell>
                    <TableCell>{status}</TableCell>
                    <TableCell>{email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Menu>
              <MenuTrigger type="button">
                <span className="ds-button__label">Ações da conta</span>
                <MenuTriggerIndicator />
              </MenuTrigger>
              <MenuPortal>
                <MenuPositioner>
                  <MenuContent aria-label="Ações da conta">
                    <MenuGroup>
                      <MenuGroupLabel>Conta</MenuGroupLabel>
                      <MenuItem onClick={() => setSaved(true)}>
                        <MenuItemText>Salvar agora</MenuItemText>
                        <MenuShortcut>⌘S</MenuShortcut>
                      </MenuItem>
                      <MenuItem disabled>
                        <MenuItemText>Transferir propriedade</MenuItemText>
                      </MenuItem>
                    </MenuGroup>
                    <MenuSeparator />
                    <MenuItem destructive>
                      <MenuItemText>Excluir conta</MenuItemText>
                    </MenuItem>
                  </MenuContent>
                </MenuPositioner>
              </MenuPortal>
            </Menu>

            <Popover>
              <PopoverTrigger render={<Button type="button" variant="outline" />}>
                Ver contexto
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader><PopoverTitle>Contexto da alteração</PopoverTitle></PopoverHeader>
                <PopoverClose label="Fechar contexto" />
                <PopoverDescription>As preferências são aplicadas somente a esta conta.</PopoverDescription>
              </PopoverContent>
            </Popover>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={<Button aria-label="Sobre as preferências" size="icon-sm" type="button" variant="ghost" />}
                >
                  <InfoIcon aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent>As preferências afetam somente esta conta</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Dialog>
              <DialogTrigger render={<Button type="button" variant="outline" />}>
                Revisar alterações
              </DialogTrigger>
              <DialogContent closeLabel="Fechar revisão" size="sm">
                <DialogHeader>
                  <DialogTitle>Revisar preferências</DialogTitle>
                  <DialogDescription>
                    Confirme os canais antes de salvar a configuração.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <p>O resumo semanal será enviado pelo canal selecionado.</p>
                </DialogBody>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant="outline" />}>
                    Voltar
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="outline"
              onClick={() => showToast({
                actionLabel: "Desfazer",
                description: "As alterações já estão disponíveis para esta conta.",
                onAction: () => setSaved(false),
                style: "subtle",
                title: "Configuração confirmada",
                type: "success",
              })}
            >
              Mostrar confirmação Toast
            </Button>
          </CardContent>
        </Card>

        <Card as="section" variant="elevated" aria-labelledby="loading-title">
          <CardHeader>
            <CardTitle as="h2" id="loading-title">Estado de carregamento</CardTitle>
            <CardDescription>Feedback visual e anúncio acessível permanecem separados.</CardDescription>
          </CardHeader>
          <CardContent className="consumer-card-content">
            <div className="consumer-spinner-row">
              <Spinner aria-label="Sincronizando preferências" size="sm" />
              <span>Sincronizando preferências</span>
            </div>
            <div
              className="consumer-loading-preview"
              role="status"
              aria-busy="true"
              aria-label="Carregando prévia do perfil"
            >
              <Skeleton variant="circle" />
              <div className="consumer-loading-copy">
                <Skeleton variant="text" />
                <Skeleton variant="text" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="consumer-actions">
          <Button type="submit">Salvar preferências</Button>
          <p aria-live="polite" className="consumer-status">
            {saved ? "Preferências salvas." : "Nenhuma alteração salva."}
          </p>
        </div>
      </form>
    </main>
    </ToastProvider>
  )
}
