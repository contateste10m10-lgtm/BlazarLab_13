# Histórico de alterações do BlazarLab

## V1.2.1 — Lapidação de resultados e relações entre métodos (2026-10-15)

- Reorganizado o cartão de resultados SampEn com estatísticas de amostra, faixa, mediana, parâmetros, correlações e comparação entre classes, todos identificados como resultados observacionais do OVRO 15 GHz.
- Adicionado filtro por banda no plano Fisher–Shannon; a vista completa mostra 192 curvas sintéticas e cada banda selecionada mostra 24 fontes demonstrativas.
- Adicionado gráfico CI × SampEn para explorar a relação entre complexidade multiescala e irregularidade em escala única. A correlação publicada no estudo é citada separadamente e não é atribuída à população sintética.
- Estendidos testes para o novo gráfico e filtro de banda; testada exportação PNG no navegador.

## V1.2 — Galeria multibanda e interatividade (2026-10-15)

- Expandida a apresentação de Sample Entropy: média por banda com ±1 desvio-padrão, distribuição por classe sintética, SampEn × índice de modulação, SampEn × variabilidade robusta e mapa de sensibilidade `m × r`.
- Adicionadas oito curvas de energia (14–195 keV) para uma fonte sintética selecionável, com botões para mostrar/ocultar cada banda.
- Adicionado plano Fisher–Shannon em 192 combinações fonte × banda sintéticas e gráfico de informação de Fisher contra o índice de modulação ou variabilidade robusta.
- Adicionadas curvas MSE-WPE nas oito bandas para a fonte selecionada, CI médio por banda, distribuição do CI por classe e CI contra métrica de variabilidade selecionável.
- Todos os gráficos demonstrativos receberam zoom, reset, tela cheia e exportação PNG; Ctrl + roda amplia e Ctrl + arraste move a janela de visualização.
- Removidos os perfis MSE tracejados que eram interpolados de extremos de resumos de artigos; os painéis multibanda usam resultados calculados de séries sintéticas.
- Reforçada a explicação da diferença entre `m_SE` (dimensão de padrão), `r` (tolerância) e `m_int` (índice de modulação intrínseco).
- Ampliados os resultados SampEn, Fisher–Shannon e MSE-WPE/CI com estatísticas e relações explicitamente identificadas como resultados publicados do OVRO 15 GHz, distintas da galeria sintética em oito bandas.
- A variabilidade robusta demonstrativa é definida como 100 × 1,4826 × MAD / |mediana|; os valores são sintéticos e não são apresentados como uma métrica publicada ou universal.

## V1.1 — Demonstração MSE-WPE calibrada

- Adicionadas duas curvas comparativas sintéticas de referência para explicar tendências relatadas no resumo MSE-WPE. Os pontos intermediários eram interpolados e os extremos reescalados ao máximo teórico para d = 4.
- Documentados parâmetros, unidades e limites da demonstração multiescala.

## V1.0 — Primeira vitrine pública

- Separação do site público educativo em relação ao aplicativo interno de cálculo.
- Introdução aos três métodos: Sample Entropy, plano Fisher–Shannon e MSE-WPE/CI.
- Séries sintéticas determinísticas, fórmulas, resultados relatados pelo grupo, resumos e referências metodológicas.
