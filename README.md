# BlazarLab — vitrine pública (V1.3.17)

O BlazarLab é uma vitrine pública de divulgação científica sobre três perspectivas complementares para analisar variabilidade de blazares: **Sample Entropy (SampEn)**, **Fisher–Shannon** e **MSE-WPE / Complexity Index (CI)**. A V1.3.17 mantém os temas claro/escuro e as melhorias de acessibilidade da versão que você enviou e lapida navegação, visualização multibanda e responsividade.

Os cenários interativos são sintéticos e determinísticos; não representam observações astronômicas nem substituem a ferramenta interna de cálculos. Os resultados reportados nos manuscritos são apresentados separadamente dos valores sintéticos.

## Novidades V1.3.17

- Menu desktop agrupado visualmente, botão móvel com três barras verticais e áreas de interação maiores.
- Nomes dos métodos destacados nos três cartões introdutórios.
- Os três cartões de resumos dos artigos aparecem em triângulo invertido em desktop; no celular são organizados em uma coluna.
- Corrigido o espaço do título principal quando a quebra de linha é ocultada em telas estreitas.
- Geometria dos gráficos orientada pela largura real do contêiner com `ResizeObserver` e limiar responsivo de 900 px.
- Supressão de redesenho responsivo imediato no ciclo de entrar/sair de tela cheia para evitar reset do estado de zoom.
- Rótulos abreviados e valores numéricos sobre as barras omitidos em gráficos compactos onde se sobrepunham.
- Legendas da lente SampEn encurtadas em contêineres estreitos; margem direita ampliada nos gráficos em que rótulos estavam encostando no limite.
- Heatmap SampEn fonte × banda com linhas maiores e rolagem interna; mapa `m × r` com espaço de leitura maior e rolagem horizontal.
- Alvos de toque maiores, tipografia auxiliar reforçada e contraste do rodapé escuro melhorado.
- Mantida a exportação PNG com paleta sincronizada ao tema claro/escuro, introduzida na V1.3.16.

## Conteúdo do pacote

- `index.html` — página pública.
- `styles.css` — identidade visual, temas, acessibilidade visual e comportamento responsivo.
- `blazarlab.js` — visualizações, cálculos demonstrativos e interações.
- `assets/` — favicon e prévia para compartilhamento.
- `tests/` — verificações estáticas, testes de fumaça e regressão, exportação PNG por tema e layout responsivo.
- `CHANGELOG.md`, `VERSION`, `LICENSE` — histórico, versão e licença.

## Publicação no GitHub Pages

1. Faça backup da versão pública atual.
2. Extraia o ZIP `blazarlab-public-v1.3.17-lapidada.zip`.
3. Copie o conteúdo da pasta `blazarlab_v1.3.17/` para a raiz do repositório público, mantendo `index.html` na raiz.
4. Em **Settings → Pages**, escolha a branch e a pasta configuradas.
5. Teste os temas claro/escuro, navegação por teclado, gráficos, mapas, zoom, tela cheia e exportação PNG em desktop e celular.

## Testes locais

Com Node.js instalado, execute:

```sh
node --check blazarlab.js
node tests/site-integrity.cjs
node tests/accessibility-responsive.cjs
node tests/smoke-test.cjs
node tests/fullscreen-regression.cjs
node tests/png-theme-export.cjs
node tests/layout-regressions.cjs
VIEWPORT_WIDTH=390 node tests/smoke-test.cjs
```

Os testes automatizados verificam estrutura, geração das visualizações, interações e presença de recursos de acessibilidade. Eles não substituem testes visuais em navegadores e leitores de tela reais e não constituem certificação WCAG.

## Escopo científico

A galeria usa dados sintéticos identificados no site. Estatísticas nos cartões de resultados são resultados reportados pelos estudos do grupo e não são recalculadas com os sinais sintéticos. Correlações são apresentadas como associações, não causalidade; as três métricas não são equivalentes.
