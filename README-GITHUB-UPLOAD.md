# Publicar BlazarLab V1.3.15 no GitHub Pages

1. Use o repositório dedicado à vitrine pública do BlazarLab, separado do aplicativo interno de cálculos.
2. Extraia o ZIP e envie o conteúdo para a raiz do repositório; `index.html` deve ficar diretamente na raiz.
3. Em **Settings → Pages**, configure a branch principal e a pasta `/(root)`.
4. Teste a seleção de método, os seletores de fonte/banda, heatmaps, zoom, Reset, tela cheia e exportação PNG em desktop e celular.
5. A exportação CSV dos dados demonstrativos não faz parte desta versão.
6. Quando a URL pública definitiva estiver confirmada, atualize o endereço canônico e complete o modelo de citação.

Testes locais: `node --check blazarlab.js`, `node tests/site-integrity.cjs` e `node tests/smoke-test.cjs` e `node tests/fullscreen-regression.cjs`. O workflow GitHub Actions executa verificações automáticas em `push` e `pull_request`.
