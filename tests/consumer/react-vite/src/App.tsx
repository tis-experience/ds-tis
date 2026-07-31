import { useState, type FormEvent } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./components/ui/accordion"
import { Button } from "./components/ui/button"
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
  RadioGroup,
  RadioGroupContent,
  RadioGroupItem,
  RadioGroupLabel,
  RadioGroupLegend,
  RadioGroupOption,
} from "./components/ui/radio-group"
import {
  Switch,
  SwitchContent,
  SwitchDescription,
  SwitchLabel,
  SwitchTitle,
} from "./components/ui/switch"
import { Textarea } from "./components/ui/textarea"

export function App() {
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <main className="consumer-shell">
      <header className="consumer-header">
        <p className="consumer-kicker">Registry shadcn · beta</p>
        <h1>Preferências da conta</h1>
        <p>Nove componentes React instalados como source, com o visual do DS TIS.</p>
      </header>

      <form className="consumer-form" onSubmit={handleSubmit}>
        <section className="consumer-section" aria-labelledby="profile-title">
          <div className="consumer-section-heading">
            <h2 id="profile-title">Perfil</h2>
            <p>Dados usados nas comunicações de serviço.</p>
          </div>

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
          </FieldGroup>
        </section>

        <section className="consumer-section" aria-labelledby="notifications-title">
          <div className="consumer-section-heading">
            <h2 id="notifications-title">Notificações</h2>
            <p>Escolha como e quando receber atualizações.</p>
          </div>

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
        </section>

        <section className="consumer-section" aria-labelledby="help-title">
          <div className="consumer-section-heading">
            <h2 id="help-title">Ajuda e confirmação</h2>
            <p>Comportamentos compostos instalados pelo mesmo registry.</p>
          </div>

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

          <Dialog>
            <DialogTrigger
              render={<button className="ds-button ds-button--outline" type="button" />}
            >
              <span className="ds-button__label">Revisar alterações</span>
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
                <DialogClose
                  render={<button className="ds-button ds-button--outline" type="button" />}
                >
                  <span className="ds-button__label">Voltar</span>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <div className="consumer-actions">
          <Button type="submit">Salvar preferências</Button>
          <p aria-live="polite" className="consumer-status">
            {saved ? "Preferências salvas." : "Nenhuma alteração salva."}
          </p>
        </div>
      </form>
    </main>
  )
}
