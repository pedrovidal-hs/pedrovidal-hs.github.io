# Neusa Vidal — Consultoria em qualidade e segurança dos alimentos

Site institucional de página única, publicado em
**[neusavidalassessoria.com.br](https://neusavidalassessoria.com.br)** via GitHub Pages.

Estático puro: sem build, sem dependências, sem recursos de terceiros.
Editar os arquivos e dar `push` já publica.

## Estrutura

```
index.html          página única (todo o conteúdo e os dados estruturados)
404.html            página de erro (o GitHub Pages usa automaticamente)
css/styles.css      folha de estilo única, com os tokens de design no topo
js/main.js          menu, scrollspy, animações e envio do formulário
font/               Glacial Indifference (corpo) e Afrah (títulos)
img/                logotipo em vários tamanhos, retrato, imagem de compartilhamento
CNAME               domínio personalizado
robots.txt          liberado para indexação, aponta o sitemap
sitemap.xml         uma URL
site.webmanifest    ícones e cores para instalação em celular
.nojekyll           desliga o Jekyll (site é estático, não precisa de build)
```

## Como rodar localmente

Não abra o `index.html` com duplo clique: as fontes e o `fetch` do formulário
precisam de um servidor HTTP. Rode na pasta do projeto:

```bash
python -m http.server 5510
```

E acesse `http://localhost:5510`.

## Ao editar

- **Cores e tipografia** ficam em `:root`, no topo do `css/styles.css`.
  Os tons `500` da marca são decorativos: têm contraste abaixo de 3:1 em fundo
  branco e não devem receber texto. Para texto use `700` ou mais escuro.
- **A fonte Afrah não tem `Ç` maiúsculo nem travessões.** Títulos em caixa alta
  ou com `—` caem no fallback e destoam. Use caixa normal.
- **Ao alterar uma pergunta do FAQ**, altere também o texto correspondente no
  `FAQPage` do JSON-LD, no fim do `index.html`. O Google desqualifica o
  resultado enriquecido se o schema descrever texto que não está na página.
- **O formulário** envia para o Formspree (`formspree.io/f/xqkoklqp`). O JS
  intercepta o envio para dar retorno na própria página; sem JS, o POST normal
  continua funcionando.

## Pendências conhecidas

- As respostas do FAQ e a seção "Como funciona" precisam de revisão técnica da
  Neusa: são textos redigidos a partir da lista de serviços, não ditados por ela.
- Não há `areaServed` nem `address` nos dados estruturados, por decisão de não
  publicar localização. Isso limita o SEO local. Há um comentário no
  `index.html` com o bloco pronto para reativar.
- Sem e-mail e sem redes sociais nos contatos, por falta dos dados.
