# BlazarLab — vitrine pública (v1.3.15)

O BlazarLab é uma vitrine pública de divulgação científica sobre três perspectivas complementares para analisar variabilidade de blazares: **Sample Entropy (SampEn)**, **Fisher–Shannon** e **MSE-WPE / Complexity Index (CI)**. Mantém a expansão multibanda da V1.3.0, os refinamentos de estabilidade e a separação do aplicativo interno de cálculos.

Esta versão concentra-se na estabilidade dos controles dos gráficos e no refinamento dos elementos de navegação e comparação científica. A página pública usa sinais sintéticos demonstrativos em oito bandas de energia; eles não substituem dados observacionais nem os cálculos da ferramenta interna.

## Novidades V1.3.15

- Removida a funcionalidade de exportação CSV dos dados demonstrativos e limpas as instruções que ainda a descreviam.
- Corrigido o ciclo de redimensionamento/tela cheia para não reinicializar barras de ferramentas, duplicar controles ou redefinir a opção de zoom ativo.
- O redesenho responsivo ocorre apenas quando a janela cruza o limite entre geometria móvel e desktop; os mesmos elementos SVG mantêm seus eventos.
- Refinados os seletores de métodos: três opções igualmente distribuídas, indicação visual mais clara do método ativo e foco de teclado visível.
- Reorganizada a seção “Ligação entre resultados” em três cartões alinhados, um por associação reportada, com distinção visual das métricas e layout adaptável.
- Atualizadas versão, citação, guia de publicação, changelog e testes de integridade.

## Conteúdo do pacote

- `index.html` — página pública.
- `styles.css` — identidade visual e comportamento responsivo.
- `blazarlab.js` — visualizações, cálculos demonstrativos e interações.
- `assets/social-preview.svg` — prévia para compartilhamento.
- `tests/` — verificações estáticas e testes de fumaça.
- `CHANGELOG.md`, `VERSION`, `LICENSE` — histórico, versão e licença.

## Publicação no GitHub Pages

1. Use o repositório separado do site público; não substitua a ferramenta interna.
2. Extraia o ZIP e envie os arquivos para a raiz do repositório (`index.html` na raiz).
3. Em **Settings → Pages**, escolha a branch principal e a pasta `/(root)`.
4. Confira seletores, oito bandas, heatmaps, zoom, reset, tela cheia e exportação PNG em desktop e celular.
5. Confirme a URL definitiva antes de completar o endereço canônico no modelo de citação.

## Testes locais

Com Node.js instalado, execute:

```sh
node --check blazarlab.js
node tests/site-integrity.cjs
node tests/smoke-test.cjs
node tests/fullscreen-regression.cjs
VIEWPORT_WIDTH=390 node tests/smoke-test.cjs
```

Os testes automatizados validam a estrutura estática, a geração das visualizações, a sincronização da galeria e a geometria móvel. Eles não substituem a conferência visual em navegadores reais.

## Escopo científico

Os dados da galeria são sintéticos, reproduzíveis e identificados no site. Estatísticas resumidas nos cartões de resultados são apresentadas como resultados reportados nos estudos do grupo e não são recalculadas com os sinais sintéticos. Os coeficientes mostrados no painel comparativo descrevem associações, não causalidade; as três métricas não são equivalentes.
