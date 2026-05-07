# 🧾 PaieAudit

**Vérifie ta fiche de paie française** — audit indépendant, gratuit, 100 % local. Détecte les anomalies (SMIC, heures supplémentaires non payées, indemnité de licenciement) en croisant ton bulletin avec le Code du travail.

> **Audit indicatif — pas un avis juridique.** Pour un litige, consulte l'inspection du travail (DREETS), un syndicat, un avocat ou les prud'hommes.

---

## 🔗 Live demo

👉 **[wilf974.github.io/PaieAudit](https://wilf974.github.io/PaieAudit/)** (mobile-first, installable PWA, fonctionne hors-ligne)

---

## Problem

L'**URSSAF** estime que **1 fiche de paie sur 4 contient au moins une erreur** en France :
- Heures supplémentaires non payées ou mal majorées
- Taux de cotisations sociales mal appliqué
- SMIC non respecté (illégal mais arrive)
- Convention collective ignorée
- Indemnité de licenciement sous-estimée

Pour 30 millions de salariés, c'est **des milliards d'euros perdus chaque année**. Et la plupart ne savent pas comment vérifier.

**PaieAudit** te donne l'outil que ton employeur a et que toi non : un calculateur formellement vérifié des règles de paie.

---

## Modules

| Onglet | Fonction |
|---|---|
| **🧾 Paie** | **📄 Upload de ton PDF de fiche de paie** ou copier-coller du texte → extraction automatique des champs (taux, heures, brut, net, hsup, statut, IDCC). Saisie manuelle aussi possible. |
| **⚖️ Indemnités** | Calcul indemnité de licenciement minimum légale (Art. R.1234-2) + préavis (L.1234-1) + congés payés non pris |
| **📚 Formation** | 8 cartes : heures sup, SMIC, congés payés, cotisations, convention collective, indemnité, préavis, recours |
| **📋 Synthèse** | Actions prioritaires + main courante + export (clipboard ou .txt) |
| **📖 Loi** | Toutes les formules avec articles du Code du travail + procédure de recours en 5 étapes |

---

## Anomalies détectées

| Signal | Action proposée |
|---|---|
| 🔴 Taux horaire < SMIC (11,88 €) | DREETS → inspection du travail |
| 🔴 Brut reçu < brut théorique (>2 % d'écart) | LRAR à l'employeur, conserver preuves |
| 🔴 Heures sup déclarées mais non payées (≥ 0,5 h) | Calcul du préjudice + délai 3 ans |
| 🟠 Net reçu très inférieur à l'estimation | Vérifier retenues non justifiées |
| 🟠 Brut reçu > théorique | OK si primes/intéressement |

---

## Architecture

```js
// Pure scoring engine — Aether-verified, no DOM, no side effects
engine.h_normales(total)                  → ∈ [0, 151.67]
engine.h_sup_25(total)                    → ∈ [0, 34.66]
engine.h_sup_50(total)                    → ≥ 0
engine.brut_mensuel(taux, hN, h25, h50)   → ≥ 0
engine.cotisations(brut, taux_pct)        → ≥ 0
engine.net_estime(brut, cotisations)      → ≥ 0
engine.indemnite_licenciement(sal, ans)   → ≥ 0
engine.preavis_mois(anciennete_mois)      → ∈ [1, 3]
engine.conges_acquis(mois_travailles)     → ∈ [0, 30]
engine.smic_mensuel()                     → 1 801,84 € (2026)
```

Toutes les fonctions sont **pures** : pas de DOM, pas d'effet de bord, **déterministes**.

---

## Garanties formelles

```
@invariant  h_normales       ∈ [0, 151.67]
@invariant  h_sup_25         ∈ [0, 34.66]
@invariant  h_sup_50         ≥ 0
@invariant  brut_mensuel     ≥ 0
@invariant  cotisations      ≥ 0
@invariant  net_estime       ≥ 0
@invariant  indemnite_licenciement ≥ 0
@invariant  preavis_mois     ∈ [1, 3]
@invariant  conges_acquis    ∈ [0, 30]
```

**64 exemples / 19 invariants formels** validés par tests d'invariants. Si un invariant est violé à l'exécution, un toast d'erreur visible s'affiche (au lieu d'un crash silencieux).

---

## Sources légales

| Règle | Article du Code du travail |
|---|---|
| Heures supplémentaires majorées | L.3121-28, L.3121-36 |
| Durée légale de travail | L.3121-27 (35h/semaine) |
| SMIC 2026 | Décret annuel + Art. L.3231-2 |
| Indemnité de licenciement | R.1234-2 (1/4 mois × ans, + 1/3 au-delà 10 ans) |
| Préavis | L.1234-1 (1 ou 2 mois selon ancienneté) |
| Congés payés | L.3141-3 (2,5 jours / mois) |
| Délai de prescription salaires | L.3245-1 (3 ans) |
| Délai de prescription rupture | L.1471-1 (1 an) |

---

## Limites

- **Cas particuliers non couverts** : forfait jours, cadre dirigeant, conventions spécifiques (industrie, BTP, hôtellerie…), primes de précarité (CDD), intéressement, RTT, télétravail, frais professionnels
- **Convention collective** non intégrée (300+ en France) — souvent plus favorable que la loi
- **Cotisations** : taux moyens 22% (non-cadre) / 25% (cadre), peut varier de ±3 % selon entreprise (mutuelle, prévoyance, transport)
- **Pas un avis juridique** : pour un litige réel, consulte un expert
- **France métropolitaine 2026** : DOM-TOM et outre-mer ont des spécificités

---

## Recours en cas de litige

1. **LRAR à l'employeur** avec calcul détaillé (souvent ça suffit)
2. **Inspection du travail (DREETS)** — gratuit, anonymat possible · `travail-emploi.gouv.fr`
3. **Délégué syndical / CSE** — peut t'accompagner
4. **Conseil de prud'hommes** — gratuit, défense possible par syndicat · `justice.fr`
5. **Avocat en droit du travail** — aide juridictionnelle si revenus modestes

⚠️ **Délais** : 3 ans pour les salaires (L.3245-1), 1 an pour la rupture (L.1471-1). Conserve TOUTES les preuves (planning, mails, badgeuse).

---

## Privacy

- ✅ **Aucune donnée envoyée** — toute l'analyse (texte ET PDF) tourne dans ton navigateur
- ✅ **PDF parsé localement** via pdf.js (Mozilla, open source) — la lib est cachée par le SW au 1ᵉʳ usage, après ça marche offline
- ✅ **Aucun stockage** — fermer l'onglet vide tout
- ✅ **Aucun tracking, aucun cookie tiers**
- ✅ **Code source ouvert** — inspectable

> **Test** : déconnecte ton wifi après le 1ᵉʳ chargement, upload ton PDF de paie → ça marche. Aucune connexion sortante.

---

## Stack

- HTML / CSS / Vanilla JS — un seul `index.html` (~58 KB)
- PWA — `manifest.webmanifest`, `sw.js`, 3 icônes SVG
- Polices : DM Sans + JetBrains Mono
- **Aucune dépendance JS** — pas de framework

---

## Lancer en local

```bash
git clone https://github.com/wilf974/PaieAudit.git
cd PaieAudit
python -m http.server 8000
```

Ouvre `http://localhost:8000/`.

---

## License

[MIT](LICENSE) — © 2026 wilf974

---

## Crédits

Conçu en **Vanilla HTML/CSS/JS**. Inspiré des projets sœurs : [MindMirror](https://github.com/wilf974/MindMirror), [HeatGuard](https://github.com/wilf974/HeatGuard), [FireOps](https://github.com/wilf974/FireOps), [MedTriage](https://github.com/wilf974/MedTriage). Tous suivent la même philosophie : déterministe, auditable, sans backend.

Si tu es salarié, syndicaliste, expert RH, avocat en droit du travail, **tes retours sont précieux** via les Issues — surtout pour enrichir la couverture des cas particuliers et conventions collectives.
