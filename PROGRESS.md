# ResearchHub improvement

The reading-room frontend and Oracle workflow repair are implemented. This repository is on `researchhub-polish-and-reliability`; main is preserved. See `docs/VERIFICATION_2026-10-11.md` for exact evidence and reproduction instructions.

- 65 live Oracle integration checks, 27 API unit checks and 8 desktop/mobile browser journeys passed.
- Production build succeeds; API and web production npm audits report zero known vulnerabilities.
- Real account/current-role checks, publication ownership, private records, transactional mutations, collection moves, questions/votes, requests, message consent, project updates, jobs, settings and file round trips are exercised against Oracle.
- Honest failure states replace demo authentication and fabricated persistence. Migrations preserve existing data and check PL/SQL compilation.
- The redesigned app uses original reading-room artwork, local fonts, responsive navigation, functional paper controls, a publication reader, project notebook and genuine library/publication exports.
- Actual refreshed captures show seeded development records. These are not publications, user counts or research-impact claims belonging to the owner.

The companion portfolio will showcase this updated build. A public Oracle-backed app deployment, production load evaluation and SMTP inbox delivery remain follow-through. The static portfolio is not the backend host. No claim of literal 100% correctness is made.

Local private configuration is gitignored. The isolated QA database is kept separately from existing user volumes. Do not reset existing databases; create a dedicated RH_QA_* schema to reproduce write tests.

## Final source handoff

Application commit `34dc07cf06f85aea4556d9c0c82de323521808bd`; documentation-only update `76f8772472acbfc2f81abde879339471f8bdc988`, pushed on `researchhub-polish-and-reliability`. Draft review: https://github.com/shadowfax-505/ResearchHub/pull/1. The delivered source archive is generated from the final review branch; the cross-project checkpoint records its exact SHA. Main is preserved. Task-owned servers and Oracle are stopped, QA data retained, Docker temporary resource fields restored. The companion `../RESEARCHHUB-LOCAL-RUN.md` contains the restart procedure.
