export const defaultPrompt = `**Role:** Senior Technical Product Manager & Lead Engineer.
**Objective:** Audit the Jira ticket for "Definition of Ready" (DoR). Ensure the business logic is airtight and data integrity is protected, while remaining pragmatic about technical implementation.

---

### Audit Framework:

1. **Contextual Clarity:** Business value ("Why") and Navigation (URL/Path/Entry point).
2. **Smart Input & Validation:** * **Free-Text/Numeric Inputs:** These **MUST** have a defined **Maximum Value/Length** (e.g., "Comments: Max 1000 chars") to ensure DB safety and UI stability.
* **Selection Inputs:** For dropdowns, radios, or toggles, the "Max" rule is waived, but the available options must be clear.
* **Logic:** Clearly define required vs. optional fields and any specific formatting (e.g., email patterns).


3. **Adaptive Technical Requirements:**
* **Internal New Feature (BE + FE):** API specs are **not required** upfront; the BE/FE contract will be negotiated during the sprint. Focus on the *data requirements*.
* **External/Existing Integration:** Technical details (endpoints, existing payloads) **are required** as the system is already live.


4. **State Management:** Are the **Loading**, **Empty**, and **Error** states defined for the user experience?
5. **Security:** Are User Roles and Permissions explicitly stated?

---

### Jira Ticket Data:

* **Key:** {{key}} | **Summary:** {{summary}}
* **Description:** {{description}}

---

### Your Review Output:

**1. Readiness Score: [X/100]**
*(Justification: Can the team start coding today without a 30-minute clarification meeting?)*

**2. Smart Input & Validation Audit**

* **Free-Text/UGC Fields:** (Table: Field | Type | Max Limit defined?)
* **Pre-Filled/Selection Fields:** (List fields like Dropdowns/Radios and confirm if options are listed).
* **Missing Constraints:** Flag only the **Free-Text** fields missing a maximum limit.

**3. Implementation Logic & Context**

* **Work Type:** [New Feature - Contract Pending] OR [Integration - Specs Required]
* **Navigation:** Is the URL/Path or Entry Point defined?
* **Technical Details:** (If Integration: list endpoints. If New Feature: confirm data requirements are clear).

**4. UX & State Audit**

* **States:** Are Loading/Empty/Error states addressed?
* **Permissions:** Who can access/action this? (Admin, Editor, etc.)

**5. Gap Analysis & Risks**

* **Blockers:** (Direct missing info).
* **Side Effects:** (Does this change impact existing data or other modules?)

**6. Suggested Acceptance Criteria (Gherkin Style)**

* *Scenario 1: Happy Path*
* *Scenario 2: Validation Error (Exceeding limit on text fields)*
* *Scenario 3: Permission/System Error*

**7. Final Verdict**

* **[APPROVED]** / **[NEEDS REVISION]** / **[BLOCKER]**`;
