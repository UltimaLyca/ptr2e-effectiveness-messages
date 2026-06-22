# Effectiveness Messages for PTR2e

A Foundry VTT module for PTR2e (Pokemon Tabletop Reunited 2e) that displays classic Pokemon-style effectiveness messages when damage is dealt.

![Foundry v14](https://img.shields.io/badge/Foundry-v14-informational)
![PTR2e](https://img.shields.io/badge/System-PTR2e-green)

## Features

- **"It's super effective!"** - Displayed when type effectiveness > 1 (×2, ×4)
- **"It's not very effective..."** - Displayed when type effectiveness < 1 (×0.5, ×0.25)
- **"It doesn't affect [target]..."** - Displayed when the target is immune (×0)
- Shows the damage multiplier alongside the message (optional)
- Sound effects support (optional, bring your own sounds)
- Per-target messages for multi-target attacks

## Installation

### Manual Installation

1. Download the latest release
2. Extract to `Data/modules/effectiveness-messages`
3. Restart Foundry and enable the module in your world

### Manifest URL

```
https://github.com/pokemon-tabletop-reunited/ptr2e-effectiveness-messages/releases/latest/download/module.json
```

## Configuration

Settings are available in Module Settings:

| Setting | Description | Default |
|---------|-------------|---------|
| Enable Effectiveness Messages | Toggle the feature on/off | On |
| Show Damage Multiplier | Display ×2, ×0.5, etc. with the message | On |
| Play Sound Effects | Play audio cues (requires sound files) | Off |
| Sound Volume | Volume for sound effects (client-side) | 0.5 |

## Sound Effects

To add sound effects, place audio files in `modules/effectiveness-messages/sounds/`:

- `super-effective.ogg` - Plays for super effective hits
- `not-very-effective.ogg` - Plays for resisted hits
- `immune.ogg` - Plays for immune targets

Recommended: Use short (< 1 second) sound clips.

## Compatibility

- **Foundry VTT**: v14+
- **System**: PTR2e 1.7.x+

## License

MIT License
