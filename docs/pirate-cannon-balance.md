# Pirate and Cannon Balance

This note defines the long-term combat curve beyond the three-port MVP. Port difficulty is fixed by world tier, so enemies never become stronger merely because a player upgraded a cannon.

## Design Targets

- A fully upgraded cannon for the current port should usually defeat its pirate in about two clicks.
- A cannon one or two progression bands behind should still win in roughly three to five clicks.
- Later ports increase pressure without shrinking the response window below a readable minimum.
- Vessel evolution and cannon upgrades both matter. Neither system replaces the other.
- New ports can add pirate behaviors, armor phases, escorts, or attack patterns instead of relying only on larger numbers.

## Pirate Curve

For port tier `t`, let `s = t - 1`:

```text
HP              = round(5 + 3s + 1.8s^1.5)
Ship damage     = round(10 + 4s + 0.45s^1.45)
Attack interval = max(3.8 seconds, 6.5 - 0.45s seconds)
Patrol cycle    = max(6.2 seconds, 12 - 0.65s seconds)
```

The polynomial health curve replaces the old `5 * 1.72^s` exponential. Under the old curve, a tier-12 pirate would have reached about 1,956 HP; the revised tier-12 target is 104 HP.

| Port tier | Pirate HP | Ship damage | Attack interval | Patrol cycle |
| ---: | ---: | ---: | ---: | ---: |
| 1 | 5 | 10 | 6.50 s | 12.0 s |
| 2 | 10 | 14 | 6.05 s | 11.4 s |
| 3 | 16 | 19 | 5.60 s | 10.7 s |
| 5 | 31 | 29 | 4.70 s | 9.4 s |
| 8 | 59 | 46 | 3.80 s | 7.5 s |
| 12 | 104 | 69 | 3.80 s | 6.2 s |
| 20 | 211 | 118 | 3.80 s | 6.2 s |
| 25 | 289 | 151 | 3.80 s | 6.2 s |

## Cannon and Vessel Synergy

```text
Cannon damage = round(cannon level * vessel mount multiplier)
```

| Vessel class | Mount multiplier | Cannon LV.12 |
| --- | ---: | ---: |
| Fishing skiff | 1.00x | 12 |
| Trawler | 1.12x | 13 |
| Ocean vessel | 1.24x | 15 |
| Deep-sea ship | 1.36x | 16 |

Future vessel ranks may continue the same `+0.12x` mount step up to a `1.60x` ceiling. Every cannon level still increases integer damage. Cannon progression is capped at LV.100, but each unlocked port exposes only four additional levels, so the three-port MVP still stops at LV.12.

At tier 12, a caught-up deep-sea ship can deal 65 damage with Cannon LV.48 and defeat the 104 HP pirate in two clicks. A behind-schedule Cannon LV.24 deals 33 damage and needs four clicks. This keeps the cannon valuable without making the encounter automatic.

## Expansion Rules

When adding a port, assign its sequential tier and use `pirateThreatForTier`. Do not hand-tune raw stats unless the port introduces a documented boss. After tier 8, prefer new readable mechanics over faster attacks because both timing values have reached their accessibility floors.
