/**
 * سجل مفاتيح الميزات الافتراضية.
 * كل مفتاح هنا يُنشأ تلقائيًا في جدول feature_flags عند أول تشغيل (seed)
 * ويمكن للأدمن تفعيله/تعطيله من لوحة التحكم في أي وقت دون تعديل الكود.
 *
 * key: المعرف الفريد المستخدم في الكود عبر featureFlagGuard('key')
 * label: الاسم الظاهر في لوحة التحكم
 * category: تجميع منطقي في واجهة الأدمن
 * default: القيمة الافتراضية عند أول إنشاء
 */
module.exports = [
  // المدفوعات
  { key: 'payment.cash', label: 'الدفع النقدي', category: 'payments', default: true },
  { key: 'payment.electronic', label: 'الدفع الإلكتروني', category: 'payments', default: true },
  { key: 'wallet.p2p_transfer', label: 'تحويل الرصيد بين محافظ الزبائن', category: 'wallet', default: true },
  { key: 'wallet.topup', label: 'شحن المحفظة', category: 'wallet', default: true },

  // الطلبات والتشغيل
  { key: 'orders.new_registrations', label: 'السماح بتسجيل حسابات جديدة', category: 'accounts', default: true },
  { key: 'orders.scheduled_orders', label: 'جدولة الطلبات لوقت لاحق', category: 'orders', default: true },
  { key: 'orders.dynamic_delivery_fee', label: 'رسوم توصيل ديناميكية (مسافة/ازدحام/طقس)', category: 'orders', default: false },

  // السائق
  { key: 'driver.heatmap', label: 'الخريطة الحرارية للطلب/الكثافة', category: 'driver', default: true },
  { key: 'driver.auto_assign', label: 'إسناد الطلبات تلقائيًا للسائق الأقرب', category: 'driver', default: true },

  // التسويق
  { key: 'marketing.home_banner', label: 'بانر الصفحة الرئيسية', category: 'marketing', default: true },
  { key: 'marketing.offers_page', label: 'صفحة العروض والإعلانات', category: 'marketing', default: true },
  { key: 'marketing.loyalty_points', label: 'نظام نقاط الولاء', category: 'marketing', default: false },

  // خاص بالسوق الليبي
  { key: 'libya.ramadan_mode', label: 'وضع رمضان/الأعياد (واجهات وعروض خاصة)', category: 'libya', default: false },
  { key: 'libya.offline_confirmation', label: 'تأكيد الطلب عبر SMS عند ضعف الشبكة', category: 'libya', default: false },
  { key: 'libya.reliability_score', label: 'تقييم الأمانة لتقليل الطلبات الوهمية', category: 'libya', default: true },

  // الأمان
  { key: 'security.ip_ban_check', label: 'فحص الحظر حسب IP', category: 'security', default: true },
  { key: 'security.phone_ban_check', label: 'فحص الحظر حسب رقم الهاتف', category: 'security', default: true },
];
