// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const questions = [
  // === SCIENCE (علوم) ===
  { questionEn: "What is the closest planet to the Sun?", questionAr: "ما هو أقرب كوكب من الشمس؟", answerEn: "Mercury", answerAr: "عطارد", category: "science", difficulty: "easy", firstLetter: "M" },
  { questionEn: "What gas do plants absorb from the atmosphere?", questionAr: "ما الغاز الذي تمتصه النباتات من الغلاف الجوي؟", answerEn: "Carbon Dioxide", answerAr: "ثاني أكسيد الكربون", category: "science", difficulty: "easy", firstLetter: "C" },
  { questionEn: "What is the chemical symbol for gold?", questionAr: "ما هو الرمز الكيميائي للذهب؟", answerEn: "Au", answerAr: "Au", category: "science", difficulty: "medium", firstLetter: "A" },
  { questionEn: "How many bones are in the adult human body?", questionAr: "كم عدد العظام في جسم الإنسان البالغ؟", answerEn: "206", answerAr: "206", category: "science", difficulty: "medium", firstLetter: "T" },
  { questionEn: "What is the speed of light in km/s?", questionAr: "ما سرعة الضوء بالكيلومتر في الثانية؟", answerEn: "300,000", answerAr: "300,000", category: "science", difficulty: "hard", firstLetter: "T" },
  { questionEn: "What organelle is the powerhouse of the cell?", questionAr: "ما العضية التي تُعدّ محطة الطاقة في الخلية؟", answerEn: "Mitochondria", answerAr: "الميتوكوندريا", category: "science", difficulty: "medium", firstLetter: "M" },
  { questionEn: "What is the atomic number of oxygen?", questionAr: "ما العدد الذري للأكسجين؟", answerEn: "8", answerAr: "8", category: "science", difficulty: "hard", firstLetter: "E" },
  { questionEn: "What planet is known as the Red Planet?", questionAr: "أي كوكب يُعرف بالكوكب الأحمر؟", answerEn: "Mars", answerAr: "المريخ", category: "science", difficulty: "easy", firstLetter: "M" },
  { questionEn: "What is the most abundant gas in Earth's atmosphere?", questionAr: "ما أكثر الغازات وفرة في الغلاف الجوي للأرض؟", answerEn: "Nitrogen", answerAr: "النيتروجين", category: "science", difficulty: "medium", firstLetter: "N" },
  { questionEn: "What force keeps planets in orbit around the Sun?", questionAr: "ما القوة التي تبقي الكواكب في مداراتها حول الشمس؟", answerEn: "Gravity", answerAr: "الجاذبية", category: "science", difficulty: "easy", firstLetter: "G" },

  // === HISTORY (تاريخ) ===
  { questionEn: "In which year did World War II end?", questionAr: "في أي عام انتهت الحرب العالمية الثانية؟", answerEn: "1945", answerAr: "1945", category: "history", difficulty: "easy", firstLetter: "N" },
  { questionEn: "Who was the first President of the United States?", questionAr: "من كان أول رئيس للولايات المتحدة؟", answerEn: "George Washington", answerAr: "جورج واشنطن", category: "history", difficulty: "easy", firstLetter: "G" },
  { questionEn: "Which ancient wonder was located in Egypt?", questionAr: "أي إحدى عجائب الدنيا القديمة كانت في مصر؟", answerEn: "Great Pyramid of Giza", answerAr: "الهرم الأكبر في الجيزة", category: "history", difficulty: "easy", firstLetter: "G" },
  { questionEn: "In which year did the Berlin Wall fall?", questionAr: "في أي عام سقط جدار برلين؟", answerEn: "1989", answerAr: "1989", category: "history", difficulty: "medium", firstLetter: "N" },
  { questionEn: "Who discovered America in 1492?", questionAr: "من اكتشف أمريكا عام 1492؟", answerEn: "Christopher Columbus", answerAr: "كريستوف كولومبوس", category: "history", difficulty: "easy", firstLetter: "C" },
  { questionEn: "Which empire was ruled by Genghis Khan?", questionAr: "أي إمبراطورية كان يحكمها جنكيز خان؟", answerEn: "Mongol Empire", answerAr: "الإمبراطورية المغولية", category: "history", difficulty: "medium", firstLetter: "M" },
  { questionEn: "In which city was the Eiffel Tower built?", questionAr: "في أي مدينة بُني برج إيفل؟", answerEn: "Paris", answerAr: "باريس", category: "history", difficulty: "easy", firstLetter: "P" },
  { questionEn: "Who was the first human to walk on the Moon?", questionAr: "من كان أول إنسان يمشي على سطح القمر؟", answerEn: "Neil Armstrong", answerAr: "نيل أرمسترونج", category: "history", difficulty: "easy", firstLetter: "N" },
  { questionEn: "Which year did the French Revolution begin?", questionAr: "في أي عام بدأت الثورة الفرنسية؟", answerEn: "1789", answerAr: "1789", category: "history", difficulty: "medium", firstLetter: "S" },
  { questionEn: "What ancient civilization built the Colosseum?", questionAr: "أي حضارة قديمة بنت الكولوسيوم؟", answerEn: "Romans", answerAr: "الرومان", category: "history", difficulty: "easy", firstLetter: "R" },

  // === GEOGRAPHY (جغرافيا) ===
  { questionEn: "What is the largest country in the world by area?", questionAr: "ما أكبر دولة في العالم من حيث المساحة؟", answerEn: "Russia", answerAr: "روسيا", category: "geography", difficulty: "easy", firstLetter: "R" },
  { questionEn: "What is the capital of Australia?", questionAr: "ما عاصمة أستراليا؟", answerEn: "Canberra", answerAr: "كانبيرا", category: "geography", difficulty: "medium", firstLetter: "C" },
  { questionEn: "Which river is the longest in the world?", questionAr: "أي نهر هو الأطول في العالم؟", answerEn: "Nile", answerAr: "النيل", category: "geography", difficulty: "easy", firstLetter: "N" },
  { questionEn: "On which continent is the Sahara Desert located?", questionAr: "في أي قارة تقع الصحراء الكبرى؟", answerEn: "Africa", answerAr: "أفريقيا", category: "geography", difficulty: "easy", firstLetter: "A" },
  { questionEn: "What is the smallest country in the world?", questionAr: "ما أصغر دولة في العالم؟", answerEn: "Vatican City", answerAr: "مدينة الفاتيكان", category: "geography", difficulty: "medium", firstLetter: "V" },
  { questionEn: "Which country has the most natural lakes?", questionAr: "أي دولة لديها أكبر عدد من البحيرات الطبيعية؟", answerEn: "Canada", answerAr: "كندا", category: "geography", difficulty: "hard", firstLetter: "C" },
  { questionEn: "What is the capital of Japan?", questionAr: "ما عاصمة اليابان؟", answerEn: "Tokyo", answerAr: "طوكيو", category: "geography", difficulty: "easy", firstLetter: "T" },
  { questionEn: "Which ocean is the largest?", questionAr: "أي محيط هو الأكبر؟", answerEn: "Pacific Ocean", answerAr: "المحيط الهادئ", category: "geography", difficulty: "easy", firstLetter: "P" },
  { questionEn: "What mountain range separates Europe from Asia?", questionAr: "أي سلسلة جبال تفصل أوروبا عن آسيا؟", answerEn: "Ural Mountains", answerAr: "جبال الأورال", category: "geography", difficulty: "medium", firstLetter: "U" },
  { questionEn: "What is the capital of Brazil?", questionAr: "ما عاصمة البرازيل؟", answerEn: "Brasilia", answerAr: "برازيليا", category: "geography", difficulty: "medium", firstLetter: "B" },

  // === SPORTS (رياضة) ===
  { questionEn: "How many players are on a soccer team on the field?", questionAr: "كم عدد لاعبي كرة القدم في الملعب؟", answerEn: "11", answerAr: "11", category: "sports", difficulty: "easy", firstLetter: "E" },
  { questionEn: "In which sport would you perform a slam dunk?", questionAr: "في أي رياضة تؤدي تسديدة الغرزة؟", answerEn: "Basketball", answerAr: "كرة السلة", category: "sports", difficulty: "easy", firstLetter: "B" },
  { questionEn: "How many Grand Slam tournaments are in tennis?", questionAr: "كم عدد بطولات الغراند سلام في التنس؟", answerEn: "4", answerAr: "4", category: "sports", difficulty: "medium", firstLetter: "F" },
  { questionEn: "In which country were the 2016 Summer Olympics held?", questionAr: "في أي دولة أُقيمت الألعاب الأولمبية الصيفية 2016؟", answerEn: "Brazil", answerAr: "البرازيل", category: "sports", difficulty: "medium", firstLetter: "B" },
  { questionEn: "What sport uses a puck?", questionAr: "أي رياضة تستخدم القرص؟", answerEn: "Ice Hockey", answerAr: "هوكي الجليد", category: "sports", difficulty: "easy", firstLetter: "I" },
  { questionEn: "How many rings are on the Olympic flag?", questionAr: "كم عدد الحلقات على العلم الأولمبي؟", answerEn: "5", answerAr: "5", category: "sports", difficulty: "easy", firstLetter: "F" },
  { questionEn: "Which country has won the most FIFA World Cups?", questionAr: "أي دولة فازت بأكبر عدد من كؤوس العالم لكرة القدم؟", answerEn: "Brazil", answerAr: "البرازيل", category: "sports", difficulty: "medium", firstLetter: "B" },
  { questionEn: "What is the maximum score in a single game of bowling?", questionAr: "ما الحد الأقصى للنتيجة في لعبة البولينج؟", answerEn: "300", answerAr: "300", category: "sports", difficulty: "hard", firstLetter: "T" },
  { questionEn: "In golf, what is the term for one under par?", questionAr: "في الغولف، ما المصطلح الذي يعني ضربة أقل من المعيار؟", answerEn: "Birdie", answerAr: "بيردي", category: "sports", difficulty: "medium", firstLetter: "B" },
  { questionEn: "What sport is played at Wimbledon?", questionAr: "ما الرياضة التي تُلعب في ويمبلدون؟", answerEn: "Tennis", answerAr: "التنس", category: "sports", difficulty: "easy", firstLetter: "T" },

  // === TECHNOLOGY (تقنية) ===
  { questionEn: "What does CPU stand for?", questionAr: "ماذا تعني اختصار CPU؟", answerEn: "Central Processing Unit", answerAr: "وحدة المعالجة المركزية", category: "technology", difficulty: "easy", firstLetter: "C" },
  { questionEn: "Who founded Microsoft?", questionAr: "من أسس شركة مايكروسوفت؟", answerEn: "Bill Gates", answerAr: "بيل غيتس", category: "technology", difficulty: "easy", firstLetter: "B" },
  { questionEn: "What does HTML stand for?", questionAr: "ماذا يعني اختصار HTML؟", answerEn: "HyperText Markup Language", answerAr: "لغة ترميز النص التشعبي", category: "technology", difficulty: "medium", firstLetter: "H" },
  { questionEn: "In what year was the first iPhone released?", questionAr: "في أي عام صدر أول هاتف iPhone؟", answerEn: "2007", answerAr: "2007", category: "technology", difficulty: "medium", firstLetter: "T" },
  { questionEn: "What is the most widely used programming language?", questionAr: "ما أكثر لغات البرمجة استخداماً؟", answerEn: "JavaScript", answerAr: "جافاسكريبت", category: "technology", difficulty: "medium", firstLetter: "J" },
  { questionEn: "What company created the Android operating system?", questionAr: "أي شركة ابتكرت نظام تشغيل أندرويد؟", answerEn: "Google", answerAr: "غوغل", category: "technology", difficulty: "easy", firstLetter: "G" },
  { questionEn: "What does Wi-Fi stand for?", questionAr: "ماذا يعني مصطلح Wi-Fi؟", answerEn: "Wireless Fidelity", answerAr: "الاتصال اللاسلكي عالي الدقة", category: "technology", difficulty: "medium", firstLetter: "W" },
  { questionEn: "What is the name of the world's first computer bug?", questionAr: "ما اسم أول خطأ برمجي تم اكتشافه في العالم؟", answerEn: "Moth", answerAr: "عثة", category: "technology", difficulty: "hard", firstLetter: "M" },
  { questionEn: "What does URL stand for?", questionAr: "ماذا يعني اختصار URL؟", answerEn: "Uniform Resource Locator", answerAr: "محدد الموقع الموحد", category: "technology", difficulty: "medium", firstLetter: "U" },
  { questionEn: "Which company developed the PlayStation?", questionAr: "أي شركة طورت جهاز بلايستيشن؟", answerEn: "Sony", answerAr: "سوني", category: "technology", difficulty: "easy", firstLetter: "S" },

  // === CULTURE & ARTS (ثقافة وفنون) ===
  { questionEn: "Who painted the Mona Lisa?", questionAr: "من رسم لوحة الموناليزا؟", answerEn: "Leonardo da Vinci", answerAr: "ليوناردو دا فينشي", category: "culture", difficulty: "easy", firstLetter: "L" },
  { questionEn: "Which Shakespeare play features the character Hamlet?", questionAr: "في أي مسرحية لشكسبير يظهر شخصية هاملت؟", answerEn: "Hamlet", answerAr: "هاملت", category: "culture", difficulty: "easy", firstLetter: "H" },
  { questionEn: "What is the national instrument of Scotland?", questionAr: "ما الآلة الموسيقية الوطنية لاسكتلندا؟", answerEn: "Bagpipes", answerAr: "المزمار الاسكتلندي", category: "culture", difficulty: "medium", firstLetter: "B" },
  { questionEn: "Who wrote 'One Thousand and One Nights'?", questionAr: "من ألف 'ألف ليلة وليلة'؟", answerEn: "Unknown (anonymous)", answerAr: "مجهول", category: "culture", difficulty: "hard", firstLetter: "U" },
  { questionEn: "What art movement did Salvador Dalí belong to?", questionAr: "إلى أي حركة فنية انتمى سالفادور دالي؟", answerEn: "Surrealism", answerAr: "السريالية", category: "culture", difficulty: "medium", firstLetter: "S" },
  { questionEn: "Which country gifted the Statue of Liberty to the USA?", questionAr: "أي دولة أهدت تمثال الحرية للولايات المتحدة؟", answerEn: "France", answerAr: "فرنسا", category: "culture", difficulty: "medium", firstLetter: "F" },
  { questionEn: "In which city is the Louvre museum?", questionAr: "في أي مدينة يقع متحف اللوفر؟", answerEn: "Paris", answerAr: "باريس", category: "culture", difficulty: "easy", firstLetter: "P" },
  { questionEn: "What is the oldest university in the world?", questionAr: "ما أقدم جامعة في العالم؟", answerEn: "University of Bologna", answerAr: "جامعة بولونيا", category: "culture", difficulty: "hard", firstLetter: "U" },
  { questionEn: "Who wrote 'Don Quixote'?", questionAr: "من كتب رواية 'دون كيخوته'؟", answerEn: "Cervantes", answerAr: "ثيرفانتيس", category: "culture", difficulty: "medium", firstLetter: "C" },
  { questionEn: "What musical note comes after Sol (G) in solfège?", questionAr: "ما النغمة الموسيقية التي تأتي بعد صول في السلم الموسيقي؟", answerEn: "La (A)", answerAr: "لا", category: "culture", difficulty: "hard", firstLetter: "L" },
];

async function main() {
  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('demo1234', 10);
  
  const host = await prisma.host.upsert({
    where: { email: 'demo@hexgame.com' },
    update: {},
    create: {
      email: 'demo@hexgame.com',
      passwordHash,
      name: 'Demo Host',
    },
  });

  console.log(`✅ Created host: ${host.email}`);

  // Clear existing questions for this host
  await prisma.question.deleteMany({ where: { hostId: host.id } });

  for (const q of questions) {
    await prisma.question.create({
      data: {
        hostId: host.id,
        questionAr: q.questionAr,
        questionEn: q.questionEn,
        answerAr: q.answerAr,
        answerEn: q.answerEn,
        category: q.category,
        difficulty: q.difficulty,
        firstLetter: q.firstLetter,
      },
    });
  }

  console.log(`✅ Created ${questions.length} questions`);
  console.log('\n📋 Demo credentials:');
  console.log('   Email: demo@hexgame.com');
  console.log('   Password: demo1234');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
