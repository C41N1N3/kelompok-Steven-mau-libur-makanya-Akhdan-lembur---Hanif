-- 1. Insert Lessons
insert into public.lessons (slug, title, description, order_index, level)
values
  ('greek-basics-1', 'Greek Basics 1', 'Start with everyday Greek words and greetings.', 1, 'beginner'),
  ('at-the-cafe', 'At The Café', 'Order food and drinks politely in a Greek café.', 2, 'beginner'),
  ('city-directions', 'City Directions', 'Ask for directions and recognize common places around town.', 3, 'beginner'),
  ('family-introductions', 'Family Introductions', 'Introduce yourself and talk about family members.', 4, 'beginner'),
  ('market-shopping', 'Market Shopping', 'Practice prices, quantities, and simple market phrases.', 5, 'beginner')
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  order_index = excluded.order_index,
  level = excluded.level;

-- 2. Insert Lesson Items
with lessons as (
  select id, slug from public.lessons
),
seed_items (slug, kind, prompt, greek, options, answer, scenario_goals, order_index) as (
  values
    -- Lesson 1: greek-basics-1
    ('greek-basics-1', 'vocabulary', 'Which word means "book"?', 'το βιβλίο', '["το τετράδιο","το βιβλίο","το μολύβι","το τραπέζι"]'::jsonb, 'το βιβλίο', '[]'::jsonb, 1),
    ('greek-basics-1', 'vocabulary', 'Which word means "hello"?', 'γεια σας', '["ευχαριστώ","γεια σας","νερό","σπίτι"]'::jsonb, 'γεια σας', '[]'::jsonb, 2),
    ('greek-basics-1', 'vocabulary', 'Which word means "please"?', 'παρακαλώ', '["παρακαλώ","καφές","μήλο","δρόμος"]'::jsonb, 'παρακαλώ', '[]'::jsonb, 3),
    ('greek-basics-1', 'vocabulary', 'Which word means "thank you"?', 'ευχαριστώ', '["ναι","όχι","ευχαριστώ","καληνύχτα"]'::jsonb, 'ευχαριστώ', '[]'::jsonb, 4),
    ('greek-basics-1', 'vocabulary', 'Which word means "yes"?', 'ναι', '["όχι","ναι","πού","τι"]'::jsonb, 'ναι', '[]'::jsonb, 5),

    ('greek-basics-1', 'listening', 'Listen and choose the translation.', 'καλημέρα', '["Good morning","Thank you","How are you?","Please"]'::jsonb, 'Good morning', '[]'::jsonb, 1),
    ('greek-basics-1', 'listening', 'Listen and choose the greeting.', 'γεια σας', '["Hello","Good night","Sorry","Water"]'::jsonb, 'Hello', '[]'::jsonb, 2),
    ('greek-basics-1', 'listening', 'Listen and choose the polite word.', 'παρακαλώ', '["Please","No","Street","Coffee"]'::jsonb, 'Please', '[]'::jsonb, 3),
    ('greek-basics-1', 'listening', 'Listen and choose the response.', 'ευχαριστώ', '["Thank you","Goodbye","Book","Family"]'::jsonb, 'Thank you', '[]'::jsonb, 4),
    ('greek-basics-1', 'listening', 'Listen and choose the answer.', 'ναι', '["Yes","No","Where","What"]'::jsonb, 'Yes', '[]'::jsonb, 5),

    ('greek-basics-1', 'speaking', 'Say "Good morning" in Greek.', 'καλημέρα', '[]'::jsonb, 'καλημέρα', '[]'::jsonb, 1),
    ('greek-basics-1', 'speaking', 'Say "Hello" politely in Greek.', 'γεια σας', '[]'::jsonb, 'γεια σας', '[]'::jsonb, 2),
    ('greek-basics-1', 'speaking', 'Say "Please" in Greek.', 'παρακαλώ', '[]'::jsonb, 'παρακαλώ', '[]'::jsonb, 3),
    ('greek-basics-1', 'speaking', 'Say "Thank you" in Greek.', 'ευχαριστώ', '[]'::jsonb, 'ευχαριστώ', '[]'::jsonb, 4),
    ('greek-basics-1', 'speaking', 'Say "Yes" in Greek.', 'ναι', '[]'::jsonb, 'ναι', '[]'::jsonb, 5),

    ('greek-basics-1', 'writing', 'Write the Greek letter alpha.', 'α', '[]'::jsonb, 'α', '[]'::jsonb, 1),
    ('greek-basics-1', 'writing', 'Write the Greek letter beta.', 'β', '[]'::jsonb, 'β', '[]'::jsonb, 2),
    ('greek-basics-1', 'writing', 'Write the Greek word for hello.', 'γεια', '[]'::jsonb, 'γεια', '[]'::jsonb, 3),
    ('greek-basics-1', 'writing', 'Write the Greek word for yes.', 'ναι', '[]'::jsonb, 'ναι', '[]'::jsonb, 4),
    ('greek-basics-1', 'writing', 'Write the Greek word for please.', 'παρακαλώ', '[]'::jsonb, 'παρακαλώ', '[]'::jsonb, 5),

    ('greek-basics-1', 'conversation', 'Greet the waiter at a cafe.', null, '[]'::jsonb, null, '["greet politely","ask for water","say thank you"]'::jsonb, 1),

    -- Lesson 2: at-the-cafe
    ('at-the-cafe', 'vocabulary', 'Which word means "water"?', 'νερό', '["ψωμί","νερό","καφές","τσάι"]'::jsonb, 'νερό', '[]'::jsonb, 1),
    ('at-the-cafe', 'vocabulary', 'Which word means "coffee"?', 'καφές', '["καφές","γάλα","χυμός","ζάχαρη"]'::jsonb, 'καφές', '[]'::jsonb, 2),
    ('at-the-cafe', 'vocabulary', 'Which word means "tea"?', 'τσάι', '["νερό","τσάι","ψωμί","τιμή"]'::jsonb, 'τσάι', '[]'::jsonb, 3),
    ('at-the-cafe', 'vocabulary', 'Which word means "bread"?', 'ψωμί', '["μήλο","ψωμί","καφές","γάλα"]'::jsonb, 'ψωμί', '[]'::jsonb, 4),
    ('at-the-cafe', 'vocabulary', 'Which word means "milk"?', 'γάλα', '["τσάι","νερό","γάλα","καφές"]'::jsonb, 'γάλα', '[]'::jsonb, 5),

    ('at-the-cafe', 'listening', 'Listen and choose the drink.', 'καφές', '["Coffee","Bread","Milk","Juice"]'::jsonb, 'Coffee', '[]'::jsonb, 1),
    ('at-the-cafe', 'listening', 'Listen and choose the item.', 'νερό', '["Water","Tea","Sugar","Apple"]'::jsonb, 'Water', '[]'::jsonb, 2),
    ('at-the-cafe', 'listening', 'Listen and choose the drink.', 'τσάι', '["Tea","Coffee","Bread","Price"]'::jsonb, 'Tea', '[]'::jsonb, 3),
    ('at-the-cafe', 'listening', 'Listen and choose the food.', 'ψωμί', '["Bread","Milk","Juice","Street"]'::jsonb, 'Bread', '[]'::jsonb, 4),
    ('at-the-cafe', 'listening', 'Listen and choose the drink.', 'γάλα', '["Milk","Water","Tea","Book"]'::jsonb, 'Milk', '[]'::jsonb, 5),

    ('at-the-cafe', 'speaking', 'Say "A coffee, please" in Greek.', 'Έναν καφέ, παρακαλώ.', '[]'::jsonb, 'Έναν καφέ, παρακαλώ.', '[]'::jsonb, 1),
    ('at-the-cafe', 'speaking', 'Say "Water, please" in Greek.', 'Νερό, παρακαλώ.', '[]'::jsonb, 'Νερό, παρακαλώ.', '[]'::jsonb, 2),
    ('at-the-cafe', 'speaking', 'Say "A tea, please" in Greek.', 'Ένα τσάι, παρακαλώ.', '[]'::jsonb, 'Ένα τσάι, παρακαλώ.', '[]'::jsonb, 3),
    ('at-the-cafe', 'speaking', 'Say "Thank you very much" in Greek.', 'Ευχαριστώ πολύ.', '[]'::jsonb, 'Ευχαριστώ πολύ.', '[]'::jsonb, 4),
    ('at-the-cafe', 'speaking', 'Say "The bill, please" in Greek.', 'Τον λογαριασμό, παρακαλώ.', '[]'::jsonb, 'Τον λογαριασμό, παρακαλώ.', '[]'::jsonb, 5),

    ('at-the-cafe', 'writing', 'Write the Greek word for coffee.', 'καφές', '[]'::jsonb, 'καφές', '[]'::jsonb, 1),
    ('at-the-cafe', 'writing', 'Write the Greek word for water.', 'νερό', '[]'::jsonb, 'νερό', '[]'::jsonb, 2),
    ('at-the-cafe', 'writing', 'Write the Greek word for tea.', 'τσάι', '[]'::jsonb, 'τσάι', '[]'::jsonb, 3),
    ('at-the-cafe', 'writing', 'Write the Greek word for bread.', 'ψωμί', '[]'::jsonb, 'ψωμί', '[]'::jsonb, 4),
    ('at-the-cafe', 'writing', 'Write the Greek word for milk.', 'γάλα', '[]'::jsonb, 'γάλα', '[]'::jsonb, 5),

    ('at-the-cafe', 'conversation', 'Order a drink at a Greek café.', null, '[]'::jsonb, null, '["greet politely","order a drink","say thank you"]'::jsonb, 1),

    -- Lesson 3: city-directions
    ('city-directions', 'vocabulary', 'Which word means "street"?', 'δρόμος', '["δρόμος","σπίτι","νερό","βιβλίο"]'::jsonb, 'δρόμος', '[]'::jsonb, 1),
    ('city-directions', 'vocabulary', 'Which word means "square"?', 'πλατεία', '["αγορά","πλατεία","σχολείο","καφές"]'::jsonb, 'πλατεία', '[]'::jsonb, 2),
    ('city-directions', 'vocabulary', 'Which word means "left"?', 'αριστερά', '["δεξιά","αριστερά","ευθεία","πίσω"]'::jsonb, 'αριστερά', '[]'::jsonb, 3),
    ('city-directions', 'vocabulary', 'Which word means "right"?', 'δεξιά', '["δεξιά","πού","δρόμος","τιμή"]'::jsonb, 'δεξιά', '[]'::jsonb, 4),
    ('city-directions', 'vocabulary', 'Which word means "school"?', 'σχολείο', '["σπίτι","σχολείο","πλατεία","αγορά"]'::jsonb, 'σχολείο', '[]'::jsonb, 5),

    ('city-directions', 'listening', 'Listen and choose the place.', 'πλατεία', '["Square","Cafe","School","Market"]'::jsonb, 'Square', '[]'::jsonb, 1),
    ('city-directions', 'listening', 'Listen and choose the direction.', 'αριστερά', '["Left","Right","Straight","Back"]'::jsonb, 'Left', '[]'::jsonb, 2),
    ('city-directions', 'listening', 'Listen and choose the direction.', 'δεξιά', '["Right","Left","Near","Far"]'::jsonb, 'Right', '[]'::jsonb, 3),
    ('city-directions', 'listening', 'Listen and choose the place.', 'σχολείο', '["School","Street","Water","Book"]'::jsonb, 'School', '[]'::jsonb, 4),
    ('city-directions', 'listening', 'Listen and choose the word.', 'δρόμος', '["Street","Square","House","Family"]'::jsonb, 'Street', '[]'::jsonb, 5),

    ('city-directions', 'speaking', 'Say "Where is the square?" in Greek.', 'Πού είναι η πλατεία;', '[]'::jsonb, 'Πού είναι η πλατεία;', '[]'::jsonb, 1),
    ('city-directions', 'speaking', 'Say "Go left" in Greek.', 'Πηγαίνετε αριστερά.', '[]'::jsonb, 'Πηγαίνετε αριστερά.', '[]'::jsonb, 2),
    ('city-directions', 'speaking', 'Say "Go right" in Greek.', 'Πηγαίνετε δεξιά.', '[]'::jsonb, 'Πηγαίνετε δεξιά.', '[]'::jsonb, 3),
    ('city-directions', 'speaking', 'Say "Is it near?" in Greek.', 'Είναι κοντά;', '[]'::jsonb, 'Είναι κοντά;', '[]'::jsonb, 4),
    ('city-directions', 'speaking', 'Say "Thank you for the help" in Greek.', 'Ευχαριστώ για τη βοήθεια.', '[]'::jsonb, 'Ευχαριστώ για τη βοήθεια.', '[]'::jsonb, 5),

    ('city-directions', 'writing', 'Write the Greek word for square.', 'πλατεία', '[]'::jsonb, 'πλατεία', '[]'::jsonb, 1),
    ('city-directions', 'writing', 'Write the Greek word for street.', 'δρόμος', '[]'::jsonb, 'δρόμος', '[]'::jsonb, 2),
    ('city-directions', 'writing', 'Write the Greek word for left.', 'αριστερά', '[]'::jsonb, 'αριστερά', '[]'::jsonb, 3),
    ('city-directions', 'writing', 'Write the Greek word for right.', 'δεξιά', '[]'::jsonb, 'δεξιά', '[]'::jsonb, 4),
    ('city-directions', 'writing', 'Write the Greek word for school.', 'σχολείο', '[]'::jsonb, 'σχολείο', '[]'::jsonb, 5),

    ('city-directions', 'conversation', 'Ask someone for directions to the square.', null, '[]'::jsonb, null, '["ask politely","name the place","thank the person"]'::jsonb, 1),

    -- Lesson 4: family-introductions
    ('family-introductions', 'vocabulary', 'Which word means "mother"?', 'μητέρα', '["πατέρας","μητέρα","αδελφός","φίλος"]'::jsonb, 'μητέρα', '[]'::jsonb, 1),
    ('family-introductions', 'vocabulary', 'Which word means "father"?', 'πατέρας', '["πατέρας","μητέρα","παιδί","φίλη"]'::jsonb, 'πατέρας', '[]'::jsonb, 2),
    ('family-introductions', 'vocabulary', 'Which word means "sister"?', 'αδελφή', '["αδελφός","αδελφή","μητέρα","οικογένεια"]'::jsonb, 'αδελφή', '[]'::jsonb, 3),
    ('family-introductions', 'vocabulary', 'Which word means "brother"?', 'αδελφός', '["αδελφός","φίλος","παιδί","πατέρας"]'::jsonb, 'αδελφός', '[]'::jsonb, 4),
    ('family-introductions', 'vocabulary', 'Which word means "family"?', 'οικογένεια', '["οικογένεια","σπίτι","σχολείο","πλατεία"]'::jsonb, 'οικογένεια', '[]'::jsonb, 5),

    ('family-introductions', 'listening', 'Listen and choose the family member.', 'αδελφή', '["Sister","Brother","Mother","Father"]'::jsonb, 'Sister', '[]'::jsonb, 1),
    ('family-introductions', 'listening', 'Listen and choose the family member.', 'μητέρα', '["Mother","Father","Friend","Child"]'::jsonb, 'Mother', '[]'::jsonb, 2),
    ('family-introductions', 'listening', 'Listen and choose the family member.', 'πατέρας', '["Father","Mother","Sister","Brother"]'::jsonb, 'Father', '[]'::jsonb, 3),
    ('family-introductions', 'listening', 'Listen and choose the family member.', 'αδελφός', '["Brother","Sister","Family","Friend"]'::jsonb, 'Brother', '[]'::jsonb, 4),
    ('family-introductions', 'listening', 'Listen and choose the word.', 'οικογένεια', '["Family","House","Market","Coffee"]'::jsonb, 'Family', '[]'::jsonb, 5),

    ('family-introductions', 'speaking', 'Say "This is my family" in Greek.', 'Αυτή είναι η οικογένειά μου.', '[]'::jsonb, 'Αυτή είναι η οικογένειά μου.', '[]'::jsonb, 1),
    ('family-introductions', 'speaking', 'Say "This is my mother" in Greek.', 'Αυτή είναι η μητέρα μου.', '[]'::jsonb, 'Αυτή είναι η μητέρα μου.', '[]'::jsonb, 2),
    ('family-introductions', 'speaking', 'Say "This is my father" in Greek.', 'Αυτός είναι ο πατέρας μου.', '[]'::jsonb, 'Αυτός είναι ο πατέρας μου.', '[]'::jsonb, 3),
    ('family-introductions', 'speaking', 'Say "I have a sister" in Greek.', 'Έχω μια αδελφή.', '[]'::jsonb, 'Έχω μια αδελφή.', '[]'::jsonb, 4),
    ('family-introductions', 'speaking', 'Say "I have a brother" in Greek.', 'Έχω έναν αδελφό.', '[]'::jsonb, 'Έχω έναν αδελφό.', '[]'::jsonb, 5),

    ('family-introductions', 'writing', 'Write the Greek word for family.', 'οικογένεια', '[]'::jsonb, 'οικογένεια', '[]'::jsonb, 1),
    ('family-introductions', 'writing', 'Write the Greek word for mother.', 'μητέρα', '[]'::jsonb, 'μητέρα', '[]'::jsonb, 2),
    ('family-introductions', 'writing', 'Write the Greek word for father.', 'πατέρας', '[]'::jsonb, 'πατέρας', '[]'::jsonb, 3),
    ('family-introductions', 'writing', 'Write the Greek word for sister.', 'αδελφή', '[]'::jsonb, 'αδελφή', '[]'::jsonb, 4),
    ('family-introductions', 'writing', 'Write the Greek word for brother.', 'αδελφός', '[]'::jsonb, 'αδελφός', '[]'::jsonb, 5),

    ('family-introductions', 'conversation', 'Introduce your family to a new friend.', null, '[]'::jsonb, null, '["say your name","mention family","ask a simple question"]'::jsonb, 1),

    -- Lesson 5: market-shopping
    ('market-shopping', 'vocabulary', 'Which word means "price"?', 'τιμή', '["τιμή","μήλο","τσάντα","ψάρι"]'::jsonb, 'τιμή', '[]'::jsonb, 1),
    ('market-shopping', 'vocabulary', 'Which word means "apple"?', 'μήλο', '["μήλο","ψάρι","τυρί","ψωμί"]'::jsonb, 'μήλο', '[]'::jsonb, 2),
    ('market-shopping', 'vocabulary', 'Which word means "fish"?', 'ψάρι', '["τυρί","ψάρι","νερό","αγορά"]'::jsonb, 'ψάρι', '[]'::jsonb, 3),
    ('market-shopping', 'vocabulary', 'Which word means "bag"?', 'τσάντα', '["τσάντα","τιμή","μήλο","καφές"]'::jsonb, 'τσάντα', '[]'::jsonb, 4),
    ('market-shopping', 'vocabulary', 'Which word means "cheese"?', 'τυρί', '["ψωμί","τυρί","ψάρι","γάλα"]'::jsonb, 'τυρί', '[]'::jsonb, 5),

    ('market-shopping', 'listening', 'Listen and choose the item.', 'μήλο', '["Apple","Fish","Bread","Cheese"]'::jsonb, 'Apple', '[]'::jsonb, 1),
    ('market-shopping', 'listening', 'Listen and choose the item.', 'ψάρι', '["Fish","Apple","Bag","Price"]'::jsonb, 'Fish', '[]'::jsonb, 2),
    ('market-shopping', 'listening', 'Listen and choose the item.', 'τυρί', '["Cheese","Milk","Coffee","Water"]'::jsonb, 'Cheese', '[]'::jsonb, 3),
    ('market-shopping', 'listening', 'Listen and choose the word.', 'τιμή', '["Price","Market","Street","Family"]'::jsonb, 'Price', '[]'::jsonb, 4),
    ('market-shopping', 'listening', 'Listen and choose the item.', 'τσάντα', '["Bag","Book","House","Tea"]'::jsonb, 'Bag', '[]'::jsonb, 5),

    ('market-shopping', 'speaking', 'Say "How much does it cost?" in Greek.', 'Πόσο κοστίζει;', '[]'::jsonb, 'Πόσο κοστίζει;', '[]'::jsonb, 1),
    ('market-shopping', 'speaking', 'Say "I would like an apple" in Greek.', 'Θα ήθελα ένα μήλο.', '[]'::jsonb, 'Θα ήθελα ένα μήλο.', '[]'::jsonb, 2),
    ('market-shopping', 'speaking', 'Say "One bag, please" in Greek.', 'Μια τσάντα, παρακαλώ.', '[]'::jsonb, 'Μια τσάντα, παρακαλώ.', '[]'::jsonb, 3),
    ('market-shopping', 'speaking', 'Say "Do you have cheese?" in Greek.', 'Έχετε τυρί;', '[]'::jsonb, 'Έχετε τυρί;', '[]'::jsonb, 4),
    ('market-shopping', 'speaking', 'Say "Thank you, goodbye" in Greek.', 'Ευχαριστώ, αντίο.', '[]'::jsonb, 'Ευχαριστώ, αντίο.', '[]'::jsonb, 5),

    ('market-shopping', 'writing', 'Write the Greek word for apple.', 'μήλο', '[]'::jsonb, 'μήλο', '[]'::jsonb, 1),
    ('market-shopping', 'writing', 'Write the Greek word for price.', 'τιμή', '[]'::jsonb, 'τιμή', '[]'::jsonb, 2),
    ('market-shopping', 'writing', 'Write the Greek word for fish.', 'ψάρι', '[]'::jsonb, 'ψάρι', '[]'::jsonb, 3),
    ('market-shopping', 'writing', 'Write the Greek word for bag.', 'τσάντα', '[]'::jsonb, 'τσάντα', '[]'::jsonb, 4),
    ('market-shopping', 'writing', 'Write the Greek word for cheese.', 'τυρί', '[]'::jsonb, 'τυρί', '[]'::jsonb, 5),

    ('market-shopping', 'conversation', 'Buy fruit at a local market.', null, '[]'::jsonb, null, '["ask the price","choose an item","say thank you"]'::jsonb, 1)
)
insert into public.lesson_items (lesson_id, kind, prompt, greek, options, answer, scenario_goals, order_index)
select lessons.id, seed_items.kind, seed_items.prompt, seed_items.greek, seed_items.options, seed_items.answer, seed_items.scenario_goals, seed_items.order_index
from seed_items
join lessons on lessons.slug = seed_items.slug
on conflict (lesson_id, kind, order_index) do update set
  prompt = excluded.prompt,
  greek = excluded.greek,
  options = excluded.options,
  answer = excluded.answer,
  scenario_goals = excluded.scenario_goals;

-- 3. Insert Difficulties
with items as (
  select lesson_items.id, lesson_items.kind
  from public.lesson_items
  join public.lessons on lessons.id = lesson_items.lesson_id
  where lessons.slug in (
    'greek-basics-1',
    'at-the-cafe',
    'city-directions',
    'family-introductions',
    'market-shopping'
  )
),
difficulties (difficulty) as (
  values ('standard'), ('competitive')
)
insert into public.lesson_item_difficulties (
  lesson_item_id,
  difficulty,
  prompt_override,
  time_limit_seconds,
  starting_health,
  xp_multiplier,
  metadata
)
select
  items.id,
  difficulties.difficulty,
  null,
  case when difficulties.difficulty = 'competitive' then
    case
      when items.kind = 'conversation' then 60
      when items.kind = 'speaking' then 25
      else 20
    end
  else null end,
  case when difficulties.difficulty = 'competitive' and items.kind in ('speaking', 'writing') then 2 else 3 end,
  case when difficulties.difficulty = 'competitive' then
    case
      when items.kind = 'conversation' then 1.75
      when items.kind = 'speaking' then 1.75
      else 1.50
    end
  else 1.00 end,
  jsonb_build_object(
    'xp',
    case
      when items.kind = 'conversation' and difficulties.difficulty = 'competitive' then 35
      when items.kind = 'conversation' then 20
      when items.kind = 'speaking' and difficulties.difficulty = 'competitive' then 21
      when items.kind = 'speaking' then 12
      when difficulties.difficulty = 'competitive' then 15
      else 10
    end
  )
from items
cross join difficulties
on conflict (lesson_item_id, difficulty) do update set
  prompt_override = excluded.prompt_override,
  time_limit_seconds = excluded.time_limit_seconds,
  starting_health = excluded.starting_health,
  xp_multiplier = excluded.xp_multiplier,
  metadata = excluded.metadata;

-- 4. Insert Badges
insert into public.badges (slug, name, description, rule)
values
  ('first-lesson', 'First Lesson', 'Complete your first lesson.', 'complete_lessons >= 1'),
  ('streak-3', 'Three Day Streak', 'Practice three days in a row.', 'current_streak >= 3'),
  ('competitive-starter', 'Competitive Starter', 'Complete a competitive practice session.', 'competitive_sessions >= 1')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  rule = excluded.rule;
