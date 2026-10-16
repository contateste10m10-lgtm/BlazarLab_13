# BlazarLab — vitrine pública (v1.3.13)

BlazarLab apresenta três perspectivas complementares sobre variabilidade de blazares: **Sample Entropy (SampEn)**, **plano Fisher–Shannon** e **MSE-WPE / Complexity Index (CI)**. Esta versão lapida a expansão multibanda da V1.3.0, mantendo a separação do aplicativo interno de cálculos. Recupera a hierarquia visual dos cartões científicos, remove cálculos demonstrativos redundantes da inicialização e acrescenta exportação CSV das oito séries da fonte selecionada.

## Executar e testar

Abra `index.html` num navegador moderno ou use `python -m http.server 8000`. O site não depende de bibliotecas JavaScript remotas. Com Node.js, execute:

```sh
node --check blazarlab.js
node tests/site-integrity.cjs
node tests/smoke-test.cjs
```

## Novidades V1.3.13

- Restaurada a tipografia dos títulos-pergunta (`.method-question`) removida na V1.3.0.
- Adicionado download local de CSV com 8 bandas × 144 pontos da fonte sintética selecionada (fluxo, erro, banda, índice temporal, classe, origem sintética e versão).
- Removido o cálculo de três séries introdutórias antigas que não eram utilizadas nos painéis multibanda, reduzindo trabalho redundante na inicialização.
- Atualizados changelog, instruções de publicação, citações e testes para identificar a V1.3.13.
- Reforçados testes de integridade da identidade visual, da versão e do arquivo de exportação.


### Recursos multibanda preservados da V1.3.0

- Um seletor de fonte sintética e banda energética alimenta as três “lentes” de análise.
- Heatmap de SampEn `24 fontes sintéticas × 8 bandas`; clicar em célula escolhe fonte/banda e atualiza os métodos.
- Heatmap MSE-WPE `8 bandas × 8 escalas temporais`; clicar numa célula sincroniza a banda e destaca a escala `τ` no gráfico de linhas correspondente. Os pontos das matrizes aceitam seleção por teclado.
- Trajetória Fisher–Shannon de uma fonte ao longo das oito bandas, com ponto ativo destacado.
- Relação sintética CI × SampEn, mantendo separados os coeficientes publicados para o OVRO 15 GHz.
- Mapa de sensibilidade `m × r` com 50 combinações por banda e visão de todos os oito mapas.
- A camada de Sample Entropy mantém quatro visualizações complementares: média por banda, distribuição por classe, SampEn × modulação intrínseca e SampEn × variabilidade robusta.

## Dados demonstrativos e convenções

A galeria contém 24 fontes sintéticas equilibradas artificialmente, cada uma com oito bandas (`14–20`, `20–24`, `24–35`, `35–50`, `50–75`, `75–100`, `100–150` e `150–195 keV`) e 144 pontos por banda. A seleção sincroniza a mesma série nas três metodologias sempre que a definição permitir. Estes sinais não são observações reais do Swift-BAT nem do OVRO; as classes são rótulos didáticos, não proporções reais de blazares.

SampEn usa `m_SE = 2`, `r_abs = 0,2σ`, autoencontros excluídos e contagens A/B com os mesmos inícios. O mapa `m × r` usa `m = 1…5` e `r_fator = 0,05…0,50`; estabilidade ±10% é critério operacional, não intervalo de confiança. A variabilidade robusta demonstrativa é `100 × 1,4826 × MAD / |mediana(fluxo)|`.

Fisher–Shannon demonstra uma KDE gaussiana e integra numericamente entropia diferencial e informação de Fisher. O gráfico usa `H` diretamente quando assim indicado e não deve ser confundido com a formulação clássica que usa potência entrópica `N_X`. MSE-WPE usa `τ=1…8`, dimensão ordinal `d=4`, atraso de uma amostra, peso de vetor igual à variância local e CI demonstrativo definido como soma discreta das oito WPE não normalizadas em nats. Os números do CI e da WPE sintéticos não reproduzem automaticamente os resultados do manuscrito; alinhar convenções é necessário antes de qualquer comparação.

O cartão “Resultados do OVRO 15 GHz” usa estatísticas relatadas nos resumos/manuscritos do grupo e está separado da galeria sintética. Os coeficientes de correlação observacionais não são aplicados aos pontos sintéticos.

## Exportação de dados sintéticos

O botão **Baixar CSV · 8 bandas** exporta a fonte selecionada em formato longo: 1.152 linhas de observações (8 bandas × 144 amostras) mais o cabeçalho. Cada linha identifica a versão do site, a origem `synthetic_demo`, a fonte, a classe didática, a banda energética, o índice da amostra, o fluxo sintético e o erro sintético. Os valores não são observações Swift-BAT/OVRO nem arquivos científicos reais. O arquivo usa UTF-8 e separador vírgula; os números usam ponto decimal para facilitar a leitura por ferramentas de análise.

## Interação

Gráficos com zoom ativável, roda, arraste, seleção retangular (Shift + arraste), duplo clique para restaurar, teclado, pinça quando o zoom está ativo, tela cheia, PNG e tabela de dados. Os heatmaps largos usam rolagem dentro do próprio quadro em telas pequenas; o mapa m×r e o heatmap WPE recalculam sua geometria para preservar legibilidade, e os outros gráficos também adaptam o desenho ao viewport.

## Publicação e citação

Crie um repositório público separado do aplicativo de cálculos internos. Atualize o endereço canônico, `og:url` e o modelo “Como citar” somente quando a URL final estiver confirmada. Verifique direitos de divulgação de artigos/manuscritos e licença com o grupo/NIT antes da publicação.

## Licença

Consulte `LICENSE`.
