# PWA Web Push (عربي مبسّط)

## المتطلبات
- استضافة HTTPS (مثلاً: Netlify / GitHub Pages / Cloudflare Pages).
- iPhone بنظام iOS 16.4 أو أحدث.
- فتح الموقع في Safari → إضافة إلى الشاشة الرئيسية.

## الملفات
- pwa-index.html — صفحتك مع دعم PWA + زر تفعيل Web Push.
- manifest.webmanifest — مانيفست PWA.
- service-worker.js — عامل الخدمة (Service Worker) لتلقي Web Push.
- icons/ — أيقونات التطبيق (مع maskable).
- server/send-test.js — سكربت Node لإرسال تنبيه Push للاختبار.
- server/subscription.json — ضع فيه اشتراك الجهاز (انسخه من Console).
- .env.example — ضع مفاتيح VAPID هنا.

## خطوات النشر
1) ارفع مجلد `pwa/` كله إلى استضافة HTTPS.
2) افتح رابط `pwa-index.html` في Safari على الآيفون.
3) من Safari: Share → Add to Home Screen.
4) افتح الأيقونة من الشاشة الرئيسية.
5) اضغط زر "تفعيل إشعارات Web Push" واسمح بالتنبيهات.
6) من Console انسخ JSON الاشتراك والصقه في `server/subscription.json`.

## توليد مفاتيح VAPID (مرة واحدة)
على جهازك (Node):
```bash
npm i web-push dotenv
node -e "const webpush=require('web-push'); const v=webpush.generateVAPIDKeys(); console.log(v)"
```
انسخ `publicKey` إلى `VAPID_PUBLIC_KEY` داخل `pwa-index.html`،
وانسخ `privateKey` و `publicKey` إلى ملف `.env` في مجلد `server`.

## إرسال إشعار اختبار
داخل مجلد `server/`:
```bash
node send-test.js
```
سيحاول إرسال Push باستخدام `subscription.json` و مفاتيح VAPID من `.env`.

> تذكير: الصوت يعمل عندما تكون واجهة التطبيق مفتوحة. عند وصول Push والواجهة مفتوحة، الـSW يرسل رسالة للصفحة لتشغيل الصوت عبر `playAlertSound()`.