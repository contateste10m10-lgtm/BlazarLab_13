# BlazarLab — vitrine pública (v1.2.1)

O BlazarLab é uma experiência educativa para apresentar três perspectivas de análise da variabilidade de blazares:

1. **Sample Entropy (SampEn)** — persistência local de padrões semelhantes;
2. **Plano Fisher–Shannon** — descrição conjunta da distribuição do fluxo e da estrutura local da densidade;
3. **MSE-WPE / Complexity Index (CI)** — diversidade de padrões ordinais em diferentes escalas temporais.

Esta edição usa a identidade visual do Multiband Entropy Lab V0.22 como referência, mas foi separada deliberadamente do aplicativo de cálculo para dados próprios. O pacote público não contém o carregador de arquivos, a interface de análise individual nem os módulos internos do aplicativo de cálculo.

## Executar localmente

Abra `index.html` em um navegador moderno. O site não depende de bibliotecas JavaScript remotas. Para testar como um site estático, execute `python -m http.server 8000` na pasta e acesse `http://localhost:8000`. O teste de fumaça incluído pode ser executado com `node tests/smoke-test.cjs` em uma instalação de Node.js.

## Publicar no GitHub Pages

1. Crie um repositório **separado** para o BlazarLab público; não substitua o repositório do aplicativo interno de análise.
2. Extraia o ZIP e envie os arquivos e pastas para a raiz do novo repositório, de modo que `index.html` fique na raiz.
3. Abra **Settings → Pages** e configure a publicação para a branch e pasta que você utiliza (normalmente `main` e `/(root)`).
4. Aguarde a publicação e teste navegação, gráficos em tela cheia e em dispositivos móveis.

## Dados e métodos demonstrativos

- Os três cenários introdutórios têm 240 pontos sintéticos determinísticos.
- A galeria multibanda contém 24 fontes demonstrativas balanceadas artificialmente (oito por rótulo: FSRQ, BL Lac e AGN), cada uma com oito bandas energéticas `14–20`, `20–24`, `24–35`, `35–50`, `50–75`, `75–100`, `100–150` e `150–195 keV`; cada curva tem 144 pontos. Os rótulos das classes são apenas ilustrativos: não representam fontes observadas nem a proporção real de classes na população de blazares.
- Nenhum dado de telescópio é baixado ou importado. Os gráficos de oito bandas usam séries sintéticas. Os números publicados nos cartões de resultado referem-se separadamente aos estudos de rádio a 15 GHz do OVRO, não às bandas energéticas demonstrativas.
- A SampEn demonstrativa usa `m_SE = 2`, fator de tolerância `r_fator = 0,2` e tolerância absoluta `r_abs = r_fator × σ`, autoencontros excluídos, pares não ordenados contados uma vez e os mesmos `N − m` inícios de padrão para as contagens A e B. O mapa `m × r` recalcula a estimativa para `m = 1, 2, 3` e `r_fator = 0,10 … 0,30`.
- O índice de modulação intrínseco demonstrativo usa `100 × sqrt(s² − média(erro²)) / média(fluxo)`, quando a estimativa da variância intrínseca é não negativa.
- A variabilidade robusta desta galeria é definida explicitamente como `100 × 1,4826 × MAD / |mediana(fluxo)|`. Essa escolha operacional pertence ao exemplo; não afirmamos que coincide com toda métrica externa chamada “variabilidade robusta”.
- O plano Fisher–Shannon estima a densidade por KDE gaussiana e integra numericamente a entropia diferencial e a informação de Fisher. É uma demonstração educativa e não uma afirmação de que o manuscrito Fisher–Shannon do grupo usa o mesmo estimador.
- A MSE-WPE usa coarse-graining em `τ = 1 … 8`, dimensão ordinal `d = 4`, atraso de uma amostra e peso de vetor igual à variância local. O CI demonstrativo é a soma das oito WPE não normalizadas em nats; para `d = 4`, o máximo teórico por escala é `ln(4!)`. Na galeria multibanda, as curvas WPE, os resumos por banda e as relações com métricas de variabilidade são calculados diretamente das séries sintéticas, não interpolados a partir de estatísticas dos artigos.
- Todos os gráficos SVG têm zoom, reset, tela cheia e exportação PNG. Use `Ctrl + roda` para ampliar e `Ctrl + arraste` para mover a janela de visualização. Os controles coloridos de banda alternam a visibilidade das curvas sem alterar os valores.

Os valores demonstrativos não devem ser comparados numericamente aos artigos sem alinhar definições, normalização, bandas, amostragem e estimadores. A população sintética equilibrada não é estatisticamente representativa da população de blazares, e suas correlações não constituem evidência astrofísica. Os cenários são ferramentas didáticas e não simulam integralmente a física dos jatos relativísticos nem a resposta instrumental Swift-BAT/OVRO.

## Galeria multibanda e gráficos

A galeria mantém os quatro gráficos de SampEn inspirados na área avançada da V0.22: **SampEn média por banda**, **distribuição de SampEn por classe**, **SampEn × índice de modulação intrínseco** e **SampEn × variabilidade robusta**. Também inclui o mapa de sensibilidade `m × r`.

As opções análogas para os demais métodos respeitam a natureza de cada medida: o plano Fisher–Shannon é codificado por classe e pode ser filtrado por banda; a informação de Fisher pode ser comparada com o índice de modulação ou com a medida robusta. Para MSE-WPE/CI, há WPE × escala nas oito bandas, CI médio por banda, distribuição do CI por classe, CI × variabilidade e a relação entre CI e SampEn. Os resultados publicados são anotados separadamente e não são recalculados a partir dos dados sintéticos.

Cada gráfico tem zoom, reset, tela cheia e exportação PNG. Use `Ctrl + roda` para ampliar e `Ctrl + arraste` para mover a janela de visualização. Os pontos incluem tooltips com informações da banda, fonte sintética e métricas calculadas.

## Referências e transparência

As referências metodológicas e os resumos do grupo estão listados no site. Os artigos mantêm os direitos de seus respectivos titulares; a citação ou link não transfere esses direitos. Verifique os direitos de divulgação e licenciamento dos manuscritos e da implementação antes de distribuir versões públicas.

## Licença

Consulte `LICENSE` para a licença do software neste pacote.
