# Changelog — BlazarLab público

## V1.3.17 — menu, geometria responsiva e acessibilidade (2026-10-17)

- Refinado o menu principal desktop e corrigido o ícone móvel para três barras empilhadas.
- Identificados os cartões com títulos explícitos Sample Entropy, Fisher–Shannon e MSE-WPE / CI.
- Organizados os três resumos de artigos em triângulo invertido no desktop, com uma coluna em telas estreitas.
- Corrigido o espaço do título principal quando a quebra de linha é ocultada no celular.
- Geometria dos gráficos baseada na largura real do contêiner, usando `ResizeObserver` e limiar de 900 px.
- Transições de tela cheia impedem redesenho responsivo temporário, para evitar redefinição do zoom.
- Simplificados os rótulos das bandas e removidos valores sobrepostos às barras em gráficos compactos.
- Encurtadas as legendas da lente SampEn para evitar sobreposição no SVG móvel.
- Heatmap SampEn fonte × banda com maior altura por linha e matriz `m × r` com mais espaço e rolagem horizontal.
- Margens direitas ampliadas nos gráficos compactos que podiam cortar rótulos.
- Alvos de toque, tamanho de textos auxiliares e contraste do rodapé reforçados.
- Preservada a exportação PNG que acompanha o tema claro/escuro, introduzida na V1.3.16.
- Nenhuma fórmula, parâmetro ou resultado científico foi intencionalmente alterado.

## V1.5.0 — acessibilidade e responsividade (2026-10-16)

- Reorganizado o cabeçalho em telas móveis para acomodar marca, seletor de tema e menu sem colisão em larguras estreitas.
- Ampliadas as áreas de toque e reforçado o foco visível em controles interativos.
- Atualizados o nome acessível e os estados do menu, com fechamento por Escape, clique externo e navegação interna.
- Melhoradas as tabelas alternativas dos gráficos com caption, cabeçalhos de linha e região de rolagem nomeada e focalizável.
- Distinguidos gráficos estáticos e SVGs com controles internos para melhorar a semântica acessível.
- Adicionada navegação com setas e foco móvel a heatmaps interativos e à grade de sensibilidade.
- Impedido que comandos de zoom por setas capturem eventos de teclado oriundos dos controles internos dos SVGs.
- Sincronizada a preferência de redução de movimento quando ela muda durante a sessão.
- Aprimorados tipografia e espaçamento em celulares, mantendo rolagem localizada para gráficos/matrizes que necessitam de largura.
- Adicionados testes de acessibilidade estrutural e responsividade; sem mudanças de fórmulas, parâmetros ou resultados científicos.


## V1.4.0 — temas claro/escuro e limpeza da seção de pesquisa (2026-10-16)

- Adicionada alternância de tema claro e escuro no cabeçalho com ícones de sol e lua, rótulos acessíveis e estado selecionado anunciado.
- Mantido o tema escuro atual como padrão; a escolha fica salva no navegador quando o armazenamento está disponível.
- Implementada a paleta clara `#FFFFFF`, `#F0F4F8`, `#70A9FF`, `#1D4ED8` e `#0F172A`, com ajustes de superfícies, tipografia, controles e gráficos.
- Removido o cartão “Trabalho conjunto” do manuscrito de síntese na seção de resumos.
- Removida a seção “Citação do projeto”, incluindo o BibTeX e o endereço provisório.
- Atualizados os testes de integridade e os guias de publicação.
- Nenhuma fórmula, dado ou parâmetro científico foi alterado.


## V1.3.15 — estabilidade de interação e refinamento visual (2026-10-16)

- Removidas as referências ativas à exportação CSV; a funcionalidade permanece ausente do site público.
- Corrigida a causa da reinicialização das barras de ferramentas durante eventos de resize/fullscreen: controles e listeners não são recriados em redimensionamentos comuns.
- Limitado o redesenho responsivo à passagem entre geometrias móvel e desktop, preservando o estado de zoom durante ciclos de tela cheia.
- Melhorado o acionamento de tela cheia nativa e fallback, com saída por Esc para o fallback.
- Refeitos o seletor de métodos e o painel de relações em cartões equilibrados, com hierarquia, contraste e comportamento móvel aprimorados.
- Atualizados README, guia GitHub Pages, citação, versão e testes.
- Nenhuma fórmula central de Sample Entropy, Fisher–Shannon ou WPE/CI foi alterada nesta versão.

## V1.3.14 — refinamento de interface
- Refinamentos iniciais dos seletores de métodos e do resumo das relações.
- Tentativa inicial de ajuste do ciclo de tela cheia; aprofundada e corrigida na V1.3.15.

## V1.3.13 — refinamento e regressão de exportação (2026-10-16)
- Restaurada a regra tipográfica `.method-question` removida na passagem para V1.3.0.
- A versão chegou a incluir exportação CSV dos dados sintéticos; ela foi removida a pedido na V1.3.14 e permanece ausente.
- Removido o cálculo de três séries introdutórias de código legado que já não eram usadas pelos painéis sincronizados multibanda.
- Nenhuma fórmula central de Sample Entropy, Fisher–Shannon ou WPE/CI foi alterada.

## V1.3.0 — exploração sincronizada multibanda (2026-10-16)
- Nova seleção compartilhada de fonte sintética e banda energética para as três metodologias.
- Heatmap de SampEn para 24 fontes sintéticas × oito bandas, com células selecionáveis.
- Heatmap WPE de oito bandas × oito escalas temporais e trajetória Fisher–Shannon da fonte ativa entre bandas.
- Conectadas seleções de banda às curvas, ao plano de informação e às relações métricas.
- Mapa de sensibilidade SampEn m × r com 50 combinações por banda e visão das oito bandas.
- Suporte móvel às matrizes e controles de zoom, tela cheia, PNG e tabelas acessíveis.
- Distinção explícita entre dados sintéticos e estatísticas publicadas de OVRO 15 GHz.

## V1.2.5 — estabilização, leitura móvel e sensibilidade SampEn
- Cartões educativos equilibrados, mapa m × r ampliado, interações e controles responsivos, tabelas acessíveis, metadados e testes automatizados.
