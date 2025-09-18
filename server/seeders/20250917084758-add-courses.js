'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const data = [{
      "title": "English Fundamentals: Getting Started",
      "difficulty": "Beginner",
      "languageId": 1,
      "content":JSON.stringify( {
        "roadmap": "This course introduces the absolute basics of English, covering the alphabet, essential greetings, numbers, and how to form very simple sentences using the verb 'to be' and common nouns. It's designed for learners with no prior English knowledge.",
        "lessons": [
          {
            "title": "The English Alphabet & Basic Pronunciation",
            "content": "## The English Alphabet & Basic Pronunciation\n\nWelcome to your first English lesson! Understanding the alphabet is the very first step to reading, writing, and speaking English.\n\n### The Alphabet\n\nThere are 26 letters in the English alphabet. Each letter has an uppercase (capital) and a lowercase form.\n\n| Uppercase | Lowercase | Pronunciation (Approx.) |\n| :-------- | :-------- | :---------------------- |\n| A         | a         | /eɪ/ (like 'ay' in 'day') |\n| B         | b         | /biː/ (like 'bee')      |\n| C         | c         | /siː/ (like 'see')      |\n| D         | d         | /diː/ (like 'dee')      |\n| E         | e         | /iː/ (like 'ee' in 'bee') |\n| F         | f         | /ef/                    |\n| G         | g         | /dʒiː/ (like 'gee')     |\n| H         | h         | /eɪtʃ/                  |\n| I         | i         | /aɪ/ (like 'eye')       |\n| J         | j         | /dʒeɪ/ (like 'jay')     |\n| K         | k         | /keɪ/ (like 'kay')      |\n| L         | l         | /el/                    |\n| M         | m         | /em/                    |\n| N         | n         | /en/                    |\n| O         | o         | /oʊ/ (like 'oh')        |\n| P         | p         | /piː/ (like 'pee')      |\n| Q         | q         | /kjuː/                  |\n| R         | r         | /ɑːr/ (like 'are')      |\n| S         | s         | /es/                    |\n| T         | t         | /tiː/ (like 'tea')      |\n| U         | u         | /juː/ (like 'you')      |\n| V         | v         | /viː/ (like 'vee')      |\n| W         | w         | /ˈdʌbəl juː/           |\n| X         | x         | /eks/                   |\n| Y         | y         | /waɪ/ (like 'why')      |\n| Z         | z         | /ziː/ (like 'zee' - American) / /zɛd/ (British) |\n\n### Vowels and Consonants\n\n*   **Vowels**: A, E, I, O, U. These letters often have different sounds depending on the word.\n*   **Consonants**: All other letters.\n\n### Basic Pronunciation Tips\n\n*   **Practice each letter sound**. Say them out loud repeatedly.\n*   **Listen to native speakers**. Use online resources or apps.\n*   **Focus on common words**. For example: *apple, book, cat, dog, egg*.\n\n### Exercise:\n\nTry to spell your name using the English alphabet sounds. What about your favorite animal?",
            "difficulty": 1,
            "order": 1
          },
          {
            "title": "Greetings & Introductions",
            "content": "## Greetings & Introductions\n\nLearning to greet people and introduce yourself is fundamental for any language. Here are some common phrases in English.\n\n### Common Greetings\n\n*   **Hello!** (General, polite)\n*   **Hi!** (Informal)\n*   **Good morning!** (Used from sunrise until noon)\n*   **Good afternoon!** (Used from noon until evening)\n*   **Good evening!** (Used from evening until night)\n*   **Good night!** (Used when leaving in the evening or going to bed)\n*   **How are you?** (Common question after a greeting)\n*   **I'm fine, thank you. And you?** (Common response)\n\n### Introducing Yourself\n\n*   **My name is [Your Name].** (e.g., *My name is Anna.*)\n*   **I am [Your Name].** (e.g., *I am David.*)\n*   **Nice to meet you!** (Polite phrase after an introduction)\n*   **What is your name?** (To ask someone's name)\n\n### Simple Conversations\n\n**Conversation 1:**\n\nA: \"Hello!\"\nB: \"Hi!\"\nA: \"What is your name?\"\nB: \"My name is Tom. What's your name?\"\nA: \"I am Lisa. Nice to meet you!\"\nB: \"Nice to meet you too!\"\n\n**Conversation 2:**\n\nA: \"Good morning! How are you?\"\nB: \"I'm fine, thank you. And you?\"\nA: \"I'm good, thanks.\"\n\n### Exercise:\n\nPractice greeting a friend or family member. Introduce yourself and ask their name. Try using different greetings depending on the time of day.",
            "difficulty": 1,
            "order": 2
          },
          {
            "title": "Numbers & Colors",
            "content": "## Numbers & Colors\n\nLearning numbers and colors is crucial for daily communication, from telling prices to describing objects.\n\n### Numbers (0-10)\n\n| Number | Word     |\n| :----- | :------- |\n| 0      | Zero     |\n| 1      | One      |\n| 2      | Two      |\n| 3      | Three    |\n| 4      | Four     |\n| 5      | Five     |\n| 6      | Six      |\n| 7      | Seven    |\n| 8      | Eight    |\
| 9      | Nine     |\
| 10     | Ten      |\n\n### Colors\n\n*   **Red**\n*   **Blue**\n*   **Yellow**\n*   **Green**\n*   **Black**\n*   **White**\n*   **Orange**\n*   **Purple**\n*   **Pink**\n*   **Brown**\n\n### Using Numbers & Colors in Sentences\n\n*   \"I have **one** apple.\"\n*   \"She has **two** books.\"\n*   \"The car is **red**.\"\n*   \"My bag is **blue**.\"\n*   \"There are **three** **green** pens.\"\n\n### Exercise:\n\nLook around your room. Count up to 10 objects and say their colors. For example: \"One **blue** pen, two **white** papers.\"",
            "difficulty": 1,
            "order": 3
          },
          {
            "title": "Basic Nouns & Articles",
            "content": "## Basic Nouns & Articles\n\nNouns are words that name people, places, things, or ideas. Articles (`a`, `an`, `the`) are used before nouns.\n\n### Common Nouns\n\n*   **People**: *teacher, student, man, woman, boy, girl*\n*   **Places**: *school, house, park, city, country*\n*   **Things**: *book, table, chair, phone, car, apple*\n\n### Articles: A, An, The\n\n*   **'A' and 'An' (Indefinite Articles)**:\n    *   Used before singular, countable nouns when you are talking about *any* one of them (not a specific one).\n    *   Use **'a'** before words starting with a consonant sound: *a book, a car, a student*.\n    *   Use **'an'** before words starting with a vowel sound: *an apple, an orange, an hour* (the 'h' is silent).\n\n*   **'The' (Definite Article)**:\n    *   Used before singular or plural, countable or uncountable nouns when you are talking about a *specific* person, place, or thing.\n    *   *The book on the table is mine.* (a specific book)\n    *   *The sun is bright.* (a unique item)\n\n### Examples:\n\n*   \"I see **a** cat.\" (Any cat)\n*   \"I see **the** cat.\" (A specific cat we both know)\n*   \"She eats **an** apple every day.\"\n*   \"He is **a** teacher.\"\n\n### Exercise:\n\nFill in the blanks with 'a', 'an', or 'the'.\n\n1.  I have ___ pen.\n2.  She eats ___ orange.\n3.  ___ sun is hot.\n4.  He is ___ doctor.",
            "difficulty": 1,
            "order": 4
          },
          {
            "title": "Simple Present Tense: The Verb 'To Be'",
            "content": "## Simple Present Tense: The Verb 'To Be'\n\nThe verb 'to be' is one of the most important and frequently used verbs in English. It's used to describe states, identify people/things, and indicate location.\n\n### Forms of 'To Be' (Present Simple)\n\n| Subject | 'To Be' Form |\n| :------ | :----------- |\
| I       | am           |\
| You     | are          |\
| He/She/It | is           |\
| We      | are          |\
| They    | are          |\
\n### Affirmative Sentences\n\n*   I **am** happy.\n*   You **are** a student.\n*   He **is** a doctor.\n*   She **is** tall.\n*   It **is** a book.\n*   We **are** friends.\n*   They **are** at home.\n\n### Negative Sentences (Add 'not')\n\n*   I **am not** sad.\n*   You **are not** a teacher.\n*   He **is not** short.\n*   She **is not** a lawyer.\n\n### Questions (Invert subject and verb)\n\n*   **Am** I right?\n*   **Are** you hungry?\n*   **Is** he from Spain?\n*   **Are** they students?\n\n### Exercise:\n\nComplete the sentences with the correct form of 'to be' (am, is, are).\n\n1.  She ___ beautiful.\n2.  We ___ in the park.\n3.  I ___ a student.\n4.  They ___ not tired.\n5.  ___ you happy?",
            "difficulty": 1,
            "order": 5
          }
        ]
      })},
    {
      "title": "Daily English Essentials",
      "difficulty": "Beginner",
      "languageId": 1,
      "content": JSON.stringify({
        "roadmap": "This course focuses on practical English for daily life, covering personal information, common verbs for routines, asking basic 'Wh-' questions, and understanding prepositions of place to describe locations. It builds on fundamental vocabulary and sentence structure.",
        "lessons": [
          {
            "title": "Personal Pronouns & Possessives",
            "content": "## Personal Pronouns & Possessives\n\nPronouns replace nouns to avoid repetition, and possessives show ownership.\n\n### Personal Pronouns\n\nThese replace the subject or object of a sentence.\n\n| Subject Pronoun | Object Pronoun |\n| :-------------- | :------------- |\
| I               | me             |\
| You             | you            |\
| He              | him            |\
| She             | her            |\
| It              | it             |\
| We              | us             |\
| They            | them           |\
\n*   **Subject**: *He* is a student. *They* are happy.\n*   **Object**: I see *him*. She talks to *us*.\n\n### Possessive Adjectives & Pronouns\n\nThese show who something belongs to.\n\n| Subject Pronoun | Possessive Adjective | Possessive Pronoun |\
| :-------------- | :------------------- | :----------------- |\
| I               | my                   | mine               |\
| You             | your                 | yours              |\
| He              | his                  | his                |\
| She             | her                  | hers               |\
| It              | its                  | (rarely used)      |\
| We              | our                  | ours               |\
| They            | their                | theirs             |\
\n*   **Possessive Adjective**: Used *before* a noun. *This is my book. That is their car.*\n*   **Possessive Pronoun**: Replaces the noun phrase. *This book is mine. That car is theirs.*\n\n### Exercise:\n\nReplace the underlined words with appropriate pronouns or possessives.\n\n1.  <u>Anna</u> is studying. (Subject pronoun)\n2.  I saw <u>John</u>. (Object pronoun)\n3.  This is <u>Sarah's</u> pen. (Possessive adjective)\n4.  The house belongs to <u>us</u>. (Possessive pronoun)",
            "difficulty": 1,
            "order": 1
          },
          {
            "title": "Daily Routines & Verbs",
            "content": "## Daily Routines & Verbs\n\nTalking about your daily routine is a great way to practice common verbs and simple sentence structures.\n\n### Common Verbs for Daily Activities\n\n*   **wake up**\n*   **get up**\n*   **eat breakfast/lunch/dinner**\n*   **go to work/school**\n*   **start work/school**\n*   **finish work/school**\n*   **go home**\n*   **cook dinner**\n*   **watch TV**\n*   **read a book**\n*   **go to bed**\n*   **sleep**\n\n### Describing Your Routine\n\nUse the simple present tense to talk about habits and routines.\n\n*   I **wake up** at 7:00 AM.\n*   She **eats breakfast** at 8:00 AM.\n*   They **go to work** by bus.\n*   He **watches TV** in the evening.\n\n### Adverbs of Frequency (Optional, for enrichment)\n\nWords like *always, usually, often, sometimes, rarely, never* help describe how often you do things.\n\n*   I **always** drink coffee in the morning.\n*   She **usually** walks to school.\n*   He **never** eats meat.\n\n### Exercise:\n\nWrite 3-5 sentences describing your typical morning routine using the verbs learned. For example: \"I wake up, then I eat breakfast.\"",
            "difficulty": 1,
            "order": 2
          },
          {
            "title": "Asking 'Wh-' Questions",
            "content": "## Asking 'Wh-' Questions\n\n'Wh-' questions are used to ask for specific information. They start with words like *who, what, where, when, why, how*.\n\n### 'Wh-' Question Words\n\n*   **Who**: Asks about a person.\n    *   *Who is your teacher?* (My teacher is Mr. Smith.)\n*   **What**: Asks about a thing or action.\n    *   *What is your favorite color?* (My favorite color is blue.)\n    *   *What are you doing?* (I am studying.)\n*   **Where**: Asks about a place.\n    *   *Where do you live?* (I live in London.)\n*   **When**: Asks about time.\n    *   *When is your birthday?* (My birthday is in May.)\n*   **Why**: Asks for a reason.\n    *   *Why are you happy?* (Because I got a new job.)\n*   **How**: Asks about manner or condition.\n    *   *How are you?* (I'm fine, thank you.)\n    *   *How do you go to school?* (I go by bus.)\n\n### Question Structure (Simple Present/Be verb)\n\n**Wh- word + (auxiliary verb / 'to be') + subject + main verb (if any)?**\n\n*   **What** is your name?\n*   **Where** do you live?\n*   **When** does the class start?\n\n### Exercise:\n\nFormulate a 'Wh-' question for each of the following answers.\n\n1.  The book is on the table. (Ask about location)\n2.  My name is Sarah. (Ask about name)\n3.  I go to bed at 10 PM. (Ask about time)",
            "difficulty": 1,
            "order": 3
          },
          {
            "title": "Prepositions of Place",
            "content": "## Prepositions of Place\n\nPrepositions of place tell us where something or someone is located.\n\n### Common Prepositions of Place\n\n*   **In**: inside something (e.g., *in the box, in the room, in London*)\n*   **On**: on the surface of something (e.g., *on the table, on the wall, on the floor*)\n*   **Under**: below something (e.g., *under the chair, under the bed*)\n*   **Next to / Beside**: at the side of something (e.g., *next to the window, beside the lamp*)\n*   **Between**: in the space separating two things (e.g., *between the sofa and the armchair*)\n*   **In front of**: directly before something (e.g., *in front of the building*)\n*   **Behind**: at the back of something (e.g., *behind the tree*)\n*   **Above / Over**: at a higher position than something (e.g., *above the shelf, over the bridge*)\n\n### Examples:\n\n*   The cat is **under** the table.\n*   My keys are **on** the desk.\n*   She lives **in** a big city.\n*   The picture is **above** the fireplace.\n\n### Exercise:\n\nDescribe the location of three objects in your current room using different prepositions of place. For example: \"My phone is *on* the desk. The lamp is *next to* the computer.\"",
            "difficulty": 1,
            "order": 4
          },
          {
            "title": "Basic Adjectives & Adverbs",
            "content": "## Basic Adjectives & Adverbs\n\nAdjectives and adverbs add detail and description to your sentences.\n\n### Adjectives\n\n*   **What they do**: Describe nouns (people, places, things).\n*   **Placement**: Usually before the noun, or after the verb 'to be'.\n*   **Examples**: *big, small, happy, sad, fast, slow, red, blue, smart, tall, short.*\n\n    *   A **big** house.\n    *   She is **happy**.\n    *   He has a **fast** car.\n\n### Adverbs\n\n*   **What they do**: Describe verbs, adjectives, or other adverbs. They tell *how*, *when*, *where*, or *to what extent*.\n*   **Formation**: Many adverbs are formed by adding '-ly' to an adjective (e.g., *quick* -> *quickly, happy* -> *happily*).\n*   **Placement**: Often after the verb they describe, or before adjectives/adverbs.\n*   **Examples**: *quickly, slowly, happily, sadly, well, badly, always, often, here, there.*\n\n    *   He runs **quickly**.\n    *   She sings **beautifully**.\n    *   They are **very** happy. (adverb describing an adjective)\n\n### Exercise:\n\nUnderline the adjective and circle the adverb in each sentence.\n\n1.  The *tall* man walks *slowly*.\n2.  She has a *beautiful* voice and sings *well*.\n3.  It's a *very* *cold* day.",
            "difficulty": 1,
            "order": 5
          }
        ]
      })
    }
    ]

    const query = data.map(el => {
      el.createdAt = el.updatedAt = new Date()
      return el});

    await queryInterface.bulkInsert('Courses', query, {});
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Courses', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
