/**
 * Weekly content — weeks 4–12 (the heart of the first trimester).
 *
 * One `WeekText` per week. Milestones follow MASTER_PROMPT.md Appendix A
 * anchors (neural tube closes ~w6 · cardiac activity visible ~w6–7 · all major
 * organs forming w4–10 · first visit w8–10 · NIPT from w10 · NT scan w11–13).
 * `nutrition.safety` is exactly `SAFETY[(week - 4) % 7]` from docs/PLAN.md.
 * No length or weight numbers appear in the prose — the UI renders those from
 * SIZE_TABLE.
 */

/** @typedef {import('../../lib/types.js').WeekText} WeekText */

/**
 * Authored content for weeks 4 through 12.
 * @type {WeekText[]}
 */
export const weeks04to12 = [
  {
    week: 4,
    baby: [
      "This is the week the tiny ball of cells that will become your baby settles into the lining of your uterus. It’s called implantation, and it’s the reason a home test can finally show two lines — the new embryo starts making a hormone that the test picks up.",
      'Your baby is now an embryo built from three thin layers, and each layer has its own job. One becomes the brain, spine, nerves and skin; the middle one becomes the heart, bones and muscles; the innermost becomes the lungs, gut and bladder. Everything that follows grows out of these three.',
      'Two support systems are going up alongside your baby: the amniotic sac that will cushion them, and the first cells of the placenta, which will handle food and oxygen for the months ahead. None of this is visible from the outside, and all of it is some of the busiest work of the whole pregnancy.'
    ],
    body: [
      "You may have just seen a positive test, or you may still be waiting on a late period. Plenty of women feel nothing at all this week, and plenty feel a lot — tender breasts, a heavy kind of tired that naps don’t fix, or mild cramping that feels like your period is on its way.",
      'A little spotting around now is common as the embryo settles in. If bleeding gets heavier than spotting or comes with pain, call your provider — that call is exactly what they are there for.',
      "It’s normal for the news to feel unreal, and for excitement and nerves to show up in the same hour. You don’t have to feel any particular way about it yet."
    ],
    nutrition: {
      focus: 'Folate',
      why: "Your baby’s neural tube — the very beginning of the brain and spinal cord — starts forming in the next couple of weeks, and folate is the nutrient that helps it close cleanly. The daily goal is 600 mcg DFE, and a prenatal vitamin does most of that lifting for you.",
      eat: [
        { idea: 'Lentil soup with a squeeze of lemon and a slice of buttered toast', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Spinach and white bean salad with olive oil and lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Fortified breakfast cereal with milk and sliced strawberries', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Avocado on whole-grain toast with a firmly cooked egg on top', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A smoothie with pasteurized orange juice, frozen mango and a handful of baby spinach', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roasted asparagus alongside rice and black beans', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: "There’s no known safe amount of alcohol in pregnancy — mocktails, sparkling water, and juice spritzers are all fair game."
    },
    todos: [
      { id: 'w4-prenatal-vitamin', label: 'Start a daily prenatal vitamin with folate — pick a time of day you will actually remember.' },
      { id: 'w4-choose-a-provider', label: "Start thinking about who you’d like caring for you: an OB, a midwife, or the practice a friend loves." }
    ]
  },

  {
    week: 5,
    baby: [
      "The neural tube is forming this week. It begins as a flat groove running down your baby’s back, and over a few days the edges fold up and zip together into the tube that becomes the brain and spinal cord.",
      'The heart starts out as a simple tube as well. Around now it begins to pulse — not a four-chambered heartbeat yet, just the first steady flicker of muscle deciding to move.',
      "Along either side of the neural tube, small blocks of tissue are stacking up like beads on a string. They’ll become your baby’s vertebrae, ribs, and the muscles of the back."
    ],
    body: [
      'The hormone that made your test positive is climbing fast right now, and it takes a lot of energy with it. A bone-deep tiredness in the late afternoon is one of the most common early signs there is.',
      'You might notice your breasts feel full or sore, that you are up in the night for the bathroom, or that your sense of smell has turned into a superpower. Smells that used to pass you by can suddenly turn your stomach.',
      'Feelings can swing wide this week, sometimes within the same conversation. Hormones are doing a great deal of work behind the scenes, and it is fair to be tired and thrilled and uneasy all at once.'
    ],
    nutrition: {
      focus: 'Your prenatal vitamin',
      why: 'The neural tube is folding shut over the next couple of weeks, and a prenatal vitamin quietly covers folate, iron and vitamin D on the days when eating well is out of reach. If it makes you queasy, taking it with food or right before bed often settles it.',
      eat: [
        { idea: 'Overnight oats with milk, chia seeds and berries', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Whole-grain toast with peanut butter and banana slices', tags: ['vegetarian', 'vegan', 'dairy-free', 'halal', 'kosher'] },
        { idea: 'A quesadilla made with pasteurized cheese, with salsa on the side', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A hard-boiled egg and a clementine for a mid-morning bite', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Rice with black beans, corn and avocado', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, and orange roughy. Salmon, sardines, shrimp, cod, and canned light tuna are great picks.'
    },
    todos: [
      { id: 'w5-book-first-visit', label: 'Call and get on the schedule — most practices see you for the first prenatal visit between weeks eight and ten.' },
      { id: 'w5-questions-note', label: "Start a running note on your phone for questions as they occur to you; they vanish the moment you’re in the room." }
    ]
  },

  {
    week: 6,
    baby: [
      'The neural tube finishes closing this week — both ends seal shut, and the brain and spinal cord are officially under construction. It is one of the biggest milestones of the entire first trimester, and it happens completely quietly.',
      'The heart now has a chamber on each side and beats quickly, often quickly enough to be seen on an early ultrasound around now or next week. If you have a scan, that small flicker on the screen is what everyone leans in for.',
      'Your baby is curled in a C shape with a tail-like tip at the bottom that will shrink away over the coming weeks. Little buds are pushing out where the arms and legs will be, dark spots mark the eyes, and shallow dimples show where the ears are headed.'
    ],
    body: [
      'Nausea often arrives around now, and “morning sickness” is a misleading name — it can show up at any hour or simply hang around all day. Many women find an empty stomach makes it worse, so a few crackers before you sit up in the morning can take the edge off.',
      'Bloating, sore breasts and a very short fuse are all common right now. You may not look pregnant at all yet, which can feel strange when you feel this different on the inside.'
    ],
    nutrition: {
      focus: 'Choline',
      why: "The neural tube seals this week, and choline works right alongside folate in building your baby’s brain and spinal cord. The daily target is 450 mg, and eggs are the easiest route there — a couple of eggs gets you a good way along.",
      eat: [
        { idea: 'Two scrambled eggs with melted cheese on toast', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Egg salad on crackers, made with fully cooked eggs', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A baked potato topped with cottage cheese and chives', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roasted salmon with potatoes and green beans', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Edamame with sea salt while dinner cooks', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A quinoa bowl with roasted broccoli and a firmly cooked egg', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Pass on raw or undercooked meat, poultry, eggs, and sprouts — and sneak-tasting raw cookie dough counts too.'
    },
    todos: [
      { id: 'w6-nausea-snacks', label: 'Stash crackers or dry cereal on the nightstand for before you stand up in the morning.' },
      { id: 'w6-review-medicines', label: 'Ask your provider about any medicines, supplements or herbal teas you take regularly.' }
    ]
  },

  {
    week: 7,
    baby: [
      "Your baby’s brain is growing faster than any other part right now, dividing into the regions that will handle movement, the senses and thinking. The head is large compared with the rest of the body, and will stay that way for a while yet.",
      'The arm buds have stretched into little paddles with the beginnings of hands at the ends. Kidneys are forming, the liver has started making blood cells, and the umbilical cord is now a working line between your baby and the growing placenta.',
      'The face is beginning to look like a face: nostrils appear, the lenses of the eyes take shape, and the jaw forms underneath. Cardiac activity is usually visible on ultrasound by around this week.'
    ],
    body: [
      'Thirst and bathroom trips both climb around now. Your blood volume is expanding to supply the placenta and your kidneys are working harder, so sipping steadily through the day tends to sit better than gulping a lot at once.',
      'Some women get a sudden flood of extra saliva this week — odd, harmless and genuinely irritating. Sour candy, mint gum or a cold drink can help move it along.'
    ],
    nutrition: {
      focus: 'Water',
      why: 'Your blood volume is expanding this week to feed the new placenta, and running low on fluid tends to make early headaches and queasiness worse. Aim for roughly eight to twelve cups across the day, and remember that soup, milk and fruit all count.',
      eat: [
        { idea: 'A tall glass of ice water with lemon or cucumber slices', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Cold watermelon or cantaloupe cubes straight from the fridge', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Cucumber and cherry tomato salad with pasteurized feta', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A mug of broth-based chicken and rice soup', tags: ['dairy-free', 'nut-free'] },
        { idea: 'A yogurt smoothie with frozen berries', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Decaf iced tea with a splash of pasteurized juice', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Choose pasteurized dairy and juice. Soft cheeses like brie, feta, and queso fresco are fine only if the label says pasteurized.'
    },
    todos: [
      { id: 'w7-water-bottle', label: 'Park a water bottle wherever you sit most — refilling it beats remembering to drink.' },
      { id: 'w7-safe-foods-list', label: 'Write down the handful of foods that still sound good, and keep those stocked.' }
    ]
  },

  {
    week: 8,
    baby: [
      'Fingers and toes are showing up as ridges on the paddle-shaped hands and feet, still lightly webbed at this stage. Elbows and knees have appeared, and the little tail from a few weeks ago has nearly disappeared.',
      'Every essential organ has now begun — heart, brain, lungs, kidneys, liver and gut. They are far from finished, but the plans are drawn, and that is exactly why the food-safety basics matter most during these particular weeks.',
      'Your baby has started to move. It is small, jerky and completely involuntary, and it will be a couple of months before any of it reaches you.'
    ],
    body: [
      'For many women, weeks eight through ten are the roughest stretch of nausea and fatigue. If that is where you are, you are right on schedule, and for most people it eases as the second trimester comes in.',
      'Your waistband may already feel tight, though this early it is bloating more than bump. Headaches are common too, usually traced back to hormones, hunger or not quite enough fluid.',
      'If you cannot keep fluids down, or food is not staying put at all, tell your provider rather than toughing it out. There is real help for severe pregnancy sickness, and asking early makes it easier to treat.'
    ],
    nutrition: {
      focus: 'Small, frequent meals',
      why: 'Every major organ is under construction this week, so getting something in beats holding out for a proper meal. An empty stomach usually makes nausea worse, so try a small bite every couple of hours rather than three big plates.',
      eat: [
        { idea: 'Crackers with a little cheese, before you get out of bed', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Plain toast or a bagel with jam', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Cold applesauce or a frozen fruit pop', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Ginger tea or ginger chews between meals', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Pretzels dipped in hummus', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A small cup of chicken noodle soup', tags: ['dairy-free', 'nut-free'] }
      ],
      safety: 'Deli meats, hot dogs, and refrigerated smoked seafood are OK only when heated until steaming hot.'
    },
    todos: [
      { id: 'w8-first-visit', label: 'Go to your first prenatal visit — this one usually lands between weeks eight and ten.' },
      { id: 'w8-family-history', label: "Jot down what you know of both families' health history; they will ask about it." },
      { id: 'w8-snacks-everywhere', label: 'Tuck crackers into your bag, your car and your desk drawer.' }
    ]
  },

  {
    week: 9,
    baby: [
      'Arms are long enough now to bend at the elbows, and the toes are separating on each foot. Tiny muscles have wired up to the nerves, so your baby twitches and shifts almost constantly, still far too small for you to feel.',
      'The heart has finished dividing into four chambers with valves between them, and it settles into a fast, regular rhythm. The skeleton is still soft cartilage, but the first hard specks of bone are beginning to appear inside it.',
      'External genitals have formed, though they look much the same for everyone at this stage. A scan cannot tell you whether you are having a girl or a boy for a couple of months yet.'
    ],
    body: [
      'Your clothes tend to notice the change before anyone else does. Breasts often grow a size or more in the first trimester and can feel heavy or achy, so a soft wire-free bra in the next size up is a small kindness to yourself.',
      'Standing up quickly may leave you light-headed as your blood vessels relax to make room for more blood. Getting up in stages, and keeping a snack within reach, both help more than you would expect.'
    ],
    nutrition: {
      focus: 'Vitamin D',
      why: "Bone is starting to harden inside your baby’s cartilage skeleton this week, and vitamin D is what lets your body actually use calcium to do it. The daily target is 600 IU, and most prenatal vitamins include a share of it.",
      eat: [
        { idea: 'Canned salmon mashed onto crackers with lemon', tags: ['dairy-free', 'nut-free'] },
        { idea: 'A glass of fortified milk, dairy or soy', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Two eggs, any fully cooked way you like them', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Fortified yogurt with granola on top', tags: ['vegetarian', 'halal', 'kosher'] },
        { idea: 'Sardines on toast with a squeeze of lemon', tags: ['dairy-free', 'nut-free'] },
        { idea: 'UV-exposed mushrooms — the label will say so — sautéed and folded through rice', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Keep caffeine to 200 mg a day or less — about one 12-oz coffee. Tea, chocolate, and soda count toward the total.'
    },
    todos: [
      { id: 'w9-caffeine-tally', label: 'Add up a normal day of coffee, tea and soda — most people are surprised where the total lands.' },
      { id: 'w9-comfortable-bra', label: 'Get fitted for a soft, supportive bra in the next size up.' }
    ]
  },

  {
    week: 10,
    baby: [
      'This is the week the embryo stage ends: from here on your baby is called a fetus. All the major organs are built and starting to rehearse their jobs — the kidneys make small amounts of urine, the liver makes blood cells, and the stomach produces digestive juice.',
      'The webbing between the fingers and toes has gone, and nails are beginning at the tips. Tooth buds are forming in the jaw, tucked under gums that will not see them for a year or more.',
      'The joints all work now. Knees and ankles bend, wrists flex, and your baby somersaults and kicks around with plenty of room to spare.'
    ],
    body: [
      "You may hear your baby’s heartbeat for the first time around now, through a handheld doppler at a prenatal visit. It is quick — much quicker than yours — and it tends to be a sound people remember for a long time.",
      'You might feel occasional pulls low on one side or the other as the ligaments holding your uterus begin to stretch. Nausea starts easing this week for some women, while for others it takes a few weeks more, and both are ordinary.'
    ],
    nutrition: {
      focus: 'Easy-does-it foods',
      why: "Your baby’s organs are all in place now and mainly growing, so this is not the week to force a perfectly balanced plate — steady calories in, in whatever form they will stay down, is the win. Cold, dry and bland foods tend to be gentlest when smells are the trigger.",
      eat: [
        { idea: 'Cold pasta salad with peas and olive oil', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'A slow-sipped smoothie of banana, yogurt and ice', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Rice with a little soy sauce and a firmly cooked egg', tags: ['vegetarian', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Cucumber sandwiches on soft bread, straight from the fridge', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Mashed potatoes with a spoonful of butter', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Chilled melon with a pinch of salt', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Wash produce well, keep raw meat away from ready-to-eat food, and refrigerate leftovers within two hours.'
    },
    todos: [
      { id: 'w10-nipt', label: 'Ask about NIPT — the blood screen for common chromosome differences, available from week ten.' },
      { id: 'w10-check-lab-coverage', label: 'Check with your insurance about coverage for screening blood work before it is drawn.' },
      { id: 'w10-record-the-heartbeat', label: 'If you hear the heartbeat at a visit, record a few seconds of it on your phone.' }
    ]
  },

  {
    week: 11,
    baby: [
      'Growth speeds up sharply from here — your baby roughly doubles in length over the next few weeks. The head is still large compared with the body, and the rest of the body now starts catching up in a hurry.',
      'Hands open and close into fists, and the ridges that become fingerprints are forming on the pads of the fingers. The nasal passages open up and the diaphragm is developing, so your baby may already hiccup, long before you can feel it.',
      'Bone is replacing cartilage in earnest, and tooth buds are settling into the jaw. If you have the nuchal translucency scan this week or in the next couple, you will see a wriggling, recognizably human profile on the screen.'
    ],
    body: [
      'Some women feel the first real lift in energy this week, and others need a few weeks more. Both are perfectly ordinary, and neither one says anything about how the pregnancy is going.',
      'Hair and nails often grow faster and thicker thanks to hormones. A stuffy nose that will not quit is common too — pregnancy swells the lining of your nose, and it is not a cold you need to wait out.',
      'Appetite tends to come back before nausea has fully left, which is a strange combination to live with. When a hungry window opens, eat.'
    ],
    nutrition: {
      focus: 'Calcium',
      why: 'Cartilage is turning into real bone this week, and your baby draws the calcium for it straight from you — the daily target is 1,000 mg. If you eat little dairy, fortified plant milks, calcium-set tofu and canned fish with the soft bones all count toward it.',
      eat: [
        { idea: 'Greek yogurt with honey and berries', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Calcium-set tofu stir-fried with broccoli', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Fortified soy or oat milk over your morning cereal', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Canned sardines or salmon on toast, soft bones and all', tags: ['dairy-free', 'nut-free'] },
        { idea: 'Grilled cheese with a bowl of tomato soup', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Steamed kale with sesame seeds over rice', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: "There’s no known safe amount of alcohol in pregnancy — mocktails, sparkling water, and juice spritzers are all fair game."
    },
    todos: [
      { id: 'w11-nt-scan', label: 'Schedule the nuchal translucency scan — the window for it runs from week eleven to week thirteen.' },
      { id: 'w11-bring-someone', label: 'Invite whoever you want beside you to the scan; there is usually a screen they can watch too.' },
      { id: 'w11-comfier-waistband', label: 'Try a belly band or the next size up in jeans — comfort beats buttoning.' }
    ]
  },

  {
    week: 12,
    baby: [
      'Reflexes arrive this week. Fingers curl, toes flex, and the mouth makes sucking motions, so a press on your belly can make your baby squirm away — though it will be weeks before you feel the answer.',
      'The intestines, which have been growing inside the umbilical cord, move into the abdomen where they belong. The kidneys send urine out into the amniotic fluid, and bone marrow has started producing white blood cells.',
      'The face is close to finished: the eyes have traveled from the sides of the head to the front, and the ears have settled into place. Almost everything from here is growth and practice rather than new construction.'
    ],
    body: [
      'Your uterus is rising up out of your pelvis this week. That is why some women notice the first genuine hint of a bump, and why the constant need to pee often lets up for a while.',
      'The end of the first trimester is in sight, and with it, for most women, the worst of the nausea and fatigue. This is also when many families start telling people, though there is no rule about when — it is your news to share on your own schedule.',
      'A lot of people find the twelve-week mark quietly sets something down that they have been carrying. However you have been holding these weeks, be gentle with yourself.'
    ],
    nutrition: {
      focus: 'Folate',
      why: 'Folate keeps earning its place well after the neural tube closes — it powers the fast cell division behind this growth spurt and helps make red blood cells for your rising blood volume. Keep the prenatal going and let greens, beans and citrus carry the rest of the 600 mcg DFE.',
      eat: [
        { idea: 'Black bean and rice bowl with lime and cilantro', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Spinach and pasteurized feta omelet, cooked all the way through', tags: ['vegetarian', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Orange segments or half a grapefruit with breakfast', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Roasted brussels sprouts with olive oil and lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Chickpea and parsley salad with plenty of lemon', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] },
        { idea: 'Avocado on fortified whole-grain toast', tags: ['vegetarian', 'vegan', 'dairy-free', 'nut-free', 'halal', 'kosher'] }
      ],
      safety: 'Skip high-mercury fish: shark, swordfish, king mackerel, tilefish, bigeye tuna, marlin, and orange roughy. Salmon, sardines, shrimp, cod, and canned light tuna are great picks.'
    },
    todos: [
      { id: 'w12-plan-your-news', label: "Decide who you’d like to tell, and how — there is no deadline on this one." },
      { id: 'w12-book-next-visit', label: 'Book your next prenatal visit; monthly check-ins are the usual rhythm until about week twenty-eight.' }
    ]
  }
];
