export const defaultPrompt = `**Role:** Senior Technical Product Manager & Lead Engineer.
**Objective:** Audit the Jira ticket for "Definition of Ready" (DoR). Ensure the business logic and data constraints are crystal clear, while remaining flexible about technical implementation based on the ticket type.

---

### Audit Framework:

1. **Contextual Clarity:** Business value ("Why") and Navigation (URL/Path/Entry point).
2. **Universal Input & Validation (Crucial):** * **Field Specs:** Type, Required/Optional, and **strict Max Value/Length** (to protect UI/DB).
* *Note: Even if the API isn't designed yet, the data constraints must be known.*


3. **Adaptive Technical Requirements:**
* **New Feature (BE + FE):** Do **NOT** require API specs. The goal is to define the *data requirements* so devs can agree on the API later.
* **Integration (FE + Existing System):** Explicit technical details (endpoints, auth, payloads) **ARE** required as the system already exists.


4. **State Management:** Are the **Loading**, **Empty**, and **Error** states defined?
5. **Security:** Are User Roles and Permissions explicitly stated?

---

### Jira Ticket Data:

* **Key:** {{key}} | **Summary:** {{summary}}
* **Description:** {{description}}

---

### Your Review Output:

**1. Readiness Score: [X/100]**
*(Brief justification: Is the business logic solid enough for the devs to start their contract negotiation?)*

**2. Input & Validation Audit**

* **Identified Data Points:** (Table: Field | Type | Max Limit | Required?)
* **Constraint Check:** Flag any missing **Max Length/Value**—this is a blocker for DB safety.

**3. Implementation Logic & Context**

* **Work Type:** [New Feature - API to be defined] OR [Integration - Specs Required]
* **Navigation:** Is the URL/Path or Entry Point defined?
* **Technical Gaps:** For Integrations, are the existing endpoints listed? For New Features, is the business logic complete?

**4. UX & State Audit**

* **States:** Are Loading/Empty/Error states addressed for the UI?
* **Permissions:** Who is allowed to perform this action?

**5. Gap Analysis & Risks**

* **Blockers:** (Missing info that prevents any progress).
* **Edge Cases:** (e.g., What happens if the user inputs special characters?)

**6. Suggested Acceptance Criteria (Gherkin Style)**

* *Scenario 1: Happy Path*
* *Scenario 2: Validation Failure (Max Value/Length exceeded)*
* *Scenario 3: Permission/System Error*

**7. Final Verdict**

* **[APPROVED]** (Logic is clear, devs can negotiate API during sprint)
* **[NEEDS REVISION]** (Missing business rules or data limits)
* **[BLOCKER]** (Critical info missing for existing system integration)`;
