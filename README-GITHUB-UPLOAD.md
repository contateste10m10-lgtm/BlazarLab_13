# Publicar BlazarLab V1.3.13 no GitHub Pages

1. Crie ou utilize o repositório separado do BlazarLab público, sem substituir o aplicativo interno.
2. Extraia o ZIP e envie o conteúdo para a raiz do repositório; `index.html` deve ficar na raiz.
3. Em **Settings → Pages**, configure branch principal e raiz (`/(root)`).
4. Teste o seletor de fonte/banda, os heatmaps, o download CSV (1.152 linhas de dados) e os gráficos em desktop e celular.
5. Quando confirmar a URL pública, atualize o endereço canônico e o modelo de citação.

Testes: `node --check blazarlab.js`, `node tests/site-integrity.cjs` e `node tests/smoke-test.cjs`. O workflow GitHub Actions executa os testes em `push` e `pull_request`.
