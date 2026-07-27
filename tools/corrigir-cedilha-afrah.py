"""
Constrói ccedilla e Ccedilla na fonte Afrah.

A fonte não tem glifo de cedilha e mapeia U+00E7 para 'Aacute' (formato de Á).
Como consequência o ç caía no fallback do navegador e aparecia mais pesado.

A cedilha é derivada da vírgula da própria fonte, reduzida e posicionada
sob a letra. É a prática usual em design de tipos, e mantém o traço da Afrah.
"""
import os
import shutil
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen

FONTDIR = r"C:\Users\vidal\source\repos\neusa\-neusa-vidal.github.ioo-main\font"
SRC = os.path.join(FONTDIR, "afrah-regular.ttf")
OUT = os.path.join(FONTDIR, "afrah-regular.fixed.ttf")

ESCALA = 0.85          # vírgula reduzida
TOPO_CEDILHA = -25     # onde o topo da cedilha encosta, em unidades de em

font = TTFont(SRC)
glyf, hmtx = font["glyf"], font["hmtx"]
glyphSet = font.getGlyphSet()


def bbox(nome):
    g = glyf[nome]
    g.recalcBounds(glyf)
    return g.xMin, g.yMin, g.xMax, g.yMax


cx0, cy0, cx1, cy1 = bbox("comma")
# posição da vírgula depois de escalada
s_x0, s_y0, s_x1, s_y1 = cx0 * ESCALA, cy0 * ESCALA, cx1 * ESCALA, cy1 * ESCALA
centro_virgula = (s_x0 + s_x1) / 2
dy = TOPO_CEDILHA - s_y1

print(f"comma bbox={cx0,cy0,cx1,cy1}  escalada={s_x0:.0f},{s_y0:.0f},{s_x1:.0f},{s_y1:.0f}")
print(f"deslocamento vertical: {dy:.0f}  (cedilha desce até {s_y0 + dy:.0f})")


def monta(base, novo_nome):
    bx0, by0, bx1, by1 = bbox(base)
    centro_base = (bx0 + bx1) / 2
    dx = centro_base - centro_virgula

    pen = TTGlyphPen(glyphSet)
    glyphSet[base].draw(pen)                                    # a letra
    tpen = TransformPen(pen, (ESCALA, 0, 0, ESCALA, dx, dy))
    glyphSet["comma"].draw(tpen)                                # a cedilha
    g = pen.glyph()
    g.recalcBounds(glyf)

    largura = hmtx[base][0]
    print(f"  {novo_nome:10} base={base!r} dx={dx:.0f} "
          f"bbox=({g.xMin},{g.yMin},{g.xMax},{g.yMax}) contornos={g.numberOfContours} "
          f"largura={largura}")
    return g, largura


print("\nmontando glifos:")
novos = {}
novos["ccedilla"], w_min = monta("c", "ccedilla")
novos["Ccedilla"], w_mai = monta("C", "Ccedilla")

# Registra os glifos: glyphOrder, glyf, hmtx, maxp
ordem = list(font.getGlyphOrder())
for nome in novos:
    if nome in ordem:
        raise SystemExit(f"glifo {nome!r} já existe; abortando para não sobrescrever")
    ordem.append(nome)

font.setGlyphOrder(ordem)
glyf.glyphOrder = ordem
for nome, g in novos.items():
    glyf.glyphs[nome] = g
hmtx.metrics["ccedilla"] = (w_min, novos["ccedilla"].xMin)
hmtx.metrics["Ccedilla"] = (w_mai, novos["Ccedilla"].xMin)
font["maxp"].numGlyphs = len(ordem)

# Remapeia o cmap em todas as subtabelas
for t in font["cmap"].tables:
    t.cmap[0x00E7] = "ccedilla"
    t.cmap[0x00C7] = "Ccedilla"

font.save(OUT)
print(f"\ngravado: {OUT}")

# --- verificação: recarrega do disco ---
v = TTFont(OUT)
vcmap = {}
for t in v["cmap"].tables:
    vcmap.update(t.cmap)
vglyf = v["glyf"]
print("\nverificando o arquivo gravado:")
ok = True
for ch, esperado, contornos_min in [("ç", "ccedilla", 2), ("Ç", "Ccedilla", 3)]:
    nome = vcmap.get(ord(ch))
    g = vglyf[nome] if nome in vglyf else None
    if g is not None:
        g.recalcBounds(vglyf)
    marca = "ok" if nome == esperado and g is not None and g.numberOfContours >= contornos_min else "FALHOU"
    if marca == "FALHOU":
        ok = False
    print(f"  {ch} -> {nome!r} contornos={g.numberOfContours if g else '-'} "
          f"yMin={g.yMin if g else '-'} {marca}")
# Á não deve ter sido afetado
print(f"  Á -> {vcmap.get(0x00C1)!r} (deve seguir 'Aacute')")
print("\nRESULTADO:", "OK" if ok and vcmap.get(0x00C1) == "Aacute" else "PROBLEMA")

if ok and vcmap.get(0x00C1) == "Aacute":
    shutil.move(OUT, SRC)
    print(f"substituído: {SRC}")
