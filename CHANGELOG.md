# Changelog — BlazarLab público

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
