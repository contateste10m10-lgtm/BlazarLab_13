# Histórico de alterações do BlazarLab

## V1.3.13 — refinamento, exportação e testes de regressão (2026-10-16)

- Restaurada a regra tipográfica `.method-question` removida na passagem para V1.3.0.
- Adicionado botão para exportar os dados da fonte selecionada nas oito bandas em CSV UTF-8, com origem sintética e versão documentadas.
- Exportação inclui 1.152 observações (8 bandas × 144 amostras), fluxo e erro medidos simulados, classe e índice da amostra.
- Removido o cálculo de três séries introdutórias de código legado que já não eram usadas pelos painéis sincronizados multibanda.
- README, guia de publicação, citação, versão e testes atualizados para V1.3.13.
- Nenhuma fórmula central de Sample Entropy, Fisher–Shannon ou WPE/CI foi alterada nesta lapidação.

## V1.3.0 — exploração sincronizada multibanda (2026-10-16)

- Nova seleção compartilhada de fonte sintética e banda energética para as três metodologias.
- Adicionado heatmap de SampEn para 24 fontes sintéticas × oito bandas, com células selecionáveis.
- Adicionado heatmap WPE de oito bandas × oito escalas temporais e trajetória Fisher–Shannon da fonte ativa entre bandas.
- Conectadas seleções de banda às curvas, ao plano de informação e às relações métricas.
- Mapa de sensibilidade SampEn m × r com 50 combinações por banda e visão das oito bandas.
- Adicionado suporte de layout móvel às matrizes e mantidos controles de zoom, tela cheia, PNG e tabelas acessíveis.
- Mantida distinção explícita entre dados sintéticos e estatísticas publicadas do OVRO 15 GHz.

## V1.2.5 — estabilização, leitura móvel e sensibilidade SampEn

- Cartões educativos equilibrados, mapa m × r ampliado, interações e controles responsivos, tabelas acessíveis, metadados e testes automatizados.
