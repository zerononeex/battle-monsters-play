// Spelling challenge word lists (Phase 6 hear-and-spell). Grade-leveled from the Dolch / Fry sight-word lists and
// standard grade spelling lists (concrete words picked where possible so the picture clue helps). Each entry:
//   [word, picture clue, clue sentence that contains the word — SPOKEN only, never shown before it's answered]
// P3 PICTURE AUDIT (playtest, 2026-10-11): the picture must depict the WORD itself, never an associate (the old ⚾ for
// "caught"). Every entry is curated: an emoji only for unambiguous concrete nouns; `null` = NO picture (verbs, abstract
// words, homophones, categories shown by an example) — the screen shows a neutral "listen" card and the spoken clue
// sentence carries the meaning. Never derived automatically (tools/test/phase7.mjs words checks every entry).
// Words never appear on screen before they are answered; that is why no entry may be a word the challenge screen's own
// labels use (checked by tools/test/phase6.mjs). POKÉMON: a bonus list that mixes in at any grade (its picture clue is
// the Pokémon's sprite; `id` = the line / form id).
window.BM = window.BM || {};
BM.WORDS = {
  2: [
    ['cake', '🎂', 'I ate a slice of birthday cake.'], ['frog', '🐸', 'The green frog jumped into the pond.'],
    ['ship', '🚢', 'The big ship sailed across the sea.'], ['fish', '🐟', 'A fish swims in the water.'],
    ['tree', '🌳', 'The bird sat in the tall tree.'], ['bell', '🔔', 'Ring the bell for lunch.'],
    ['duck', '🦆', 'The duck says quack.'], ['rain', '🌧️', 'We stayed inside because of the rain.'],
    ['boat', '⛵', 'We rowed the boat on the lake.'], ['star', '⭐', 'I made a wish on a star.'],
    ['king', null, 'The king wore a gold crown.'], ['nest', '🪺', 'The bird built a nest.'],
    ['sock', '🧦', 'I lost one sock in the wash.'], ['milk', '🥛', 'I drink milk with my cereal.'],
    ['snow', '❄️', 'We built a snowman out of snow.'], ['road', '🛣️', 'The car drove down the road.'],
    ['coat', '🧥', 'Wear your coat when it is cold.'], ['smile', '😊', 'Your smile makes me happy.'],
    ['green', '🟢', 'Grass is green.'], ['black', '⬛', 'The cat has black fur.'],
    ['sleep', null, 'I sleep in my bed at night.'], ['apple', '🍎', 'I ate a red apple.'],
    ['clock', '🕒', 'The clock says it is three.'], ['which', null, 'Which one do you want?'],
    ['would', null, 'Would you like to play?'], ['because', null, 'I wore a hat because it was sunny.'],
  ],
  3: [
    ['train', '🚂', 'The train goes choo choo.'], ['bridge', '🌉', 'We walked across the bridge.'],
    ['cloud', '☁️', 'A white cloud floated by.'], ['horse', '🐴', 'The horse ran in the field.'],
    ['mouse', '🐭', 'A little mouse ate the cheese.'], ['juice', '🧃', 'I drink orange juice.'],
    ['pencil', '✏️', 'Write your name with a pencil.'], ['rabbit', '🐰', 'The rabbit hopped away.'],
    ['turtle', '🐢', 'The turtle walks slowly.'], ['kitchen', null, 'Dad is cooking in the kitchen.'],
    ['friend', null, 'My friend came over to play.'], ['lunch', null, 'We eat lunch at noon.'],
    ['beach', '🏖️', 'We built sandcastles at the beach.'], ['thumb', '👍', 'Hold up your thumb.'],
    ['knife', '🔪', 'Cut the bread with a knife.'], ['write', null, 'Please write a story.'],
    ['light', '💡', 'Turn on the light.'], ['night', '🌃', 'Owls hunt at night.'],
    ['dragon', '🐉', 'The dragon breathed fire.'], ['garden', null, 'Flowers grow in the garden.'],
    ['spider', '🕷️', 'A spider spun a web.'], ['money', '💰', 'I saved my money in a jar.'],
    ['happy', null, 'The puppy is happy to see me.'], ['circle', '⭕', 'Draw a circle.'],
    ['winter', null, 'It snows in winter.'], ['laugh', null, 'The joke made me laugh.'],
  ],
  4: [
    ['castle', '🏰', 'The princess lived in a castle.'], ['giraffe', '🦒', 'The giraffe has a very long neck.'],
    ['weather', null, 'The weather is sunny today.'], ['pumpkin', '🎃', 'We carved a pumpkin.'],
    ['rocket', '🚀', 'The rocket flew to space.'], ['octopus', '🐙', 'An octopus has eight arms.'],
    ['guitar', '🎸', 'He plays the guitar.'], ['balloon', '🎈', 'The red balloon floated up.'],
    ['thunder', null, 'Thunder boomed during the storm.'], ['penguin', '🐧', 'A penguin cannot fly.'],
    ['mountain', '⛰️', 'We climbed the mountain.'], ['squirrel', '🐿️', 'The squirrel hid a nut.'],
    ['picture', '🖼️', 'I drew a picture.'], ['favorite', null, 'Blue is my favorite color.'],
    ['breakfast', null, 'I ate pancakes for breakfast.'], ['library', null, 'We borrowed books from the library.'],
    ['scissors', '✂️', 'Cut the paper with scissors.'], ['journey', null, 'The journey took three days.'],
    ['bicycle', '🚲', 'I ride my bicycle to school.'], ['calendar', '📅', 'Mark the date on the calendar.'],
    ['answer', null, 'Raise your hand to answer.'], ['believe', null, 'I believe you can do it.'],
    ['enough', null, 'Did you have enough to eat?'], ['caught', null, 'She caught the ball.'],
    ['through', null, 'We walked through the door.'], ['school', '🏫', 'We learn to read at school.'],
  ],
  5: [
    ['volcano', '🌋', 'Lava poured out of the volcano.'], ['skeleton', null, 'The skeleton has many bones.'],
    ['treasure', null, 'The pirates found the treasure.'], ['telescope', '🔭', 'We looked at stars with a telescope.'],
    ['lightning', '⚡', 'Lightning flashed across the sky.'], ['dinosaur', '🦖', 'The dinosaur had sharp teeth.'],
    ['microphone', '🎤', 'She sang into the microphone.'], ['astronaut', '👩‍🚀', 'The astronaut floated in space.'],
    ['chocolate', '🍫', 'I love chocolate ice cream.'], ['butterfly', '🦋', 'The butterfly landed on a flower.'],
    ['mysterious', null, 'The mysterious box had no label.'], ['adventure', null, 'We went on an adventure.'],
    ['furniture', '🛋️', 'We moved the furniture.'], ['neighbor', null, 'Our neighbor has a dog.'],
    ['temperature', null, 'The temperature is very hot.'], ['vegetable', '🥦', 'Broccoli is a vegetable.'],
    ['calculator', null, 'Use a calculator to add.'], ['envelope', '✉️', 'Put the letter in the envelope.'],
    ['electricity', null, 'The lamp uses electricity.'], ['knowledge', null, 'Books give us knowledge.'],
    ['beautiful', null, 'What a beautiful flower.'], ['different', null, 'Each snowflake is different.'],
    ['surprise', null, 'We planned a surprise party.'], ['government', null, 'The government makes laws.'],
  ],
  6: [
    ['hurricane', '🌀', 'The hurricane brought strong winds.'], ['crocodile', '🐊', 'The crocodile swam in the river.'],
    ['encyclopedia', null, 'Look it up in the encyclopedia.'], ['thermometer', '🌡️', 'The thermometer shows how hot it is.'],
    ['silhouette', '👤', 'We saw his silhouette in the window.'], ['rhythm', null, 'Clap to the rhythm.'],
    ['symphony', null, 'The orchestra played a symphony.'], ['architect', null, 'The architect designed the house.'],
    ['celebrate', null, 'We celebrate birthdays with cake.'], ['equation', null, 'Solve the equation.'],
    ['fascinate', null, 'Stars fascinate me.'], ['guarantee', null, 'I guarantee you will like it.'],
    ['parachute', '🪂', 'The parachute opened in the sky.'], ['pyramid', null, 'The pyramid is in Egypt.'],
    ['necessary', null, 'Water is necessary for life.'], ['exaggerate', null, 'Do not exaggerate the story.'],
    ['restaurant', null, 'We ate dinner at a restaurant.'], ['committee', null, 'The committee voted yes.'],
    ['environment', null, 'We must protect the environment.'], ['recommend', null, 'I recommend this book.'],
    ['license', '🪪', 'You need a license to drive.'], ['camouflage', null, 'The lizard used camouflage to hide.'],
  ],
  7: [
    ['conscience', null, 'Your conscience tells right from wrong.'], ['mischievous', null, 'The mischievous cat knocked over a cup.'],
    ['hippopotamus', '🦛', 'The hippopotamus lives near rivers.'], ['chrysalis', null, 'The caterpillar made a chrysalis.'],
    ['ambulance', '🚑', 'The ambulance raced to the hospital.'], ['accommodate', null, 'The hotel can accommodate fifty guests.'],
    ['acquaintance', null, 'She is an acquaintance from school.'], ['millennium', null, 'A millennium is a thousand years.'],
    ['miniature', null, 'He built a miniature train.'], ['occurrence', null, 'Snow is a rare occurrence here.'],
    ['pharmacy', null, 'Get medicine at the pharmacy.'], ['questionnaire', null, 'Fill out the questionnaire.'],
    ['rhinoceros', '🦏', 'The rhinoceros has a horn.'], ['souvenir', null, 'I bought a souvenir on vacation.'],
    ['psychology', null, 'She studies psychology.'], ['privilege', null, 'It is a privilege to help.'],
    ['embarrass', null, 'Please do not embarrass me!'], ['definitely', null, 'I will definitely come.'],
    ['boulevard', null, 'We drove down the boulevard.'], ['cylinder', null, 'A can is shaped like a cylinder.'],
    ['quarantine', null, 'The sick dog stayed in quarantine.'], ['maneuver', null, 'The pilot made a sharp maneuver.'],
  ],
};
// Bonus list: Pokémon names as spellable words (any grade). [word, line/form id for the sprite clue, clue sentence]
BM.WORDS_POKEMON = [
  ['pikachu', 'pikachu', 'Pikachu is an Electric type Pokémon.'], ['charmander', 'charmander', 'Charmander has a flame on its tail.'],
  ['squirtle', 'squirtle', 'Squirtle shoots water from its mouth.'], ['bulbasaur', 'bulbasaur', 'Bulbasaur has a plant bulb on its back.'],
  ['eevee', 'eevee_water', 'Eevee can evolve in many ways.'], ['snorlax', 'snorlax', 'Snorlax loves to eat and sleep.'],
  ['psyduck', 'psyduck', 'Psyduck always has a headache.'], ['gengar', 'gengar', 'Gengar hides in the shadows.'],
  ['onix', 'onix', 'Onix is a giant rock snake.'], ['magikarp', 'magikarp', 'Magikarp can only splash.'],
  ['meowth', 'meowth', 'Meowth loves shiny coins.'], ['jigglypuff', 'jigglypuff', 'Jigglypuff sings everyone to sleep.'],
  ['abra', 'abra', 'Abra can teleport away.'], ['lapras', 'lapras', 'Lapras carries people across the sea.'],
  ['dratini', 'dratini', 'Dratini is a baby dragon.'], ['vulpix', 'vulpix', 'Vulpix has six curly tails.'],
  ['growlithe', 'growlithe', 'Growlithe is a loyal fire puppy.'], ['machop', 'machop', 'Machop is very strong.'],
  ['cubone', 'cubone', 'Cubone wears a skull helmet.'], ['gyarados', 'gyarados', 'Gyarados is a fierce sea serpent.'],
];
BM.SPELL_POKEMON_SHARE = 0.15; // share of spelling words drawn from the Pokémon bonus list
