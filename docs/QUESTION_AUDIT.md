# Question Audit

Generated with seed `101`. Re-run with `QUESTION_AUDIT_SEED=<n> npm run audit:questions` for another deterministic generated set.

## Counts

- Built lesson activities: 64
- Raw source rows: 129
- Adapted source activities: 115
- Assessment source rows: 23

## Initial Review Findings

- **P2 source-coverage**: 38/64 built activities are generated/fallback rows, not direct source matches. Review these against the workbook before calling the question set source-locked.

## Manual Verification Task
> [!IMPORTANT]
> **NotebookLM Alignment Required**: Verify all 60~80 questions (currently 64 built) against original books using NotebookLM for absolute parity.

## Built Lesson Activities

| # | Chapter | Activity | Origin | Concept | Prompt | Answer | Source match |
| - | - | - | - | - | - | - | - |
| 1 | ch10 | ch10-identify-1 | generated/fallback | shape-3d-identify | Which option is prism? | prism |  |
| 2 | ch10 | ch10-identify-2 | generated/fallback | shape-3d-identify | Which option is cuboid? | cuboid |  |
| 3 | ch10 | ch10-footprint-1 | generated/fallback | shape-3d-to-2d | What 2D shape comes from cube? | square |  |
| 4 | ch10 | ch10-footprint-2 | generated/fallback | shape-3d-to-2d | What 2D shape comes from cuboid? | rectangle |  |
| 5 | ch10 | ch10-mixed-identify-1 | generated/fallback | shape-3d-identify | Which option is cuboid? | cuboid |  |
| 6 | ch10 | ch10-mixed-footprint-2 | generated/fallback | shape-3d-to-2d | What 2D shape comes from cylinder? | circle |  |
| 7 | ch10 | ch10-mixed-identify-3 | generated/fallback | shape-3d-identify | Which option is cube? | cube |  |
| 8 | ch10 | ch10-mixed-footprint-4 | generated/fallback | shape-3d-to-2d | What 2D shape comes from prism? | triangle |  |
| 9 | ch11 | ch11-s5-q1 | source/adapted | compare-area | Which shape has the smaller area? | D | ch11-s5-q1 |
| 10 | ch11 | ch11-s5-q1-pair2 | source/adapted | compare-area | Which shape has the smaller area? | A | ch11-s5-q1-pair2 |
| 11 | ch11 | ch11-s5-q1-pair3 | source/adapted | compare-area | Which shape has the smaller area? | B | ch11-s5-q1-pair3 |
| 12 | ch11 | ch11-s3-q1 | source/adapted | compare-capacity | Arrange containers from least to most cups. | order C -> B -> A / [1,2,3] | ch11-s3-q1 |
| 13 | ch11 | ch11-s4-q1 | source/adapted | compare-capacity | Tap the container that has more water. | 7 | ch11-s4-q1 |
| 14 | ch11 | ch11-capacity-3 | generated/fallback | compare-capacity | How many more cups does one container have? | 3 |  |
| 15 | ch11 | ch11-s6-q1-pair2 | source/adapted | compare-area | Which shape has the larger area? | Shape B | ch11-s6-q1-pair2 |
| 16 | ch11 | ch11-s6-q1-pair3 | source/adapted | compare-area | Which shape has the larger area? | Shape A | ch11-s6-q1-pair3 |
| 17 | ch12 | ch12-learn-1 | source/adapted | addition-make-10 | 9 + 3 | {"finalAnswer":12,"blanks":[1,1,2,1,2,12]} | ch12-s7-q1 |
| 18 | ch12 | ch12-learn-2 | source/adapted | addition-make-10 | 5 + 8 | {"finalAnswer":13,"blanks":[2,2,3,2,3,13]} | ch12-s7-q1-2 |
| 19 | ch12 | ch12-learn-3 | source/adapted | addition-make-10 | 7 + ? = 10 | {"finalAnswer":3,"blanks":[3]} | ch12-a-q1 |
| 20 | ch12 | ch12-practice-1 | source/adapted | guided-box-make10 | ? + 9 = 10 | {"finalAnswer":1,"blanks":[1]} | ch12-a-q1-2 |
| 21 | ch12 | ch12-practice-2 | source/adapted | guided-box-make10 | 10 + 8 = ? | {"finalAnswer":18,"blanks":[18]} | ch12-a-q1-3 |
| 22 | ch12 | ch12-practice-3 | source/adapted | guided-box-make10 | 9 + 7 = ? | {"finalAnswer":16,"blanks":[16]} | ch12-a-q1-4 |
| 23 | ch12 | ch12-practice-4 | generated/fallback | guided-box-make10 | 5 + 6 | {"finalAnswer":11,"blanks":[4,4,1,4,1,11]} |  |
| 24 | ch12 | ch12-practice-5 | generated/fallback | guided-box-make10 | 5 + 7 | {"finalAnswer":12,"blanks":[3,3,2,3,2,12]} |  |
| 25 | ch13 | ch13-learn-1 | source/adapted | subtraction-use-10 | 14 - 8 | {"finalAnswer":6,"blanks":[4,4,4,4,6]} | ch13-s8-q1 |
| 26 | ch13 | ch13-learn-2 | source/adapted | subtraction-use-10 | 18 - 9 = ? | {"finalAnswer":9,"blanks":[9]} | ch13-s8-q3-2 |
| 27 | ch13 | ch13-learn-3 | source/adapted | subtraction-use-10 | 14 - 7 = ? | {"finalAnswer":7,"blanks":[7]} | ch13-s8-q3-3 |
| 28 | ch13 | ch13-practice-1 | source/adapted | guided-box-sub10 | 12 - 4 = ? | {"finalAnswer":8,"blanks":[8]} | ch13-s8-q3-4 |
| 29 | ch13 | ch13-practice-2 | source/adapted | guided-box-sub10 | 15 - 8 | {"finalAnswer":7,"blanks":[7]} | ch13-a-q1 |
| 30 | ch13 | ch13-practice-3 | generated/fallback | guided-box-sub10 | 11 - 4 | {"finalAnswer":7,"blanks":[1,3,1,3,7]} |  |
| 31 | ch13 | ch13-practice-4 | generated/fallback | guided-box-sub10 | 11 - 5 | {"finalAnswer":6,"blanks":[10,1,5,5,1,6]} |  |
| 32 | ch13 | ch13-practice-5 | generated/fallback | guided-box-sub10 | 11 - 5 | {"finalAnswer":6,"blanks":[1,4,1,4,6]} |  |
| 33 | ch14 | ch14-s9-q1 | source/adapted | place-value-group | Group/count 40 blocks | 4 tens, 0 ones | ch14-s9-q1 |
| 34 | ch14 | ch14-s9-q1-2 | source/adapted | place-value-group | Group/count 60 blocks | 6 tens, 0 ones | ch14-s9-q1-2 |
| 35 | ch14 | ch14-hundreds-1 | generated/fallback | place-value-hundreds-chart | fill-missing on hundreds chart | [9,12,72,95] |  |
| 36 | ch14 | ch14-hundreds-2 | generated/fallback | place-value-hundreds-chart | jump-by-10 on hundreds chart | [14,34,84] |  |
| 37 | ch14 | ch14-hundreds-3 | generated/fallback | place-value-hundreds-chart | I have 3 tens and 4 ones. Who am I? | 34 |  |
| 38 | ch14 | ch14-numberline-1 | generated/fallback | place-value-number-line | Fill number line 0-50, jump 10 | [10,30] |  |
| 39 | ch14 | ch14-numberline-2 | generated/fallback | place-value-number-line | Fill number line 0-100, jump 5 | [45,50,65] |  |
| 40 | ch14 | ch14-numberline-3 | generated/fallback | place-value-number-line | Fill number line 0-100, jump 10 | [20,70,80] |  |
| 41 | ch15 | ch15-compose-1 | generated/fallback | compose-shapes | a large triangle | correct |  |
| 42 | ch15 | ch15-compose-2 | generated/fallback | compose-shapes | a rectangle | correct |  |
| 43 | ch15 | ch15-compose-3 | generated/fallback | compose-shapes | a large triangle | correct |  |
| 44 | ch15 | ch15-compose-4 | generated/fallback | compose-shapes | a square | correct |  |
| 45 | ch15 | ch15-identify-1 | generated/fallback | shape-3d-identify | Which option is prism? | prism |  |
| 46 | ch15 | ch15-identify-2 | generated/fallback | shape-3d-identify | Which option is cylinder? | cylinder |  |
| 47 | ch15 | ch15-footprint-1 | generated/fallback | shape-3d-to-2d | What 2D shape comes from cuboid? | rectangle |  |
| 48 | ch15 | ch15-footprint-2 | generated/fallback | shape-3d-to-2d | What 2D shape comes from prism? | triangle |  |
| 49 | ch16 | s20_p2 | source/adapted | tell-time | What time is it? | 10:30 | s20_p2 |
| 50 | ch16 | s20_p2-2 | source/adapted | tell-time | What time is it? | 7:00 | s20_p2-2 |
| 51 | ch16 | ch16-read-3 | generated/fallback | tell-time | What time is it? | half past 5 |  |
| 52 | ch16 | ch16-read-4 | generated/fallback | tell-time | What time is it? | half past 1 |  |
| 53 | ch16 | ch16-clock-1 | generated/fallback | tell-time | What time is it? | 9 o'clock |  |
| 54 | ch16 | ch16-clock-2 | generated/fallback | tell-time | What time is it? | 10 o'clock |  |
| 55 | ch16 | ch16-clock-3 | generated/fallback | tell-time | Set 12 half-past | 12 half-past |  |
| 56 | ch16 | ch16-clock-4 | generated/fallback | tell-time | Set 7 o-clock | 7 o-clock |  |
| 57 | ch17 | ch17-s22-q5 | source/adapted | add-sub-mixed | There were 12 cakes. 4 were eaten. How many are left? | 8 | ch17-s22-q5 |
| 58 | ch17 | ch17-word-2 | generated/fallback | add-sub-mixed | Omar has 6 birds. Omar gave 5 to a friend. How many birds does Omar have now? | 1 |  |
| 59 | ch17 | ch17-word-3 | generated/fallback | add-sub-mixed | Nour has 20 apples. Nour gave 11 to a friend. How many apples does Nour have now? | 9 |  |
| 60 | ch17 | ch17-word-4 | generated/fallback | add-sub-mixed | Omar has 12 stars. Omar gave 2 to a friend. How many stars does Omar have now? | 10 |  |
| 61 | ch17 | ch17-s21-q1 | source/adapted | guided-box-make10 | 20 and 3 make __ | {"finalAnswer":23,"blanks":[23]} | ch17-s21-q1 |
| 62 | ch17 | ch17-s21-q4 | source/adapted | guided-box-sub10 | If you are the 4th person in a line, how many people are in front of you? | {"finalAnswer":3,"blanks":[3]} | ch17-s21-q4 |
| 63 | ch17 | ass17_p1 | source/adapted | number-comparison | 45 ? 27; 8 tens ? 11 ones; 79 ? 82 | 45 > 27; 8 tens > 11 ones; 79 < 82 | ass17_p1 |
| 64 | ch17 | ch17-word-extra-1 | generated/fallback | add-sub-mixed | Hani has 8 birds. Hani gave 4 to a friend. How many birds does Hani have now? | 4 |  |

## Raw Source Rows

| # | Chapter | Source id | Type | Prompt | Answer |
| - | - | - | - | - | - |
| 1 | ch10 | ch10-s1-q1 | multiple-choice-visual | Which shape looks like [Target]? \| target=prism | c |
| 2 | ch10 | ch10-s1-q1-2 | multiple-choice-visual | Which shape looks like [Target]? \| target=sphere | a |
| 3 | ch10 | ch10-s1-q2 | matching | Join each shape to its name. | ["1","Cuboid shape"] |
| 4 | ch10 | ch10-s1-q2-2 | matching | Join each shape to its name. | ["2","Prism shape"] |
| 5 | ch10 | ch10-s1-q2-3 | matching | Join each shape to its name. | ["3","Ball shape"] |
| 6 | ch10 | ch10-s1-q2-4 | matching | Join each shape to its name. | ["4","Cylinder shape"] |
| 7 | ch10 | ch10-s1-q2-5 | matching | Join each shape to its name. | ["5","Cube shape"] |
| 8 | ch10 | ch10-s2-q1 | visual-selection | Trace the following shapes, then circle the shapes you draw. \| source=cylinder | circle |
| 9 | ch10 | ch10-s2-q1-2 | visual-selection | Trace the following shapes, then circle the shapes you draw. \| source=prism | triangle |
| 10 | ch10 | ch10-s2-q1-3 | visual-selection | Trace the following shapes, then circle the shapes you draw. \| source=cuboid | rectangle |
| 11 | ch10 | ch10-s2-q1-4 | visual-selection | Trace the following shapes, then circle the shapes you draw. \| source=cube | square |
| 12 | ch10 | ch10-a-q5 | counting-composite | How many? | {"cube":6,"cuboid":2,"cylinder":1,"ball":0} |
| 13 | ch11 | ch11-s3-q1 | ordering | Arrange the containers in order from most to least amount. | ["A","B","C"] |
| 14 | ch11 | ch11-s3-q1-2 | ordering | Arrange the containers in order from most to least amount. | ["A","B","C"] |
| 15 | ch11 | ch11-s3-q1-3 | ordering | Arrange the containers in order from most to least amount. | ["A","B","C"] |
| 16 | ch11 | ch11-s4-q1 | unit-counting | Notice the amount of water in each container. Write how many cups. \| target=bucket | 5 |
| 17 | ch11 | ch11-s4-q1-2 | unit-counting | Notice the amount of water in each container. Write how many cups. \| target=juice-box | 7 |
| 18 | ch11 | ch11-s4-q1-3 | unit-counting | Notice the amount of water in each container. Write how many cups. \| target=vase | 3 |
| 19 | ch11 | ch11-s5-q1 | area-comparison-visual | Arrange from the smallest area to the largest area. | ["D","A","B","C"] |
| 20 | ch11 | ch11-s5-q1-2 | area-comparison-visual | Arrange from the smallest area to the largest area. | ["D","A","B","C"] |
| 21 | ch11 | ch11-s5-q1-3 | area-comparison-visual | Arrange from the smallest area to the largest area. | ["D","A","B","C"] |
| 22 | ch11 | ch11-s5-q1-4 | area-comparison-visual | Arrange from the smallest area to the largest area. | ["D","A","B","C"] |
| 23 | ch11 | ch11-s6-q1 | area-grid-counting | Count the squares of the colored area, and write how many units. |  |
| 24 | ch11 | ch11-s6-q1-2 | area-grid-counting | Count the squares of the colored area, and write how many units. |  |
| 25 | ch11 | ch11-s6-q1-3 | area-grid-counting | Count the squares of the colored area, and write how many units. |  |
| 26 | ch11 | ch11-s6-q1-4 | area-grid-counting | Count the squares of the colored area, and write how many units. |  |
| 27 | ch11 | ch11-s6-q3 | word-problem | Youssef and Omar colored the shape, and this is what it looked like on the right. | Omar |
| 28 | ch12 | ch12-s7-q1 | split-tree-addition | Let's do addition. Make a 10. | 12 |
| 29 | ch12 | ch12-s7-q1-2 | split-tree-addition | Make a 10 to add. | 13 |
| 30 | ch12 | ch12-s7-q3 | word-problem | There are 8 dogs. 7 more dogs come. How many dogs are there in total? | 15 |
| 31 | ch12 | ch12-a-q1 | fill-in-the-blanks | Complete the following. \| 7 + __ = 10 | 3 |
| 32 | ch12 | ch12-a-q1-2 | fill-in-the-blanks | Complete the following. \| __ + 9 = 10 | 1 |
| 33 | ch12 | ch12-a-q1-3 | fill-in-the-blanks | Complete the following. \| 10 + 8 = __ | 18 |
| 34 | ch12 | ch12-a-q1-4 | fill-in-the-blanks | Complete the following. \| 9 + 7 = __ | 16 |
| 35 | ch13 | ch13-s8-q1 | split-tree-subtraction | Let's look at how to calculate 14 - 8. Tell us what numbers go in the [Box]. | 6 |
| 36 | ch13 | ch13-s8-q3 | fill-in-the-blanks | Complete the following. \| 10 + 5 = __ | 15 |
| 37 | ch13 | ch13-s8-q3-2 | fill-in-the-blanks | Complete the following. \| 18 - 9 = __ | 9 |
| 38 | ch13 | ch13-s8-q3-3 | fill-in-the-blanks | Complete the following. \| 14 - 7 = __ | 7 |
| 39 | ch13 | ch13-s8-q3-4 | fill-in-the-blanks | Complete the following. \| 12 - 4 = __ | 8 |
| 40 | ch13 | ch13-a-q1 | result-finding | Find the result. \| 15 - 8 | 7 |
| 41 | ch13 | ch13-a-q1-2 | result-finding | Find the result. | prism |
| 42 | ch14 | ch14-s9-q1 | ten-grouping | Count the groups of 10, then write the numerals. |  |
| 43 | ch14 | ch14-s9-q1-2 | ten-grouping | Count the groups of 10, then write the numerals. |  |
| 44 | ch14 | ch14-s9-q1-3 | ten-grouping | Count the groups of 10, then write the numerals. |  |
| 45 | ch14 | ch14-s10-q1 | place-value-counting | Count how many 10s and 1s. Write the number. |  |
| 46 | ch14 | ch14-s10-q1-2 | place-value-counting | Count how many 10s and 1s. Write the number. |  |
| 47 | ch14 | ch14-s10-q1-3 | place-value-counting | Count how many 10s and 1s. Write the number. |  |
| 48 | ch14 | ch14-s10-q4 | word-problem | Ahmed had 13 pencils. He gave away 9 of them. How many pencils does he have now? | 4 |
| 49 | ch14 | ch14-s11-q1 | matching-to-100 | Match the pairs that make 100. | {"left":30,"right":70} |
| 50 | ch14 | ch14-s11-q1-2 | matching-to-100 | Match the pairs that make 100. | {"left":40,"right":60} |
| 51 | ch14 | ch14-s11-q1-3 | matching-to-100 | Match the pairs that make 100. | {"left":50,"right":50} |
| 52 | ch14 | ch14-s11-q1-4 | matching-to-100 | Match the pairs that make 100. | {"left":80,"right":20} |
| 53 | ch14 | ch14-s12-q1 | grid-fragment-fill | Fill in the missing numbers in the 100-chart fragments. |  |
| 54 | ch14 | ch14-s15-q1 | math-problems | Solve the addition and subtraction problems. | 73 |
| 55 | ch14 | ch14-s15-q1-2 | math-problems | Solve the addition and subtraction problems. | 100 |
| 56 | ch14 | ch14-s15-q1-3 | math-problems | Solve the addition and subtraction problems. | 40 |
| 57 | ch14 | ch14-s15-q1-4 | math-problems | Solve the addition and subtraction problems. | 96 |
| 58 | ch14 | ch14-s16-q1 | capacity-ordering | Order the beakers from the least capacity to the greatest capacity. | A, C, B |
| 59 | ch14 | ch14-s16-q1-2 | capacity-ordering | Order the beakers from the least capacity to the greatest capacity. | A, C, B |
| 60 | ch14 | ch14-s16-q1-3 | capacity-ordering | Order the beakers from the least capacity to the greatest capacity. | A, C, B |
| 61 | ch14 | ch14-s16-q3 | word-problem | Mariam had 80 candies. She gave 40 to her brother. How many does she have left? | 40 |
| 62 | ch15 | s17_p1 | shape_composition | How many pieces of colored paper A do you need to make each shape below? | 10 |
| 63 | ch15 | s17_p1-2 | shape_composition | How many pieces of colored paper A do you need to make each shape below? | 8 |
| 64 | ch15 | s17_p1-3 | shape_composition | How many pieces of colored paper A do you need to make each shape below? | 8 |
| 65 | ch15 | s17_p2 | mixed_arithmetic | Complete the following. |  |
| 66 | ch15 | s17_p3 | comparison_circle | Circle the bigger number. | {"options":[62,69],"answer":69} |
| 67 | ch15 | s17_p3-2 | comparison_circle | Circle the bigger number. | {"options":[19,91],"answer":91} |
| 68 | ch15 | s17_p3-3 | comparison_circle | Circle the bigger number. | {"options":[120,112],"answer":120} |
| 69 | ch15 | s17_p3-4 | comparison_circle | Circle the bigger number. | {"options":[54,47],"answer":54} |
| 70 | ch15 | s17_p4 | capacity_ordering | Arrange the containers in order from most to least amount. | A, D, B, C |
| 71 | ch15 | s17_p4-2 | capacity_ordering | Arrange the containers in order from most to least amount. | A, D, B, C |
| 72 | ch15 | s17_p4-3 | capacity_ordering | Arrange the containers in order from most to least amount. | A, D, B, C |
| 73 | ch15 | s17_p4-4 | capacity_ordering | Arrange the containers in order from most to least amount. | A, D, B, C |
| 74 | ch15 | s18_p1 | stick_construction | We made a shape using sticks (—) as follow. Answer the questions. |  |
| 75 | ch15 | s18_p2 | multiple_choice | Choose the correct answer. |  |
| 76 | ch15 | s18_p3 | grid_fragment | Write the number in [blank square] |  |
| 77 | ch15 | s18_p4 | word_problem | There are 40 people on the bus, 20 people got off. How many people are on the bus now? | 20 |
| 78 | ch15 | s19_p1 | dot_grid_copy | Draw the same shape. |  |
| 79 | ch15 | s19_p2 | matching | Match to make 100. | [70,30] |
| 80 | ch15 | s19_p2-2 | matching | Match to make 100. | [80,20] |
| 81 | ch15 | s19_p2-3 | matching | Match to make 100. | [40,60] |
| 82 | ch15 | s19_p2-4 | matching | Match to make 100. | [10,90] |
| 83 | ch15 | s19_p2-5 | matching | Match to make 100. | [50,50] |
| 84 | ch15 | s19_p2-6 | matching | Match to make 100. | [100,0] |
| 85 | ch15 | s19_p3 | area_ordering | Arrange the following shapes from the greatest area to the least area. | B, A, C, D |
| 86 | ch15 | s19_p3-2 | area_ordering | Arrange the following shapes from the greatest area to the least area. | B, A, C, D |
| 87 | ch15 | s19_p3-3 | area_ordering | Arrange the following shapes from the greatest area to the least area. | B, A, C, D |
| 88 | ch15 | s19_p3-4 | area_ordering | Arrange the following shapes from the greatest area to the least area. | B, A, C, D |
| 89 | ch15 | s19_p4 | make_ten_addition | Make a ten to add 8 + 5 | 13 |
| 90 | ch15 | s19_p5 | stick_construction | How many sticks (—) were used to make the opposite shape? | 12 |
| 91 | ch16 | s20_p1 | number_ordering | Arrange the following numbers from least to greatest. | [19,63,85,94,100] |
| 92 | ch16 | s20_p1-2 | number_ordering | Arrange the following numbers from least to greatest. | [19,63,85,94,100] |
| 93 | ch16 | s20_p1-3 | number_ordering | Arrange the following numbers from least to greatest. | [19,63,85,94,100] |
| 94 | ch16 | s20_p1-4 | number_ordering | Arrange the following numbers from least to greatest. | [19,63,85,94,100] |
| 95 | ch16 | s20_p1-5 | number_ordering | Arrange the following numbers from least to greatest. | [19,63,85,94,100] |
| 96 | ch16 | s20_p2 | analog_clock_read | Let's read the clocks. |  |
| 97 | ch16 | s20_p2-2 | analog_clock_read | Let's read the clocks. |  |
| 98 | ch16 | s20_p2-3 | analog_clock_read | Let's read the clocks. |  |
| 99 | ch16 | s20_p3 | stick_construction | We made a shape using sticks (—) as follow. Answer the questions. |  |
| 100 | ch16 | s20_p4 | multiple_choice | Choose the correct answer. |  |
| 101 | ch16 | ass16_p1 | trace_source_identification | We traced a shape onto paper, and it looks like a red circle. Which shape did we trace? | cylinder |
| 102 | ch16 | ass16_p2 | capacity_matching | Match the equal amounts (number of cups). | {"item1":"Patterned vase","item2":"Yellow pitcher","cups":3} |
| 103 | ch16 | ass16_p2-2 | capacity_matching | Match the equal amounts (number of cups). | {"item1":"Red gas can","item2":"Red vase","cups":4} |
| 104 | ch16 | ass16_p2-3 | capacity_matching | Match the equal amounts (number of cups). | {"item1":"Orange juice box","item2":"Green bucket","cups":5} |
| 105 | ch16 | ass16_p2-4 | capacity_matching | Match the equal amounts (number of cups). | {"item1":"Red teapot","item2":"Pink water bottle","cups":6} |
| 106 | ch16 | ass16_p3 | odd_one_out_3d | Cross out the shape that does not belong in each group. |  |
| 107 | ch16 | ass16_p4 | shape_decomposition | Which shapes were used to make the opposite structure? Choose all that apply. | ["cube","cylinder","cuboid"] |
| 108 | ch16 | ass16_p5 | area_ordering_grid | Arrange from the largest area to the smallest area. | A, D, B, C |
| 109 | ch16 | ass16_p5-2 | area_ordering_grid | Arrange from the largest area to the smallest area. | A, D, B, C |
| 110 | ch16 | ass16_p5-3 | area_ordering_grid | Arrange from the largest area to the smallest area. | A, D, B, C |
| 111 | ch16 | ass16_p5-4 | area_ordering_grid | Arrange from the largest area to the smallest area. | A, D, B, C |
| 112 | ch16 | ass16_p6 | object_part_counting | How many of each shape were used to make the toy cart? |  |
| 113 | ch17 | ass17_p1 | number_comparison | Compare using >, <, or =. | > |
| 114 | ch17 | ass17_p1-2 | number_comparison | Compare using >, <, or =. | > |
| 115 | ch17 | ass17_p1-3 | number_comparison | Compare using >, <, or =. | < |
| 116 | ch17 | ass17_p2 | fill_missing_numbers | Write the missing numbers. |  |
| 117 | ch17 | ass17_p3 | visual_pattern_completion | Continue the pattern. |  |
| 118 | ch17 | ass17_p4 | counting_to_100 | Count the total number of objects. (Bundles of 10 and ones) | 45 |
| 119 | ch17 | ass17_p4-2 | counting_to_100 | Count the total number of objects. (Bundles of 10 and ones) | 20 |
| 120 | ch17 | ch17-s21-q1 | place-value-composition | 20 and 3 make __ | 23 |
| 121 | ch17 | ch17-s21-q4 | ordinal-word-problem | If you are the 4th person in a line, how many people are in front of you? | 3 |
| 122 | ch17 | ch17-s21-q5 | number-comparison | Which is greater: 5 tens or 48 ones? | 5 tens |
| 123 | ch17 | ch17-s22-q1 | analog-clock-read | Write the time shown on the clock. | 3:30 |
| 124 | ch17 | ch17-s22-q3 | shape-logic-counting | How many green triangle papers do you need to cover a 2x2 square area if each small square uses 2 triangles? | 8 |
| 125 | ch17 | ch17-s22-q5 | subtraction-word-problem | There were 12 cakes. 4 were eaten. How many are left? | 8 |
| 126 | ch17 | ch17-s23-q1 | shape-tracing-match | Which shape do you get when tracing these objects? | {"object":"Tissue box","shape":"Rectangle"} |
| 127 | ch17 | ch17-s23-q1-2 | shape-tracing-match | Which shape do you get when tracing these objects? | {"object":"Tent","shape":"Triangle"} |
| 128 | ch17 | ch17-s23-q1-3 | shape-tracing-match | Which shape do you get when tracing these objects? | {"object":"Ball","shape":"Circle"} |
| 129 | ch17 | ch17-s23-q4 | stick-construction-analysis | Look at the shape made of sticks [cross shape]. Answer the questions. |  |

## Assessment Source Rows

| # | Assessment | Source id | Type | Prompt | Answer |
| - | - | - | - | - | - |
| 1 | Accumulative Assessment Till Chapter 17 | f2_p1 | analog-clock-read-multiple | What time is it? | [{"id":"f2_c1","time":"1:15","details":"Hour hand past 1, minute hand at 3"},{"id":"f2_c2","time":"6:30","details":"Hour hand between 6-7, minute hand at 6"},{"id":"f2_c3","time":"2:45","details":"Hour hand near 3, minut |
| 2 | Accumulative Assessment Till Chapter 17 | f2_p2 | number-ordering | Order from least to greatest. | [10,13,30,31] |
| 3 | Accumulative Assessment Till Chapter 17 | f2_p3 | shape-footprint-match | Match the 3D shape to its face footprint. | [{"3d":"cube","face":"square"},{"3d":"cuboid","face":"rectangle"},{"3d":"cylinder","face":"circle"}] |
| 4 | Accumulative Assessment Till Chapter 17 | f2_p4 | money-counting | How much money? (L.E.) | [{"id":"f2_m1","composition":"one 10 LE note + five 1 LE coins","answer":15},{"id":"f2_m2","composition":"two 20 LE notes","answer":40}] |
| 5 | Final Assessment 3 | f3_p1 | composite-shape-analysis | A parallelogram is made of 2 __? | triangles |
| 6 | Final Assessment 3 | f3_p2 | grid-navigation | On the 100-chart, what is the number above 55? | 45 |
| 7 | Final Assessment 3 | f3_p3 | area-comparison | Which color shape has the largest area? | Yellow |
| 8 | Final Assessment 4 | f4_p1 | word-to-number | Which number is 'one hundred'? | 100 |
| 9 | Final Assessment 4 | f4_p2 | make-a-ten-strategy | To subtract 17 - 8, we can decompose 8 into 7 and 1. 17 - 7 = 10. 10 - 1 = __? | 9 |
| 10 | Final Assessment 4 | f4_p3 | clock-hands-drawing | Draw the minute hand for 5:20. Where should it point? | 4 |
| 11 | Final Assessment 5 | f5_p1 | dot-grid-copy | Copy the 'M' shape onto the dot grid. |  |
| 12 | Final Assessment 5 | f5_p2 | ordinal-logic | Ibrahim is 5th from the back. There are 8 people in front of him. How many people in total? | 13 |
| 13 | Final Assessment 6 | f6_p1 | 3d-shape-identification | Which shape is a cylinder? | soup can |
| 14 | Final Assessment 6 | f6_p2 | clock-hands-drawing | Draw hands for 7:15. Minute hand should be at __? | 3 |
| 15 | Final Assessment 7 | f7_p1 | dot-grid-copy | Copy the mushroom shape onto the dot grid. |  |
| 16 | Final Assessment 7 | f7_p2 | subtraction-word-problem | There are 17 children. There are 9 fewer teachers than children. How many teachers are there? | 8 |
| 17 | Final Assessment 8 | f8_p1 | stick-counting | How many sticks are used to make the hourglass shape? | 6 |
| 18 | Final Assessment 8 | f8_p2 | area-unit-comparison | Heba's shape has 19 units. Gamal's has 17 units. Who has the larger area? | Heba |
| 19 | Final Assessment 9 | f9_p1 | 3d-face-tracing | Tracing a face of a __ gives a square. | cube |
| 20 | Final Assessment 9 | f9_p2 | capacity-math | Container B holds 10 cups. Container A holds 8 cups. How many more cups does B hold than A? | 2 |
| 21 | Final Assessment 10 | f10_p1 | object-category-match | Which object is a sphere? | tennis ball |
| 22 | Final Assessment 10 | f10_p2 | ordinal-reasoning | There are 20 books on a shelf. The food book is 10th from the left. How many books are to its right? | 10 |
| 23 | Final Assessment 10 | f10_p3 | analog-clock-read-mixed | Read the following times. | ["8:00","7:15","9:45"] |

