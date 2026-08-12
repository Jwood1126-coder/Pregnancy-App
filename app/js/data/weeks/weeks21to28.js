/**
 * Weekly content — weeks 21–28 (mid-second trimester to the doorstep of the third).
 *
 * One `WeekText` per week. Milestones follow MASTER_PROMPT.md Appendix A anchors
 * (first movements felt w16–22 · recognizes voices ~w25–26 · eyes open ~w27 ·
 * rapid brain growth across T3 · kick counts from w28) and the screening windows
 * (glucose screen w24–28 · Tdap w27–36 · RhoGAM ~w28 if Rh-negative). Nutrition
 * follows the T2 arc into T3: fiber, colorful produce, calcium with vitamin D,
 * steady blood sugar around the glucose screen, whole grains, the ≈ +340 kcal
 * hearty-snack framing, iron, then DHA for the third-trimester brain sprint.
 * `nutrition.safety` is exactly `SAFETY[(week - 4) % 7]` from docs/PLAN.md.
 * No length or weight numbers appear in the prose — the UI renders those from
 * SIZE_TABLE.
 */

/** @typedef {import('../../lib/types.js').WeekText} WeekText */

/**
 * Authored content for weeks 21 through 28.
 * @type {WeekText[]}
 */
export const weeks21to28 = [
  {
    week: 21,
    baby: [
      "Your baby’s bone marrow has taken over the making of red blood cells this week. The liver and spleen have been handling that job for months and will keep helping for a while yet, but the marrow inside those hardening bones is the long-term factory.",
      'The gut is rehearsing digestion. Your baby swallows amniotic fluid all day, takes up a little sugar and water from it, and passes the rest along to the bowel — quiet practice for the first real feeds.',
      'Movements have turned into something you can name. The arms and legs have grown into proportion with each other, and there is enough muscle behind them now that a kick reads as a kick rather than a flutter.'
    ],
    body: [
      'Your appetite may be back with real force, and the middle-of-the-night hunger is not your imagination. This is the stretch where something small before bed can be the difference between sleeping through and lying awake.',
      'Fine lines may appear across your belly, hips or breasts as the skin stretches, and they can itch. Moisturizer soothes the itch even though it cannot change the lines themselves, which settle to a quiet silver over the year after birth.',
      'You may notice your skin looking oilier and the veins standing out more on your legs. Both come down to the extra blood you are carrying and the hormones running the show, and getting your feet up when you can takes the pressure off.'
    ],
    nutrition: {
      focus: 'Fiber',
      why: "Your baby’s gut is practicing digestion this week, and yours could use a hand — pregnancy hormones slow everything down, and iron supplements slow it further. Aim for twenty-five to thirty grams of fiber a day with plenty of water alongside; fiber without the fluid can make things worse rather than better.",
      eat: [
        { idea: 'Bran cereal with sliced pear and cold milk', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A black bean and roasted sweet potato bowl with salsa', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Whole-grain toast with mashed avocado and chili flakes', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Raspberries and a spoonful of chia stirred into yogurt', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A few prunes and a handful of almonds mid-afternoon', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Barley and vegetable soup with a thick slice of rye bread', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Choose pasteurized dairy and juice. Soft cheeses like brie, feta, and queso fresco are fine only if the label says pasteurized.'
    },
    todos: [
      { id: 'w21-water-bottle', label: 'Park a big water bottle wherever you sit — fiber only works with plenty to drink.' },
      { id: 'w21-put-your-feet-up', label: 'Build one real break into the day with your feet up; your legs are working harder than they used to.' }
    ]
  },

  {
    week: 22,
    baby: [
      "Your baby’s sense of touch is well developed now, and there is plenty within reach — the cord to grip, a face to stroke, a foot to catch hold of. A good share of the movement you feel is simply a hand exploring.",
      'The lips have grown more defined, and fine pale eyebrows and lashes have come in. The eyes are fully formed behind the closed lids, though the iris has not yet taken on the pigment that will set their color.',
      'Under the gums, buds for the permanent teeth are forming behind the baby teeth already in place. It is a full second set being stacked up years ahead of the day they will be needed.',
      'The pancreas keeps building the cells that will manage blood sugar after birth, and the liver is learning to process what comes its way. Organ by organ, the systems are shifting from being built to being tested.'
    ],
    body: [
      'Your belly button may be flattening out or pushing forward, and it usually stays that way until sometime after birth. It is a small, funny sign of how much room is being asked for in there.',
      'You are visibly pregnant to strangers now, and some of them will say so, reach for your bump, or hand you an opinion you did not ask for. It is entirely fine to step back, hold up a hand, or say no thank you and keep walking.',
      'Puffy feet by the end of the day and an ache low in your back are both common at this point. Shoes with genuine support and short breaks off your feet help more than you would expect.'
    ],
    nutrition: {
      focus: 'Colorful produce',
      why: "Your baby’s face is filling in its finest details this week, and the everyday vitamins behind that steady work — vitamin C, folate, potassium — travel best in colorful fruit and vegetables. Eating across the colors also puts vitamin C on the plate at mealtimes, which helps you take up more of the iron you eat.",
      eat: [
        { idea: 'A slaw of red cabbage, carrot and apple with a lemon dressing', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roasted red pepper and tomato soup with a grilled cheese', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A mango and berry smoothie with a handful of spinach blended in', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Sheet-pan sweet potato, broccoli and red onion in olive oil', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Orange segments and kiwi alongside breakfast', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Beet and carrot sticks with hummus', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Deli meats, hot dogs, and refrigerated smoked seafood are OK only when heated until steaming hot.'
    },
    todos: [
      { id: 'w22-three-colors', label: 'Try for three different colors on the dinner plate this week — easier to hit than any number you could count.' },
      { id: 'w22-support-shoes', label: 'Swap in shoes with proper support, and keep a pair by the door you can slide into.' }
    ]
  },

  {
    week: 23,
    baby: [
      "Your baby’s lungs are getting ready for air long before they will need it. Fine blood vessels are spreading through them this week, and the cells that make surfactant — the slippery coating that keeps the air sacs from sticking shut — are starting up.",
      'The skin is still loose and wrinkled, because it is growing ahead of the fat that will fill it out. It looks reddish for now, colored by the web of new blood vessels sitting just underneath.',
      'Loud sounds are becoming familiar rather than startling — the vacuum, the dog, a door slamming shut. Some babies answer a sudden noise with a kick, and many go still and settle when a piece of music they have heard before comes back on.',
      'This is the start of a steep climb in growth. Over the next month your baby puts on weight faster than at any point so far, and you will feel the difference in how solid the movements become.'
    ],
    body: [
      'You may feel your belly draw up tight and go hard for half a minute, then let go. Those are Braxton Hicks — practice squeezes that come at no particular rhythm and usually ease when you change position or drink some water. Contractions that arrive in a regular pattern before thirty-seven weeks are worth a call to your provider.',
      'A little swelling in your ankles and hands by evening is ordinary now. Swelling that comes on suddenly in your face or hands, especially alongside a bad headache or changes in your vision, is one to call about right away.',
      'Leg cramps that wake you at night turn up around here for a lot of people. Straightening the leg and pulling your toes back toward you usually breaks the cramp within a few seconds.'
    ],
    nutrition: {
      focus: 'Calcium and vitamin D',
      why: "Your baby’s skeleton is mineralizing quickly through this stretch and draws the calcium for it straight from you, so the daily 1,000 mg matters as much for your bones as for theirs. Vitamin D is what lets you absorb it — the target there is 600 IU a day, and many prenatal vitamins carry less calcium than people assume.",
      eat: [
        { idea: 'Yogurt with honey and a spoonful of toasted oats', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Sardines mashed on hot buttered toast with lemon', tags: ['nut-free'] },
        { idea: 'Fortified soy milk poured over fortified breakfast cereal', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Macaroni cheese with a side of steamed greens', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Tahini whisked with lemon and spooned over roasted carrots', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Bok choy stir-fried with garlic alongside rice', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Keep caffeine to 200 mg a day or less — about one 12-oz coffee. Tea, chocolate, and soda count toward the total.'
    },
    todos: [
      { id: 'w23-after-hours-number', label: "Save your provider’s after-hours number in your phone, and learn the difference between practice tightenings and regular contractions." },
      { id: 'w23-check-your-prenatal-label', label: 'Read the calcium and vitamin D lines on your prenatal label so you know what food still needs to cover.' }
    ]
  },

  {
    week: 24,
    baby: [
      'The week belongs to the lungs. They are branching into their final small passages, and the supply of surfactant — the slippery coating that keeps those passages from sticking shut — is steadily building.',
      'The inner ear has finished developing, which hands your baby a sense of which way is up. They can tell when they are upright, tipped sideways or turning over, and they will put it to use in the months of somersaults ahead.',
      "The skin is losing its see-through look as it thickens, and hair has come in on the head with real color and texture. What shade it lands on is still anyone’s guess — plenty of babies are born with hair that changes its mind in the first year.",
      'Week 24 is a quiet marker in your care team’s notes — a point where, in the rare event a baby comes very early, a newborn team has a great deal to work with, and it gets better every week. Almost every pregnancy sails straight past it; it is a line on a chart, not something to sit with.'
    ],
    body: [
      'The glucose screen window opens this week and stays open through week twenty-eight. You drink a sweet, syrupy drink at the office, wait about an hour, then have blood drawn. It is a routine check offered to nearly everyone, and being asked back for the longer follow-up test is common and manageable — it is a screen, not a verdict.',
      'Your bump gets measured at visits now, with a tape from your pubic bone to the top of your uterus. The number tends to track your week number, and your provider is watching the trend across visits rather than any single reading.',
      'You may find yourself more out of breath on the stairs and slower to get up off the sofa. That is the ordinary geometry of a growing uterus pressing on everything else, rather than anything that needs fixing.'
    ],
    nutrition: {
      focus: 'Steady blood sugar',
      why: 'Your glucose screen lands in the window that opens this week, and how you eat day to day matters far more than anything you do the morning of the test. Pairing carbohydrates with some protein or fat — rather than eating them on their own — smooths out your energy and gives your baby a steadier supply too.',
      eat: [
        { idea: 'Apple slices with peanut butter', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Whole-grain crackers with cheese and a few olives', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Greek yogurt with berries and a sprinkle of oats', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A chicken, avocado and brown rice bowl', tags: ['dairy-free', 'nut-free'] },
        { idea: 'A hard-boiled egg with a slice of seeded toast', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Split pea and vegetable soup with a whole-grain roll', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Wash produce well, keep raw meat away from ready-to-eat food, and refrigerate leftovers within two hours.'
    },
    todos: [
      { id: 'w24-glucose', label: 'Schedule your glucose screen — it is done between weeks twenty-four and twenty-eight.' },
      { id: 'w24-glucose-logistics', label: 'Ask the office whether to eat beforehand and how long the visit runs, then bring something to keep you occupied.' }
    ]
  },

  {
    week: 25,
    baby: [
      "Your baby is beginning to know your voice from all the others. Yours arrives twice over — through the air and up through your own body — and a lower voice like your partner’s carries through the belly better than a high one, so both are worth using out loud.",
      'The hands are finished work now. Fingernails are growing in, the swirls and loops of the fingerprints are set for life, and the grip is firm enough to hold onto the cord for a while at a time.',
      'The nostrils, plugged since early on, are opening up. Your baby practices breathing motions with amniotic fluid moving through the nose now, which builds the muscles that will manage the first real breath.',
      'Fat is filling in under the skin, so the wrinkled look is smoothing out and the color is turning from red toward pink. Your baby is starting to look less like a work in progress and more like a newborn.'
    ],
    body: [
      'Heartburn tends to step up around now as there is less room for your stomach to work with. Smaller meals eaten more often, staying upright for a while afterward, and propping your head up at night all take the edge off, and your provider can tell you which remedies suit you.',
      'Sleep is harder to come by. Between the trips to the bathroom, the restless legs and a mind that starts making lists at two in the morning, broken nights are the standard at this stage — naps count, and so does going to bed earlier than feels reasonable.',
      'You might notice your hair looking thicker and your nails growing faster than usual. Enjoy it while it lasts; it is a loan that gets quietly called in a few months after birth.'
    ],
    nutrition: {
      focus: 'Whole grains',
      why: 'Your baby is laying down fat and running a nonstop growth project, and whole grains are steady fuel for it — they carry B vitamins, iron, magnesium and fiber that white flour has had stripped away. They also release their energy slowly, which helps on the afternoons that flatten you.',
      eat: [
        { idea: 'Overnight oats with milk, cinnamon and grated apple', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A brown rice bowl with roasted vegetables and chickpeas', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Whole-wheat pasta with tomato sauce and white beans', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Popcorn with a little butter and salt', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Farro tossed with pasteurized feta, cucumber and mint', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Peanut butter and banana on seeded whole-grain bread', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] }
      ],
      safety: "There’s no known safe amount of alcohol in pregnancy — mocktails, sparkling water, and juice spritzers are all fair game."
    },
    todos: [
      { id: 'w25-read-aloud', label: 'Read or sing something out loud tonight — your baby is learning the sound of you.' },
      { id: 'w25-confirm-your-class', label: 'Confirm your childbirth class dates so the sessions land comfortably before week thirty-six.' }
    ]
  },

  {
    week: 26,
    baby: [
      "Your baby’s eyes have been sealed shut for months and are getting ready to open. The layers of the retina are settling into place, and the lids will part sometime in the next week or two.",
      'Brain activity for hearing and sight now shows up in a measurable way. Your baby answers sound more reliably than before — a familiar voice, a burst of music, a sudden clatter — usually with a kick or a moment of complete stillness.',
      'Weight is going on faster than at any point so far, mostly as fat laid down under the skin. If you are carrying a boy, his testicles have begun their slow descent.',
      'The kicks have real force behind them now. Someone with a hand resting on your belly can feel them, and some evenings you can watch a foot travel across from the outside.'
    ],
    body: [
      'Your ribs are being asked to make room, and an ache underneath them — often worse on the right — is common at this stage. Sitting up tall and stretching an arm overhead buys your lungs a little more space.',
      'Blood pressure gets checked at every visit from here. Call your provider right away for a headache that will not shift, changes in your vision, or sudden swelling of your face and hands; those are the ones they want to hear about at any hour, no apology needed.',
      'This is around when the whole thing starts to feel close rather than theoretical, and that can arrive as excitement, nerves, or both in the same hour. Say the anxious parts out loud to someone — your partner, a friend, your midwife. It weighs less once it is outside your head.'
    ],
    nutrition: {
      focus: 'A little extra energy',
      why: 'Your baby is putting on weight faster than at any point so far, and your body is doing all the building. The second trimester asks for roughly 340 extra calories a day — a hearty snack rather than a second dinner — and it sits better spread across the day than eaten in one go.',
      eat: [
        { idea: 'Trail mix with almonds, walnuts and dried cherries', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Sharp cheddar and apple slices with a handful of pretzels', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A mango and yogurt smoothie with a spoonful of nut butter', tags: ['vegetarian', 'halal', 'kosher'] },
        { idea: 'Avocado on toast with lime and flaky salt', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A mug of soup and a buttered roll in the late afternoon', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Rice pudding with cinnamon and a spoonful of jam', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, and orange roughy. Salmon, sardines, shrimp, cod, and canned light tuna are great picks.'
    },
    todos: [
      { id: 'w26-share-a-kick', label: 'Let someone else catch a kick this week — from here the nudges are easy to feel from the outside.' },
      { id: 'w26-birth-preferences-talk', label: 'Start talking through what matters to you in labor; the written plan comes later, the conversation starts now.' }
    ]
  },

  {
    week: 27,
    baby: [
      "Your baby’s eyes open this week. The lids have been fused since early on, and now they part, blink and close again, with lashes fully grown and pupils that tighten in a bright light.",
      'Sleeping and waking have organized into real cycles, including the flickering stage that goes with dreaming. Whatever a baby has to dream about in there, the brain is clearly rehearsing something.',
      'You may notice a run of small rhythmic taps that carries on for a few minutes and then stops. Those are hiccups, they show up often from here on, and they do not bother your baby in the least.',
      'The surface of the brain, smooth until recently, is folding into the grooves and ridges it will keep for life. That folding is how so much brain fits into so small a head, and it carries on hard through the months ahead.'
    ],
    body: [
      'This is the last week of the second trimester. If the middle months treated you kindly, you may feel the tiredness of the early weeks drifting back in — you are carrying more, sleeping worse, and running a construction site around the clock.',
      'The Tdap window opens this week and runs through week thirty-six, and the earlier end of it is the sweet spot. You pass whooping cough protection along to your baby, which covers them through the first months before they can be vaccinated themselves.',
      'Breathlessness, heartburn and a bladder with strong opinions can all turn up in the same evening now. An early dinner, small portions and pillows in the right places do more than any single fix.'
    ],
    nutrition: {
      focus: 'Iron, one more round',
      why: 'Your baby spends this last stretch stockpiling iron in their own liver — a store meant to carry them through their first months of life — and every bit of it comes from you. The daily target holds at 27 mg, and a vitamin C food at the same meal helps you take up much more of what is on the plate.',
      eat: [
        { idea: 'Beef and broccoli stir-fry over rice', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Iron-fortified cereal with sliced kiwi', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'White bean and kale stew finished with a splash of vinegar', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Lamb meatballs in tomato sauce', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Blackstrap molasses stirred into oatmeal with raisins', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roasted pumpkin seeds with a couple of clementines', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Pass on raw or undercooked meat, poultry, eggs, and sprouts — and sneak-tasting raw cookie dough counts too.'
    },
    todos: [
      { id: 'w27-tdap', label: 'Ask about your Tdap shot — it is given between weeks twenty-seven and thirty-six and passes whooping cough protection to your baby.' },
      { id: 'w27-learn-the-pattern', label: "Notice the hours your baby is usually busy — knowing their pattern makes next week’s kick counts simple." }
    ]
  },

  {
    week: 28,
    baby: [
      "Welcome to the third trimester. Your baby’s brain is in the middle of its biggest growth spurt, adding tissue and folds at a pace it holds all the way to birth.",
      'The eyes open and close on a rhythm of their own now, and they can pick out a bright light held against your belly. Some babies turn toward it, and some turn firmly away.',
      'Fat is rounding out the arms, legs and cheeks, so your baby holds their own warmth better than before. The lungs have come far enough that, with help, they could manage air.',
      "Movements have settled into a pattern you can recognize — busy stretches and quiet ones, usually on a schedule of your baby’s own choosing. That personal pattern is the thing worth knowing from here on."
    ],
    body: [
      'The third trimester starts here, and so do more frequent visits — usually every two weeks until around week thirty-six, then weekly after that. Expect a blood count at this visit, and if your blood type is Rh-negative, an injection called RhoGAM that protects this pregnancy and the ones that might follow.',
      'This is the week to start counting kicks. Pick a time your baby is usually active, settle on your left side, and count until you reach ten movements — most days that takes well under an hour. If you count fewer than ten movements in two hours, or the pattern shifts clearly from what you know, call your provider; they would far rather hear from you.',
      "Fatigue often circles back around now, along with breathlessness and a stomach with less room than it would like. You may also see a few drops of thick yellowish fluid from your breasts — that is colostrum, your baby’s first food, turning up early to practice."
    ],
    nutrition: {
      focus: 'DHA for the brain sprint',
      why: "Your baby’s brain is adding tissue faster now than it will at any other time, and the membranes of all those new cells are built largely out of DHA, which they draw from you and bank for later. Two or three servings a week of oily fish — salmon, sardines, herring, trout — covers the daily 200 to 300 mg; leaner picks like cod, tilapia and shrimp are lovely low-mercury protein but carry far less DHA. Algae oil does the same job for anyone who would rather skip fish altogether.",
      eat: [
        { idea: 'Salmon fishcakes with peas and mashed potato', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Sardine and tomato pasta with parsley', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Trout roasted with lemon and new potatoes', tags: ['dairy-free', 'nut-free'] },
        { idea: 'A shrimp, avocado and rice bowl with lime', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Ground flaxseed stirred into fortified soy yogurt, as a plant omega-3 top-up', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Omega-3 enriched eggs, scrambled firm, on toast', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Choose pasteurized dairy and juice. Soft cheeses like brie, feta, and queso fresco are fine only if the label says pasteurized.'
    },
    todos: [
      { id: 'w28-kick-counts', label: 'Start daily kick counts — count to ten movements at a time your baby is usually active, and call your provider if you count fewer than ten movements in two hours or the pattern clearly changes.' },
      { id: 'w28-rhogam', label: 'If your blood type is Rh-negative, ask about your RhoGAM injection — it is usually given around this week.' },
      { id: 'w28-two-week-visits', label: 'Put the next few prenatal visits in the calendar; they move to every two weeks from here.' },
      { id: 'w28-side-sleeping', label: 'Settle into sleeping on your side from around now — a pillow between your knees makes it stick, and waking up on your back is nothing to worry about.' }
    ]
  }
];
