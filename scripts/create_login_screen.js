// Script para criar a tela de login no Figma utilizando o design system
// Pode ser executado no Console do Desenvolvedor do Figma (Cmd+Option+I) ou via use_figma por outro agente.

async function run() {
  console.log("Iniciando criação da tela de login...");

  // 1. Carregar as fontes necessárias antes de criar nós de texto
  await Promise.all([
    figma.loadFontAsync({ family: 'Inter', style: 'Regular' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Medium' }),
    figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
  ]);

  // 2. Encontrar ou criar a página "Login Screen"
  let loginPage = figma.root.children.find(p => p.name === 'Login Screen');
  if (!loginPage) {
    loginPage = figma.createPage();
    loginPage.name = 'Login Screen';
  }
  figma.currentPage = loginPage;

  // 3. Obter as coleções de variáveis
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const semantic = collections.find(c => c.name === 'Semantic');
  const foundation = collections.find(c => c.name === 'Foundation');
  
  // Helper para buscar variáveis por nome
  const getVariable = (collection, name) => {
    if (!collection) return null;
    return collection.variableIds
      .map(id => figma.variables.getVariableById(id))
      .find(v => v && v.name === name);
  };

  // Resgatar variáveis de espaçamento, cantos e cores
  const spaceSm = getVariable(semantic, 'space/sm');
  const spaceMd = getVariable(semantic, 'space/md');
  const spaceLg = getVariable(semantic, 'space/lg');
  const spaceXl = getVariable(semantic, 'space/xl');
  const space2xl = getVariable(semantic, 'space/2xl');
  const space3xl = getVariable(semantic, 'space/3xl');
  
  const radiusLg = getVariable(semantic, 'radius/lg');
  
  const colorBgSubtle = getVariable(semantic, 'background/subtle');
  const colorBgSurface = getVariable(semantic, 'surface/default');
  const colorBorderSubtle = getVariable(semantic, 'border/subtle');
  const colorTextStrong = getVariable(semantic, 'content/strong');
  const colorTextDefault = getVariable(semantic, 'content/default');
  const colorBrandDefault = getVariable(semantic, 'primary/content-default');

  // 4. Buscar os Component Sets no arquivo
  const buttonSet = figma.root.findOne(node => node.type === 'COMPONENT_SET' && node.name === 'Button');
  const inputSet = figma.root.findOne(node => node.type === 'COMPONENT_SET' && node.name === 'Input Text');
  const checkboxSet = figma.root.findOne(node => node.type === 'COMPONENT_SET' && node.name === 'Checkbox');
  const checkboxFieldSet = figma.root.findOne(node => node.type === 'COMPONENT_SET' && node.name === 'Checkbox Field');

  // Helper para instanciar variantes a partir de propriedades passadas
  function createInstanceFromSet(componentSet, properties) {
    if (!componentSet) {
      console.warn("Component set não encontrado.");
      return null;
    }
    
    const variant = componentSet.children.find(node => {
      const variantProps = node.name.split(',').reduce((acc, prop) => {
        const [k, v] = prop.split('=').map(s => s.trim());
        acc[k] = v;
        return acc;
      }, {});
      
      return Object.keys(properties).every(k => {
        const targetVal = String(properties[k]).toLowerCase();
        const variantVal = String(variantProps[k] || '').toLowerCase();
        return targetVal === variantVal;
      });
    });
    
    if (variant) {
      return variant.createInstance();
    } else {
      console.log(`Variante exata para ${componentSet.name} não encontrada, usando default.`);
      return componentSet.defaultVariant.createInstance();
    }
  }

  // Helper para cores em Hex
  function hexToFigmaColor(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return { r, g, b };
  }

  // 5. Instanciar componentes do formulário
  console.log("Instanciando componentes do design system...");
  
  // Campo de E-mail
  const emailInput = createInstanceFromSet(inputSet, {
    Size: 'Medium',
    State: 'Default',
    Filled: 'False',
    'Read-only': 'False',
    Error: 'False'
  });
  if (emailInput) {
    emailInput.setProperties({
      'Rótulo': 'E-mail',
      'Placeholder': 'seu@email.com',
      'Show Left Icon': false,
      'Show Right Icon': false
    });
  }

  // Campo de Senha
  const passwordInput = createInstanceFromSet(inputSet, {
    Size: 'Medium',
    State: 'Default',
    Filled: 'False',
    'Read-only': 'False',
    Error: 'False'
  });
  if (passwordInput) {
    passwordInput.setProperties({
      'Rótulo': 'Senha',
      'Placeholder': '••••••••',
      'Show Left Icon': false,
      'Show Right Icon': true // Olho para mostrar senha
    });
  }

  // Checkbox de Lembrar-me
  const rememberCheckbox = createInstanceFromSet(checkboxFieldSet || checkboxSet, {
    Size: 'Medium',
    Checked: 'false',
    Error: 'False'
  });
  if (rememberCheckbox) {
    rememberCheckbox.setProperties({
      'Rótulo': 'Lembrar-me'
    });
  }

  // Botão de Enviar
  const submitButton = createInstanceFromSet(buttonSet, {
    Size: 'Medium',
    Style: 'Brand',
    State: 'Default',
    Loading: 'false',
    'Icon Only': 'false'
  });
  if (submitButton) {
    submitButton.setProperties({
      'Rótulo': 'Entrar'
    });
  }

  // 6. Criar o Card de Login (Customizado com tokens de visual)
  console.log("Criando Login Card com Auto-Layout e Variables...");
  const card = figma.createFrame();
  card.name = 'Login Card';
  card.layoutMode = 'VERTICAL';
  card.primaryAxisSizingMode = 'AUTO';
  card.counterAxisSizingMode = 'FIXED';
  card.resize(400, 100); // Largura fixa 400px, altura adaptável
  
  // Espaçamento vertical (space/xl = 20px)
  if (spaceXl) {
    card.itemSpacing = spaceXl.valuesByMode[semantic.defaultModeId] || 20;
    card.setBoundVariable('itemSpacing', spaceXl);
  } else {
    card.itemSpacing = 20;
  }
  
  // Padding interno (space/3xl = 32px)
  if (space3xl) {
    const pVal = space3xl.valuesByMode[semantic.defaultModeId] || 32;
    card.paddingLeft = pVal;
    card.paddingRight = pVal;
    card.paddingTop = pVal;
    card.paddingBottom = pVal;
    card.setBoundVariable('paddingLeft', space3xl);
    card.setBoundVariable('paddingRight', space3xl);
    card.setBoundVariable('paddingTop', space3xl);
    card.setBoundVariable('paddingBottom', space3xl);
  } else {
    card.paddingLeft = 32;
    card.paddingRight = 32;
    card.paddingTop = 32;
    card.paddingBottom = 32;
  }
  
  // Cantos arredondados (radius/lg = 12px)
  if (radiusLg) {
    card.cornerRadius = radiusLg.valuesByMode[semantic.defaultModeId] || 12;
    card.setBoundVariable('cornerRadius', radiusLg);
  } else {
    card.cornerRadius = 12;
  }
  
  // Fundo (surface/default)
  if (colorBgSurface) {
    card.fills = [{ type: 'SOLID', color: hexToFigmaColor('#ffffff') }];
    card.setBoundVariable('fills', colorBgSurface);
  } else {
    card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
  }
  
  // Borda (border/subtle)
  card.strokeAlign = 'INSIDE';
  card.strokeWeight = 1;
  if (colorBorderSubtle) {
    card.strokes = [{ type: 'SOLID', color: hexToFigmaColor('#e2e8f0') }];
    card.setBoundVariable('strokes', colorBorderSubtle);
  } else {
    card.strokes = [{ type: 'SOLID', color: { r: 0.88, g: 0.91, b: 0.94 } }];
  }

  // 7. Montar a estrutura interna do Card

  // Header do Card
  const headerFrame = figma.createFrame();
  headerFrame.name = 'Header';
  headerFrame.layoutMode = 'VERTICAL';
  headerFrame.primaryAxisSizingMode = 'AUTO';
  headerFrame.counterAxisSizingMode = 'AUTO';
  headerFrame.layoutAlign = 'STRETCH';
  if (spaceSm) {
    headerFrame.itemSpacing = spaceSm.valuesByMode[semantic.defaultModeId] || 8;
    headerFrame.setBoundVariable('itemSpacing', spaceSm);
  } else {
    headerFrame.itemSpacing = 8;
  }
  headerFrame.fills = []; // Sem fundo

  const titleText = figma.createText();
  titleText.characters = 'Bem-vindo de volta';
  titleText.fontSize = 24;
  titleText.fontName = { family: 'Inter', style: 'Bold' };
  titleText.layoutAlign = 'STRETCH';
  if (colorTextStrong) {
    titleText.setBoundVariable('fills', colorTextStrong);
  }
  headerFrame.appendChild(titleText);

  const descText = figma.createText();
  descText.characters = 'Acesse sua conta para continuar';
  descText.fontSize = 14;
  descText.fontName = { family: 'Inter', style: 'Regular' };
  descText.layoutAlign = 'STRETCH';
  if (colorTextDefault) {
    descText.setBoundVariable('fills', colorTextDefault);
  }
  headerFrame.appendChild(descText);
  card.appendChild(headerFrame);

  // Formulário e Inputs
  const formFrame = figma.createFrame();
  formFrame.name = 'Form Fields';
  formFrame.layoutMode = 'VERTICAL';
  formFrame.primaryAxisSizingMode = 'AUTO';
  formFrame.counterAxisSizingMode = 'AUTO';
  formFrame.layoutAlign = 'STRETCH';
  if (spaceLg) {
    formFrame.itemSpacing = spaceLg.valuesByMode[semantic.defaultModeId] || 16;
    formFrame.setBoundVariable('itemSpacing', spaceLg);
  } else {
    formFrame.itemSpacing = 16;
  }
  formFrame.fills = [];

  if (emailInput) {
    emailInput.layoutAlign = 'STRETCH';
    formFrame.appendChild(emailInput);
  }
  if (passwordInput) {
    passwordInput.layoutAlign = 'STRETCH';
    formFrame.appendChild(passwordInput);
  }

  // Linha de ações secundárias (Lembrar-me + Esqueceu a senha)
  const helperRow = figma.createFrame();
  helperRow.name = 'Helper Row';
  helperRow.layoutMode = 'HORIZONTAL';
  helperRow.primaryAxisSizingMode = 'AUTO';
  helperRow.counterAxisSizingMode = 'AUTO';
  helperRow.layoutAlign = 'STRETCH';
  helperRow.primaryAxisAlignItems = 'SPACE_BETWEEN';
  helperRow.counterAxisAlignItems = 'CENTER';
  helperRow.fills = [];

  if (rememberCheckbox) {
    helperRow.appendChild(rememberCheckbox);
  }

  const forgotLink = figma.createText();
  forgotLink.characters = 'Esqueceu a senha?';
  forgotLink.fontSize = 14;
  forgotLink.fontName = { family: 'Inter', style: 'Medium' };
  if (colorBrandDefault) {
    forgotLink.setBoundVariable('fills', colorBrandDefault);
  }
  helperRow.appendChild(forgotLink);
  formFrame.appendChild(helperRow);
  card.appendChild(formFrame);

  // Botão de Submit
  if (submitButton) {
    submitButton.layoutAlign = 'STRETCH';
    card.appendChild(submitButton);
  }

  // Footer (Link de Cadastro)
  const footerRow = figma.createFrame();
  footerRow.name = 'Footer';
  footerRow.layoutMode = 'HORIZONTAL';
  footerRow.primaryAxisSizingMode = 'AUTO';
  footerRow.counterAxisSizingMode = 'AUTO';
  footerRow.layoutAlign = 'STRETCH';
  footerRow.primaryAxisAlignItems = 'CENTER';
  footerRow.fills = [];

  const footerText = figma.createText();
  footerText.characters = 'Não tem uma conta? ';
  footerText.fontSize = 14;
  footerText.fontName = { family: 'Inter', style: 'Regular' };
  if (colorTextDefault) {
    footerText.setBoundVariable('fills', colorTextDefault);
  }
  footerRow.appendChild(footerText);

  const signUpLink = figma.createText();
  signUpLink.characters = 'Cadastre-se';
  signUpLink.fontSize = 14;
  signUpLink.fontName = { family: 'Inter', style: 'Bold' };
  if (colorBrandDefault) {
    signUpLink.setBoundVariable('fills', colorBrandDefault);
  }
  footerRow.appendChild(signUpLink);
  card.appendChild(footerRow);

  // 8. Criar o frame principal da tela de visualização (responsivo)
  console.log("Criando layout container da tela...");
  const previewFrame = figma.createFrame();
  previewFrame.name = 'Login Screen Preview';
  previewFrame.resize(1280, 800);
  previewFrame.layoutMode = 'VERTICAL';
  previewFrame.primaryAxisAlignItems = 'CENTER';
  previewFrame.counterAxisAlignItems = 'CENTER';
  
  if (colorBgSubtle) {
    previewFrame.setBoundVariable('fills', colorBgSubtle);
  } else {
    previewFrame.fills = [{ type: 'SOLID', color: { r: 0.95, g: 0.96, b: 0.98 } }];
  }

  previewFrame.appendChild(card);
  figma.viewport.scrollAndZoomIntoView([previewFrame]);
  console.log("Tela de login criada com sucesso no Figma!");
}

run().catch(err => {
  console.error("Erro ao executar script:", err);
});
