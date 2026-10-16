# Audit d'accessibilite (WCAG 2.1 AA) - Glyph Weaver

Date : 2026-10-16. Perimetre : la coquille applicative (`@glyph-weaver/ui`) et
la page unique de `apps/web`, sur les deux themes (sombre et clair).

## Methode

L'audit combine deux moyens, tous deux verifiables :

1. **Contraste (automatise et garde).** Chaque couleur de texte est comparee a
   chaque surface selon la formule WCAG (luminance relative, rapport
   `(L1 + 0.05) / (L2 + 0.05)`), seuil **4.5:1** pour le texte normal. Le test
   `packages/ui/src/__tests__/theme-contrast.test.ts` recalcule ces rapports
   depuis les deux fichiers CSS et echoue si un couple passe sous le seuil.
2. **Relecture structurelle (manuelle).** Noms accessibles des controles,
   reperes de page, navigation clavier, gestion du focus, alternatives.

## Constats et corrections

Les deux fichiers portent la meme palette : `packages/ui/src/theme/theme.css`
(la source livree) et `apps/web/app/globals.css` (celle reellement rendue).
Toute correction est appliquee aux deux, et un test echoue si les deux divergent.

### Theme sombre

| Jeton | Avant | Apres | Pire contraste avant | Apres |
|---|---|---|---|---|
| `--gw-text-muted` | `#8a7e6e` | `#a99d8b` | 3.61 (sur `bg-tertiary`) | 5.37 |
| `--gw-error` | `#c44e4e` | `#e07a7a` | 3.10 | 4.93 |
| `--gw-success` | `#4e9a5c` | `#63b573` | 4.16 | 5.72 |

### Theme clair

| Jeton | Avant | Apres | Pire contraste avant | Apres |
|---|---|---|---|---|
| `--gw-text-muted` | `#8a7a95` | `#665a72` | 2.99 | 4.84 |
| `--gw-accent-gold` | `#b89030` | `#755a17` | 2.24 | 4.90 |
| `--gw-success` | `#3d7a4a` | `#2f6239` | 3.88 | 5.40 |
| `--gw-warning` | `#b08520` | `#745713` | 2.54 | 5.08 |
| `--gw-error` | `#b33a3a` | `#a52f2f` | 4.42 | 5.19 |

### Pastille d'etat de l'en-tete

Le statut du sort s'affiche en texte blanc sur un fond colore (`--gw-success`,
`--gw-warning` ou `--gw-text-muted`). Blanc sur ces fonds plafonnait a environ
2.5:1. Le texte est desormais `var(--gw-bg-primary)` : fonce sur un fond clair en
theme sombre, clair sur un fond fonce en theme clair. Les deux passent.

### Bouton principal de l'onboarding

Le texte etait `--gw-text-primary` (`#f0e6d3`) sur `--gw-accent-purple`
(`#7b5ea7`), soit 4.24:1, juste sous le seuil. Le texte est passe a `#fff`
(5.25:1 en sombre, 6.78:1 en clair).

## Ce qui est deja conforme

- Chaque bouton icone porte un nom accessible (`aria-label` ou `title`) :
  en-tete (menu, annuler, retablir, theme, langue, panneau), barre laterale,
  palette d'outils.
- La boite de dialogue d'accueil utilise `role="dialog"`, `aria-modal`, un
  titre relie par `aria-labelledby`, et se ferme avec Echap.
- Le menu est ouvrable au clavier ; des raccourcis clavier existent
  (`packages/ui/src/shortcuts`).
- Les libelles d'interface sont entierement en i18n EN/FR.

## Limites assumees

- **Le canevas n'a pas d'equivalent lecteur d'ecran.** L'acte central, dessiner
  un anneau, est graphique ; une alternative textuelle complete demanderait une
  representation du trace. Documente, non traite ici.
- **Pas de passage d'axe-core en CI.** L'audit de contraste est automatise et
  garde ; le reste (focus visible, ordre de tabulation, noms) reste une
  relecture. Ajouter `@axe-core/playwright` est la suite naturelle si le projet
  se dote d'une chaine de tests navigateur.
