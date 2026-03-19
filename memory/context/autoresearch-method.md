# Research: Karpathy's Autoresearch Method for AI Skills

- **Source:** "How to 10x your Claude Skills (using Karpathy's autoresearch method)"
- **Key Philosophy:** Use an autonomous agent to iteratively improve another agent's prompt/skill using a "Red-Green-Refactor" loop based on objective scoring.

## The Autoresearch Loop (Mechanical)
1.  **Baseline:** Run the current skill and score it against a checklist.
2.  **Mutation:** The supervisor agent makes ONE small change to the skill prompt.
3.  **Testing:** Run the mutated skill multiple times against test inputs.
4.  **Evaluation:** Score the outputs using a Binary (Yes/No) Checklist.
5.  **Selection:** If the score improves, keep the change. If it drops, revert.
6.  **Iteration:** Repeat until a target score (e.g., 95%) is hit.

## The "Binary Checklist" Rule
- **Avoid Vague Metrics:** Never use "Rate quality 1-10." It's inconsistent.
- **Use Yes/No Questions:** 
    - "Does the headline include a specific number?"
    - "Is the copy free of the word 'revolutionary'?"
    - "Is the total word count under 150?"
- **Sweet Spot:** 3-6 questions. More than that leads to "gaming the system" where the model passes the test but the output loses soul.

## Strategic Takeaway for Gunner
- **Auto-Improving Rubrics:** We can apply this to **Gunner's Call Grading Rubrics**. 
    - Instead of manually tweaking a "Motivation" prompt, we create a checklist: "Did it correctly identify the house's repair needs? Yes/No."
    - We let a supervisor agent run 50 variations of the prompt against a set of "Gold Standard" transcripts until the grading accuracy hits 95%.
- **Skill Evolution:** We should treat our internal OpenClaw skills (like `ghl-connector` or `property-analyzer`) as living documents that get "Autoresearched" once a week based on the success/failure of real-world tasks.
- **The "Changelog" is the Asset:** The most valuable output isn't just the final prompt, but the log of what *didn't* work. This prevents us from repeating the same prompt-engineering mistakes in the future.
