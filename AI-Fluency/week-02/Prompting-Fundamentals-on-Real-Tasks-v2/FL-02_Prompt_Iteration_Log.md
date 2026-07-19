# FL-02 --- Prompt Iteration Log

## Task

Summarize a long technical article or internship lesson into concise,
actionable study notes with key concepts, examples, and next steps.

------------------------------------------------------------------------

# Version 1 --- Naive Prompt

**Technique:** None (baseline)

### Prompt

> Summarize this article.

### Typical Output

-   Short summary
-   Misses important details
-   No structure
-   No action items
-   Doesn't explain difficult concepts

### Observation

The model completed the task, but the output is too generic for
studying. It doesn't identify what should be learned or practiced.

------------------------------------------------------------------------

# Version 2 --- Role Assignment

**Technique:** Role Assignment

### Prompt

> You are a senior software engineering mentor. Summarize the following
> article for a computer science student preparing for a backend
> internship. Focus on the concepts that matter most in real software
> engineering.

### Output

-   Better explanations
-   More technical vocabulary
-   Better prioritization
-   Concepts explained instead of simply listed

### Observation

Giving the model a role changed the perspective. The summary became more
educational rather than descriptive.

------------------------------------------------------------------------

# Version 3 --- Context and Motivation

**Technique:** Context + Motivation

### Prompt

> You are a senior backend engineer mentoring an intern.

> I am studying for my backend internship. I have limited study time and
> need to understand only the concepts that will likely appear during
> internship tasks or interviews.

> Summarize the article while emphasizing:
>
> -   practical concepts
> -   interview knowledge
> -   common mistakes
> -   why each concept matters

### Output

-   Practical explanations
-   Real-world relevance
-   Better prioritization
-   Less unnecessary information

### Observation

Adding the reason behind the request helped the model decide what
information deserved more attention.

------------------------------------------------------------------------

# Version 4 --- Few-shot Example

**Technique:** Few-shot Prompting

### Prompt

Provide an example format, then instruct the model to summarize using
that exact format.

### Output

-   Consistent formatting
-   Easier to read
-   Similar sections throughout
-   Better organization

### Observation

Providing an example significantly improved consistency.

------------------------------------------------------------------------

# Version 5 --- Output Structure

**Technique:** Structured Output

### Prompt

Request the summary using fixed headings:

-   Overview
-   Main Concepts
-   Important Definitions
-   Real-world Examples
-   Common Interview Questions
-   Common Mistakes
-   Things to Practice
-   Self Quiz

### Output

-   Highly organized
-   Easy to review later
-   Includes practice material

### Observation

Explicit structure reduced ambiguity and produced a reusable study
guide.

------------------------------------------------------------------------

# Version 6 --- Step Decomposition

**Technique:** Step Decomposition

### Prompt

Complete the task in order: 1. Read the article. 2. Identify the main
topics. 3. Explain each topic simply. 4. Highlight technical terms. 5.
Give examples. 6. Mention common mistakes. 7. Generate interview
questions. 8. Produce revision notes. 9. End with practical exercises.

### Output

-   Comprehensive
-   Logical flow
-   Actionable practice

### Observation

Breaking the task into explicit steps produced the highest-quality
result.

------------------------------------------------------------------------

# Cross-Model Comparison

## Claude

### Strengths

-   Excellent organization
-   Concise educational tone
-   Strong consistency

### Weaknesses

-   Sometimes fewer practical examples unless requested

## ChatGPT

### Strengths

-   Rich examples
-   Better practical exercises
-   Strong adaptation to detailed instructions

### Weaknesses

-   Can be more verbose

## Overall Comparison

Claude excelled at concise, structured summaries. ChatGPT produced more
detailed explanations, examples, and exercises. Both completed the task
well, but ChatGPT benefited from tighter length constraints.

------------------------------------------------------------------------

# Reusable Prompt Template

``` text
You are an experienced [ROLE].

Your goal is to help someone who is [AUDIENCE].

Context:
[BACKGROUND]

Complete the task in this order:

1. Understand the input.
2. Identify key information.
3. Organize it into sections.
4. Explain difficult concepts simply.
5. Provide practical examples.
6. Highlight common mistakes.
7. Produce:

# Overview
# Key Concepts
# Important Details
# Practical Examples
# Common Mistakes
# Action Items
# Practice Questions

Requirements:
- Be concise.
- Be technically accurate.
- Do not omit critical information.
- Explain jargon when needed.
```
