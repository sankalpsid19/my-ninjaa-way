# Nutrition Intelligence Module --- Implementation Plan

## 1. Context

The existing app already contains a **Calorie Calculator** module.

The next module should evolve the product from a one-time calculator
into a **daily nutrition companion** that users return to repeatedly.

The core product idea is:

> **Don't just tell the user how many calories they eat. Tell them what
> nutrients they are getting, what they are missing, why it matters, and
> what they can do next.**

The Nutrition module should reuse the user's existing calorie-calculator
information wherever possible instead of asking them to enter the same
information again.

------------------------------------------------------------------------

# 2. Product Goal

Build a modern, visually engaging **Nutrition Tracker / Nutrient
Intelligence** module that lets users:

1.  Track food and meals.
2.  Track calories and macronutrients.
3.  Track vitamins and minerals.
4.  Understand daily nutrient coverage.
5.  Identify nutrient gaps.
6.  See where each nutrient came from.
7.  Receive simple, actionable suggestions.
8.  Compare today vs previous days.
9.  Discover weekly nutrition patterns.
10. Return daily because the dashboard continuously changes based on
    their food intake.

The module should feel like:

> **"My personal nutrition dashboard"**

rather than:

> **"A calorie logging form."**

------------------------------------------------------------------------

# 3. Product Principles

## 3.1 Minimize manual input

Food logging must be extremely fast.

Users should be able to log food through:

-   Search
-   Recent foods
-   Favorites
-   Quick add
-   Natural language
-   Voice
-   Barcode
-   Photo recognition (later phase)

Do not force users to enter grams for everything.

Support natural units such as:

-   1 roti
-   1 bowl
-   1 katori
-   1 cup
-   1 glass
-   1 piece
-   1 tablespoon
-   1 teaspoon
-   100 g

------------------------------------------------------------------------

## 3.2 Explain numbers instead of dumping numbers

Bad UX:

``` text
Vitamin D: 4.2 µg
Magnesium: 182 mg
Iron: 9.8 mg
```

Better UX:

``` text
Today's Nutrient Coverage

🟢 Protein       Excellent
🟢 Vitamin C     Excellent
🟢 Iron          Good
🟡 Fiber         Needs attention
🔴 Vitamin D     Low
```

Users can tap into the detailed numbers.

------------------------------------------------------------------------

## 3.3 Turn information into action

Every important gap should answer:

> "What should I do now?"

Example:

``` text
Fiber
72% of today's target

You're about 8g short.

Easy options:
• 1 apple
• 1 bowl of oats
• 1/2 cup lentils
• 1 serving vegetables
```

------------------------------------------------------------------------

## 3.4 Encourage consistency, not perfection

Avoid shame-based language.

Never say:

-   "You failed."
-   "Bad food."
-   "You ate too much."
-   "Unhealthy person."

Prefer:

-   "Needs attention"
-   "You are above your target today"
-   "A lighter option could help balance your day"
-   "You could improve fiber with your next meal"

------------------------------------------------------------------------

# 4. Information Architecture

Add a new top-level module:

``` text
Nutrition
│
├── Today
├── Log Food
├── Nutrients
├── Insights
└── History
```

If the app already has global navigation, integrate Nutrition into that
navigation rather than creating a second navigation system.

------------------------------------------------------------------------

# 5. Reuse Existing Calorie Calculator

The current Calorie Calculator is an important foundation.

Reuse:

-   User profile
-   Age
-   Sex, where already collected and appropriate
-   Height
-   Weight
-   Activity level
-   Goal
-   Estimated calorie requirement
-   Existing unit preferences

Do not duplicate these fields.

After the user completes the Calorie Calculator, offer:

``` text
Your estimated daily calorie target is 2,100 kcal.

Want to track what you're actually eating?

[ Start Nutrition Tracking ]
```

The Nutrition module should use the existing calorie result as the
initial calorie target, while allowing the user to adjust targets later.

------------------------------------------------------------------------

# 6. Onboarding / First Visit

Do not create a long onboarding flow if the Calorie Calculator already
contains the necessary profile.

First visit:

``` text
Your Nutrition Journey

We'll help you understand:

✓ Calories
✓ Protein & macros
✓ Vitamins & minerals
✓ Nutrient gaps
✓ Daily nutrition trends

[ Start Tracking ]
```

Then ask only for missing information, such as:

``` text
Diet preference

○ Vegetarian
○ Eggetarian
○ Vegan
○ Non-vegetarian
○ Other
```

Optional:

``` text
What would you like to improve?

□ Protein
□ Weight management
□ General nutrition
□ Fitness performance
□ Better food quality
□ Fiber
```

Allow skipping.

------------------------------------------------------------------------

# 7. Main Screen --- "Today"

This is the most important screen.

The design should be mobile-first, modern, clean and highly visual.

## Header

``` text
Good morning 👋

Your Nutrition
Sunday, September 6
```

If time of day changes:

``` text
Good afternoon 👋
```

or

``` text
Good evening 👋
```

------------------------------------------------------------------------

# 8. Nutrition Score

Create a prominent but simple score.

``` text
          84
   Nutrition Score

      Great day so far
```

The score should consider, where sufficient data exists:

-   Calories relative to target
-   Protein coverage
-   Fiber coverage
-   Micronutrient coverage
-   Food diversity
-   Added sugar
-   Sodium
-   Saturated fat
-   Hydration if tracked

Important:

-   This is a product score, not a medical score.
-   Clearly explain the scoring methodology.
-   Never imply that the score diagnoses health conditions.
-   Do not penalize missing data too aggressively.

If insufficient food has been logged:

``` text
Log another meal to improve your nutrition score.
```

Do not pretend the score is accurate with almost no data.

------------------------------------------------------------------------

# 9. Calorie Ring

Use a prominent circular progress visualization.

``` text
       1,420 kcal
      ───────────
      of 2,100 kcal

       680 remaining
```

Below:

``` text
Breakfast     420
Lunch         650
Snack         350
Dinner          -
```

Actions:

``` text
[ + Log Food ]
```

------------------------------------------------------------------------

# 10. Macro Cards

Display:

``` text
Protein
94g / 140g
67%

Carbs
165g / 250g
66%

Fat
48g / 70g
69%

Fiber
18g / 30g
60%
```

Use progress bars.

Tap any card to open detailed nutrient information.

------------------------------------------------------------------------

# 11. Nutrient Coverage

This should be a signature feature.

Display a compact summary:

``` text
Nutrient Coverage

🟢 8 On track
🟡 4 Need attention
🔴 2 Low
```

Then show the highest-priority nutrients:

``` text
Protein       🟢 Excellent
Vitamin C     🟢 Excellent
Iron          🟢 Good
Fiber         🟡 Needs attention
Calcium       🟡 Needs attention
Vitamin D     🔴 Low
```

Use a "View all nutrients" action.

------------------------------------------------------------------------

# 12. Nutrient Detail Screen

When a user taps a nutrient:

Example:

``` text
IRON

Today's intake

19.2 mg
83% of target

██████████████░░
```

Then:

``` text
Where did your iron come from?

🥬 Spinach       6.2 mg
🫘 Lentils       4.1 mg
🥚 Eggs          2.0 mg
🍞 Bread         1.4 mg
```

Then:

``` text
Your 7-day pattern

Mon  ██████████
Tue  ███████████
Wed  ███████
Thu  ██████████
Fri  ████████
Sat  █████████
Sun  █████████
```

Then:

``` text
How to improve

Try adding one of:

• Lentils
• Spinach
• Beans
• Pumpkin seeds
```

------------------------------------------------------------------------

# 13. "What Am I Missing?" Card

This should appear on Today.

Example:

``` text
⚡ Today's Nutrition Gaps

You could improve:

🔴 Vitamin D
🟡 Fiber
🟡 Calcium

You're doing well with:

🟢 Protein
🟢 Vitamin C
🟢 Iron

[ See how to improve ]
```

The number of recommendations should be limited.

Do not overwhelm users with 15 problems.

Prioritize the top 1--3 actionable gaps.

------------------------------------------------------------------------

# 14. "One Thing to Improve"

Create a very strong habit-forming component.

Every day show one simple action.

Example:

``` text
✨ Your focus today

Add one fiber-rich food.

You're currently 8g below
your fiber target.

Try:
🥣 Oats
🍎 Apple
🫘 Lentils
🥗 Vegetables
```

The focus should change based on actual logged nutrition.

This gives users a reason to return tomorrow.

------------------------------------------------------------------------

# 15. Meal Timeline

Show meals as a timeline.

``` text
TODAY

08:30
🍳 Breakfast
2 eggs + toast + banana

420 kcal
Protein 22g

      ↓

13:15
🍛 Lunch
Rice + dal + vegetables

650 kcal
Protein 31g

      ↓

17:00
🍎 Snack
Apple + yogurt

210 kcal

      ↓

Dinner
+ Add meal
```

Tap a meal to edit it.

------------------------------------------------------------------------

# 16. Food Logging

The logging interface should prioritize speed.

Opening:

``` text
Add Food

[ 🔍 Search food ]

Quick actions:

[ 📷 Scan ]
[ 🎤 Speak ]
[ ⭐ Favorites ]
[ 🕘 Recent ]

Meals:

Breakfast
Lunch
Snack
Dinner
```

------------------------------------------------------------------------

# 17. Food Search

Search should support:

-   Food name
-   Brand
-   Indian dishes
-   Restaurant foods
-   Common household foods
-   Ingredients

Examples:

``` text
dal
roti
paneer
rice
banana
curd
chicken biryani
```

Results should show:

``` text
Dal
1 bowl

180 kcal
12g protein
```

Do not make the user open another screen just to see basic nutrition.

------------------------------------------------------------------------

# 18. Recent & Favorites

Show:

``` text
Recent

🍌 Banana
🥛 Milk
🍳 Eggs
🍚 Rice
🫘 Dal
```

Favorites:

``` text
⭐ My usual breakfast
Eggs + toast + banana

⭐ My lunch
Rice + dal + vegetables
```

Allow one-tap re-add.

This is a major retention feature because users frequently eat the same
meals.

------------------------------------------------------------------------

# 19. Saved Meals

Users should be able to save combinations.

Example:

``` text
My Meals

💪 High Protein Breakfast
3 eggs + oats + milk

🍛 Regular Lunch
Rice + dal + vegetables

🥗 Light Dinner
Paneer + salad + curd
```

One tap logs the entire meal.

------------------------------------------------------------------------

# 20. Natural Language Food Logging

Phase 2 feature.

Input:

``` text
What did you eat?

"2 eggs, 2 rotis and one bowl of dal"
```

Parse into:

``` text
2 Eggs
2 Roti
1 Bowl Dal
```

Then calculate:

``` text
Estimated nutrition

Calories     520
Protein      27g
Carbs        65g
Fat          17g
Fiber        11g
```

User must confirm before saving.

Always allow editing quantities.

------------------------------------------------------------------------

# 21. Voice Logging

Phase 2.

User says:

> "I had two bananas and a glass of milk."

System produces:

``` text
2 Bananas
1 Glass Milk

[ Review ]
```

Then user confirms.

Do not automatically save uncertain voice interpretations.

------------------------------------------------------------------------

# 22. Photo Meal Recognition

Phase 3.

User uploads/takes a photo.

System:

``` text
Detected foods

✓ Rice
✓ Dal
✓ Paneer
✓ Mixed vegetables
```

Estimate portions:

``` text
Rice          ~180g
Dal           ~150g
Paneer         ~80g
Vegetables    ~100g
```

Then:

``` text
Estimated nutrition

Calories       ~640 kcal
Protein         ~28g
Carbs           ~82g
Fat             ~20g
Fiber            ~9g

[ Review & Add ]
```

Important:

-   Show "Estimated".
-   Show confidence where useful.
-   Never claim perfect accuracy.
-   Always allow correction.
-   Do not silently save photo estimates.

------------------------------------------------------------------------

# 23. Barcode Scanning

Phase 3.

For packaged food:

``` text
Scan Barcode
      ↓
Product
      ↓
Serving size
      ↓
Nutrition facts
      ↓
Add to meal
```

Capture:

-   Calories
-   Protein
-   Carbohydrates
-   Fat
-   Fiber
-   Sugar
-   Added sugar
-   Sodium
-   Relevant vitamins/minerals
-   Ingredients

------------------------------------------------------------------------

# 24. Micronutrient System

The nutrient engine should support extensible nutrients.

## Vitamins

-   Vitamin A
-   Vitamin B1
-   Vitamin B2
-   Vitamin B3
-   Vitamin B5
-   Vitamin B6
-   Vitamin B7
-   Folate / B9
-   Vitamin B12
-   Vitamin C
-   Vitamin D
-   Vitamin E
-   Vitamin K

## Minerals

-   Calcium
-   Iron
-   Magnesium
-   Phosphorus
-   Potassium
-   Sodium
-   Zinc
-   Copper
-   Manganese
-   Selenium

## Other

-   Fiber
-   Sugar
-   Added sugar
-   Saturated fat
-   Trans fat
-   Cholesterol
-   Omega-3
-   Omega-6

The UI should not display all of these at once.

Group:

``` text
Vitamins
Minerals
Fats
Other
```

------------------------------------------------------------------------

# 25. Food Database Architecture

The system should support:

``` text
Food
├── Basic information
├── Serving sizes
├── Calories
├── Macronutrients
└── Nutrients
```

Recommended conceptual data model:

``` text
Food
- id
- name
- brand
- category
- servingSize
- servingUnit
- calories
- protein
- carbohydrates
- fat
- fiber
- sugar
- addedSugar
- sodium
```

Then use a flexible nutrient table:

``` text
Nutrient
- id
- name
- category
- unit
- dailyTarget
```

``` text
FoodNutrient
- foodId
- nutrientId
- amount
```

This avoids creating hundreds of database columns.

------------------------------------------------------------------------

# 26. Food Categories

Support:

``` text
Fruits
Vegetables
Grains
Legumes
Dairy
Eggs
Meat
Fish
Nuts
Seeds
Oils
Beverages
Packaged foods
Restaurant foods
Recipes
User-created foods
```

Prioritize strong coverage of Indian foods.

Examples:

``` text
Roti
Paratha
Poha
Upma
Idli
Dosa
Dal
Rajma
Chole
Paneer
Curd
Khichdi
Biryani
Samosa
Rice
```

------------------------------------------------------------------------

# 27. Household Serving Units

The database should support common measurements.

``` text
1 roti
1 bowl
1 katori
1 cup
1 glass
1 piece
1 slice
1 tablespoon
1 teaspoon
100g
```

Where possible, show a serving selector:

``` text
Quantity

[-] 2 [+]

Serving
○ Piece
○ Bowl
○ Gram
```

------------------------------------------------------------------------

# 28. Recipes

Allow users to create recipes.

Example:

``` text
Create Recipe

Paneer Curry

Paneer        250g
Tomato        200g
Onion         100g
Oil            15g
Spices

Servings: 3
```

Automatically calculate:

``` text
Per serving

Calories     390
Protein       24g
Carbs         15g
Fat            25g
Fiber           4g

+ micronutrients
```

Save recipe for future logging.

------------------------------------------------------------------------

# 29. "What If I Add This?"

Highly recommended feature.

When viewing a food, show the effect on the current day.

Example:

``` text
Banana

If you add this:

Calories    +105
Fiber       +3g
Potassium   +422mg

Your day becomes:

Fiber
72% → 82%

[ Add Banana ]
```

This makes the app interactive rather than static.

------------------------------------------------------------------------

# 30. Food Substitution

When appropriate, show alternatives.

Example:

``` text
Looking for a more nutrient-dense option?

White rice
      ↓
Brown rice

Potential benefits:
+ Fiber
+ Magnesium
+ B vitamins
```

The system should never imply that one food is universally "good" or
"bad".

Focus on trade-offs.

------------------------------------------------------------------------

# 31. Nutrient Source Attribution

For every nutrient, show top contributors.

Example:

``` text
Today's Protein

Chicken       32%
Eggs          25%
Dal           18%
Dairy         15%
Other         10%
```

This answers:

> "Where is my nutrition actually coming from?"

------------------------------------------------------------------------

# 32. Weekly Insights

Create a weekly dashboard.

``` text
THIS WEEK

Nutrition Score
84 ↑ 6%

Average Calories
2,010 kcal

Average Protein
132g

Average Fiber
27g
```

Then:

``` text
Consistency

Protein      6/7 days
Fiber        4/7 days
Calcium      3/7 days
Vitamin C    7/7 days
```

------------------------------------------------------------------------

# 33. Trend Charts

Support:

``` text
7 Days
30 Days
3 Months
6 Months
1 Year
```

Charts:

-   Calories
-   Protein
-   Fiber
-   Sugar
-   Sodium
-   Nutrition score
-   Nutrient coverage
-   Hydration
-   Food diversity

Use simple charts.

Avoid complicated dashboards.

------------------------------------------------------------------------

# 34. Today vs Yesterday

Example:

``` text
Today vs Yesterday

Calories      1,920   2,140
Protein         132g    118g
Fiber            29g     19g
Sugar            42g     67g
Sodium         1,850   2,420
```

Then automatically summarize:

> Today you had more protein and fiber while consuming less sugar and
> sodium.

Only generate this when enough data exists.

------------------------------------------------------------------------

# 35. Food Diversity

Introduce a "Food Diversity" metric.

Example:

``` text
FOOD DIVERSITY

74

Different plant foods this week
23

Fruits        6
Vegetables   11
Legumes       3
Nuts          3
Whole grains 4
```

This encourages variety without focusing solely on calories.

------------------------------------------------------------------------

# 36. Hydration

Include a lightweight hydration tracker.

``` text
HYDRATION

1.8L / 2.5L

💧 💧 💧 💧 ○ ○ ○

[ +250 ml ]
[ +500 ml ]
```

Keep hydration separate from calorie/nutrient calculations unless a
reliable source supports the relationship.

------------------------------------------------------------------------

# 37. AI Nutrition Assistant

Add an AI section:

``` text
✨ Ask about your nutrition

"Why am I low on fiber?"

"Give me a high-protein breakfast."

"What nutrients am I missing?"

"Suggest a 600 calorie dinner."

"Compare my nutrition this week."
```

The AI must use the user's actual logged data where available.

Example:

``` text
You averaged about 23g of fiber
over the last 7 days.

Your current target is 30g.

Your biggest fiber sources were:
• Lentils
• Fruit
• Vegetables

Adding one serving of legumes or
whole grains could help.
```

Do not make medical diagnoses.

------------------------------------------------------------------------

# 38. "Complete My Day"

This should become a signature AI feature.

Input:

``` text
Current food intake
+
Remaining calories
+
Remaining nutrients
+
Diet preference
+
Saved foods
+
User preferences
```

Output:

``` text
✨ Complete My Day

You're currently short on:

Fiber
Calcium
Protein

Suggested dinner:

Paneer
+ vegetables
+ 2 rotis
+ curd

~580 kcal
Protein 32g
Fiber 10g

Helps improve:
✓ Protein
✓ Fiber
✓ Calcium
```

Allow:

``` text
[ Log this meal ]
```

The recommendation must be clearly presented as a suggestion, not
medical advice.

------------------------------------------------------------------------

# 39. Smart Daily Insight

Generate one or two insights per day.

Examples:

``` text
✨ Today's insight

Your protein intake is on track,
but your fiber is lower than usual.

Try adding a fruit or legumes today.
```

Another:

``` text
✨ Nice work

You've already reached 80% of your
protein target before dinner.
```

Positive reinforcement should be balanced and data-driven.

------------------------------------------------------------------------

# 40. Retention / Habit Loop

The module should create a natural daily loop:

``` text
Open app
   ↓
See today's status
   ↓
Notice one thing to improve
   ↓
Log food
   ↓
Dashboard updates
   ↓
See nutrient coverage improve
   ↓
Get personalized suggestion
   ↓
Return next meal
   ↓
Weekly insights
   ↓
Return tomorrow
```

Do not rely on artificial gamification alone.

The changing dashboard itself should create the reason to return.

------------------------------------------------------------------------

# 41. Gamification

Use lightweight positive achievements.

Examples:

``` text
🔥 7-day logging streak

💪 Protein target
6 days this week

🥦 Fiber goal
5 days this month

🌱 25 different plant foods
this month
```

Avoid aggressive streak mechanics that punish users for missing a day.

------------------------------------------------------------------------

# 42. Notifications

Notifications should be optional.

Examples:

``` text
"You're about 8g short on fiber today."

"Your dinner hasn't been logged yet."

"You've hit your protein target today 🎯"

"Your weekly nutrition summary is ready."
```

Avoid excessive notifications.

Provide notification settings.

------------------------------------------------------------------------

# 43. Premium / Future Features

Potential premium features:

``` text
AI meal planning
AI food photo analysis
Advanced nutrient insights
Weekly nutrition reports
Personalized meal suggestions
Restaurant meal estimation
Barcode scanning
Wearable integration
Advanced trend analysis
Grocery list generation
Recipe optimization
```

The free experience must still be genuinely useful.

------------------------------------------------------------------------

# 44. UI Design Direction

The UI should feel like a premium modern wellness product.

## Visual language

Use:

-   Large cards
-   Rounded corners
-   Generous whitespace
-   Soft backgrounds
-   Clear typography
-   Large numeric highlights
-   Progress rings
-   Progress bars
-   Lightweight charts
-   Semantic icons
-   Subtle animation

Avoid:

-   Dense spreadsheets
-   Excessive gradients
-   Too many colors
-   Tiny text
-   Too many numbers on the first screen
-   Aggressive gamification

------------------------------------------------------------------------

# 45. Color Semantics

Recommended semantic system:

``` text
Green   = On track
Yellow  = Needs attention
Red     = Low / significantly outside target
Blue    = Informational
Purple  = AI / intelligent suggestions
```

Never rely only on color.

Also use:

-   Text labels
-   Icons
-   Progress values

for accessibility.

------------------------------------------------------------------------

# 46. Mobile UX

The primary experience should be designed for mobile.

The most important action should always be easy to reach:

``` text
              + Log Food
```

Consider a floating action button or bottom-center action.

Suggested bottom navigation:

``` text
Home
Nutrition
Progress
Profile
```

If the existing application already has navigation, integrate rather
than replace it.

------------------------------------------------------------------------

# 47. Desktop UX

On desktop, use a two-column dashboard:

``` text
┌──────────────────────┬──────────────────────┐
│ Nutrition Score      │ Calories & Macros    │
│                      │                      │
├──────────────────────┼──────────────────────┤
│ Nutrient Coverage    │ Today's Insight      │
│                      │                      │
├──────────────────────┴──────────────────────┤
│ Today's Meals                                │
├──────────────────────────────────────────────┤
│ Weekly Trends                                │
└──────────────────────────────────────────────┘
```

Maintain the same information hierarchy as mobile.

------------------------------------------------------------------------

# 48. Animation & Microinteractions

Use subtle animations.

Examples:

When food is added:

``` text
Calories
1,200 → 1,420
```

Animate the progress ring.

When nutrient coverage improves:

``` text
Fiber
60% → 72%
```

Animate the progress bar.

When the daily goal is reached:

``` text
🎉 Protein target reached
```

Keep animations fast and non-distracting.

Respect reduced-motion preferences.

------------------------------------------------------------------------

# 49. Empty States

First-time user:

``` text
Your nutrition story starts here.

Log your first meal and we'll
start building your nutrition picture.

[ Log First Meal ]
```

No food logged today:

``` text
Nothing logged yet.

Start with your breakfast.
```

Not enough data for insights:

``` text
Keep logging meals.

We'll show personalized insights
once we have enough data.
```

Never fabricate insights.

------------------------------------------------------------------------

# 50. Error / Uncertainty UX

Nutrition data can be estimates.

Clearly distinguish:

``` text
Verified nutrition
Estimated nutrition
AI-estimated nutrition
User-entered nutrition
```

For photo recognition:

``` text
Estimated: ~620 kcal
```

For AI:

``` text
AI estimate
```

Give users an easy correction mechanism.

------------------------------------------------------------------------

# 51. Data Model

Recommended conceptual schema:

``` text
User
 └── NutritionProfile
      ├── NutritionTargets
      ├── FoodLogs
      │    └── Meal
      │         └── FoodLogItem
      ├── SavedMeals
      ├── FavoriteFoods
      ├── Recipes
      ├── HydrationLogs
      └── NutritionInsights
```

Core entities:

### NutritionProfile

``` text
id
userId
dietType
goal
activityLevel
createdAt
updatedAt
```

### NutritionTarget

``` text
id
userId
nutrientId
targetAmount
unit
source
createdAt
updatedAt
```

### Meal

``` text
id
userId
date
mealType
name
createdAt
updatedAt
```

### FoodLogItem

``` text
id
mealId
foodId
quantity
servingUnit
calories
createdAt
updatedAt
```

Store calculated nutrient data in a way that preserves historical
accuracy when food database values later change.

------------------------------------------------------------------------

# 52. Nutrient Engine

Create a dedicated service/module:

``` text
nutrition-engine/
├── calorie-calculator
├── macro-calculator
├── nutrient-calculator
├── target-calculator
├── coverage-calculator
├── score-calculator
├── gap-detector
└── recommendation-engine
```

Responsibilities:

### nutrient-calculator

Calculate total nutrient intake from food logs.

### coverage-calculator

``` text
coverage = intake / target * 100
```

Apply appropriate handling for nutrients where higher is not necessarily
better.

### gap-detector

Identify nutrients requiring attention.

### score-calculator

Calculate Nutrition Score.

### recommendation-engine

Turn gaps into food suggestions.

------------------------------------------------------------------------

# 53. Nutrition Score Logic

Keep the initial implementation explainable.

Example conceptual weighting:

``` text
Macro adherence          25%
Fiber                    15%
Micronutrient coverage   30%
Food diversity            10%
Added sugar               5%
Sodium                    5%
Saturated fat             5%
Logging consistency       5%
```

Do not hard-code these weights blindly.

Keep them configurable.

Create:

``` text
NutritionScoreConfig
```

so weights can be adjusted later without rewriting the application.

The score should also avoid punishing users for nutrients they haven't
had enough opportunity to log.

------------------------------------------------------------------------

# 54. Recommendation Engine

Recommendations should follow:

``` text
Identify gap
    ↓
Find foods rich in nutrient
    ↓
Filter by diet preference
    ↓
Filter by allergies/preferences
    ↓
Filter by remaining calorie budget where relevant
    ↓
Rank by user's saved/recent foods
    ↓
Generate 3–5 suggestions
```

Example:

``` text
Gap:
Fiber

User preference:
Vegetarian

Recommended:
1. Lentils
2. Oats
3. Apple
4. Chickpeas
```

Personalize based on foods the user already eats.

------------------------------------------------------------------------

# 55. Recommendation Ranking

Prefer:

1.  Foods the user likes.
2.  Foods the user already has logged.
3.  Foods from saved meals.
4.  Common locally relevant foods.
5.  Nutrient-dense options.
6.  Options compatible with remaining calories.
7.  Simple preparation.

This makes recommendations feel personal.

------------------------------------------------------------------------

# 56. Privacy & Safety

Implement:

-   Delete nutrition history
-   Export data
-   Clear AI-generated data where applicable
-   Avoid unnecessary personal data
-   No medical diagnosis
-   No disease treatment claims
-   Clearly label estimates
-   Allow users to correct data
-   Allow notification opt-out

For sensitive nutrition/health situations, recommend professional
guidance rather than presenting the app as a substitute for a dietitian
or doctor.

------------------------------------------------------------------------

# 57. Accessibility

Requirements:

-   WCAG-conscious contrast
-   Keyboard navigation
-   Screen-reader labels
-   Large tap targets
-   Do not rely solely on color
-   Reduced-motion support
-   Accessible chart summaries
-   Clear text equivalents for visual scores

Example:

Instead of only:

``` text
🟢 ████████████
```

also show:

``` text
Protein: 87% of target — On track
```

------------------------------------------------------------------------

# 58. Performance

Nutrition dashboard should feel instant.

Target:

``` text
Initial dashboard render < 2 sec
Food search response < 500 ms where possible
Local UI update after food logging < 200 ms
```

Use:

-   Cached food search
-   Cached user targets
-   Optimistic UI updates
-   Incremental calculations
-   Server-side aggregation where appropriate

------------------------------------------------------------------------

# 59. Offline-Friendly Logging

If the app supports mobile/PWA behavior, food logging should tolerate
temporary connectivity loss.

Flow:

``` text
User logs food
    ↓
Save locally
    ↓
Update dashboard
    ↓
Sync when online
```

Resolve duplicate/conflict cases safely.

------------------------------------------------------------------------

# 60. Analytics Events

Instrument the module.

Track events such as:

``` text
nutrition_opened
nutrition_onboarding_completed
food_search_started
food_logged
food_log_edited
food_log_deleted
saved_meal_created
saved_meal_used
favorite_food_used
nutrient_detail_opened
nutrition_insight_viewed
recommendation_clicked
recommendation_food_logged
nutrition_score_viewed
weekly_report_viewed
ai_nutrition_question_asked
```

Important product metrics:

``` text
Daily active nutrition users
Food logs per active user
7-day retention
30-day retention
Average meals logged per day
Repeat nutrition sessions
Saved meal usage
Recommendation → food logged conversion
```

------------------------------------------------------------------------

# 61. Retention Strategy

The core retention loop should be:

## Daily

``` text
New food
→ Updated nutrient coverage
→ New insight
→ New recommendation
```

## Weekly

``` text
7-day data
→ Pattern discovery
→ Weekly report
→ New goal
```

## Monthly

``` text
30-day data
→ Long-term trends
→ Improvement areas
→ Progress story
```

The user should feel:

> "The longer I use this, the more useful it becomes."

------------------------------------------------------------------------

# 62. Weekly Report

Create a visually attractive report:

``` text
Your Week in Nutrition

Nutrition Score
84 ↑ 6%

🔥 Your strongest area
Protein

⚠️ Focus area
Fiber

🌱 Food diversity
23 plant foods

💧 Hydration
82% average

Best day
Thursday

Most common meal
Dal + rice + vegetables

Next week's focus
Increase fiber consistency
```

Make the report shareable, but do not expose private information by
default.

------------------------------------------------------------------------

# 63. Long-Term Progress

After 30+ days:

``` text
YOUR NUTRITION JOURNEY

30 days tracked

Average nutrition score
81 → 86

Fiber
21g → 28g

Protein
108g → 126g

Food diversity
15 → 24 foods/week
```

The user should be able to see improvement over time.

------------------------------------------------------------------------

# 64. Implementation Phases

## Phase 1 --- Foundation / MVP

Implement first:

``` text
✓ Reuse Calorie Calculator profile
✓ Nutrition profile
✓ Food database
✓ Food search
✓ Meals
✓ Food logging
✓ Recent foods
✓ Favorites
✓ Saved meals
✓ Calories
✓ Protein
✓ Carbs
✓ Fat
✓ Fiber
✓ Daily dashboard
✓ Basic targets
✓ Basic history
```

Goal:

> User can log food every day with minimal friction.

------------------------------------------------------------------------

## Phase 2 --- Nutrient Intelligence

Implement:

``` text
✓ Vitamins
✓ Minerals
✓ Nutrient coverage
✓ Nutrient gaps
✓ Nutrient detail pages
✓ Food source attribution
✓ Nutrition Score
✓ "One Thing to Improve"
✓ Basic recommendations
✓ Weekly dashboard
✓ Trend charts
```

Goal:

> User understands their nutrition rather than merely counting calories.

------------------------------------------------------------------------

## Phase 3 --- AI & Advanced Logging

Implement:

``` text
✓ Natural language food logging
✓ Voice logging
✓ AI Nutrition Assistant
✓ Complete My Day
✓ Food substitution
✓ "What if I add this?"
✓ Personalized recommendations
```

Goal:

> Make the app feel intelligent and personalized.

------------------------------------------------------------------------

## Phase 4 --- Advanced Input

Implement:

``` text
✓ Barcode scanner
✓ Photo meal recognition
✓ Restaurant food estimation
✓ Recipe recognition
```

Goal:

> Make logging almost effortless.

------------------------------------------------------------------------

## Phase 5 --- Long-Term Wellness

Implement:

``` text
✓ Hydration
✓ Food diversity
✓ Wearable integration
✓ Advanced trends
✓ Monthly nutrition reports
✓ Meal planning
✓ Grocery list
✓ Personalized nutrition goals
```

Goal:

> Turn the module into a long-term nutrition companion.

------------------------------------------------------------------------

# 65. Recommended Development Order

For Antigravity implementation, follow this order:

``` text
1. Inspect existing application
        ↓
2. Inspect existing Calorie Calculator
        ↓
3. Reuse existing user/profile state
        ↓
4. Design Nutrition database schema
        ↓
5. Build food/nutrient data layer
        ↓
6. Build Nutrition Engine
        ↓
7. Build food search
        ↓
8. Build meal logging
        ↓
9. Build Today dashboard
        ↓
10. Build nutrient coverage
        ↓
11. Build nutrient detail pages
        ↓
12. Build recommendations
        ↓
13. Build History / Trends
        ↓
14. Add AI features
        ↓
15. Add advanced food input
        ↓
16. Add analytics
        ↓
17. Performance optimization
        ↓
18. Accessibility pass
        ↓
19. Mobile UX pass
        ↓
20. Production QA
```

------------------------------------------------------------------------

# 66. Antigravity Coding Guidelines

Before writing new code:

1.  Inspect the existing project.
2.  Identify the current framework and architecture.
3.  Identify existing UI components.
4.  Identify existing design tokens.
5.  Identify existing state management.
6.  Identify the existing database/ORM.
7.  Identify the current Calorie Calculator implementation.
8.  Reuse existing components and utilities.
9.  Do not create duplicate profile/calorie calculation logic.
10. Preserve existing functionality.

Do not rewrite the application architecture unless there is a clear
technical reason.

------------------------------------------------------------------------

# 67. Component Structure

Suggested frontend structure:

``` text
nutrition/
├── pages/
│   ├── NutritionDashboard
│   ├── FoodLog
│   ├── Nutrients
│   ├── NutrientDetail
│   ├── Insights
│   └── NutritionHistory
│
├── components/
│   ├── NutritionScore
│   ├── CalorieRing
│   ├── MacroCards
│   ├── NutrientCoverage
│   ├── NutrientGapCard
│   ├── DailyFocus
│   ├── MealTimeline
│   ├── FoodSearch
│   ├── FoodLogModal
│   ├── SavedMeals
│   ├── FoodSourceBreakdown
│   ├── NutritionChart
│   ├── WeeklySummary
│   └── AIInsightCard
│
├── services/
│   ├── nutritionService
│   ├── foodService
│   ├── nutrientService
│   ├── recommendationService
│   └── aiNutritionService
│
└── utils/
    ├── nutritionCalculations
    ├── nutrientCoverage
    └── nutritionScore
```

Adapt this structure to the existing project architecture.

------------------------------------------------------------------------

# 68. API Concept

Potential endpoints:

``` text
GET    /api/nutrition/today
GET    /api/nutrition/history
GET    /api/nutrition/targets

GET    /api/foods/search?q=
GET    /api/foods/:id

POST   /api/meals
PUT    /api/meals/:id
DELETE /api/meals/:id

POST   /api/meals/:id/items
PUT    /api/meal-items/:id
DELETE /api/meal-items/:id

GET    /api/nutrients
GET    /api/nutrients/:id

GET    /api/nutrition/insights
GET    /api/nutrition/recommendations

POST   /api/nutrition/ai
```

Use the existing API conventions if the project already has them.

------------------------------------------------------------------------

# 69. Testing Strategy

## Unit tests

Test:

-   Calorie totals
-   Macro totals
-   Nutrient totals
-   Serving conversions
-   Target calculations
-   Coverage percentages
-   Score calculation
-   Recommendation filtering

## Integration tests

Test:

``` text
Create meal
→ Add food
→ Calculate nutrition
→ Update dashboard
→ Update nutrient coverage
```

## E2E tests

Critical flow:

``` text
Existing user
→ Open Nutrition
→ Search food
→ Add food
→ Dashboard updates
→ View nutrient
→ View recommendation
→ Add recommended food
```

------------------------------------------------------------------------

# 70. Definition of Done --- MVP

The first production-ready version is complete when:

### Existing integration

-   [ ] Existing Calorie Calculator remains unchanged and functional.
-   [ ] Nutrition reuses existing user information.
-   [ ] No duplicate profile data is created unnecessarily.

### Food logging

-   [ ] User can search food.
-   [ ] User can select serving size.
-   [ ] User can log food.
-   [ ] User can edit food.
-   [ ] User can delete food.
-   [ ] User can repeat recent foods.
-   [ ] User can favorite foods.
-   [ ] User can save meals.

### Nutrition

-   [ ] Calories calculated correctly.
-   [ ] Macros calculated correctly.
-   [ ] Fiber calculated correctly.
-   [ ] Daily targets displayed.
-   [ ] Nutrient totals update after food changes.

### Dashboard

-   [ ] Nutrition Score.
-   [ ] Calorie progress.
-   [ ] Macro progress.
-   [ ] Nutrient Coverage.
-   [ ] Daily Nutrition Gaps.
-   [ ] One Thing to Improve.
-   [ ] Meal timeline.

### UX

-   [ ] Mobile responsive.
-   [ ] Desktop responsive.
-   [ ] Loading states.
-   [ ] Empty states.
-   [ ] Error states.
-   [ ] Accessible controls.
-   [ ] No misleading health claims.

------------------------------------------------------------------------

# 71. Most Important Product Differentiators

Do not build this as a generic MyFitnessPal clone.

The strongest differentiators should be:

## 1. Nutrient Coverage

``` text
"How much of my nutrition did I actually cover?"
```

## 2. One Thing to Improve

``` text
"What should I do next?"
```

## 3. Nutrient Source Attribution

``` text
"Which foods gave me this nutrient?"
```

## 4. Complete My Day

``` text
"What should I eat next?"
```

## 5. Food Diversity

``` text
"Am I eating a varied diet?"
```

## 6. Progressive Intelligence

``` text
"The more I use it, the better it understands me."
```

------------------------------------------------------------------------

# 72. Final Product Experience

The ideal daily experience should look like:

``` text
OPEN APP
    ↓
"Your Nutrition Score is 84"
    ↓
"Fiber is slightly low"
    ↓
"Try adding an apple or lentils"
    ↓
User logs food
    ↓
Fiber increases from 72% → 84%
    ↓
Nutrition Score updates
    ↓
User sees positive progress
    ↓
AI suggests dinner
    ↓
User logs dinner
    ↓
Day becomes complete
    ↓
Next morning:
"Yesterday was your best fiber day this week."
```

This creates a natural reason to return.

------------------------------------------------------------------------

# 73. Final Antigravity Instruction

When implementing this specification:

> **Build the Nutrition module as an evolution of the existing Calorie
> Calculator, not as a separate application.**

Prioritize:

1.  **Excellent food logging UX**
2.  **Clear nutrition visualization**
3.  **Actionable nutrient insights**
4.  **Fast repeat logging**
5.  **Personalization**
6.  **Progressive AI intelligence**
7.  **Long-term trends**
8.  **Retention through usefulness rather than notifications or
    gamification**

The user should be able to understand their nutrition status in **5
seconds**, log a food in **under 10 seconds**, and always have a clear
answer to:

> **"What should I do next?"**

Build Phase 1 first, validate the UX, then progressively introduce
nutrient intelligence and AI.

Do not implement all advanced features at once.
