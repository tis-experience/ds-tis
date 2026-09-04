# Implementação

- Status: Validado localmente, aguardando integração.
- Adapter: `packages/react/src/ark/textarea.jsx`.
- Stories: `packages/react/src/stories/ark-textarea.stories.jsx`.
- Ref aponta para textarea nativo. API preserva atributos de formulário, tamanhos e estados.
- Playground usa value/onChange, contador, maxlength=200, submit FormData e reset com retorno de foco. Há exemplos não controlados, estados e tamanhos.
- `test:vnext` e `test:vnext:browser` passaram: required, multiline/FormData, value/defaultValue, maxlength, contador, reset/ref/foco, readonly/disabled/invalid, sm/md/lg, resize vertical, dark e 320px/Axe.
- Bundle: adapter 1,20 KiB gzip; preview com CSS 12,63 KiB gzip (React/ReactDOM externos).
- Capturas `evidence/textarea-light.png`, `textarea-dark.png` e `textarea-320.png` revisadas: alinhamento, bordas, texto e foco seguem CSS TIS; sem recortes.
- Builds Astro e três Storybooks passaram; Pages com links íntegros.
- Tokens: 1.595, zero erros. Nenhum diff de tokens ou CSS; Figma não inspecionado neste worktree sem snapshot.
