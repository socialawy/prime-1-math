Here is the exact wording and instruction data extracted directly from the textbook to help mapping the UI prompts and interaction types.

### 1. Exact Wording of Practice Questions (Chapter 11: Comparing Capacity)
[cite_start]The book relies on very short, direct sentences for this age group[cite: 60, 62, 63]. Here are three exact examples:
* [cite_start]"Circle the container that has more water than the first one." [cite: 61]
* [cite_start]"Draw an amount of water less than the given one." [cite: 62]
* [cite_start]"Arrange the containers in order from least to most water. The first one is done for you." [cite: 63]

### 2. Instruction Verbs Used in the Book
[cite_start]The textbook uses a consistent set of action verbs to tell the student what to do[cite: 13, 21, 60, 63, 75, 139]. For your app's UI instructions or audio prompts, you should use these exact verbs:
* [cite_start]**Circle** ("Circle the correct shape.") [cite: 23]
* [cite_start]**Color** ("Color the one that has less water.") [cite: 60]
* [cite_start]**Draw** ("Draw an amount of water...") [cite: 62]
* [cite_start]**Cross out** ("Cross out the shape that does not belong in each group.") [cite: 21]
* [cite_start]**Match** ("Match the equal amounts.") [cite: 76]
* [cite_start]**Join** ("Join each shape to its name.") [cite: 24]
* [cite_start]**Arrange** ("Arrange the containers in order...") [cite: 63]
* [cite_start]**Count** ("Count the groups of 10...") [cite: 190]
* [cite_start]**Write** ("Write how many cups.") [cite: 75]
* [cite_start]**Complete** ("Complete to make 10.") [cite: 139]
* [cite_start]**Choose** ("Choose the correct answer.") [cite: 13]

### 3. Typical "Fill in the Blank" Questions (Chapter 12: Addition)
Chapter 12 uses two different styles of fill-in-the-blank questions. 

[cite_start]**Style A: Standard Equation Completion** [cite: 139]
The book presents a simple missing addend with the instruction:
> "Complete to make 10." 
> [cite_start]$2 + \_\_ = 10$ [cite: 139]
> [cite_start]$\_\_ + 6 = 10$ [cite: 140]

[cite_start]**Style B: Conceptual Step-by-Step (The "Making 10" Logic)** [cite: 143]
For teaching the split strategy, the book uses empty boxes ($\Box$) embedded in sentences. Here is the exact text for $5 + 8$:
> "Let's look at two ways to calculate 5 + 8. 
> [cite_start]Tell us what numbers go in the $\Box$ [cite: 143]
> [cite_start]1. 5 needs $\Box$ more to make 10. [cite: 143]
> [cite_start]2. Split 8 into $\Box$ and 3 [cite: 143]
> [cite_start]3. Add $\Box$ to 5 to make 10. [cite: 143]
> [cite_start]4. 10 and $\Box$ make $\Box$" [cite: 143]

For the web application, "Style B" is where to use the interactive "Split Tree" component to allow the student to drag and drop these missing numbers into the boxes dynamically!