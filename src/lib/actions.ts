
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { Transaction, Withdrawal, User, Campaign, Article } from './db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const ADMIN_EMAIL = 'hagaaty@gmail.com';


// --- DATABASE SIMULATION ---

// This file simulates all database interactions to avoid the need for a live Vercel Postgres connection,
// which was causing runtime errors. The functions mimic the originals but return hardcoded mock data.
// This ensures the application is fully functional for demonstration and development without database dependencies.

// Helper function to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_USER: User = {
    id: '1c82831c-4b68-4e1a-9494-27a3c3b4a5f7',
    name: 'Hagaaty Admin',
    email: 'hagaaty@gmail.com',
    balance: 4.00,
    referral_earnings: 0.00,
    status: 'active'
};

let mockTransactions: Transaction[] = [
    { id: 'trans_1', user_id: MOCK_USER.id, amount: 4.00, description: 'Welcome Bonus', created_at: new Date().toISOString() }
];

let mockWithdrawals: Withdrawal[] = [];
let mockArticles: Article[] = [
    {
        id: 'art_172001',
        title: '5 أسرار لإعلانات جوجل الناجحة في 2024',
        content: '## مقدمة\n\nتعتبر إعلانات جوجل أداة قوية بشكل لا يصدق للشركات من جميع الأحجام. ولكن مع المنافسة الشديدة، كيف يمكنك التأكد من أن حملاتك تحقق أفضل النتائج الممكنة؟ في هذا المقال، سنكشف عن 5 أسرار أساسية لإتقان إعلانات جوجل.\n\n### 1. الكلمات المفتاحية الدقيقة\n\nبدلاً من استهداف كلمات مفتاحية عامة وواسعة، ركز على الكلمات المفتاحية طويلة الذيل (Long-tail keywords) التي تظهر نية شراء واضحة. هذا يقلل من التكلفة ويزيد من معدلات التحويل.\n\n### 2. صفحات هبوط مخصصة\n\nلا ترسل كل الزوار إلى صفحتك الرئيسية. قم بإنشاء صفحات هبوط مخصصة لكل مجموعة إعلانية تتوافق مع رسالة الإعلان وتقدم دعوة واضحة لاتخاذ إجراء (CTA).\n\n### 3. استخدام الإضافات الإعلانية (Ad Extensions)\n\nالإضافات مثل روابط الموقع، والمقتطفات، وإضافات المكالمات تزيد من مساحة إعلانك على صفحة النتائج وتوفر معلومات إضافية للمستخدمين، مما يزيد من نسبة النقر إلى الظهور (CTR).\n\n### 4. اختبار A/B المستمر\n\nلا تتوقف أبدًا عن الاختبار. قم بتجربة عناوين مختلفة، ونصوص إعلانية، ودعوات لاتخاذ إجراء. حتى التغييرات الطفيفة يمكن أن تحدث فرقًا كبيرًا في الأداء.\n\n### 5. تتبع التحويلات بدقة\n\nإذا كنت لا تتبع التحويلات، فأنت تهدر أموالك. تأكد من إعداد تتبع التحويلات بدقة لقياس عائد الاستثمار (ROI) وتحسين حملاتك بناءً على البيانات الفعلية.',
        html_content: '<h1>5 أسرار لإعلانات جوجل الناجحة في 2024</h1><h2>مقدمة</h2><p>تعتبر إعلانات جوجل أداة قوية بشكل لا يصدق للشركات من جميع الأحجام. ولكن مع المنافسة الشديدة، كيف يمكنك التأكد من أن حملاتك تحقق أفضل النتائج الممكنة؟ في هذا المقال، سنكشف عن 5 أسرار أساسية لإتقان إعلانات جوجل.</p><h3>1. الكلمات المفتاحية الدقيقة</h3><p>بدلاً من استهداف كلمات مفتاحية عامة وواسعة، ركز على الكلمات المفتاحية طويلة الذيل (Long-tail keywords) التي تظهر نية شراء واضحة. هذا يقلل من التكلفة ويزيد من معدلات التحويل.</p><h3>2. صفحات هبوط مخصصة</h3><p>لا ترسل كل الزوار إلى صفحتك الرئيسية. قم بإنشاء صفحات هبوط مخصصة لكل مجموعة إعلانية تتوافق مع رسالة الإعلان وتقدم دعوة واضحة لاتخاذ إجراء (CTA).</p><h3>3. استخدام الإضافات الإعلانية (Ad Extensions)</h3><p>الإضافات مثل روابط الموقع، والمقتطفات، وإضافات المكالمات تزيد من مساحة إعلانك على صفحة النتائج وتوفر معلومات إضافية للمستخدمين، مما يزيد من نسبة النقر إلى الظهور (CTR).</p><h3>4. اختبار A/B المستمر</h3><p>لا تتوقف أبدًا عن الاختبار. قم بتجربة عناوين مختلفة، ونصوص إعلانية، ودعوات لاتخاذ إجراء. حتى التغييرات الطفيفة يمكن أن تحدث فرقًا كبيرًا في الأداء.</p><h3>5. تتبع التحويلات بدقة</h3><p>إذا كنت لا تتبع التحويلات، فأنت تهدر أموالك. تأكد من إعداد تتبع التحويلات بدقة لقياس عائد الاستثمار (ROI) وتحسين حملاتك بناءً على البيانات الفعلية.</p>',
        keywords: 'إعلانات جوجل, تسويق رقمي, تحسين محركات البحث, كلمات مفتاحية',
        slug: '5-secrets-for-successful-google-ads-in-2024',
        status: 'published',
        created_at: new Date('2024-07-05T10:00:00Z')
    },
    {
        id: 'art_172002',
        title: 'كيف يغير الذكاء الاصطناعي مستقبل التسويق الرقمي؟',
        content: '## ثورة الذكاء الاصطناعي\n\nلم يعد الذكاء الاصطناعي (AI) مجرد مفهوم في أفلام الخيال العلمي. إنه الآن جزء لا يتجزأ من حياتنا اليومية، ويقود ثورة في عالم التسويق الرقمي. من تخصيص تجارب العملاء إلى أتمتة المهام المعقدة، يفتح الذكاء الاصطناعي آفاقًا جديدة للمسوقين.\n\n### التخصيص الفائق (Hyper-Personalization)\n\nيمكن للذكاء الاصطناعي تحليل كميات هائلة من بيانات المستخدم لتقديم رسائل وعروض مخصصة لكل فرد على حدة. هذا يؤدي إلى زيادة التفاعل والولاء للعلامة التجارية.\n\n### إنشاء المحتوى المؤتمت\n\nأدوات مثل GPT-4 يمكنها الآن كتابة نصوص إعلانية، ومقالات مدونات، ومنشورات لوسائل التواصل الاجتماعي بجودة عالية، مما يوفر الوقت والجهد للمسوقين للتركيز على الاستراتيجية.\n\n### التحليلات التنبؤية\n\nبدلاً من النظر إلى ما حدث في الماضي، يمكن للذكاء الاصطناعي التنبؤ بالاتجاهات المستقبلية وسلوك العملاء، مما يسمح للشركات باتخاذ قرارات استباقية وتحسين استراتيجياتها التسويقية بشكل مستمر.\n\n### خاتمة\n\nالشركات التي تتبنى الذكاء الاصطناعي في استراتيجياتها التسويقية اليوم هي التي ستقود السوق غدًا. إنها ليست مجرد ميزة تنافسية، بل ضرورة للبقاء والنمو.',
        html_content: '<h1>كيف يغير الذكاء الاصطناعي مستقبل التسويق الرقمي؟</h1><h2>ثورة الذكاء الاصطناعي</h2><p>لم يعد الذكاء الاصطناعي (AI) مجرد مفهوم في أفلام الخيال العلمي. إنه الآن جزء لا يتجزأ من حياتنا اليومية، ويقود ثورة في عالم التسويق الرقمي. من تخصيص تجارب العملاء إلى أتمتة المهام المعقدة، يفتح الذكاء الاصطناعي آفاقًا جديدة للمسوقين.</p><h3>التخصيص الفائق (Hyper-Personalization)</h3><p>يمكن للذكاء الاصطناعي تحليل كميات هائلة من بيانات المستخدم لتقديم رسائل وعروض مخصصة لكل فرد على حدة. هذا يؤدي إلى زيادة التفاعل والولاء للعلامة التجارية.</p><h3>إنشاء المحتوى المؤتمت</h3><p>أدوات مثل GPT-4 يمكنها الآن كتابة نصوص إعلانية، ومقالات مدونات، ومنشورات لوسائل التواصل الاجتماعي بجودة عالية، مما يوفر الوقت والجهد للمسوقين للتركيز على الاستراتيجية.</p><h3>التحليلات التنبؤية</h3><p>بدلاً من النظر إلى ما حدث في الماضي، يمكن للذكاء الاصطناعي التنبؤ بالاتجاهات المستقبلية وسلوك العملاء، مما يسمح للشركات باتخاذ قرارات استباقية وتحسين استراتيجياتها التسويقية بشكل مستمر.</p><h3>خاتمة</h3><p>الشركات التي تتبنى الذكاء الاصطناعي في استراتيجياتها التسويقية اليوم هي التي ستقود السوق غدًا. إنها ليست مجرد ميزة تنافسية، بل ضرورة للبقاء والنمو.</p>',
        keywords: 'الذكاء الاصطناعي, التسويق الرقمي, أتمتة التسويق, تحليلات تنبؤية',
        slug: 'how-ai-is-changing-digital-marketing',
        status: 'published',
        created_at: new Date('2024-07-04T14:30:00Z')
    },
    {
        id: 'art_172003',
        title: 'دليلك الكامل لتحسين محركات البحث (SEO) للمبتدئين',
        content: '## ما هو SEO؟\n\nتحسين محركات البحث (SEO) هو عملية تحسين موقعك الإلكتروني ليظهر في أعلى نتائج البحث المجانية على محركات البحث مثل جوجل. الهدف هو زيادة عدد الزوار وجودتهم إلى موقعك.\n\n### أساسيات SEO\n\n1.  **SEO على الصفحة (On-Page SEO):** يشمل كل ما يمكنك التحكم فيه مباشرة على موقعك، مثل جودة المحتوى، واستخدام الكلمات المفتاحية في العناوين والنصوص، وتحسين الصور، وسرعة تحميل الصفحة.\n2.  **SEO خارج الصفحة (Off-Page SEO):** يركز على بناء سلطة موقعك على الإنترنت من خلال الحصول على روابط خلفية (Backlinks) من مواقع أخرى موثوقة.\n3.  **SEO التقني (Technical SEO):** يتأكد من أن محركات البحث يمكنها الزحف إلى موقعك وفهرسته بسهولة. يشمل ذلك ملفات `robots.txt`، وخرائط الموقع (Sitemaps)، وبيانات المخطط (Schema markup).\n\n### نصائح للبدء\n\n-   **ابحث عن الكلمات المفتاحية:** استخدم أدوات مثل Google Keyword Planner للعثور على الكلمات التي يبحث عنها جمهورك.\n-   **أنشئ محتوى عالي الجودة:** قدم قيمة حقيقية لقرائك. أجب عن أسئلتهم وحل مشاكلهم.\n-   **اجعل موقعك متوافقًا مع الجوال:** معظم عمليات البحث تتم الآن عبر الهواتف المحمولة، لذا تأكد من أن موقعك يبدو ويعمل بشكل رائع على جميع الشاشات.',
        html_content: '<h1>دليلك الكامل لتحسين محركات البحث (SEO) للمبتدئين</h1><h2>ما هو SEO؟</h2><p>تحسين محركات البحث (SEO) هو عملية تحسين موقعك الإلكتروني ليظهر في أعلى نتائج البحث المجانية على محركات البحث مثل جوجل. الهدف هو زيادة عدد الزوار وجودتهم إلى موقعك.</p><h3>أساسيات SEO</h3><ol><li><strong>SEO على الصفحة (On-Page SEO):</strong> يشمل كل ما يمكنك التحكم فيه مباشرة على موقعك، مثل جودة المحتوى، واستخدام الكلمات المفتاحية في العناوين والنصوص، وتحسين الصور، وسرعة تحميل الصفحة.</li><li><strong>SEO خارج الصفحة (Off-Page SEO):</strong> يركز على بناء سلطة موقعك على الإنترنت من خلال الحصول على روابط خلفية (Backlinks) من مواقع أخرى موثوقة.</li><li><strong>SEO التقني (Technical SEO):</strong> يتأكد من أن محركات البحث يمكنها الزحف إلى موقعك وفهرسته بسهولة. يشمل ذلك ملفات `robots.txt`، وخرائط الموقع (Sitemaps)، وبيانات المخطط (Schema markup).</li></ol><h3>نصائح للبدء</h3><ul><li><strong>ابحث عن الكلمات المفتاحية:</strong> استخدم أدوات مثل Google Keyword Planner للعثور على الكلمات التي يبحث عنها جمهورك.</li><li><strong>أنشئ محتوى عالي الجودة:</strong> قدم قيمة حقيقية لقرائك. أجب عن أسئلتهم وحل مشاكلهم.</li><li><strong>اجعل موقعك متوافقًا مع الجوال:</strong> معظم عمليات البحث تتم الآن عبر الهواتف المحمولة، لذا تأكد من أن موقعك يبدو ويعمل بشكل رائع على جميع الشاشات.</li></ul>',
        keywords: 'SEO, تحسين محركات البحث, تسويق المحتوى, روابط خلفية',
        slug: 'complete-guide-to-seo-for-beginners',
        status: 'published',
        created_at: new Date('2024-07-03T09:00:00Z')
    },
    {
        id: 'art_172004',
        title: '7 طرق لاستخدام وسائل التواصل الاجتماعي لزيادة المبيعات',
        content: '## قوة وسائل التواصل الاجتماعي\n\nلم تعد وسائل التواصل الاجتماعي مجرد مكان للتواصل مع الأصدقاء، بل أصبحت أداة تسويقية قوية يمكنها دفع المبيعات بشكل مباشر. إليك 7 طرق فعالة لتحقيق ذلك.\n\n1.  **التسويق عبر المؤثرين:** تعاون مع مؤثرين في مجالك للوصول إلى جمهور جديد وموثوق.\n2.  **الإعلانات المستهدفة:** استخدم بيانات فيسبوك وإنستغرام الدقيقة لاستهداف العملاء المحتملين بناءً على اهتماماتهم وسلوكهم.\n3.  **المحتوى الذي ينشئه المستخدم (UGC):** شجع عملائك على مشاركة صورهم وتجاربهم مع منتجاتك. هذا يبني الثقة والمصداقية.\n4.  **المسابقات والهدايا:** تعتبر طريقة رائعة لزيادة التفاعل والوعي بالعلامة التجارية وجمع بيانات العملاء المحتملين.\n5.  **التجارة الاجتماعية (Social Commerce):** اسمح للعملاء بالشراء مباشرة من منصات مثل فيسبوك شوب وإنستغرام شوبينج لتقليل خطوات عملية الشراء.\n6.  **بناء مجتمع:** قم بإنشاء مجموعة حصرية على فيسبوك أو قناة على تيليجرام لعملائك لتعزيز الولاء وتقديم عروض خاصة.\n7.  **خدمة العملاء الفورية:** استخدم وسائل التواصل الاجتماعي للرد بسرعة على استفسارات العملاء وحل مشاكلهم، مما يحسن من سمعة علامتك التجارية.',
        html_content: '<h1>7 طرق لاستخدام وسائل التواصل الاجتماعي لزيادة المبيعات</h1><h2>قوة وسائل التواصل الاجتماعي</h2><p>لم تعد وسائل التواصل الاجتماعي مجرد مكان للتواصل مع الأصدقاء، بل أصبحت أداة تسويقية قوية يمكنها دفع المبيعات بشكل مباشر. إليك 7 طرق فعالة لتحقيق ذلك.</p><ol><li><strong>التسويق عبر المؤثرين:</strong> تعاون مع مؤثرين في مجالك للوصول إلى جمهور جديد وموثوق.</li><li><strong>الإعلانات المستهدفة:</strong> استخدم بيانات فيسبوك وإنستغرام الدقيقة لاستهداف العملاء المحتملين بناءً على اهتماماتهم وسلوكهم.</li><li><strong>المحتوى الذي ينشئه المستخدم (UGC):</strong> شجع عملائك على مشاركة صورهم وتجاربهم مع منتجاتك. هذا يبني الثقة والمصداقية.</li><li><strong>المسابقات والهدايا:</strong> تعتبر طريقة رائعة لزيادة التفاعل والوعي بالعلامة التجارية وجمع بيانات العملاء المحتملين.</li><li><strong>التجارة الاجتماعية (Social Commerce):</strong> اسمح للعملاء بالشراء مباشرة من منصات مثل فيسبوك شوب وإنستغرام شوبينج لتقليل خطوات عملية الشراء.</li><li><strong>بناء مجتمع:</strong> قم بإنشاء مجموعة حصرية على فيسبوك أو قناة على تيليجرام لعملائك لتعزيز الولاء وتقديم عروض خاصة.</li><li><strong>خدمة العملاء الفورية:</strong> استخدم وسائل التواصل الاجتماعي للرد بسرعة على استفسارات العملاء وحل مشاكلهم، مما يحسن من سمعة علامتك التجارية.</li></ol>',
        keywords: 'تسويق عبر وسائل التواصل الاجتماعي, زيادة المبيعات, فيسبوك, انستغرام',
        slug: '7-ways-to-use-social-media-for-sales',
        status: 'published',
        created_at: new Date('2024-07-02T11:45:00Z')
    },
    {
        id: 'art_172005',
        title: 'قياس عائد الاستثمار (ROI) في حملاتك التسويقية الرقمية',
        content: '## لماذا قياس ROI مهم؟\n\nقياس عائد الاستثمار (ROI) هو المقياس الأكثر أهمية في التسويق. إنه يخبرك بما إذا كانت جهودك التسويقية تحقق ربحًا أم لا. بدون قياس ROI، أنت تعمل في الظلام.\n\n### كيفية حساب ROI\n\nالمعادلة الأساسية بسيطة:\n\n`ROI = (صافي الربح - تكلفة التسويق) / تكلفة التسويق`\n\nعلى سبيل المثال، إذا أنفقت 1000 دولار على حملة إعلانية وحققت مبيعات بقيمة 5000 دولار (بصافي ربح 2500 دولار)، فإن عائد الاستثمار الخاص بك هو:\n\n`(2500 - 1000) / 1000 = 1.5` أو `150%`.\n\n### أدوات لتتبع ROI\n\n-   **Google Analytics:** أداة مجانية وقوية لتتبع سلوك المستخدمين والتحويلات على موقعك.\n-   **Facebook Pixel:** ضروري لتتبع فعالية إعلاناتك على فيسبوك وإنستغرام.\n-   **أنظمة CRM:** تساعدك على تتبع رحلة العميل بأكملها من العميل المحتمل إلى العميل الفعلي.\n\n### خاتمة\n\nركز على المقاييس التي تهم حقًا. قد تكون مرات الظهور والنقرات جيدة، لكن التحويلات والمبيعات هي التي تدفع نمو عملك. اجعل قياس ROI جزءًا أساسيًا من روتينك التسويقي.',
        html_content: '<h1>قياس عائد الاستثمار (ROI) في حملاتك التسويقية الرقمية</h1><h2>لماذا قياس ROI مهم؟</h2><p>قياس عائد الاستثمار (ROI) هو المقياس الأكثر أهمية في التسويق. إنه يخبرك بما إذا كانت جهودك التسويقية تحقق ربحًا أم لا. بدون قياس ROI، أنت تعمل في الظلام.</p><h3>كيفية حساب ROI</h3><p>المعادلة الأساسية بسيطة:</p><p><code>ROI = (صافي الربح - تكلفة التسويق) / تكلفة التسويق</code></p><p>على سبيل المثال، إذا أنفقت 1000 دولار على حملة إعلانية وحققت مبيعات بقيمة 5000 دولار (بصافي ربح 2500 دولار)، فإن عائد الاستثمار الخاص بك هو:</p><p><code>(2500 - 1000) / 1000 = 1.5</code> أو <code>150%</code>.</p><h3>أدوات لتتبع ROI</h3><ul><li><strong>Google Analytics:</strong> أداة مجانية وقوية لتتبع سلوك المستخدمين والتحويلات على موقعك.</li><li><strong>Facebook Pixel:</strong> ضروري لتتبع فعالية إعلاناتك على فيسبوك وإنستغرام.</li><li><strong>أنظمة CRM:</strong> تساعدك على تتبع رحلة العميل بأكملها من العميل المحتمل إلى العميل الفعلي.</li></ul><h3>خاتمة</h3><p>ركز على المقاييس التي تهم حقًا. قد تكون مرات الظهور والنقرات جيدة، لكن التحويلات والمبيعات هي التي تدفع نمو عملك. اجعل قياس ROI جزءًا أساسيًا من روتينك التسويقي.</p>',
        keywords: 'ROI, عائد الاستثمار, تسويق رقمي, تحليلات',
        slug: 'measuring-roi-in-digital-marketing',
        status: 'published',
        created_at: new Date('2024-07-01T16:00:00Z')
    }
];
let mockCampaigns: Campaign[] = [];

export async function getFinancials() {
    await delay(300);
    console.log("SIMULATING: getFinancials");
    return {
        balance: MOCK_USER.balance,
        referralEarnings: MOCK_USER.referral_earnings,
        transactions: [...mockTransactions],
        withdrawals: [...mockWithdrawals],
    };
}

export async function addTransaction(userId: string, amount: number, description: string) {
    await delay(200);
    console.log("SIMULATING: addTransaction", { userId, amount, description });
    
    if (userId !== MOCK_USER.id) throw new Error("User not found");

    MOCK_USER.balance += amount;
    mockTransactions.push({
        id: `trans_${Date.now()}`,
        user_id: userId,
        amount,
        description,
        created_at: new Date().toISOString()
    });

    revalidatePath('/dashboard/financials');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function requestWithdrawal(amount: number, phoneNumber: string) {
    await delay(500);
    console.log("SIMULATING: requestWithdrawal", { amount, phoneNumber });

    if (amount > MOCK_USER.referral_earnings) {
        throw new Error('Withdrawal amount cannot exceed your available referral earnings.');
    }
    if(amount <= 0) {
        throw new Error('Invalid withdrawal amount.');
    }

    MOCK_USER.referral_earnings -= amount;

    const newWithdrawal: Withdrawal = {
        id: `wd_${Date.now()}`,
        user_id: MOCK_USER.id,
        user_name: MOCK_USER.name,
        amount,
        phone_number: phoneNumber,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    mockWithdrawals.push(newWithdrawal);
    
    if (resend) {
        try {
            await resend.emails.send({
                from: `Hagaaty <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
                to: ADMIN_EMAIL,
                subject: 'New Withdrawal Request',
                html: `
                    <h1>New Withdrawal Request</h1>
                    <p>User <strong>${MOCK_USER.name} (${MOCK_USER.email})</strong> has requested a withdrawal.</p>
                    <ul>
                        <li>Amount: <strong>$${amount.toFixed(2)}</strong></li>
                        <li>Vodafone Cash Number: <strong>${phoneNumber}</strong></li>
                    </ul>
                    <p>Please process this payment manually and mark it as completed in the admin dashboard.</p>
                `
            });
            console.log("SIMULATING: Withdrawal request email sent to admin.");
        } catch (error) {
            console.error("Failed to send withdrawal email:", error);
        }
    } else {
         console.log(`
--- SIMULATED EMAIL ---
        To: ${ADMIN_EMAIL}
        Subject: New Withdrawal Request
        Body: User ${MOCK_USER.name} requested $${amount.toFixed(2)} to phone ${phoneNumber}.
        -----------------------
`);
    }

    revalidatePath('/dashboard/financials');
    revalidatePath('/dashboard/admin');
}

export async function sendManualTopUpNotification(method: string, amount: number, userId: string, userName: string, userEmail: string) {
    if (!resend) {
        console.warn("Resend is not configured. Skipping email notification.");
        return;
    }

    // This creates a unique token for the confirmation link
    const confirmationToken = `${userId}-${amount}-${Date.now()}`;

    // For a real app, this URL should point to a deployed API route.
    // For this simulation, we'll just log it. The functionality is illustrative.
    const confirmationUrl = `https://your-app-domain.vercel.app/api/confirm-payment?token=${confirmationToken}`;

    try {
        await resend.emails.send({
            from: `Hagaaty <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
            to: ADMIN_EMAIL,
            subject: `Manual Top-Up Action Required: $${amount} via ${method}`,
            html: `
                <h1>Manual Top-Up Awaiting Confirmation</h1>
                <p>User <strong>${userName} (${userEmail})</strong> has reported a manual payment.</p>
                <ul>
                    <li>Amount: <strong>$${amount.toFixed(2)}</strong></li>
                    <li>Method: <strong>${method}</strong></li>
                </ul>
                <p>After you have verified the payment from your end (e.g., in your Vodafone Cash or Binance account), click the button below to credit the user's account automatically.</p>
                <a href="${confirmationUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm & Credit $${amount.toFixed(2)}</a>
                <p style="font-size: 12px; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser: ${confirmationUrl}</p>
                <p style="font-size: 12px;">This is a simulated action. In a real app, clicking the link would trigger a secure API endpoint to credit the user.</p>
            `,
        });
        console.log("SIMULATING: Manual top-up notification email with confirmation link sent to admin.");
    } catch (error) {
        console.error("Failed to send manual top-up notification email:", error);
        throw new Error("Could not send notification email.");
    }
}


const supportTicketSchema = z.object({
  subject: z.string(),
  message: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
});

export async function sendSupportTicket(data: z.infer<typeof supportTicketSchema>) {
    const { subject, message, userName, userEmail } = supportTicketSchema.parse(data);

    if (!resend) {
        console.warn("Resend is not configured. Simulating support ticket email.");
        await delay(500);
        console.log(`
--- SIMULATED SUPPORT EMAIL ---
        To: ${ADMIN_EMAIL}
        Reply-To: ${userEmail}
        Subject: [Support Ticket] ${subject}
        
        From: ${userName} (${userEmail})
        
        Message:
        ${message}
        -----------------------
`);
        return { success: true };
    }

    try {
        await resend.emails.send({
            from: `Hagaaty Support <support@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
            to: ADMIN_EMAIL,
            reply_to: userEmail,
            subject: `[Support Ticket] ${subject}`,
            html: `
                <h1>New Support Ticket</h1>
                <p><strong>From:</strong> ${userName} (${userEmail})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send support ticket email:", error);
        throw new Error("Could not send support ticket.");
    }
}


export async function processWithdrawal(withdrawalId: string) {
    await delay(300);
    console.log("SIMULATING: processWithdrawal", { withdrawalId });

    const withdrawal = mockWithdrawals.find(w => w.id === withdrawalId);
    if (withdrawal) {
        withdrawal.status = 'completed';
        withdrawal.updated_at = new Date().toISOString();
        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/financials');
    } else {
        throw new Error("Withdrawal not found or already processed.");
    }
}

// --- Admin Functions ---
export async function getAdminDashboardData() {
    await delay(400);
    console.log("SIMULATING: getAdminDashboardData");
    return {
        users: [MOCK_USER],
        campaigns: [...mockCampaigns],
        pendingWithdrawals: mockWithdrawals.filter(w => w.status === 'pending'),
    };
}

export async function toggleUserStatus(userId: string, currentStatus: 'active' | 'suspended') {
  await delay(150);
  console.log("SIMULATING: toggleUserStatus", { userId });
  if (userId === MOCK_USER.id) {
    MOCK_USER.status = currentStatus === 'active' ? 'suspended' : 'active';
  }
  revalidatePath('/dashboard/admin');
}

export async function addUserBalance(userId: string, amount: number) {
    console.log("SIMULATING: addUserBalance", { userId, amount });
    const description = `Admin manual credit: $${amount.toFixed(2)}`;
    await addTransaction(userId, amount, description);

    revalidatePath('/dashboard/admin');
    
    // Send email notification to user
    const user = MOCK_USER; // In real app, find user by ID
     if (resend && user) {
        try {
            await resend.emails.send({
                from: `Hagaaty <noreply@${process.env.RESEND_DOMAIN || 'resend.dev'}>`,
                to: user.email,
                subject: 'Your Account Has Been Credited',
                html: `
                    <h1>Balance Update</h1>
                    <p>Hello ${user.name},</p>
                    <p>Your account has been credited with <strong>$${amount.toFixed(2)}</strong>.</p>
                    <p>Your new balance is <strong>${(user.balance).toFixed(2)}</strong>.</p>
                    <p>Thank you for using Hagaaty!</p>
                `
            });
        } catch (error) {
            console.error("Failed to send balance update email:", error);
        }
    }
}

export async function toggleCampaignStatus(campaignId: string, currentStatus: 'active' | 'paused') {
    await delay(150);
    console.log("SIMULATING: toggleCampaignStatus", { campaignId });
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    if(campaign) {
        campaign.status = currentStatus === 'active' ? 'paused' : 'active';
    }
    revalidatePath('/dashboard/admin');
}

// --- Article Functions ---
function createSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

const ArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  html_content: z.string(),
  keywords: z.string(),
});

export async function saveArticle(articleData: z.infer<typeof ArticleSchema>) {
    await delay(200);
    const validatedData = ArticleSchema.parse(articleData);
    const slug = createSlug(validatedData.title);
    
    const existingIndex = mockArticles.findIndex(a => a.slug === slug);
    const newArticle: Article = {
        id: `art_${Date.now()}`,
        ...validatedData,
        slug,
        status: 'draft',
        created_at: new Date()
    };

    if (existingIndex > -1) {
        mockArticles[existingIndex] = { ...mockArticles[existingIndex], ...newArticle, id: mockArticles[existingIndex].id };
    } else {
        mockArticles.push(newArticle);
    }
    
    console.log('SIMULATING: Article saved successfully.', newArticle);
    revalidatePath('/dashboard/admin/articles');
}

export async function getArticles(): Promise<Article[]> {
  await delay(100);
  console.log("SIMULATING: getArticles");
  return [...mockArticles].sort((a,b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function getPublishedArticles(): Promise<Article[]> {
  await delay(100);
  console.log("SIMULATING: getPublishedArticles");
  return mockArticles.filter(a => a.status === 'published').sort((a,b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  await delay(50);
  console.log("SIMULATING: getArticleBySlug", { slug });
  const article = mockArticles.find(a => a.slug === slug && a.status === 'published');
  return article || null;
}

export async function publishArticle(id: string) {
  await delay(150);
  console.log("SIMULATING: publishArticle", { id });
  const article = mockArticles.find(a => a.id === id);
  if (article) {
    article.status = 'published';
    revalidatePath('/dashboard/admin/articles');
    revalidatePath('/blog');
    revalidatePath(`/blog/${article.slug}`);
  }
}

export async function deleteArticle(id: string) {
  await delay(150);
  console.log("SIMULATING: deleteArticle", { id });
  mockArticles = mockArticles.filter(a => a.id !== id);
  revalidatePath('/dashboard/admin/articles');
  revalidatePath('/blog');
}

    