# Changelog — BlazarLab público

## V1.3.16 — exportação PNG consciente do tema (2026-10-16)

- Corrigida a exportação PNG para identificar o tema ativo no momento do clique.
- Fundo, grade, rótulos, eixos, tooltips, barras e contornos recebem cores adequadas ao tema claro ou escuro.
- Cores explícitas de séries conhecidas são adaptadas na exportação clara, incluindo rótulos claros herdados de uma renderização anterior; gradientes de heatmap que codificam valores são preservados.
- Nenhuma fórmula, parâmetro ou dado científico foi alterado. Mantida a base de acessibilidade e responsividade da versão mais recente recebida.

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
