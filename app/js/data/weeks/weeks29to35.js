/**
 * Weekly content — weeks 29–35 (the heart of the third trimester).
 *
 * One `WeekText` per week. Milestones follow MASTER_PROMPT.md Appendix A
 * anchors (rapid brain growth across T3 · daily kick counts from w28 · lungs
 * maturing w34–36 · head-down positioning conversations w32–36 · hospital bag
 * packed by w35). Nutrition follows the T3 arc: choline for the brain-wiring
 * sprint (DHA is owned by week 28), fiber and fluids for constipation, iron
 * stores, smaller meals for heartburn, magnesium for the cramps and restless
 * legs of these weeks, energy-dense snacks framed as roughly 450 extra
 * calories a day, and steady protein. `nutrition.safety` is exactly
 * `SAFETY[(week - 4) % 7]` from docs/PLAN.md. No length or weight numbers
 * appear in the prose — the UI renders those from SIZE_TABLE.
 */

/** @typedef {import('../../lib/types.js').WeekText} WeekText */

/**
 * Authored content for weeks 29 through 35.
 * @type {WeekText[]}
 */
export const weeks29to35 = [
  {
    week: 29,
    baby: [
      "Your baby's brain is laying down connections at a rate it will never match again — nerve cells reaching out to one another and settling into the networks that will run everything from the first breath to knowing your face.",
      "That brain is picking up management jobs, too. It is getting better at holding your baby's temperature steady, which is part of why the fine downy hair that has been keeping them warm will start to thin out over the coming weeks.",
      'The bones are all in place and hardening as they take up calcium, though the skull plates stay soft and separate. Muscles are filling out, and with less room to somersault in, what you feel is turning into jabs, presses and slow rolls.',
      "Inside those bones, the marrow is now the only source of your baby's red blood cells; the liver and spleen have handed the job over for good. It is one more thing your baby has quietly taken on for themselves."
    ],
    body: [
      'Prenatal visits usually move to every two weeks around now. It means more appointments in the calendar, and it also means hearing that heartbeat twice as often.',
      'Heartburn, breathlessness on the stairs and a bladder that feels permanently full all trace back to the same thing: there is less room in the middle of you than there used to be. Smaller meals, an extra pillow at night, and staying upright for a while after eating help more than anything drastic.',
      "This is a good week to learn your baby's rhythm. Pick a time when they are usually lively, settle somewhere comfortable, and count movements — most babies reach ten well inside two hours. Knowing their normal is what makes a real change easy to spot and worth a phone call."
    ],
    nutrition: {
      focus: 'Choline',
      why: 'The brain wiring going in this week runs on choline as well as fat, and the daily target of 450 mg is one plenty of prenatal vitamins are light on. Two eggs gets you most of the way there, and it keeps counting after birth — choline passes straight into breast milk.',
      eat: [
        { idea: 'Two eggs baked in a muffin tin with spinach, eaten warm', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A jacket potato with cottage cheese, chives and black pepper', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Edamame tossed with sesame and flaky salt', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Turkey and roasted vegetable couscous', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Soft tofu simmered with mushrooms and spring onion over rice', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A crustless quiche of egg, potato and leek, cooked all the way through', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Deli meats, hot dogs, and refrigerated smoked seafood are OK only when heated until steaming hot.'
    },
    todos: [
      { id: 'w29-pick-a-kick-time', label: 'Pick a time of day when your baby is usually busy, sit down with a cold drink, and get to know their pattern.' },
      { id: 'w29-start-your-class', label: 'Childbirth classes tend to run about now — put the dates in the calendar and go together if you can.' }
    ]
  },

  {
    week: 30,
    baby: [
      "Your baby's eyes can tell light from dark, and the pupils widen and narrow the way yours do. Hold your belly to a sunny window and you may get an answer — some babies turn toward the brightness, others squirm away from it.",
      'The soft down called lanugo is starting to disappear now that a layer of fat and a better-run internal thermostat can keep your baby warm. Underneath it, the skin is smoothing out and losing the last of its see-through look.',
      'Practice breathing has settled into a steadier rhythm, the diaphragm rising and falling as your baby draws amniotic fluid in and pushes it back out. There is no air down there yet, but the muscles are learning the motion they will need in one go.',
      'The grip is getting genuinely strong, and the fingernails have grown out to the very tips of those small fingers. There is a fair chance your baby arrives needing a trim.'
    ],
    body: [
      'Sleep gets complicated around now: a bump that will not settle, hips that ache on whichever side you land on, and a bladder that wakes you anyway. A pillow under the belly and another between your knees is the arrangement most people end up at.',
      'Braxton Hicks tightenings may be easier to notice this week — your uterus rehearsing, usually painless and irregular, easing off when you change position or drink some water. Contractions that come regularly before thirty-seven weeks are a different thing, and they are worth a call.',
      'Your skin is stretching quickly and itching over the bump is common. Unscented moisturizer and cooler showers take the edge off. Itching that keeps you awake, or itching on your palms and soles without a rash, is worth a call to your provider rather than a wait — there is a simple blood test for it, and it is easy to sort out once they know.'
    ],
    nutrition: {
      focus: 'Fiber and fluids',
      why: 'Pregnancy hormones have slowed your digestion, your uterus is leaning on your bowel, and iron adds to the traffic jam — which is why constipation tends to peak right about here. Twenty-five to thirty grams of fiber a day plus eight to twelve cups of fluid works far better than either one on its own.',
      eat: [
        { idea: 'Overnight oats with raspberries and a spoon of chia', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Bean and vegetable soup with a whole-grain roll', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A pear and a small handful of almonds mid-afternoon', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Stewed prunes over yogurt, or a small glass of prune juice', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Popcorn with olive oil and salt for the evening', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A baked sweet potato with black beans and salsa', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Keep caffeine to 200 mg a day or less — about one 12-oz coffee. Tea, chocolate, and soda count toward the total.'
    },
    todos: [
      { id: 'w30-pediatrician', label: 'Start looking for a pediatrician — ask who your friends use, and book a meet-the-doctor visit if the practice offers one.' },
      { id: 'w30-question-list', label: 'Keep a running list of questions on your phone so none of them evaporate in the exam room.' },
      { id: 'w30-water-within-reach', label: 'Park a big water bottle wherever you sit most — refilling it beats trying to remember to drink.' }
    ]
  },

  {
    week: 31,
    baby: [
      'Your baby processes information now rather than simply receiving it. All five senses are working together, so a sound, a taste or a touch can get a response — turning toward your voice, or going still when a loud noise settles.',
      'Your baby now spends most of the day and night asleep, in cycles far shorter than yours — a preview of the broken nights ahead, and one more thing that is nobody’s fault. Nobody knows what a baby dreams about either, which is a nice thing to wonder about at three in the morning.',
      'Fat is filling in under the skin, rounding out the arms and legs and smoothing the wrinkles away. The kidneys are working hard too — your baby passes a surprising amount of urine into the amniotic fluid every day, which is exactly what should be happening.',
      'The iron store your baby has been building in their liver is filling out now. By birth there is enough of it to carry them through their first months on the outside, before food starts doing that job.'
    ],
    body: [
      'You may be out of breath doing very little. Your uterus is pressing up under your diaphragm, so your lungs have less room to open — sitting and standing tall to give your ribs some space helps more than slowing down does.',
      'Some women find a few drops of thick yellowish colostrum on their nipples this week. That is the first milk, made and waiting. If you see nothing at all, it tells you nothing about how feeding will go.',
      'Backache, restless legs and a general case of the fidgets are all common this deep in. A warm shower before bed and a short walk after dinner do more than they sound like they would.'
    ],
    nutrition: {
      focus: 'Iron',
      why: 'Your baby spends these weeks filling that liver store, and the iron for it comes straight out of your own supply while your blood volume is at its peak. Twenty-seven milligrams a day is the target, and a squeeze of citrus or a side of peppers helps your body take up much more of the iron in beans, greens and grains.',
      eat: [
        { idea: 'Beef and broccoli over rice with a wedge of lime', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Lentil soup with tomatoes, finished with lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Fortified breakfast cereal with sliced strawberries', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Chicken thighs roasted with red peppers and potatoes', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Dried apricots and pumpkin seeds in a bag by the door', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A black bean and spinach quesadilla with salsa', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Wash produce well, keep raw meat away from ready-to-eat food, and refrigerate leftovers within two hours.'
    },
    todos: [
      { id: 'w31-feeding-class', label: 'Look into a feeding or breastfeeding class — knowing the basics beforehand makes the first week gentler.' },
      { id: 'w31-safe-sleep-space', label: 'Set up where your baby will sleep: a firm, flat surface with a fitted sheet and nothing else in it.' }
    ]
  },

  {
    week: 32,
    baby: [
      'Many babies are head-down by around now, and plenty of the rest turn over the next few weeks. That is why your provider starts checking which way up your baby is lying at your visits from here.',
      'Your baby is rehearsing the whole newborn routine: breathing motions, sucking and swallowing, over and over. Hiccups come with the territory, and you can often feel them from the outside as a steady little rhythm that carries on for a few minutes at a time.',
      'The skin has gone from see-through to opaque, with fat underneath filling it out. Fingernails and toenails are complete, and there may be a real head of hair up top by now.',
      'The bones have hardened everywhere except the skull. Those plates stay separate and slightly movable so the head can ease through the birth canal, and they knit together over the months after birth.'
    ],
    body: [
      'Your uterus has climbed up near your ribs, so every meal meets a stomach with a fraction of its usual room. This is about the week when eating little and often stops being advice and becomes the only comfortable way to do it.',
      'Braxton Hicks usually pick up around now. They come and go without a pattern and settle when you move or drink water — unlike labor contractions, which get longer, stronger and closer together as time passes.',
      'It is a good moment to talk about how you would like the birth to go, while nobody is in a hurry and nobody is in labor. Plans shift on the day and that is fine; the point is that the people beside you know what matters to you.'
    ],
    nutrition: {
      focus: 'Smaller meals for heartburn',
      why: "With your uterus pressed up under your ribs and pregnancy hormones keeping the valve at the top of your stomach relaxed, a big meal has nowhere to go but up. Five or six small ones across the day get the same food in with far less burn — and your baby's fastest weight gain is just ahead, so the food still matters.",
      eat: [
        { idea: 'Half a roast chicken sandwich now, the other half a couple of hours later', tags: ['dairy-free', 'nut-free'] },
        { idea: 'A small bowl of oatmeal with banana instead of a heavy breakfast', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Yogurt with honey and soft fruit — easy on a crowded stomach', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Steamed fish with rice and green beans, kept plain', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Melon with cottage cheese as a late-afternoon plate', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Crackers and cheese before bed, sitting up a while afterward', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: "There's no known safe amount of alcohol in pregnancy — mocktails, sparkling water, and juice spritzers are all fair game."
    },
    todos: [
      { id: 'w32-birth-plan', label: 'Sketch a one-page birth plan: pain relief you would like to try, who you want in the room, and what matters most if plans change.' },
      { id: 'w32-hospital-preregister', label: 'Preregister at your hospital or birth center so the paperwork is long done before you need it.' },
      { id: 'w32-hospital-tour', label: 'Book a tour of where you will give birth — knowing which door opens at two in the morning is worth a lot.' }
    ]
  },

  {
    week: 33,
    baby: [
      'Antibodies are crossing the placenta from you to your baby in earnest now. That borrowed protection is what covers your baby in the earliest weeks out here, while their own defenses are still warming up.',
      'The skeleton keeps hardening, and your baby draws a steady supply of calcium from you every day to do it. The skull is the deliberate exception: soft spots and flexible seams stay open, both for the trip out and for the brain growth that follows it.',
      'Room is running short. Movements turn into rolls, stretches and firm pushes rather than flips, and you may be able to trace the shape of a heel or an elbow sliding under your skin.',
      'The eyes can follow a moving light and the pupils narrow and widen with it. Hearing is sharp enough that a familiar song or a familiar voice can settle your baby mid-wriggle.'
    ],
    body: [
      'Puffy feet and ankles at the end of a long day are ordinary this deep into pregnancy — put your feet up when you can, and drink more rather than less. Sudden swelling in your face or hands is a different matter, and it sits on the list of reasons to call, in the card at the bottom of this screen.',
      'Tingling or numbness in your hands, especially overnight, is common now — extra fluid pressing on the nerves that run through your wrists. Shaking your hands out helps, and it usually eases in the weeks after birth.',
      'Sleep is broken, the dreams are vivid, and by evening you may be ready for bed at eight. Take the rest when it is offered; there is no prize for pushing through this stretch.'
    ],
    nutrition: {
      focus: 'Magnesium',
      why: 'Magnesium goes into the bones your baby is hardening and into the muscles and nerves that keep waking you — the calf cramps, the restless evenings, the hands that will not settle. It comes from ordinary food rather than anything special: seeds, beans, whole grains, dark leafy greens and a little dark chocolate.',
      eat: [
        { idea: 'Pumpkin seeds and dark chocolate as an evening handful', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A spinach and black bean burrito with avocado', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Brown rice with edamame, sesame and spring onion', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Peanut butter and sliced banana on oat toast', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'A cashew and vegetable stir-fry over brown rice', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'A mug of cocoa made with fortified milk before bed', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, and orange roughy. Salmon, sardines, shrimp, cod, and canned light tuna are great picks.'
    },
    todos: [
      { id: 'w33-ask-about-position', label: 'Ask at your next visit which way your baby is lying — head-down conversations usually start around this stretch.' },
      { id: 'w33-freezer-meals', label: 'Cook double and freeze the extra. Future you, three days into newborn life, will be grateful.' }
    ]
  },

  {
    week: 34,
    baby: [
      "Your baby's lungs are in their final stretch of preparation. They are producing more surfactant, the slippery coating that keeps the tiny air sacs from sticking shut, and that work carries on through the next couple of weeks.",
      'Fat is going on quickly. The skin has turned from red and wrinkled to smooth and pink, the cheeks have filled out, and the waxy vernix coating is getting thicker to protect all that new softness.',
      'The nervous system is maturing right alongside — steadier temperature control, a stronger suck, better coordinated movement. If your baby is a boy, the testicles have usually finished their journey down by about now.',
      'Hearing is well established, so this is a lovely time to read the same book or play the same song most evenings. Newborns often settle to sounds they first met from the inside.'
    ],
    body: [
      'Energy may dip noticeably this week. Carrying this much around is genuine physical work and sleep is not repaying you the way it used to — short rests scattered through the day beat one heroic attempt at a lie-in.',
      'Pressure low in your pelvis, twinges through your hips, and a walk that has turned into a waddle all come from the same place: a heavier baby settling lower, and hormones softening the joints that hold you together.',
      'Visits are frequent now and they get quicker — a bump measurement, blood pressure, the heartbeat, and a chance to ask whatever it was you thought of in the middle of the night. Writing the question down beforehand is the only way it survives the drive over.'
    ],
    nutrition: {
      focus: 'Energy-dense snacks',
      why: 'Your baby is putting on weight faster now than in any week before this, while your stomach, lungs and everything else compete for what space is left. This stretch runs on about 450 extra calories a day — a hearty snack, not a second dinner — and small, rich bites go down far more comfortably than a big plate.',
      eat: [
        { idea: 'Nut butter on whole-grain toast with banana slices', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Trail mix with walnuts, dried cherries and dark chocolate', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'Cheese cubes and grapes waiting in a box in the fridge', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A smoothie with yogurt, frozen mango and a scoop of oats', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Avocado mashed onto crackers with flaky salt', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Hummus with olive oil and warm pita bread', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Pass on raw or undercooked meat, poultry, eggs, and sprouts — and sneak-tasting raw cookie dough counts too.'
    },
    todos: [
      { id: 'w34-line-up-help', label: 'Line up your first-weeks help: who cooks, who holds the baby while you shower, who you can text at midnight.' },
      { id: 'w34-wash-the-small-clothes', label: 'Wash and put away the newborn clothes, sheets and towels so they are soft and ready.' }
    ]
  },

  {
    week: 35,
    baby: [
      "Your baby's lungs are nearly ready. These last weeks are mostly about lungs and brain, and both keep maturing right up to the end — which is why the time still on the clock is worth having.",
      'The brain is adding weight and wiring quickly through this stretch. The kidneys are fully developed, and the liver is handling waste on its own now.',
      'There is very little spare room left. Your baby is curled up with knees drawn in and arms tucked, so instead of turning they roll, press and stretch — you are more likely to feel a foot slide across than a somersault.',
      'Most babies are head-down by now, settled low and pointed the right way. If yours has other ideas, there is still time and there are options, and your provider will walk you through them without any rush.'
    ],
    body: [
      'You may notice the bump riding lower and your breathing coming easier — that is your baby dropping into your pelvis. With a first baby it often happens a few weeks before birth, and it trades heartburn for a good deal more pressure below and more trips to the bathroom.',
      'A burst of nesting energy is common around now, and so is the exact opposite. Both are fine. If the urge to reorganize a cupboard lands at eleven at night, go ahead — just leave the step ladder out of it.',
      'This is the week the hospital bag stops being a someday job. Packing it now is less about expecting anything soon and more about getting it off your mind for good.'
    ],
    nutrition: {
      focus: 'Protein',
      why: "These last weeks are your baby's busiest for laying down muscle and brain tissue, and protein is the raw material for both — somewhere between seventy-five and a hundred grams a day through the third trimester. Spreading it across every meal and snack right now is far kinder to a squashed stomach than loading it all into dinner.",
      eat: [
        { idea: 'Two eggs scrambled with cheese on toast, cooked through', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Greek yogurt with honey and chopped walnuts', tags: ['vegetarian', 'halal', 'kosher'] },
        { idea: 'Chicken and white bean stew with rosemary', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Lentil and vegetable curry over rice', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Cottage cheese with sliced peaches and black pepper', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roasted chickpeas with paprika, eaten by the handful', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Choose pasteurized dairy and juice. Soft cheeses like brie, feta, and queso fresco are fine only if the label says pasteurized.'
    },
    todos: [
      { id: 'w35-hospital-bag', label: 'Pack the hospital bag this week — one for you, one for your baby, and a small one for whoever is coming with you.' },
      { id: 'w35-practice-the-drive', label: 'Drive the route to the hospital once, after dark, and find out where to park and which entrance stays open.' },
      { id: 'w35-work-handover', label: 'Write the work handover notes now, while it is easy — plenty of people stop sooner than they planned to.' }
    ]
  }
];
