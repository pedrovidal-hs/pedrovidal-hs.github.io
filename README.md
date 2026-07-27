# Neusa Vidal — Consultoria em qualidade e segurança dos alimentos

Site institucional de página única, publicado em
**[pedrovidal-hs.github.io](https://pedrovidal-hs.github.io)** via GitHub Pages.

Estático puro: sem build, sem dependências, sem recursos de terceiros.
Editar os arquivos e dar `push` já publica.

> **Endereço provisório.** O domínio definitivo é `neusavidalassessoria.com.br`,
> ainda não registrado. Enquanto isso o site roda na URL do GitHub, que contém
> o nome de usuário. Veja *Migrar para o domínio próprio* no fim deste arquivo.

## Estrutura

```
index.html          página única (todo o conteúdo e os dados estruturados)
404.html            página de erro (o GitHub Pages usa automaticamente)
css/styles.css      folha de estilo única, com os tokens de design no topo
js/main.js          menu, scrollspy, animações e envio do formulário
font/               Glacial Indifference (corpo) e Afrah (títulos)
img/                logotipo em vários tamanhos, retrato, imagem de compartilhamento
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
- **A fonte Afrah não tem travessões** (`–` `—`), nem `…`, `°`, `º`, `ª`.
  Títulos com esses caracteres caem no fallback e destoam. Prefira vírgula,
  dois-pontos ou hífen simples.
- **A cedilha da Afrah foi reconstruída por nós.** A fonte original não tinha
  glifo de cedilha e mapeava `ç` (U+00E7) para `Aacute`, então o `ç` renderizava
  como `Á` no arquivo original e desaparecia no subset, caindo no fallback
  (mais pesado, com aparência de negrito). Os glifos `ccedilla` e `Ccedilla`
  foram compostos a partir do `c`/`C` mais a vírgula da própria fonte, reduzida
  a 85% e descida até `-216` unidades. **Ao trocar ou reinstalar a Afrah,
  refaça essa correção**, senão o `ç` volta a quebrar.
- **Ao alterar uma pergunta do FAQ**, altere também o texto correspondente no
  `FAQPage` do JSON-LD, no fim do `index.html`. O Google desqualifica o
  resultado enriquecido se o schema descrever texto que não está na página.
- **O formulário** envia para o Formspree (`formspree.io/f/xqkoklqp`). O JS
  intercepta o envio para dar retorno na própria página; sem JS, o POST normal
  continua funcionando.

## Publicar

O repositório se chama `pedrovidal-hs.github.io`, ou seja, é um *user site*:
o GitHub Pages serve na **raiz** do domínio, e não em subpasta. É por isso que
os caminhos absolutos (`href="/"` no `404.html`, `start_url` no manifest)
funcionam.

Em **Settings → Pages**, a origem deve ser `Deploy from a branch`, branch
`main`, pasta `/ (root)`. Depois disso, todo `push` na `main` republica em um
ou dois minutos.

## Migrar para o domínio próprio

Quando `neusavidalassessoria.com.br` estiver registrado:

1. No painel do domínio, criar os registros DNS (valores da documentação do
   GitHub Pages):

   | Tipo | Nome | Valor |
   |------|------|-------|
   | A    | @    | `185.199.108.153` |
   | A    | @    | `185.199.109.153` |
   | A    | @    | `185.199.110.153` |
   | A    | @    | `185.199.111.153` |
   | AAAA | @    | `2606:50c0:8000::153` |
   | AAAA | @    | `2606:50c0:8001::153` |
   | AAAA | @    | `2606:50c0:8002::153` |
   | AAAA | @    | `2606:50c0:8003::153` |
   | CNAME | www | `pedrovidal-hs.github.io` |

2. Criar na raiz do projeto um arquivo `CNAME` com uma única linha:
   `neusavidalassessoria.com.br`
3. Trocar `pedrovidal-hs.github.io` por `neusavidalassessoria.com.br` em
   `index.html` (canonical, Open Graph, Twitter e os `@id` do JSON-LD),
   `sitemap.xml` e `robots.txt`:

   ```bash
   sed -i 's|pedrovidal-hs\.github\.io|neusavidalassessoria.com.br|g' \
     index.html sitemap.xml robots.txt
   ```

4. Em **Settings → Pages**, preencher *Custom domain* e marcar
   *Enforce HTTPS* (aparece depois que o certificado é emitido, o que pode
   levar algumas horas).

O GitHub passa a redirecionar `pedrovidal-hs.github.io` para o domínio novo
com 301, então o que já tiver sido indexado é transferido.

## Pendências conhecidas

- **A URL atual contém o nome de usuário do GitHub.** O site está liberado para
  indexação, então buscas pela marca podem exibir `pedrovidal-hs.github.io`
  até a migração. Para evitar isso, trocar em `index.html` o
  `<meta name="robots">` para `noindex, follow` — mas **é preciso lembrar de
  reverter** quando o domínio entrar, senão o site nunca é indexado.
- As respostas do FAQ e a seção "Como funciona" precisam de revisão técnica da
  Neusa: são textos redigidos a partir da lista de serviços, não ditados por ela.
- Não há `areaServed` nem `address` nos dados estruturados, por decisão de não
  publicar localização. Isso limita o SEO local. Há um comentário no
  `index.html` com o bloco pronto para reativar.
- Sem e-mail e sem redes sociais nos contatos, por falta dos dados.
