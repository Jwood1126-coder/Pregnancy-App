/**
 * Weekly content — weeks 13–20 (the first-to-second-trimester handover).
 *
 * One `WeekText` per week. Milestones follow MASTER_PROMPT.md Appendix A
 * anchors (first movements felt w16–22 · hearing develops ~w18 · sex visible on
 * ultrasound ~w18–20 · anatomy scan w18–22). Nutrition follows the T2 arc:
 * appetite returning, steady protein, iron paired with vitamin C, calcium,
 * DHA from low-mercury fish. `nutrition.safety` is exactly `SAFETY[(week - 4) % 7]`
 * from docs/PLAN.md. No length or weight numbers appear in the prose — the UI
 * renders those from SIZE_TABLE.
 */

/** @typedef {import('../../lib/types.js').WeekText} WeekText */

/**
 * Authored content for weeks 13 through 20.
 * @type {WeekText[]}
 */
export const weeks13to20 = [
  {
    week: 13,
    baby: [
      "Your baby's proportions are starting to even out. The head has been running well ahead of the rest of the body, and now the body is catching up — the arms have already grown to match, and the legs are close behind.",
      'The vocal cords finish forming this week, tucked into a throat with no air in it. There is nothing to make a sound with yet, so the first cry has to wait for the first breath.',
      'Fine bones are lengthening through the arms and legs, and the spleen has joined in on making red blood cells. Hands can reach the mouth now, which is when thumb-sucking tends to start.',
      'The placenta has taken over nearly all of the hormone work your ovaries were doing early on, and it has grown into the job. It feeds your baby, carries waste away, and keeps expanding right alongside them.'
    ],
    body: [
      'This is the last week of the first trimester, and many women feel the change — nausea loosening its grip, food sounding good again, an afternoon that does not have to end in a nap. If yours is slower to lift, give it a couple more weeks; it usually fades out rather than stopping all at once.',
      'Your uterus has grown up out of your pelvis, so a low, firm curve may show when you lie down. A sharp pull low on one side when you stand up quickly is usually the round ligaments stretching, and it tends to pass in seconds.',
      'The end of the first trimester lands differently for everyone. Some people feel their shoulders drop; others carry a little worry the whole way through. Both are honest ways to arrive at thirteen weeks.'
    ],
    nutrition: {
      focus: 'Getting your appetite back',
      why: 'With the organ-building of the first trimester behind you, the job shifts from surviving nausea to eating ordinary meals again. You do not need extra calories yet — that starts with the second trimester, and it comes to about 340 extra calories a day, which is a hearty snack rather than a second dinner.',
      eat: [
        { idea: 'Oatmeal made with plant milk, sliced banana and a spoonful of peanut butter', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'A baked potato with cheese and a side of steamed broccoli', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Chicken and vegetable soup with a thick slice of bread', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Cottage cheese with sliced pear and cracked pepper', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Eggs scrambled in olive oil with tomatoes on toast', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Hummus with warm pita and cucumber spears', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Pass on raw or undercooked meat, poultry, eggs, and sprouts — and sneak-tasting raw cookie dough counts too.'
    },
    todos: [
      { id: 'w13-dental-checkup', label: 'Book a dental cleaning — pregnancy is hard on gums, and this stretch is a comfortable time to go.' },
      { id: 'w13-restock-the-kitchen', label: 'Restock the fridge with real meals now that food sounds good again.' }
    ]
  },

  {
    week: 14,
    baby: [
      "Your baby's face has working muscles now, and every one of them is being tried out. Squints, frowns and grimaces come and go with no feeling behind them — this is practice, the same way a hand opens and closes.",
      'A soft down called lanugo begins spreading over the skin this week. It holds warmth in while there is still no fat underneath, and most of it sheds again before birth.',
      'The roof of the mouth finishes closing, which matters for sucking now and for speech much later. The neck is lengthening too, lifting the head up off the chest so your baby looks less curled and more like a small person.'
    ],
    body: [
      'Welcome to the second trimester. For many women this is the kindest stretch of the whole pregnancy — steadier energy, a stomach that behaves, and hunger that arrives on schedule.',
      'Your gums may bleed a little when you brush. That is hormones softening the tissue rather than anything you have done wrong, and a softer brush with gentle flossing usually settles it.',
      'Some women watch a bump appear almost overnight this week, while others stay small for a while yet. How you are built and where your uterus sits matter far more than anything you are doing.'
    ],
    nutrition: {
      focus: 'Protein',
      why: 'Your baby is in one of the fastest-growing stretches of the pregnancy, laying down muscle over a quickly lengthening frame, and protein is the raw material for it. Needs through the second and third trimesters land near seventy-five to a hundred grams a day, which is easier than it sounds when every meal carries a solid source.',
      eat: [
        { idea: 'Greek yogurt with berries and a scatter of pumpkin seeds', tags: ['vegetarian', 'halal', 'kosher'] },
        { idea: 'Lentil dal over rice with a squeeze of lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A roast chicken sandwich on whole-grain bread', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Cottage cheese with pineapple', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Edamame with flaky salt, straight from the freezer', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Two eggs on toast, cooked until the yolks are firm', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Choose pasteurized dairy and juice. Soft cheeses like brie, feta, and queso fresco are fine only if the label says pasteurized.'
    },
    todos: [
      { id: 'w14-work-leave', label: 'Look up your workplace leave policy — knowing the rules early makes the conversation easier later.' },
      { id: 'w14-gentle-movement', label: 'Pick a movement you enjoy — walking, swimming, prenatal yoga — and aim for most days of the week.' }
    ]
  },

  {
    week: 15,
    baby: [
      "Your baby's legs have overtaken the arms in length this week, and the whole body looks longer and less folded up. The bones are hardening steadily, which is why a scan around now shows a clear little skeleton rather than a soft outline.",
      'Movements are getting more coordinated: arms and legs that travel together rather than twitching on their own, and hands that find the face, the feet and the cord. The eyelids stay fused shut for now and will be for a couple of months yet, while the eyes underneath finish forming.',
      'Practice breathing has begun. Your baby pulls amniotic fluid into the lungs and pushes it back out, which does nothing for oxygen yet but builds the muscles and airways that will manage the first real breath.'
    ],
    body: [
      'Energy tends to hold steady through these weeks, which makes it a good time for the things that get harder later — a trip, a long appointment, shifting furniture around a spare room. The middle months tend to be the roomiest ones, so spend the good days on the jobs you have been putting off.',
      'More blood is moving through you than before, and it shows up in small odd ways: a stuffy nose that will not clear, an occasional nosebleed, gums that bleed at the sink. It is usually just the extra volume rather than a sign of trouble.',
      'If you feel a faint flutter low down, it may well be your baby. First movements usually turn up somewhere between weeks sixteen and twenty-two, and first-time parents often notice them later than they expect to.'
    ],
    nutrition: {
      focus: 'Iron with vitamin C',
      why: 'Your blood volume is climbing to keep the placenta supplied, and your baby is making red blood cells of their own — both run on iron, and the daily target is 27 mg. Vitamin C eaten in the same meal helps your body take up far more of the iron in plants and grains.',
      eat: [
        { idea: 'Beef and bell pepper stir-fry over rice', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Lentils simmered with tomatoes and finished with lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Iron-fortified oatmeal with sliced strawberries on top', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Spinach salad with orange segments and toasted seeds', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Chickpea and tomato stew with crusty bread', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Turkey chili with peppers and a spoonful of salsa', tags: ['dairy-free', 'nut-free'] }
      ],
      safety: 'Deli meats, hot dogs, and refrigerated smoked seafood are OK only when heated until steaming hot.'
    },
    todos: [
      { id: 'w15-knee-pillow', label: 'If your hips ache at night, try a pillow between your knees — it is the arrangement most people land on later, and there is nothing to worry about if you wake up on your back.' },
      { id: 'w15-maternity-basics', label: 'Try on a few maternity basics; two pairs of trousers that truly fit beat a closet of things that almost do.' }
    ]
  },

  {
    week: 16,
    baby: [
      "The muscles along your baby's back and neck are strong enough now to hold the head up straighter instead of tucked to the chest. The arms and legs move together in a more coordinated way too — less twitch, more stretch and kick.",
      'Behind the closed lids, the eyes have started making small side-to-side movements. The pattern the scalp hair will follow is set this week, even though there is little to see up there yet.',
      "Your baby's heart is moving a serious amount of blood every day, and the umbilical cord is thick and firmly anchored. Somewhere between now and week twenty-two, all this movement becomes strong enough for you to feel from the outside."
    ],
    body: [
      'Quickening — the first movements you can feel — often lands in this stretch. It is easy to miss, because it feels nothing like a kick: more like a bubble rising, popcorn going off, or a fish turning over low in your belly.',
      'If you have felt nothing yet, that is completely ordinary, especially with a first baby or when the placenta sits at the front of the uterus and muffles the taps. It arrives when it arrives, and once it does there is no mistaking it.',
      'You may notice a darker line running down the middle of your belly, or patches of deeper color across your face. That is pigment answering hormones, and it usually fades over the months after birth.'
    ],
    nutrition: {
      focus: 'Calcium',
      why: 'The skeleton that has been soft cartilage is hardening in earnest now, and your baby draws the calcium for it straight from you — the daily target is 1,000 mg, with vitamin D helping you actually use it. Keeping it topped up protects your own bones as much as it builds theirs.',
      eat: [
        { idea: 'A yogurt parfait with granola and berries', tags: ['vegetarian', 'halal', 'kosher'] },
        { idea: 'Calcium-set tofu with broccoli and sesame over rice', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Cheese and crackers with apple slices', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Canned salmon cakes with the soft bones mashed right in', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Fortified orange juice alongside breakfast', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Kale sautéed with garlic next to a bowl of white beans', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Keep caffeine to 200 mg a day or less — about one 12-oz coffee. Tea, chocolate, and soda count toward the total.'
    },
    todos: [
      { id: 'w16-note-the-first-flutter', label: 'Write down the day you first feel your baby move — it is one of the details people wish they had kept.' },
      { id: 'w16-seat-belt-check', label: 'Wear the lap belt low, under your bump, with the shoulder strap between your breasts.' }
    ]
  },

  {
    week: 17,
    baby: [
      "Fat begins forming under your baby's skin this week. It fills out the loose, see-through look they have had until now, and it is what will hold their warmth in once they are out in the world.",
      "The heartbeat has come under the brain's direction rather than beating on its own rhythm alone. Sweat glands are forming in the skin, and the umbilical cord is growing thicker and stronger to carry everything passing through it.",
      'Your baby practices sucking and swallowing in the amniotic fluid, and the skeleton keeps trading soft cartilage for bone. The joints are sturdy enough now that a kick has some genuine push behind it.'
    ],
    body: [
      'Your center of gravity is drifting forward, and your body is quietly renegotiating how to stand. Backache and a wider, slower walk both show up around here, and flat shoes plus standing tall help more than they have any right to.',
      'Vivid, strange dreams are very common in the middle of pregnancy, and so is waking at odd hours. Sleep runs lighter now, and there is nothing to read into the dreams themselves.',
      'Your appetite may be genuinely large this week. Eating when you are hungry is the right answer.'
    ],
    nutrition: {
      focus: 'DHA from low-mercury fish',
      why: "Your baby's brain has just taken charge of the heartbeat, and the nerve cells doing that work are built largely out of fat — DHA above all. Two or three servings a week of oily fish — salmon, sardines, herring, trout — covers the daily 200 to 300 mg; leaner picks like cod, tilapia and shrimp are lovely low-mercury protein but carry far less DHA. An algae-oil supplement covers it without any fish at all.",
      eat: [
        { idea: 'Roasted salmon with lemon and potatoes', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Trout baked with tomatoes, olives and a drizzle of oil', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Shrimp tacos with shredded cabbage and lime', tags: ['dairy-free', 'nut-free'] },
        { idea: 'A canned light tuna sandwich with plenty of crunch', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Chia pudding made with fortified soy milk — a plant omega-3 top-up', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Ground walnut and flaxseed over yogurt or oatmeal, as a plant omega-3 top-up', tags: ['vegetarian', 'halal', 'kosher'] }
      ],
      safety: 'Wash produce well, keep raw meat away from ready-to-eat food, and refrigerate leftovers within two hours.'
    },
    todos: [
      { id: 'w17-two-fish-nights', label: 'Pencil in two fish dinners a week from the low-mercury list — salmon, cod, shrimp, sardines.' },
      { id: 'w17-book-a-class', label: 'Look into childbirth classes now; the good ones fill months ahead.' }
    ]
  },

  {
    week: 18,
    baby: [
      'Your baby can hear this week. The small bones of the middle ear have hardened and the nerve endings from the brain have finished wiring in, so the whoosh of your blood, the rumble of your stomach and the low music of your voice all get through.',
      'Nerves are being wrapped in myelin, a fatty sheath that lets signals travel along them much faster. It is quiet, unglamorous work, and it carries on long past birth.',
      'Yawns, stretches and hiccups happen regularly now. If your baby is a girl, her uterus and fallopian tubes are formed and in place; if a boy, the genitals have grown enough to show up on a scan.'
    ],
    body: [
      'The anatomy scan window opens this week and stays open through week twenty-two. It is a long, careful appointment — the sonographer works through the brain, heart, spine, kidneys, limbs and placenta, and often goes quiet while concentrating. That silence is someone doing their job, not news.',
      'You will usually come away with pictures, and if you want to know the sex, this is the scan that can tell you. It is equally fine to say you would rather be surprised, or to have them write it down in an envelope for later.',
      'Feeling nervous beforehand is normal, and so is feeling nothing but excited. Most scans end with a reassuring report; if something needs a closer look, your provider will explain what it means and what comes next, and every question you have is worth asking out loud.'
    ],
    nutrition: {
      focus: 'Water',
      why: 'The amniotic fluid your baby now hears and swallows through is refreshed constantly, and your body makes it out of what you drink. Somewhere between eight and twelve cups of fluid a day covers it, and it takes the edge off the headaches and constipation of the middle months.',
      eat: [
        { idea: 'A glass of water with every meal, and one more whenever you brush your teeth', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A brothy vegetable soup in place of a heavy lunch', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Chilled gazpacho with a hunk of crusty bread', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Sparkling water with lime and a few frozen berries', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Crisp cucumber and radish with a pinch of salt', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Oranges and grapes washed and waiting in the fridge', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: "There's no known safe amount of alcohol in pregnancy — mocktails, sparkling water, and juice spritzers are all fair game."
    },
    todos: [
      { id: 'w18-anatomy-scan', label: 'Book your anatomy scan — the detailed ultrasound is done between weeks eighteen and twenty-two.' },
      { id: 'w18-decide-about-finding-out', label: 'Decide together whether you want to learn the sex, and tell the sonographer before they begin.' },
      { id: 'w18-talk-to-your-baby', label: 'Say hello out loud — your voice is one of the first sounds your baby can hear.' }
    ]
  },

  {
    week: 19,
    baby: [
      "A waxy white coating called vernix is spreading over your baby's skin. It waterproofs them through months of floating in fluid, and plenty of babies still wear streaks of it at birth.",
      'The brain is marking out specialized territory this week — separate regions for smell, taste, hearing, sight and touch. Each one is beginning to wire up to the part of the body it will spend a lifetime listening to.',
      'Hair is sprouting on the scalp, and the arms and legs have settled into proportion with the rest of the body. If your baby is a girl, her ovaries already hold the beginnings of every egg she will ever have.'
    ],
    body: [
      'Round ligament pain often peaks around now — a sharp tug low on one side when you sneeze, laugh, or get up too fast. It passes in seconds, and easing into standing rather than springing up helps.',
      'You may feel light-headed in the middle of the day. Blood pressure tends to run low in mid-pregnancy, so stand up in stages and keep something to drink within reach.',
      'Sleep gets more complicated from here. A pillow under the bump and another between your knees is worth more than any amount of advice about positions.'
    ],
    nutrition: {
      focus: 'Choline',
      why: "Your baby's brain is mapping out the areas that will handle each of the senses, and choline supports that wiring along with the memory circuits still being laid down. The daily target is 450 mg, plenty of prenatal vitamins are light on it, and egg yolks are the easiest fix there is.",
      eat: [
        { idea: 'Two hard-boiled eggs, salted, cold from the fridge', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Egg salad on rye with plenty of black pepper, made at home with fully cooked eggs', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Edamame or roasted soybeans as an afternoon snack', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A chicken and quinoa bowl with roasted vegetables', tags: ['dairy-free', 'nut-free'] },
        { idea: 'A potato and cheese frittata, cooked all the way through', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roasted cauliflower with olive oil and lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, and orange roughy. Salmon, sardines, shrimp, cod, and canned light tuna are great picks.'
    },
    todos: [
      { id: 'w19-babymoon', label: 'If a trip appeals, aim for the next month or two — travel is at its most comfortable right now.' },
      { id: 'w19-name-list', label: 'Start a shared list of names; half the fun is seeing which ones survive the week.' }
    ]
  },

  {
    week: 20,
    baby: [
      'Halfway. From this week on, your baby is measured from head to heel instead of head to bottom, so the length on the Size tab takes a sudden jump — nobody doubled overnight, the tape measure just got a pair of long legs to follow.',
      'Taste buds are working, and your baby swallows amniotic fluid all day long, which carries a faint hint of whatever you have been eating. Their bowel is quietly collecting meconium, the dark first stool that mostly waits until after birth.',
      'Sleep and waking are settling into a real pattern, though rarely one that matches yours. As the movements get stronger you may start to recognize the busy hours and the quiet ones.'
    ],
    body: [
      'Your uterus has reached roughly the level of your belly button, which is the landmark your provider measures from at visits from here on. The movements feel firmer too — less bubble, more nudge.',
      'Heartburn, indigestion and a little breathlessness on the stairs turn up around now as everything inside gets more crowded. Smaller meals eaten more often tend to help more than cutting out any particular food.',
      'Halfway is a strange and lovely place to be standing. It is worth marking somehow, even quietly.'
    ],
    nutrition: {
      focus: 'Iron, round two',
      why: 'You are on the steepest part of the climb in blood volume, and iron is the nutrient most likely to run short over the second half of pregnancy. Coffee and tea alongside a meal cut down how much of it you absorb, so save them for between meals and put something citrus on the plate instead.',
      eat: [
        { idea: 'Beef chili with tomatoes, peppers and beans', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Fortified breakfast cereal with a glass of orange juice', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Black bean tacos with salsa and lime', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Steak strips with roasted red peppers', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Dried apricots and pumpkin seeds tucked in your bag', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Spinach and chickpea curry with tomatoes', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Pass on raw or undercooked meat, poultry, eggs, and sprouts — and sneak-tasting raw cookie dough counts too.'
    },
    todos: [
      { id: 'w20-halfway-note', label: 'Write your baby a short note at the halfway mark and tuck it away for them.' },
      { id: 'w20-registry-start', label: 'Start a registry list, even a rough one — it is far easier now than in a hurry later.' }
    ]
  }
];
