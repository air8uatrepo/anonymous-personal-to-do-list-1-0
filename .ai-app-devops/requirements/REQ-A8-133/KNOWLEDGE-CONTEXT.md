# Knowledge context

Revision: 1

## Relevant knowledge
Deterministic bounded read completed before target binding.
The issue target remains requester-owned and is not inferred from these sources.

### K-01 INDEX.md

```text
# INDEX — agent entry

After this file, open **at most 2–3** more docs. Before coding, check **placement**: logic may live in the portal git **or** on **admin remote Hermes**.

Human structure exhibit (browser): [`structure-guide.html`](./structure-guide.html). Business [`business/`](./business/); tech [`tech/`](./tech/).
Template-to-knowledge mapping for team review: [`knowledge-template-mapping.html`](./knowledge-template-mapping.html).

Unregistered features do not exist for agents.

## Task router

| You need to… | Open |
|--------------|------|
| **Which repo / which machine** | [`tech/systems/map.md`](./tech/systems/map.md) ★ |
| **Map AI requirement content to knowledge** | [`knowledge-template-mapping.html`](./knowledge-template-mapping.html) + [`structure-guide.html`](./structure-guide.html) |
| Clarify requirements / direction | [`business/context/personas/supplier.md`](./business/context/personas/supplier.md) → that feature’s folder under `business/features/` (company stub) |
| WIP compute fields / overdue I/O | [`tech/internal-interface/schemas/wip-compute.md`](./tech/internal-interface/schemas/wip-compute.md) + [`business/features/wip/invariants.md`](./business/features/wip/invariants.md) |
| Change Customer Manual | [`business/features/customer-manual/README.md`](./business/features/customer-manual/README.md) |
| Manual on WIP stages | [`business/features/wip/README.md` Related](./business/features/wip/README.md#related-wip--customer-manual) + [`business/features/customer-manual/README.md` Related](./business/features/customer-manual/README.md#related-wip--customer-manual); tech wiring in [`tech/features/wip/README.md` Related](./tech/features/wip/README.md#related-wip--customer-manual-implementation-wiring) (archive joins secondary) |
| Skill names / deploy home | [`tech/systems/skills-map.md`](./tech/systems/skills-map.md) + [`tech/systems/hermes-air8.md`](./tech/systems/hermes-air8.md) |
| File paths / env for a feature | [`tech/features/<feature>/pointers.md`](./tech/features/) |
| `buyer_key` / `client_id` | [`tech/internal-interface/identity/`](./tech/internal-interface/identity/) |
| Tables / persistence | [`tech/database/`](./tech/database/) |
| Partner / public APIs | [`tech/external-interface/`](./tech/external-interface/) |
| Local / UAT callbacks | [`tech/playbooks/`](./tech/playbooks/) |
| Knowledge update intake / review | [`tech/playbooks/knowledge-update.md`](./tech/playbooks/knowledge-update.md) |
| Install A8 resources into Codex | [`tech/playbooks/codex-install.md`](./tech/playbooks/codex-install.md) |
| Repair validation failures | [`skills/a8-knowledge-repair/SKILL.md`](./skills/a8-knowledge-repair/SKILL.md) |
| A8 knowledge workflow flows and mapping | [`a8-knowledge-flows.html`](./a8-knowledge-flows.html) |
| New feature | [`business/features/_template/`](./business/features/_template/) + register here + **map.md row** + `tech/features/<name>/` |

## Feature registry

| Feature | Status | One-liner |
|---------|--------|-----------|
| [wip](./business/features/wip/) | active | Excel → stage board (compute on portal, Mapping on remote Hermes) |
| [customer-manual](./business/features/customer-manual/) | active | PDF → knowledge QA (BFF on portal, ingest/QA on remote Hermes) |

## Load protocol

1. Implementation path: INDEX → **tech/systems/map.md** → feature folder → **tech/features/.../pointers**.
2. `pointers` vs code → trust code; fix pointers or `gaps.md`.
3. Skill vs intent conflict → runtime follows **remote** skill; record gaps; no third source of truth.
4. Do not search systems absent from the map (e.g. do not look in `air8-ai-service` for WIP compute).
```

### K-02 tech/systems/map.md

```text
# Feature placement matrix

Before changing any slice: find the system cell, then open that feature’s [`tech/features/.../pointers.md`](../features/). Empty cell = that slice is not in that system — do not search there.

**Systems**

| ID | What | Changing it means |
|----|------|-------------------|
| `portal` | Git: `air8-supplier-portal` (UAT Jenkins job `air8-ai-portal`) | UI, BFF, deterministic compute, MySQL I/O |
| `hermes` | Hermes on **admin remote**, profile **`air8`** | Skills, manual knowledge tree, Mapping/QA LLM steps |
| `mysql` | DB `air8_ai_engine` (portal process) | Schema / version rows |
| `scf` | Existing Air8 attachment/user APIs (not this portal git) | objectKey upload/download |
| `n8n` | Workflows (planned insight path) | `wip-manual-get-inputs` / save (see gaps) |

Laptop `%LOCALAPPDATA%/hermes/profiles/air8` and `~/.cursor/skills/` are **not** UAT/prod Hermes. Only skills deployed to the admin remote profile serve portal environments.

## Matrix (WIP / Customer Manual)

| Slice | portal | hermes | mysql | scf | n8n |
|-------|--------|--------|-------|-----|-----|
| WIP board UI | yes | | read snapshot | | |
| WIP Excel header/stats/extract/compute | yes `lib/wip/` | | job progress | source may upload S3 | |
| WIP column→stage (Mapping Session) | assemble prompt, HTTP only | **skill `client-wip-conversion`** | | | |
| WIP standard product-type map | write back compute | **skill `wip-standard-product-type`** | | | |
| CM upload drawer / list | yes | | pending rows | sysAttachment | |
| CM classify + ingest | assemble prompt, PATCH status | **classify / ingest + attachment skills** | extract activate | objectKey download | |
| CM knowledge files (content.md, buyer dirs) | | **profile `knowledge/`** | | image objectKey | |
| CM QA chat | inject routing, SSE forward | **skill `customer-manual-qa`** | | images via objectKey | |
| CM changelog UI | yes | written at ingest into extract | JSON fields | | |
| Manual cards on WIP stages | read mapping table, render | planned: skill `wip-manual-insight` | `wip_customer_manual_mapping` | | planned: get-inputs / save |

## Forbidden assumptions

1. “Implement Mapping Session” inside the portal repo — semantics live in the Hermes skill.
2. Editing laptop Hermes equals updating UAT.
3. Treating `~/.cursor/skills/client-wip-conversion` as runtime truth.
4. Believing compute lives in `air8-ai-service` — WIP compute is in the **portal Node process** (`lib/wip/c_compute`), not the Jenkins `air8-ai-service` chain.
5. Using portal BFF download URLs instead of ingest’s `air8-attachment-download`.

## Registering a new feature

1. Add rows here (fine slices: UI / deterministic / LLM / storage).
2. Write git paths or skill names in `tech/features/<feature>/pointers.md`.
3. If both Hermes and portal change, split tasks; put deploy order in a playbook.

## Related
- [[skills map]](./skills-map.md) — catalogs: remote skill names for hermes cells
- [[air8-supplier-portal]](./air8-supplier-portal.md) — implements: portal system cell (UI / BFF / compute)
- [[hermes-air8]](./hermes-air8.md) — implements: hermes system cell (skills + knowledge tree)
- [[tech WIP README · WIP × CM]](../features/wip/README.md#related-wip--customer-manual-implementation-wiring) — implements: “Manual cards on WIP stages” row (portal read + planned hermes skill + mysql mapping + planned n8n)
- [[tech Customer Manual]](../features/customer-manual/README.md) — implements: CM slices that feed Ask CM / changelog / planned insight
- [[business WIP · WIP × CM]](../../business/features/wip/README.md#related-wip--customer-manual) — depends-on: product relationship for that matrix row
```

### K-03 business/context/personas/supplier.md

```text
# Persona: `supplier`

- Type: **external** (portal login user)
- id: `persona:supplier`
- Layers (same persona, two jobs — do not split into buyer or finance):
  - `supplier/management` — management
  - `supplier/department` — department / stage execution
- Login identity: supplier tenant (`company_code`). **Not** the retail buyer; buyers are their customers.

WIP + Customer Manual are **built for this persona only**. If a request cannot say “management or department”, ask before coding.

## Who they are

Export manufacturing suppliers (apparel / hardgoods factories or groups): take retail buyer orders, track WIP in Excel, follow buyer manuals for compliance and process. In the portal they need **their POs and the manuals they must obey** — not financing product sheets, not a buyer back-office.

Two heights of attention under one login (roles may be plant manager, merchandiser, planner, QC — **layer by task, not forced one title per person**):

| Layer | Typical job | Time scale |
|-------|-------------|------------|
| Management | Where are these POs, what is overdue, can I brief boss/sales in one screen | Days–weeks, cross style / PO |
| Department | I am on the **current stage** — what progress means, what the buyer manual requires here | Shift–day, one stage |

## Pains (product promises, WIP + CM)

### 1. Management — PO status tracking and display

- Buyer Excels differ; no single standard stage board for all POs.
- They want: **which stage each PO is on, quantities, overdue, risk color** — not shop-floor booking or root-cause essays.
- Fear: cannot brief in a meeting; discover lateness after CRD; cannot align with buyer on “where is the goods”.

Capability: WIP upload → `compute_json` board, PO rows, stage bars, CRD / stage overdue **display** (rules in `features/wip/invariants.md`).

### 2. Department — current-stage insights + manual impact

- Focus on **current stage** (and queue/overdue there): “what to watch on this step”.
- Buyer manuals are long; they need **clauses, changes, questions landed on current stage**, not the whole PDF.
- Fear: miss PP / packing / audit requirements and get rejected; insights invent “why late” without manual or date evidence.

Capability: WIP current-stage insight entry; Customer Manual per buyer; join: manual on `stage_key`; Ask CM with current stage.

## What they fear

| Layer | Fear |
|-------|------|
| Management | Cannot reconcile PO progress; overdue invisible; narrating internal capacity issues as buyer-facing spin without numbers |
| Department | Unknown current-stage manual requirements; invented policy answers; finance/collections insight dumped onto a stage |

## Success looks like

- **Management**: open WIP, see active snapshot by buyer; point at PO/stage bars for status and overdue without reopening raw Excel.
- **Department**: open current stage, see progress-based analysis + that stage’s manual requirements/impact; Ask Manual scoped to this buyer and stage.
- Both: numbers from compute, clauses from manuals; **do not invent delay reasons**.

## Capabilities they hit

- [`features/wip`](../../features/wip/) — management primary path; department uses current stage
- [`features/customer-manual`](../../features/customer-manual/) — department primary; management occasionally reads changelog

## Related
- [[vocabulary]](../vocabulary.md) — defines: Supplier / Buyer / WIP / Customer Manual cross-feature terms
- [[WIP]](../../features/wip/README.md) — consumes: management PO board; department current-stage entry
- [[Customer Manual]](../../features/customer-manual/README.md) — consumes: department stage requirements / Ask CM; management changelog
- [[WIP · WIP × CM]](../../features/wip/README.md#related-wip--customer-manual) — depends-on: department-layer join — manual requirements on WIP `stage_key` under same supplier + buyer

## Copy and insights — who they address

| Content | Audience | Must | Must not |

```

## Conflicts and gaps
Target application is not identified; knowledge is read-only evidence.
