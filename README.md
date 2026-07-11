# منصة فلاش (Flash Platform) — توصيل طعام للسوق الليبي

منصة متكاملة قابلة للتوسع تتضمن 3 تطبيقات + لوحة تحكم إدارية + خادم واحد (API) يخدم الجميع.

## المكونات
| المكون | الوصف | المسار |
|---|---|---|
| **Flash Eat** | تطبيق الزبون (طلب، محفظة، تحويل رصيد، عروض) | `apps/flash-eat-customer` |
| **Flash Man** | تطبيق السائق (طلبات، خريطة حرارية، أرباح) | `apps/flash-man-driver` |
| **Flash Restaurant** | تطبيق/بوابة المطعم (استقبال طلبات، قائمة الطعام) | `apps/flash-restaurant` |
| **Admin Dashboard** | لوحة تحكم الأدمن (كل شيء يُدار يدويًا من هنا) | `admin-dashboard` |
| **Backend API** | الخادم المركزي (Node.js + Express + PostgreSQL + Socket.IO) | `backend` |

## الفكرة الأساسية: "كل شيء قابل للتحكم اليدوي"
كل ميزة في المنصّة (الدفع الإلكتروني، الدفع النقدي، التسجيل الجديد، البانر، صفحة العروض، الخريطة الحرارية، التحويل بين المحافظ...) لها **مفتاح تفعيل/تعطيل** مخزّن في جدول `feature_flags` يتحكم به الأدمن مباشرة من لوحة التحكم دون الحاجة لإصدار تحديث أو لمس الكود. راجع:
- `backend/src/config/featureFlags.js`
- `backend/src/middleware/featureFlagGuard.js`

## أبرز الميزات المُنفّذة
1. **محفظة رقمية + تحويل بين الزبائن** (`walletService.js`, `walletController.js`)
2. **دفع نقدي وإلكتروني** مع إمكانية **حظر وسيلة دفع معيّنة يدويًا لأي حساب** (`PaymentMethodBlock` model)
3. **حظر الحسابات حسب رقم الهاتف أو عنوان IP** (`Ban` model + `checkBan.js` middleware)
4. **خريطة حرارية لطلبات/كثافة السائقين** (`heatmapService.js` + `heatmapController.js`)
5. **بانر إعلاني أعلى الصفحة الرئيسية + صفحة عروض/إعلانات منفصلة** (`Banner`, `Offer` models)
6. **نظام صلاحيات أدمن كامل** لإدارة كل ما سبق
7. ميزات إضافية اقترحتها لملاءمة السوق الليبي (انظر `docs/LIBYA_FEATURES.md`):
   - دعم عملة الدينار الليبي (LYD) كافتراضي + دعم عدة عملات
   - نظام "نقاط ولاء" قابل للتفعيل/الإيقاف
   - وضع "أوفلاين/ضعف الشبكة" لتأكيد الطلب عبر SMS/USSD لاحقًا
   - تقييم الأمانة (Reliability Score) للسائق والزبون لتقليل الطلبات الوهمية
   - رسوم توصيل ديناميكية حسب المسافة/الطقس/الازدحام (كل عامل قابل للتفعيل بمفتاح منفصل)
   - "وضع الصيام/الأعياد" لتفعيل واجهات وعروض خاصة تلقائيًا أو يدويًا

## التشغيل السريع
```bash
# 1) الخادم
cd backend
cp .env.example .env
npm install
npm run migrate   # ينشئ الجداول
npm run seed       # بيانات تجريبية + مفاتيح الميزات الافتراضية
npm run dev

# 2) لوحة التحكم
cd ../admin-dashboard
npm install
npm run dev

# 3) التطبيقات (React Native / Expo)
cd ../apps/flash-eat-customer && npm install && npm start
cd ../apps/flash-man-driver && npm install && npm start
cd ../apps/flash-restaurant && npm install && npm start
```

## البنية التقنية
- **Backend**: Node.js, Express, PostgreSQL (Sequelize ORM), Redis (كاش + طوابير)، Socket.IO (تتبّع حي)، JWT auth.
- **Apps**: React Native (Expo) — كود مشترك قابل لإعادة الاستخدام بين التطبيقات الثلاثة عبر حزمة داخلية (`packages/shared` يُقترح إضافتها لاحقًا لتقليل التكرار).
- **Admin Dashboard**: React + Vite + TailwindCSS.
- **قابلية التوسع**: طبقة `services/` منفصلة عن `controllers/`، فصل واضح للنماذج، تصميم متعدد المدن (`city_id` في الطلبات والمطاعم) وتعدد العملات جاهز من البداية.

## هيكلة GitHub
المستودع منظم كـ **Monorepo** بمجلد لكل تطبيق + خادم واحد، مع `.github/workflows/ci.yml` لفحص البناء تلقائيًا عند كل Push. يمكن فصل كل مجلد لاحقًا إلى مستودع مستقل دون تعديل المنطق الداخلي.

راجع `docs/ARCHITECTURE.md` لتفاصيل قاعدة البيانات والـ API الكاملة.
