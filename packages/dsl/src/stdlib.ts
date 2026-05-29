export const STDLIB_SPELLS: Record<string, string> = {
  'fire-blast': `ring { size: 1.0; } sigil fire-sigil { force: 0.9; focus: 0.8; spread: 0.6; range: 0.8; lifetimeBias: 0.3; } sign fire-blast at 0 deg { force: 0.9; spread: 0.7; range: 1.0; };`,

  'water-heal': `ring { size: 0.8; } sigil water-sigil { force: 0.5; focus: 0.9; spread: 0.8; range: 0.6; lifetimeBias: 0.7; } sign water-heal at 90 deg { force: 0.5; spread: 0.9; range: 0.7; };`,

  'wind-dash': `ring { size: 0.7; } sigil wind-sigil { force: 0.6; focus: 0.7; spread: 0.5; range: 0.9; lifetimeBias: 0.2; } sign wind-dash at 180 deg { force: 0.7; spread: 0.6; range: 1.0; };`,

  'earth-wall': `ring { size: 1.2; } sigil earth-sigil { force: 0.9; focus: 0.8; spread: 0.4; range: 0.6; lifetimeBias: 0.8; } sign earth-wall at 270 deg { force: 0.9; spread: 0.5; range: 0.8; };`,

  'light-flash': `ring { size: 0.6; } sigil light-sigil { force: 0.7; focus: 0.6; spread: 0.9; range: 0.8; lifetimeBias: 0.1; } sign light-flash at 0 deg { force: 0.8; spread: 0.9; range: 1.0; };`,
}
