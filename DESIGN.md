# Design Brief

## Direction

Command Center Dark — A high-tech traffic control room interface combining grid-based layouts, semantic color coding, and minimal ornamentation for mission-critical decision-making.

## Tone

Bold, utilitarian, focused. No rounded softness — sharp decision-making interface with direct information hierarchy inspired by NASA control rooms and traffic operations centers.

## Differentiation

Semantic traffic color system integrated into design tokens: red for emergencies, amber for warnings, green for clear flow, blue for general info. Every interactive element communicates action type via color semantics, not just convention.

## Color Palette

| Token       | OKLCH           | Role                          |
| ----------- | --------------- | ----------------------------- |
| background  | 0.12 0.0 0      | Deep charcoal, minimal visual noise |
| foreground  | 0.92 0.0 0      | High contrast, near-white text |
| card        | 0.16 0.0 0      | Elevated surface for data panels |
| primary     | 0.72 0.18 220   | Tech blue, info & general UI  |
| accent      | 0.70 0.15 90    | Amber warnings & highlights   |
| destructive | 0.55 0.24 25    | Red emergencies & critical alerts |
| chart-3     | 0.68 0.22 140   | Green for clear/normal flow   |
| muted       | 0.22 0.0 0      | Secondary surfaces & disabled |
| border      | 0.28 0.0 0      | Subtle structure boundaries   |

## Typography

- Display: Space Grotesk — Geometric sans-serif for headings, role titles, and data labels
- Body: DM Sans — Clean, readable sans-serif for paragraphs, descriptions, and UI text
- Mono: JetBrains Mono — Machine-readable for vehicle IDs, timestamps, data codes

## Elevation & Depth

Borders define structure, not shadows. Cards have subtle elevated backgrounds against dark canvas; 1px borders outline surfaces. No soft shadows — hard edges create clarity in data-dense layouts.

## Structural Zones

| Zone    | Background       | Border                        | Notes                          |
| ------- | ---------------- | ----------------------------- | ------------------------------ |
| Header  | `card` with `border-b` | 1px solid border    | Navigation tabs, role indicator |
| Content | `background`     | —                            | Map + chatboard grid layout    |
| Cards   | `card` with border | 1px solid `border`   | Data panels, alternating groups |
| Footer  | `secondary`      | `border-t`                   | Status legend, color semantics |

## Spacing & Rhythm

Tight spacing (0.5rem/8px radii, 1rem gap grid, 1.5rem section margins) emphasizes density. No breathing room — every pixel serves data presentation or interaction. Micro-spacing groups related UI elements tightly.

## Component Patterns

- Buttons: Primary (cyan), Accent (amber), Destructive (red) — semantic color per action type, no hover glow
- Badges: Status indicators (red/amber/green/blue), small radii (4px), bold text
- Cards: 1px border, no shadow, dark background, compact padding (1rem)
- Data displays: Monospace for metrics, grid for vehicle tables, color-coded indicators

## Motion

- Entrance: Fade in 0.3s smooth (no bounce)
- Hover: Color intensity shift + border highlight, no scale
- Status: Blink animation for critical alerts (1s cycle), pulse for warnings (2s cycle)
- Decorative: None — motion serves clarity only

## Constraints

- No gradients, no glassmorphism, no decorative blur
- All colors must map to semantic tokens (no arbitrary hex)
- Borders and strong contrast over soft shadows
- Minimum text size 12px for accessibility in data-dense layout
- High contrast ratios: foreground/background ≥ 0.8 L difference

## Signature Detail

Traffic light color semantics wired into the design system — red/amber/green/blue aren't just visual flourishes, they encode critical information at a glance, reducing cognitive load in high-pressure operations.
