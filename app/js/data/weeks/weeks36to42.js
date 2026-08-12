/**
 * Weekly content — weeks 36–42 (the home stretch, and past the date).
 *
 * One `WeekText` per week. Milestones follow MASTER_PROMPT.md Appendix A
 * anchors (lungs maturing w34–36 · head-down positioning conversations w32–36 ·
 * GBS swab w36–37 · car seat installed by w36 · "early term" 37–38 · "full
 * term" 39w0d–40w6d · daily kick counts and a call for any clear drop in
 * movement). Nutrition follows the T3 arc through to the finish: steady
 * energy, hydration, iron banked for recovery, a stocked freezer, slow-burn
 * fuel, choline for a brain that is still wiring, and eating for the first days
 * after. Weeks 40–42 are written gently — informative, unhurried, no countdown
 * pressure. `nutrition.safety` is exactly `SAFETY[(week - 4) % 7]` from
 * docs/PLAN.md. No length or weight numbers appear in the prose — the UI
 * renders those from SIZE_TABLE.
 */

/** @typedef {import('../../lib/types.js').WeekText} WeekText */

/**
 * Authored content for weeks 36 through 42.
 * @type {WeekText[]}
 */
export const weeks36to42 = [
  {
    week: 36,
    baby: [
      "Your baby's lungs are finishing what they started a couple of weeks ago: making enough surfactant, the slippery film that keeps the smallest air sacs from collapsing between breaths. Most of that work wraps up right about now, and it is a good part of the reason these late weeks are worth having.",
      'Fat is still going on day after day, filling out the cheeks and the soft creases at the wrists and knees. That padding is what will hold your baby\'s temperature steady once the world around them is room temperature instead of you.',
      'The downy hair that has covered your baby all this time is nearly gone, shed into the amniotic fluid and swallowed along with it. It gathers in the bowel as a dark, sticky first stool called meconium — you will be introduced within a day or two of meeting each other.',
      'Room has run out. Most babies are head-down by this week with the head easing toward the pelvis, and your provider will feel your bump at each visit to check which way up yours is lying. If they are bottom-down, there are still options and there is still time, and your team will walk you through them.'
    ],
    body: [
      'Visits usually go weekly from about here. They are short — blood pressure, a bump measurement, the heartbeat, and whatever you thought of at four in the morning — but the rhythm of seeing someone every week is its own kind of comfort.',
      'One of these visits brings the group B strep swab, a quick swab done between now and next week. Group B strep is a common bacterium that lives harmlessly in plenty of healthy people; the result simply tells your team whether you will be offered antibiotics during labor, and a positive swab changes the plan only a little.',
      'You may notice the bump sitting lower and your breath coming easier, traded for real pressure down below and a bathroom you now visit on a loop. Pelvic aching, waddling and a hip that complains when you roll over all belong to this stretch — a warm shower, a pillow between the knees, and sitting down more often than feels reasonable.'
    ],
    nutrition: {
      focus: 'Steady energy',
      why: "Your baby is still putting on weight every single day while your stomach shares what little room is left, so the aim this week is fuel that lasts rather than volume. Pairing a protein with a slow carbohydrate at each small meal keeps you level through days made mostly of appointments and waiting.",
      eat: [
        { idea: 'Oatmeal with peanut butter stirred through and sliced banana', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Hard-boiled eggs and whole-grain crackers, ready in the fridge', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A toasted turkey and cheese sandwich, the deli meat heated until it steams', tags: ['nut-free'] },
        { idea: 'Greek yogurt with berries and a spoon of granola', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Hummus and warm pita with cucumber spears', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A mug of lentil soup with a slice of buttered bread', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Deli meats, hot dogs, and refrigerated smoked seafood are OK only when heated until steaming hot.'
    },
    todos: [
      { id: 'w36-car-seat', label: 'Install the car seat this week — rear-facing in the back seat — and look for a free inspection station nearby if you want a second pair of eyes on it.' },
      { id: 'w36-gbs', label: 'Expect the group B strep swab at a visit between now and next week; ask for the result so you already know it when the day comes.' },
      { id: 'w36-after-hours-number', label: "Save your practice's after-hours number in both your phones, under a name you can find in a hurry." },
      { id: 'w36-tank-and-chargers', label: 'Keep the car above half a tank and the phones charging overnight from here on.' }
    ]
  },

  {
    week: 37,
    baby: [
      'This week your baby is what your care team calls early term. A baby born now is usually ready for the outside, and the two or three weeks still on the clock are not idle time — they go almost entirely to the brain and the lungs, which keep maturing right up to the day.',
      'The whole newborn skill set is being rehearsed in there: sucking a thumb, blinking, turning toward light, gripping whatever is within reach. The hardest one to master is stringing sucking, swallowing and breathing into a single smooth rhythm, and your baby practices it until the first feed and then some.',
      "The skull stays deliberately unfinished. Those plates are separate and can slide over one another on the way out, which is why some newborns arrive with a slightly pointed head — it settles into a normal round one within a few days.",
      'The waxy vernix that has been waterproofing your baby is thinning out, and the pool of amniotic fluid has just passed its fullest. From here it slowly gets smaller while your baby gets bigger, which is exactly why the jabs feel so much more pointed than they used to.'
    ],
    body: [
      'Your provider may start checking how your cervix is doing at these visits, or may not — practices differ, and both are fine. Either way, those checks tell far less about when labor will start than everyone hopes, so try not to read a fortune into the result.',
      'It is worth knowing what real labor feels like before you need to know. Practice tightenings wander in and out and settle when you move or drink; labor contractions get longer, stronger and closer together and carry on regardless of what you do. Fluid leaking, bleeding, or a change in your baby\'s movement are all reasons to call whatever else is happening.',
      'Nesting may hit like a wave this week, or you may want to lie on the sofa and be left alone. Both are completely ordinary, and neither one predicts anything about the birth.'
    ],
    nutrition: {
      focus: 'Hydration, packed for labor',
      why: 'The amniotic fluid around your baby is made and refreshed constantly — much of it now by your baby\'s own kidneys — and being well watered supports that turnover. Eight to twelve cups a day also takes the edge off practice contractions, which fire more readily when you are running dry, so it is worth practising with the things that will travel to the hospital with you.',
      eat: [
        { idea: 'A large insulated bottle of ice water — fill one now and pack a second in the bag', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Coconut water, chilled, for the days you are tired of plain water', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Frozen grapes, mango and pineapple chunks straight from the freezer', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Ice chips to crunch when nothing else appeals', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A mug of miso broth in the late afternoon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A tall glass of milk or fortified soy milk before bed', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Keep caffeine to 200 mg a day or less — about one 12-oz coffee. Tea, chocolate, and soda count toward the total.'
    },
    todos: [
      { id: 'w37-labor-signs', label: 'Talk through what would send you in: contractions that get longer, stronger and closer together, fluid leaking, bleeding, or a clear change in your baby\'s movement.' },
      { id: 'w37-backup-plan', label: 'Agree on a plan B — who drives if your first choice is out of town, and who looks after the house while you are away.' }
    ]
  },

  {
    week: 38,
    baby: [
      "Your baby's brain has been growing quickly through these last weeks and carries right on after birth. What is being laid down now is the wiring for the very first jobs: feeding, staying warm, being soothed, and knowing the voices they have been listening to for months.",
      'Fat keeps filling in under the skin, and the proportions have caught up with each other — the head and the belly are about the same distance around now. The wrinkled, just-out-of-the-bath look has smoothed out for good.',
      'Your baby opens and closes their eyes, and the color behind them is most likely a dark slate for now, whatever shade it becomes. Real eye color settles over the first months out in daylight, so the newborn photos are not the final answer.',
      'The fingernails have grown right out past the fingertips, and the grip is firm. Plenty of babies arrive having scratched their own cheek on the way, which looks alarming and heals in days.'
    ],
    body: [
      'You may lose your mucus plug this week or the next — a jelly-like blob, sometimes tinged pink or brown. It can come away days or weeks before anything else happens, so it is interesting news rather than a starting gun. Bright red bleeding is a different thing and worth a call.',
      'Nights are broken and the days are long, and everyone you know has started texting to ask. It is entirely fine to answer once and then put the phone face down for the afternoon.',
      'Swollen feet and hands by the end of the day are ordinary now, especially in warm weather — feet up, fluids in, and shoes a size roomier than you would like. Swelling that arrives suddenly in your face or hands, a headache that will not lift, or vision that turns blurry or spotty are a different matter, and they are worth a call at any hour; you will find them on the red-flag list further down this page.'
    ],
    nutrition: {
      focus: 'Iron for the days after',
      why: 'Birth comes with some blood loss whichever way it goes, and the iron you bank this week is what makes the first weeks at home feel less wrung out. Twenty-seven milligrams a day is the target, and something with vitamin C alongside it helps your body take up much more of the iron in beans, greens and grains.',
      eat: [
        { idea: 'Steak strips with peppers and onions folded into a warm tortilla', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Lentil bolognese over pasta, heavy on the tomatoes', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Fortified breakfast cereal with sliced kiwi', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Spinach and white bean soup finished with lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A bowl of beef and kidney bean chili with cornbread', tags: ['nut-free'] },
        { idea: 'Eggs baked in tomato sauce with crusty bread, yolks cooked firm', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Wash produce well, keep raw meat away from ready-to-eat food, and refrigerate leftovers within two hours.'
    },
    todos: [
      { id: 'w38-insurance', label: 'Call your insurer to ask how your baby gets added to the plan and how long you have after birth to do it.' },
      { id: 'w38-recovery-basket', label: 'Stock the bathroom for afterward: pads, comfortable underwear, and a water bottle you can drink from one-handed.' }
    ]
  },

  {
    week: 39,
    baby: [
      'As of this week your baby is full term. The lungs got their extra time, the brain got its extra time, and everything your baby needs to breathe, feed and stay warm on the outside is finished and waiting.',
      "Antibodies are still pouring across the placenta in these final days — the borrowed immune protection your baby will carry through their first months. It is one of the quiet reasons the last weeks earn their keep.",
      'A little more fat goes on each day, mostly around the shoulders and the cheeks, and the vernix has largely worn away. Skin that has spent months in fluid often looks dry or peels a bit in the first week out; it is not a problem to fix, just a newborn getting used to air.',
      'Your voice is thoroughly familiar by now, and so are the other voices around you. Newborns turn toward the ones they first heard from the inside, which makes the first minutes after birth a genuinely lovely thing to witness.'
    ],
    body: [
      'Labor could start any day, or it could be another two or three weeks. Both are normal, and there is no way to tell which one you are in for from how you feel today.',
      'The signals worth acting on stay the same: contractions that build a rhythm and keep it, a gush or a trickle of fluid, bleeding, or a clear change in your baby\'s movement. Your baby has less room to swing an elbow now, but the pattern should stay just as busy right up to the end.',
      'Rest where you can and eat when you can. There is nothing left on the list that matters more than sleep, and the house does not need to be any cleaner than it is.'
    ],
    nutrition: {
      focus: 'A stocked freezer',
      why: 'Your baby is full term as of this week, which means the dinner you cook tonight could be the last one you cook for a while. Food you can reheat and eat with one hand at three in the morning will be worth more to you than anything you could make from scratch that week.',
      eat: [
        { idea: 'A double batch of chili frozen flat in single portions', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Baked oatmeal squares cut up and frozen for one-handed breakfasts', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Soup frozen a mugful at a time — lentil, chicken or tomato', tags: ['nut-free'] },
        { idea: 'Bean and rice burritos rolled, wrapped and frozen to reheat until steaming', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Energy bites of oats, dates and peanut butter in a tub in the fridge', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Cheese, crackers and clementines parked within reach of the sofa', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: "There's no known safe amount of alcohol in pregnancy — mocktails, sparkling water, and juice spritzers are all fair game."
    },
    todos: [
      { id: 'w39-cook-double', label: 'Cook double whatever you make this week and freeze the second half in single portions.' },
      { id: 'w39-say-yes', label: 'When people ask how they can help, hand them a real job: a meal, a grocery run, an hour of laundry.' }
    ]
  },

  {
    week: 40,
    baby: [
      'Your baby is fully built and fully term. These days are spent doing what they will keep doing on the outside — sleeping in long stretches, waking to push and stretch, and rehearsing the breathing motion over and over with no air in sight.',
      'A last layer of fat is still going on, and the skull plates are still soft and slightly overlapping so the head can mold to the path out. If your baby arrives with a lopsided little head, it is a sign the design worked, and it rounds out on its own.',
      'What actually starts labor is still not fully understood, and the current thinking is that your baby has a hand in the signal — a message from a body that has finished the last of its growing. There is no way to hurry that conversation along, and no prize for the date it lands on.'
    ],
    body: [
      "Your due date has been an estimate all along — only a small share of babies arrive on the day itself, and plenty of first babies take another week or two. If the messages asking whether anything is happening are wearing thin, you are allowed to stop answering them.",
      'Your provider may offer to sweep the membranes or talk through what happens if you go past this week. It is a good conversation to have while you are calm, so that whatever comes next already sounds familiar.',
      'Keep an eye on movement. Less room does not mean less moving — your baby should still have their usual busy stretches, and a clear drop is worth a phone call the same day, at any hour.'
    ],
    nutrition: {
      focus: 'Slow-burn energy',
      why: 'Your baby has finished growing organs and is mostly topping up fat, so the nutrition job this week is your own tank. Labor is endurance work, and it runs on the slow-releasing carbohydrates you have been eating in the days beforehand — oats, whole grains, beans and fruit — far more than on anything you eat on the day.',
      eat: [
        { idea: 'Overnight oats with grated apple and cinnamon', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A rice bowl with black beans, avocado and lime', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Whole-grain toast with mashed banana and honey', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Pasta with olive oil, garlic and white beans', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Medjool dates with a little cream cheese, two or three at a time', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Frozen grapes and a glass of milk before bed', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, and orange roughy. Salmon, sardines, shrimp, cod, and canned light tuna are great picks.'
    },
    todos: [
      { id: 'w40-ask-whats-next', label: 'Ask your provider what happens if you go past your date, so the plan is familiar long before you need it.' },
      { id: 'w40-something-lovely', label: 'Put one good thing in the diary this week — breakfast out, a film, a long nap with the phone face down.' }
    ]
  },

  {
    week: 41,
    baby: [
      'Your baby keeps growing gently in there, adding a little length and a little weight each day. The placenta carries on with its work, and your team will be checking the fluid around your baby and listening to their heartbeat to see that both look the way they should.',
      "The fingernails are long enough that a newborn manicure goes on the first-week list. Most of the vernix is gone, so babies born around now often arrive with dry, wrinkled hands and feet and skin that flakes for a week or so — normal, and no treatment needed beyond time.",
      'Babies born after their date arrive with everything finished, and often with a good head of hair. However alert or sleepy yours is in that first hour, it says nothing about them — newborns each arrive on their own settings.'
    ],
    body: [
      'Being past your date is its own small endurance event: the phone, the questions, the sense that the calendar has stopped moving. You have not done anything wrong and nothing is stuck. Most pregnancies that reach this week end within it.',
      'The check-ins get more frequent now and more detailed: a listen to your baby\'s heartbeat across a stretch of time, a scan to measure the fluid, and a conversation about whether and when to help labor along. Ask what each one is looking at and what the choices are — this is a decision you make together with your team.',
      'The old comforts still work: walking, a warm shower, sleep whenever it is offered. Add something to watch that has nothing whatsoever to do with babies.'
    ],
    nutrition: {
      focus: 'Choline',
      why: "Your baby's brain is still wiring itself in these extra days and leans on choline to do it — four hundred and fifty milligrams a day, with eggs by far the easiest way there. It passes straight into breast milk too, so it is a good habit to already be in when your baby arrives.",
      eat: [
        { idea: 'Two eggs any way you like them, cooked until the yolk is firm', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Egg salad you make yourself with hard-boiled eggs, on soft bread with plenty of pepper', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roast chicken with potatoes and Brussels sprouts', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Edamame with flaky salt as an afternoon snack', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Quinoa salad with chickpeas and roasted broccoli', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A baked potato with cottage cheese and chives', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Pass on raw or undercooked meat, poultry, eggs, and sprouts — and sneak-tasting raw cookie dough counts too.'
    },
    todos: [
      { id: 'w41-extra-checks', label: 'Go to every extra check your provider offers this week — the heartbeat trace and the fluid scan are how they keep a close eye on your baby.' },
      { id: 'w41-mute-the-chat', label: 'Send one message to everyone who keeps asking: you will share news when there is news, and the phone is going face down until then.' }
    ]
  },

  {
    week: 42,
    baby: [
      'Very few pregnancies reach this week — by now most families have met their baby, and most of the rest have a date in the diary. Your baby is fully grown and fully ready, and the checks your team is running are there to confirm that in real time.',
      'Skin that has been in fluid this long is usually dry and peeling at birth, the nails are long, and there may be a good head of hair. The creamy vernix is essentially gone, which is simply what a baby who stayed a little longer looks like.',
      'The last part may go several ways: labor that starts on its own, a little help to get it going, or a birth in an operating room. However it unfolds, it ends with the same thing you have been working toward all year.'
    ],
    body: [
      'By now your team will have mapped this stretch out with you, and they will want to see you often. Go to every appointment, keep asking questions, and say plainly if you would like things to get moving — your preferences are part of the plan.',
      'You are close now, and you are allowed to be completely done with being pregnant. Both of those can be true on the same day.',
      'The recovery afterward deserves as much thought as the birth itself. Soft clothes, easy food, help you have already asked for, and full permission to hand your baby to someone else while you sleep.'
    ],
    nutrition: {
      focus: 'Eating for the first days after',
      why: 'However your baby arrives this week, the days right after are hungry and thirsty ones, especially if you plan to breastfeed. Protein at every meal, iron-rich food to rebuild with, and a full glass beside you every time you sit down is the entire plan.',
      eat: [
        { idea: 'A jug of water on the counter and a glass at every spot you sit', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A basket of one-handed snacks: oat bars, dried apricots, mixed nuts', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Scrambled eggs on toast — fast, warm, and full of protein', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Chicken and vegetable soup reheated from the freezer', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Yogurt with berries and honey, eaten standing up', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Lentil stew over rice, for the iron and the comfort', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Choose pasteurized dairy and juice. Soft cheeses like brie, feta, and queso fresco are fine only if the label says pasteurized.'
    },
    todos: [
      { id: 'w42-stay-close', label: 'Keep in close touch with your provider and go to every check they schedule — they already have a plan for this week.' },
      { id: 'w42-first-visitors', label: 'Decide now who visits in the first week and who can happily wait; it is far easier to say before your baby is here.' }
    ]
  }
];
