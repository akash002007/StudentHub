# StudentHub — RPSC-Style Recruiter Assessment System Walkthrough

This walkthrough details the formal transformation of StudentHub's Recruiter Assessment module into an **RPSC-Style Recruitment Examination System**, adhering to rigorous paper pattern blueprints, controlled scoring, negative marking, qualifying benchmarks vs. shortlisting cutoffs, multi-tier merit lists, tie-breaking rules, answer objection/re-evaluation workflows, and version immutability.

---

## 1. Files Changed & Added

### Types & Data Modeling
* [src/types/index.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/types/index.ts):
  - Added `AssessmentSection`, `CutoffType`, `AssessmentCutoffConfig`, `MeritCriterion`, `AssessmentMeritConfig`, `SectionScoreSummary`, `QuestionObjection`, `AssessmentAuthorization`.
  - Extended `AssessmentRecord` with `version`, `sections`, `cutoffConfig`, `meritConfig`, `negativeMarkingRate`, `negativeMarkingType`, `examinationType`, `isVersionLocked`, and `schedule`.
  - Extended `AssessmentAttempt` with `sectionScores`, `cutoffCleared`, `meritRank`, `shortlistStatus`.

### Core Examination Engine
* [src/lib/assessment-engine.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/lib/assessment-engine.ts):
  - Updated store persistence (`.data/assessment-store-db.json`) for `objections` and `authorizations`.
  - Upgraded `saveAssessmentConfig` & `publishAssessmentConfig` to handle sections, negative rates, and version immutability locking (`isVersionLocked = true`).
  - Upgraded `submitAssessmentAttempt` to compute per-section score breakdowns, verify sectional minimum cutoffs, and calculate overall qualification.
  - Implemented `computeMeritList`, `shortlistCandidates`, `createNewAssessmentVersion`, `generatePaperFromBlueprint`, `submitQuestionObjection`, `getQuestionObjections`, `resolveQuestionObjection`, `reevaluateAssessment`, `getAssessmentAuthorizations`.

### Recruiter & Student API Endpoints
* [src/app/api/recruiter/assessments/[id]/merit/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/recruiter/assessments/[id]/merit/route.ts) `[NEW]` (GET merit list, ranks, cutoff qualification)
* [src/app/api/recruiter/assessments/[id]/shortlist/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/recruiter/assessments/[id]/shortlist/route.ts) `[NEW]` (POST bulk shortlist/reject/interview action)
* [src/app/api/recruiter/assessments/[id]/version/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/recruiter/assessments/[id]/version/route.ts) `[NEW]` (POST create immutable version clone)
* [src/app/api/recruiter/assessments/[id]/reevaluate/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/recruiter/assessments/[id]/reevaluate/route.ts) `[NEW]` (POST automated re-evaluation from corrected answer key)
* [src/app/api/recruiter/assessments/[id]/objections/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/recruiter/assessments/[id]/objections/route.ts) `[NEW]` (GET list objections, POST resolve objection)
* [src/app/api/recruiter/assessments/[id]/authorizations/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/recruiter/assessments/[id]/authorizations/route.ts) `[NEW]` (GET candidate exam authorizations)
* [src/app/api/recruiter/assessments/blueprint/generate/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/recruiter/assessments/blueprint/generate/route.ts) `[NEW]` (POST generate question paper from blueprint)
* [src/app/api/student/assessments/[id]/objection/route.ts](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/api/student/assessments/[id]/objection/route.ts) `[NEW]` (POST candidate question objection submission)

### Recruiter UI & Workspaces
* [src/app/dashboard/recruiter/assessments/new/page.tsx](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/dashboard/recruiter/assessments/new/page.tsx):
  - 15-step structured RPSC examination wizard (Basic Details, Drive, Pattern, Sections Builder, Question Blueprint, Embedded Question Bank, Scoring, Negative Marking, Cutoff, Merit & Ranking, Proctoring, Schedule, Candidate Rules, Preview, Readiness Checklist & Publish).
* [src/app/dashboard/recruiter/assessments/[id]/page.tsx](file:///c:/Users/AKASH/Downloads/StudentHub-main/StudentHub-main/src/app/dashboard/recruiter/assessments/[id]/page.tsx):
  - Upgraded workspace with dedicated tabs for Overview, Blueprint & Pattern, Merit List (with rank, score, section breakdown, cutoff qualification, bulk shortlisting), Authorizations, Questions, Results, Objections & Re-evaluation, Analytics, Integrity Timeline, Versioning & Audit.

---

## 2. Database & Persistence Changes

* Stored in `.data/assessment-store-db.json` with file synchronization:
  - `assessments`: Preserves `version`, `isVersionLocked`, `sections`, `cutoffConfig`, `meritConfig`, `negativeMarkingRate`, `negativeMarkingType`, `schedule`.
  - `attempts`: Preserves `sectionScores` (correct, wrong, unanswered, score, maxMarks), `cutoffCleared`, `meritRank`, `shortlistStatus`.
  - `authorizations`: Preserves `examDate`, `examWindowStart`, `examWindowEnd`, `maxAttempts`, `attemptsUsed`, `status` (`AUTHORIZED` | `USED` | `EXPIRED`).
  - `objections`: Preserves candidate question objections, resolution statuses (`SUBMITTED` | `ACCEPTED` | `REJECTED`), and notes.

---

## 3. APIs Added & Modified

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/recruiter/assessments/[id]/merit` | `GET` | Computes official merit rankings, applies tie-breakers & shortlisting cutoff |
| `/api/recruiter/assessments/[id]/shortlist` | `POST` | Bulk shortlists, rejects, or moves candidates to interview |
| `/api/recruiter/assessments/[id]/version` | `POST` | Spawns a new mutable draft version while freezing the active version |
| `/api/recruiter/assessments/[id]/reevaluate` | `POST` | Re-evaluates attempts and recalculates merit following key corrections |
| `/api/recruiter/assessments/[id]/objections` | `GET`, `POST` | Lists and resolves candidate question challenges |
| `/api/recruiter/assessments/[id]/authorizations` | `GET` | Returns issued candidate authorizations and entry status |
| `/api/recruiter/assessments/blueprint/generate` | `POST` | Validates Question Bank pool and generates snapshot questions |
| `/api/student/assessments/[id]/objection` | `POST` | Candidate endpoint to challenge questions post-exam |

---

## 4. Assessment Workflow

```
Recruitment Drive
        ↓
Create Formal Assessment (15-Step Wizard)
        ↓
Exam Blueprint (Easy / Medium / Hard per Section)
        ↓
Question Selection (System + Company + Recruiter pools)
        ↓
Scoring & Negative Marking (0.33x per wrong answer)
        ↓
Passing Benchmark (e.g. 40%) vs. Shortlisting Cutoff (e.g. Top 20%)
        ↓
Merit Ranking & Tie-Break Policy
        ↓
Publish & Lock Version (v1 immutable)
        ↓
Assign Candidates & Issue Authorizations
        ↓
Candidate Takes Proctored Exam (Authoritative Server Evaluation)
        ↓
Merit List Generated & Ranked
        ↓
Bulk Shortlist / Move to Interview
```

---

## 5. Blueprint Implementation

* Recruiter defines question counts for **Easy**, **Medium**, and **Hard** for every section.
* The generator validates available active questions across:
  1. StudentHub System Question Bank (Read-only)
  2. Authorized Company Question Bank
  3. Recruiter Private Question Bank
* **Pool Check**: If a section requires 10 Hard questions but only 6 exist, generation halts with a descriptive error before publishing.
* When validated, snapshots are created with deterministic section IDs, marks, and negative marking rates.

---

## 6. Question Bank Integration

* **Strict Architectural Constraint Preserved**: Question Bank is accessible **strictly inside the Assessment Builder** (never as an independent top-level sidebar item).
* Supports browsing System, Company, and Recruiter questions, keyword search, difficulty filtering, preview, and inline question creation.

---

## 7. Scoring Implementation

* **Question-Level & Section-Level**:
  - Unanswered questions = `0 marks`.
  - Correct answers = `+marks`.
  - Incorrect answers = `-(negativeRate × marks)`.
* Server evaluates attempts with strict bounds: final score cannot drop below zero (`Math.max(0, ...)`) unless specifically allowed.

---

## 8. Cutoff Implementation

* Distinct separation between:
  - **Passing Benchmark** (`passingMarks` / `passingPercentage`): Minimum qualification floor (e.g. 40%).
  - **Shortlisting Cutoff** (`cutoffConfig`): Controls candidate progression to subsequent interview rounds.
* Supported Cutoff Types:
  - `TOP_PERCENTAGE`: Top X% of qualifying candidates on the merit list.
  - `TOP_N`: Top N candidates by score.
  - `FIXED_SCORE`: Absolute score threshold.
  - `PERCENTAGE`: Percentage threshold.
  - `SECTIONAL`: All sectional cutoffs must be satisfied.

---

## 9. Merit Implementation

* Multi-tier sorting policy:
  1. **Primary**: Total examination score (descending).
  2. **Secondary**: Configured section score (e.g. Technical Knowledge score).
  3. **Tertiary**: Secondary section score (e.g. Aptitude score).
  4. **Tie-Breaker**: Resolved deterministically.

---

## 10. Tie-Break Implementation

* Configurable tie-breaking rules:
  - `SUBMISSION_TIME` (RPSC Standard): Earlier submission timestamp wins.
  - `FEWEST_INCORRECT`: Candidate with fewer negative marking deductions ranks higher.
  - `ACCURACY`: Candidate with higher correct/attempted ratio ranks higher.
  - `SECTION_PRIORITY`: Priority given to primary section score.

---

## 11. Proctoring Configuration

* Dedicated proctoring parameters:
  - Standard vs. Proctored Mode
  - Video camera feed required
  - Audio microphone stream required
  - Entire screen display sharing required
  - Browser fullscreen enforcement
  - Configurable violation thresholds (Window/Tab switch limits, Fullscreen exit limits)
  - Automatic session pause on camera/mic/screen-share disconnect.

---

## 12. Authorization Implementation

* Candidate assignments issue a formal `AssessmentAuthorization`:
  - `candidateId`, `applicationId`, `examDate`, `examWindowStart`, `examWindowEnd`, `maxAttempts`, `attemptsUsed`, `status` (`AUTHORIZED` | `USED` | `EXPIRED`).
  - Token and attempt status are validated server-side on exam entry.

---

## 13. Versioning Implementation

* **Immutability Guarantee**: Once published, an assessment's questions, sections, marks, negative rates, and duration are frozen (`isVersionLocked = true`).
* Historical candidate attempts are permanently linked to their specific version (e.g. `v1`).
* If changes are required, recruiter triggers `createNewAssessmentVersion`, spawning a mutable `v2` draft while historical `v1` attempts remain unmodified.

---

## 14. Security Checks

* **IDOR & Cross-Company Isolation**: Question access and assessments are strictly verified against recruiter's authenticated `companyId`.
* **Zero Client Trust**: All scores, percentages, ranks, cutoff determinations, and timers are calculated server-side.
* **Answer Masking**: Correct answers and explanations are stripped from client payloads during active examinations.
* **Idempotent Submissions**: Prevents replay attacks and double submissions.

---

## 15. Audit Logging

* All state transitions are logged to the Recruiter Audit Trail:
  - `ASSESSMENT_CREATED`, `ASSESSMENT_DRAFT_UPDATED`
  - `ASSESSMENT_PUBLISHED`, `ASSESSMENT_VERSION_CREATED`
  - `ASSESSMENT_CANDIDATES_ASSIGNED`, `ASSESSMENT_STARTED`
  - `ASSESSMENT_SUBMITTED`, `ASSESSMENT_TERMINATED`
  - `CANDIDATES_BULK_SHORTLIST`, `CANDIDATES_BULK_REJECT`
  - `OBJECTION_ACCEPTED`, `OBJECTION_REJECTED`
  - `ASSESSMENT_REEVALUATED`

---

## 16. Tests Performed

* **Automated Test Suite** (`scratch/test-rpsc-engine.ts`):
  1. Blueprint generation with pool validation.
  2. Draft creation with sections and negative marking (0.33).
  3. Assessment publishing and immutable version locking.
  4. Candidate authorization generation.
  5. Proctored attempt execution and section scoring.
  6. Negative marking deduction validation.
  7. Multi-tier Merit ranking & cutoff qualification.
  8. Bulk shortlisting execution.
  9. Question challenge submission & acceptance.
  10. Automated re-evaluation and merit recalculation.
  11. Version 2 generation with immutable v1 preservation.
* **TypeScript Compilation**: `npx tsc --noEmit` passed with 0 errors.
* **Git Version Control**: Committed and pushed to `origin/main` (`d3c1e48`).

---

## 17. Remaining Limitations

* **Operating System Level Focus**: Web browsers cannot prevent native OS-level application switching (e.g. Windows Alt+Tab); detection relies on standard browser Page Visibility, Focus/Blur, Fullscreen, and MediaStream integrity events.
* **Network Interruption Handling**: If a candidate loses internet connectivity, unsaved responses remain in localStorage; reconnection restores the server-authoritative timer session.
