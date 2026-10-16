# Publicar o BlazarLab (guia rápido)

**Importante:** publique o BlazarLab em um repositório separado. O repositório do aplicativo interno de análise não deve ser substituído por este pacote.

1. Crie um repositório novo no GitHub chamado, por exemplo, `blazarlab`.
2. Extraia o ZIP do BlazarLab.
3. Envie o conteúdo da pasta extraída para a raiz do repositório. `index.html`, `styles.css`, `blazarlab.js`, `README.md`, `LICENSE` e a pasta `assets/` devem ficar diretamente na raiz.
4. Abra **Settings → Pages**.
5. Selecione a branch `main` e a pasta `/(root)` (ou a estrutura equivalente usada no seu repositório).
6. Salve e aguarde o endereço ser publicado.
7. Confira desktop e celular: navegação, seleção dos três cenários e os perfis comparativos MSE-WPE, os três painéis gráficos, fórmulas, resumos e links DOI.

O site usa apenas HTML, CSS, SVG e JavaScript nativos. Não precisa copiar bibliotecas de `assets/vendor/` e não exige CDN para os gráficos.
