#!/usr/bin/env npx tsx

import fs from 'fs';
import path from 'path';

const LOCALES_DIR = path.join(process.cwd(), 'client/src/locales');

// Critical missing translations to add
const criticalEnglishTranslations = {
  "hero": {
    "title": "Art Souk",
    "subtitle": "Saudi & GCC Art Marketplace",
    "description": "Discover exceptional Middle Eastern art",
    "featuredArt": "Featured Art",
    "featuredArtist": "Featured Artist",
    "cta": {
      "start": "Get Started"
    }
  },
  "workshops": {
    "loginToRegister": "Login to register",
    "registrationSuccess": "Registration successful",
    "registrationSuccessDesc": "You have been registered for the workshop",
    "registrationFailed": "Registration failed",
    "registrationFailedDesc": "Please try again later",
    "loading": "Loading workshops...",
    "online": "Online",
    "free": "Free",
    "full": "Full",
    "categories": {
      "painting": "Painting",
      "sculpture": "Sculpture",
      "drawing": "Drawing",
      "digital_art": "Digital Art",
      "photography": "Photography"
    },
    "skillLevel": {
      "all": "All Levels"
    }
  },
  "artwork": {
    "status": {
      "available": "Available",
      "sold": "Sold",
      "reserved": "Reserved"
    }
  }
};

const criticalArabicTranslations = {
  "hero": {
    "title": "سوق آرت",
    "subtitle": "سوق الفن السعودي ودول الخليج",
    "description": "اكتشف فن الشرق الأوسط الاستثنائي",
    "featuredArt": "الفن المميز",
    "featuredArtist": "الفنان المميز",
    "cta": {
      "start": "ابدأ الآن"
    }
  },
  "workshops": {
    "loginToRegister": "سجل الدخول للتسجيل",
    "registrationSuccess": "تم التسجيل بنجاح",
    "registrationSuccessDesc": "تم تسجيلك في ورشة العمل",
    "registrationFailed": "فشل التسجيل",
    "registrationFailedDesc": "يرجى المحاولة مرة أخرى لاحقاً",
    "loading": "جاري تحميل ورش العمل...",
    "online": "عبر الإنترنت",
    "free": "مجاني",
    "full": "مكتمل",
    "categories": {
      "painting": "الرسم",
      "sculpture": "النحت",
      "drawing": "الرسم بالقلم",
      "digital_art": "الفن الرقمي",
      "photography": "التصوير"
    },
    "skillLevel": {
      "all": "جميع المستويات"
    }
  },
  "artwork": {
    "status": {
      "available": "متاح",
      "sold": "مباع",
      "reserved": "محجوز"
    }
  },
  "auth": {
    "logout": "تسجيل الخروج",
    "signin": "تسجيل الدخول",
    "signup": "التسجيل"
  },
  "social": {
    "unfollowed": "إلغاء المتابعة",
    "followed": "تم المتابعة",
    "unfollowedDesc": "ألغيت متابعة هذا المستخدم",
    "followedDesc": "أنت تتابع هذا المستخدم الآن",
    "following": "متابعة",
    "follow": "تابع",
    "unliked": "لم يعد معجباً",
    "liked": "أعجبني",
    "unlikedDesc": "ألغيت إعجابك بهذا العنصر",
    "likedDesc": "أعجبك هذا العنصر",
    "commentAdded": "تمت إضافة التعليق",
    "commentAddedDesc": "تمت إضافة تعليقك",
    "commentUpdated": "تم تحديث التعليق",
    "commentUpdatedDesc": "تم تحديث تعليقك",
    "commentDeleted": "تم حذف التعليق",
    "commentDeletedDesc": "تم حذف تعليقك",
    "confirmDelete": "هل أنت متأكد من أنك تريد حذف هذا التعليق؟",
    "comments": "التعليقات",
    "writeComment": "اكتب تعليقاً...",
    "postComment": "نشر التعليق",
    "noComments": "لا توجد تعليقات بعد",
    "signInToComment": "سجل الدخول للتعليق",
    "website": "الموقع الإلكتروني",
    "recentActivity": "النشاط الأخير"
  }
};

// Unused translations to remove for performance
const unusedEnglishKeys = [
  "nav.community",
  "nav.editorial", 
  "nav.virtualExhibitions",
  "nav.search",
  "nav.profile",
  "nav.login",
  "nav.logout",
  "nav.admin",
  "nav.sellerDashboard",
  "nav.collectorDashboard"
];

function deepMerge(target: any, source: any): any {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function removeUnusedKeys(obj: any, keysToRemove: string[]): any {
  const result = { ...obj };
  
  keysToRemove.forEach(keyPath => {
    const keys = keyPath.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (current[keys[i]]) {
        current = current[keys[i]];
      } else {
        break;
      }
    }
    
    if (current && keys[keys.length - 1] in current) {
      delete current[keys[keys.length - 1]];
    }
  });
  
  return result;
}

async function optimizeTranslations() {
  try {
    console.log('🔧 Optimizing translation files...');
    
    // Load current translations
    const enPath = path.join(LOCALES_DIR, 'en.json');
    const arPath = path.join(LOCALES_DIR, 'ar.json');
    
    const enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    const arTranslations = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
    
    // Add critical missing translations
    const updatedEnTranslations = deepMerge(enTranslations, criticalEnglishTranslations);
    const updatedArTranslations = deepMerge(arTranslations, criticalArabicTranslations);
    
    // Remove unused translations for performance
    const optimizedEnTranslations = removeUnusedKeys(updatedEnTranslations, unusedEnglishKeys);
    
    // Write optimized translations
    fs.writeFileSync(enPath, JSON.stringify(optimizedEnTranslations, null, 2) + '\n');
    fs.writeFileSync(arPath, JSON.stringify(updatedArTranslations, null, 2) + '\n');
    
    console.log('✅ Translation optimization complete!');
    console.log(`📊 Added critical missing translations`);
    console.log(`🗑️  Removed ${unusedEnglishKeys.length} unused English keys`);
    console.log('🚀 Files optimized for better performance');
    
  } catch (error) {
    console.error('❌ Error optimizing translations:', error);
    process.exit(1);
  }
}

optimizeTranslations();