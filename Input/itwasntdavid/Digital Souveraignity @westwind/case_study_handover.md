# Handover Guide: Westwind Case Study for itwasntdavid.de

This guide provides instructions for deploying the concise, usage-driven Westwind case study to **itwasntdavid.de** (TinaCMS + Vite stack).

---

## 📁 Updated Files

Both files are located in `/home/david/Projects/VPS Management/` and are fully formatted with TinaCMS frontmatter:

1. **German Version (Primary for local German non-profit / Hamburg context)**:
   - File: [westwind-digital-sovereignty-case-study-de.md](file:///home/david/Projects/VPS%20Management/westwind-digital-sovereignty-case-study-de.md)
   - Target Location: `content/posts/de/fallstudie-westwind-souveraene-infrastruktur.md`
   - Reading Time: `3 Min. Lesezeit`

2. **English Version**:
   - File: [westwind-digital-sovereignty-case-study.md](file:///home/david/Projects/VPS%20Management/westwind-digital-sovereignty-case-study.md)
   - Target Location: `content/posts/en/westwind-sovereign-infrastructure-case-study.md`
   - Reading Time: `3 min read`

---

## 🎯 Structured Highlights (Usage-Driven)

1. **Verwaltung von Einsätzen (*NocoBase*)**:
   - Tabelle, Status, Zielgruppen (z.B. Geflüchtete), Dauer, Ehrenamtliche
   - Auswertungen: >1.800 Ehrenamtsstunden, Jahresübersichten
2. **Planung von Einsätzen (*Kalender*)**:
   - Monatskalender (Schraubtage, Spendenabholungen, Kurse)
   - Rollenbasierte Ansicht (Schutz sensibler Mitgliederdaten)
3. **Verwaltung von Förderungen & Kosten**:
   - Budget-Zuordnungen zu Einsätzen, transparente Verwendungsnachweise für Stadt & Stiftungen
4. **Zusammenarbeit (*Docmost*)**:
   - Echtzeit-Wiki, Handbücher, Onboarding, IT-Entscheidungen
5. **Tägliche Backups**:
   - Automatisierte verschlüsselte Sicherung nach Scaleway S3 (Paris), Wiederherstellung in <60 Minuten

---

## 🚀 Transfer Command for itwasntdavid.de Instance

```bash
cp "/home/david/Projects/VPS Management/westwind-digital-sovereignty-case-study-de.md" "content/posts/de/fallstudie-westwind-souveraene-infrastruktur.md"
cp "/home/david/Projects/VPS Management/westwind-digital-sovereignty-case-study.md" "content/posts/en/westwind-sovereign-infrastructure-case-study.md"
```
