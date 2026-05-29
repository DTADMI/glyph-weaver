# WHA-DSL Reference

**W**eaver **H**ieroglyphic **A**lgebra — Domain-Specific Language for defining glyph spells textually.

## Grammar

```
program          → statement*
statement        → importStatement | spellDefinition
importStatement  → import STRING ;
spellDefinition  → ring block? sigilDecl signDecl* ;
sigilDecl        → sigil IDENTIFIER block?
signDecl         → sign IDENTIFIER (at NUMBER deg)? block?
block            → { (param ;)* }
param            → IDENTIFIER : NUMBER
```

## Lexical Tokens

| Token Type | Example | Description |
| --- | --- | --- |
| `SIGIL` | `sigil` | Declares a sigil |
| `SIGN` | `sign` | Declares a sign |
| `RING` | `ring` | Starts a spell definition |
| `AT` | `at` | Introduces an angle |
| `DEG` | `deg` | Marks angle units |
| `IMPORT` | `import` | Imports a spell definition |
| `LBRACE` | `{` | Opens a parameter block |
| `RBRACE` | `}` | Closes a parameter block |
| `COLON` | `:` | Separates param name from value |
| `SEMI` | `;` | Terminates a statement or param |
| `NUMBER` | `42`, `3.14` | Numeric literal |
| `IDENTIFIER` | `fire-sigil` | Name identifier |
| `STRING` | `"fire-blast"` | Double-quoted string |
| `EOF` | (end) | End of input |

Comments use `//` to end of line. Whitespace is insignificant.

## Parameters

Sigil and sign blocks accept these numeric parameters:

| Parameter | Range | Description |
| --- | --- | --- |
| `force` | 0.0–1.0 | Spell power |
| `focus` | 0.0–1.0 | Precision/concentration |
| `spread` | 0.0–1.0 | Area of effect width |
| `range` | 0.0–1.0 | Effective distance |
| `lifetimeBias` | 0.0–1.0 | Duration bias |

Ring blocks accept:

| Parameter | Range | Description |
| --- | --- | --- |
| `size` | 0.0+ | Ring radius |
| `neatness` | 0.0–1.0 | Drawing quality |

## Element Mapping

Sigil names determine the spell element by prefix:

| Prefix | Element |
| --- | --- |
| `fire-` | fire |
| `water-` | water |
| `wind-` | wind |
| `earth-` | earth |
| `light-` | light |
| `dark-` | dark |
| `lightning-` | lightning |
| `ice-` | ice |
| `nature-` | nature |
| `arcane-` | arcane |

## Manifestation Mapping

Sign names determine the manifestation by suffix:

| Suffix | Manifestation |
| --- | --- |
| `-blast`, `-strike` | projectile |
| `-heal`, `-flash` | aura |
| `-dash` | levitation |
| `-wall`, `-shield` | barrier |
| `-cage` | convergence |
| `-wave`, `-pillar` | column |
| `-zone` | area |

## Standard Library

Five spells included:

| Name | Element | Manifestation |
| --- | --- | --- |
| `fire-blast` | fire | projectile |
| `water-heal` | water | aura |
| `wind-dash` | wind | levitation |
| `earth-wall` | earth | barrier |
| `light-flash` | light | aura |

## Examples

### Minimal Spell
```
ring sigil fire-sigil;
```

### Spell with Parameters
```
ring { size: 1.0; } sigil fire-sigil { force: 0.9; focus: 0.8; } sign fire-blast at 45 deg;
```

### Full Spell Definition
```
ring {
  size: 1.0;
  neatness: 0.95;
}
sigil fire-sigil {
  force: 0.9;
  focus: 0.8;
  spread: 0.6;
  range: 0.8;
  lifetimeBias: 0.3;
}
sign fire-blast at 0 deg {
  range: 1.0;
  force: 0.9;
};
```

### Importing
```
import "fire-blast";
ring sigil custom-sigil sign custom-blast at 90 deg;
```
