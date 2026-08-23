# Assignment: Survive the Crit – Design Review & Fix Log

> **Track:** General AI Fluency | **Week:** 6 | **Phase:** Build+  
> **Author:** Amr Khaled Morcy  
> **Proof Statement Submitted to Reviewer:**  
> *"I build thoughtful full-stack web applications that combine strong engineering with exceptional user experience."*

---

## 1. Review Setup & Core Questions

The live portfolio (`https://3mr5aled.netlify.app`) was submitted for peer review along with the Chapter 1 Proof Statement. The reviewer was instructed to evaluate the portfolio without defensive commentary from the author, focusing on two primary questions:

1. **Question 1:** *"In ten seconds, what do I do?"*
   * **Reviewer Answer:** *"You are a full-stack developer who builds web applications with React, Next.js, Node.js, and AI workflows."* -> **[PASS]** (Clear positioning landed immediately).
2. **Question 2:** *"Would you believe I'm good at it?"*
   * **Reviewer Answer:** *"Yes, the case studies show real projects (healthcare, home service, API security, MCP agents) with clear problem-solution-outcome breakdowns rather than just a list of buzzwords."* -> **[PASS]**

---

## 2. Reviewer Feedback & Categorization Matrix

All incoming feedback was sorted into **Must-Fix** (confusing, broken, hurts the primary action) vs. **Nice-to-Have** (future enhancements):

| Feedback Received | Category | Status | Action Taken / Plan |
| :--- | :---: | :---: | :--- |
| *"The contact section at the bottom was missing a direct email fallback link for people who prefer emailing directly instead of filling out a form."* | **Must-Fix** | **Fixed** | Added direct `mailto:3mr5aled.dev@gmail.com` link into the footer contact section. |
| *"On smaller screens, the hero heading text felt slightly cramped without enough line height."* | **Must-Fix** | **Fixed** | Adjusted hero heading line-height class to `leading-tight tracking-tight` with `py-12 sm:py-20` padding. |
| *"The case study tags (MCP Protocol, React, Node.js) were hard to read because the text was too light."* | **Must-Fix** | **Fixed** | Increased tag text font weight to `font-semibold` and contrast to `text-gray-700` on `bg-gray-100`. |
| *"Add live embedded interactive demos directly inside the case study cards."* | **Nice-to-Have** | **Backlog** | Scheduled for Week 7 capstone enhancements once dedicated demo microservices are hosted. |
| *"Add dark mode toggle switch in the navbar."* | **Nice-to-Have** | **Backlog** | Theme switcher prioritized as a post-capstone enhancement. |

---

## 3. Evidence of Must-Fixes Addressed on Live Site

1. **Direct Email Fallback Link:** Updated `footer` component in [app/page.tsx](file:///D:/03-Career/02-Internships/Flyrank%20AI%20Intern/Assignments/flyrank-ai-internship/AI-Fluency/week-04/Ship-a-Blank-Page/app/page.tsx) with explicit `mailto:3mr5aled.dev@gmail.com` link.
2. **Tag Contrast Enhancement:** Upgraded all case study tech stack badge contrast from light gray to `font-semibold text-gray-700 bg-gray-100`.
3. **Hero Line Spacing:** Adjusted text container leading and vertical padding for mobile viewports.

---
*Submitted for FlyRank Internship Week 6 Assignment: Survive the Crit.*
