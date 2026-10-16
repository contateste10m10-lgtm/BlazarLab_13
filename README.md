# BlazarLab — vitrine pública (v1.1)

O BlazarLab é uma experiência educativa para apresentar três perspectivas de análise da variabilidade de blazares:

1. **Sample Entropy (SampEn)** — persistência local de padrões semelhantes;
2. **Plano Fisher–Shannon** — descrição conjunta da distribuição e da estrutura local da densidade;
3. **MSE-WPE / Complexity Index (CI)** — diversidade de padrões ordinais em diferentes escalas temporais.

Esta edição foi derivada visualmente do projeto Multiband Entropy Lab V0.22, mas foi separada deliberadamente do aplicativo de cálculo para dados próprios. O pacote público contém apenas a página educativa, os estilos, o motor das demonstrações sintéticas, o favicon e a documentação de implantação. Não contém o carregador de arquivos nem o aplicativo interno de análise.

## Executar localmente

Abra `index.html` em um navegador moderno. O site não depende de bibliotecas JavaScript remotas e pode ser visualizado localmente. Para testar como um site estático, também é possível executar um servidor local simples na pasta:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`. Para executar o teste de fumaça incluído, use `node tests/smoke-test.cjs` em uma instalação de Node.js.

## Publicar no GitHub Pages

1. Crie um repositório **separado** para o BlazarLab público. Não substitua o repositório que contém o aplicativo privado de análise.
2. Extraia o ZIP e envie os arquivos e pastas desta pasta para a raiz do novo repositório, de modo que `index.html` fique na raiz.
3. No GitHub, abra **Settings → Pages** e configure a publicação a partir da branch e pasta que você utiliza (normalmente `main` e `/(root)`).
4. Aguarde o GitHub Pages publicar o site e teste os links, a navegação em celular e os três cenários.

Se for publicado em uma subpasta, o site usa caminhos relativos para o CSS, JavaScript e favicon.

## Dados e demonstrações

- Os três cenários principais têm 240 observações sintéticas e são gerados deterministicamente no navegador.
- Nenhum dado de telescópio é baixado, carregado ou exibido como se fosse sintético.
- A SampEn demonstrativa usa `m = 2`, `r = 0,2σ`, autoencontros excluídos, pares não ordenados contados uma vez e os mesmos `N − m` inícios de padrão para as contagens A e B.
- O plano Fisher–Shannon de demonstração estima a densidade por kernel gaussiano (KDE), e integra numericamente a entropia diferencial e a informação de Fisher. É uma demonstração educativa, não uma afirmação de que o manuscrito Fisher–Shannon do grupo usa o mesmo estimador.
- A MSE-WPE calculada usa coarse-graining em escalas `τ = 1 … 8`, dimensão ordinal `d = 4`, atraso de uma amostra e peso de cada vetor igual à variância local. O CI demonstrativo é a soma das oito WPE não normalizadas em nats; para `d = 4`, o máximo teórico por escala é `ln(4!)`.
- O gráfico multiescala também inclui duas curvas de referência sintéticas para ilustrar a tendência descrita no resumo: queda mais lenta na faixa de baixa modulação e queda mais acentuada na faixa de alta modulação. Os extremos relatados no resumo (4,10 → 2,88 e 3,88 → 1,83) são reescalados proporcionalmente para caber no limite teórico `ln(4!)`; os pontos intermediários são interpolados. Essas linhas tracejadas não são medições OVRO nem resultados individuais calculados pela função WPE. A curva âmbar e o CI, por sua vez, são calculados do sinal sintético selecionado.

Os resultados calculados neste site não devem ser comparados numericamente com artigos do grupo sem alinhar primeiro as definições, a normalização e os estimadores usados em cada estudo. A página identifica os cenários como sintéticos e não reconstrói observações a partir de médias de artigos.

## Conteúdo científico e referências

As referências fundamentais e os resumos do grupo estão listados no próprio site, com links DOI para os artigos metodológicos. Consulte as publicações ou versões completas dos manuscritos para os detalhes necessários à reprodução dos resultados.

## Limitações conhecidas

- A demonstração Fisher–Shannon usa KDE com largura de banda automática e integração numérica simples; diferentes escolhas de estimação podem mudar os valores.
- O algoritmo demonstrativo de SampEn cobre a convenção descrita na página, mas não substitui a validação independente nem uma auditoria de cada condição de contorno para uso científico.
- A convenção de dimensão e normalização da WPE deve ser verificada na versão de referência de cada manuscrito antes de uma comparação quantitativa entre resultados. Por isso, os perfis tracejados foram deliberadamente tratados como comparativos qualitativos e reescalados para a convenção `d = 4` desta demonstração.
- Os cenários são ferramentas didáticas; não simulam integralmente a física de jatos relativísticos ou o processo instrumental do OVRO.

## Licença

Consulte `LICENSE` para a licença dos arquivos de software deste pacote. Os artigos citados mantêm os direitos de seus respectivos titulares; a citação ou link para um artigo não transfere esses direitos.
