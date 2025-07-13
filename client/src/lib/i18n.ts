import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Get language from localStorage or default to English
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

// Nuclear option: inline resources to ensure they're always available
const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        artworks: "Artworks",
        artists: "Artists",
        galleries: "Galleries",
        auctions: "Auctions",
        workshops: "Workshops",
        events: "Events",
        commissions: "Commissions",
        dashboard: "Dashboard"
      },
      auth: {
        welcome: "Welcome to",
        artSouk: "Art Souk",
        subtitle: "Discover and collect authentic art from across the GCC region",
        login: "Sign In",
        signin: "Sign In",
        signup: "Sign Up",
        logout: "Logout",
        backToHome: "Back to Home",
        badge: "Member",
        features: {
          discover: "Discover Art",
          discoverDesc: "Browse thousands of artworks from GCC artists",
          galleries: "Gallery Access",
          galleriesDesc: "Connect with premier galleries in the region",
          collections: "Build Collections",
          collectionsDesc: "Save and organize your favorite artworks",
          community: "Join Community",
          communityDesc: "Connect with artists, collectors, and enthusiasts"
        },
        benefits: {
          favorites: "Save favorite artworks",
          inquiries: "Contact artists directly",
          auctions: "Participate in live auctions",
          personalized: "Get personalized recommendations"
        }
      },
      hero: {
        title: "Discover Art from Saudi Arabia & the GCC",
        subtitle: "Contemporary",
        description: "Connect with the most talented artists, galleries, and collectors in the region. Explore traditional Arabic calligraphy, contemporary works, and emerging talents from across the Gulf.",
        featuredArt: "Contemporary Saudi Art Exhibition",
        featuredArtist: "Featured Artist",
        cta: {
          browse: "Browse Artists",
          start: "Start Collecting"
        }
      },
      home: {
        welcome: "Welcome to Art Souk",
        subtitle: "Discover exceptional art from the region",
        user: "User",
        stats: {
          artists: "Artists",
          artworks: "Artworks",
          galleries: "Galleries",
          favorites: "Favorites",
          trending: "Trending",
          liveAuctions: "Live Auctions"
        }
      },
      social: {
        follow: "Follow",
        following: "Following",
        followed: "Followed",
        followedDesc: "You are now following this user",
        unfollowed: "Unfollowed",
        unfollowedDesc: "You have unfollowed this user",
        like: "Like",
        liked: "Liked",
        likedDesc: "You liked this item",
        unlike: "Unlike",
        unliked: "Unliked",
        unlikedDesc: "You unliked this item",
        commentAdded: "Comment Added",
        commentAddedDesc: "Your comment has been added",
        commentUpdated: "Comment Updated",
        commentUpdatedDesc: "Your comment has been updated",
        commentDeleted: "Comment Deleted"
      },
      common: {
        siteName: "Art Souk",
        siteNameAr: "سوق آرت",
        error: "Error",
        loading: "Loading...",
        save: "Save",
        cancel: "Cancel",
        edit: "Edit",
        delete: "Delete",
        back: "Back",
        featured: "Featured",
        viewAll: "View All",
        allCategories: "All Categories",
        allStatus: "All Status",
        published: "Published",
        sortBy: "Sort By",
        anonymous: "Anonymous"
      },
      site: {
        name: "Art Souk",
        tagline: "Saudi Arabia & GCC Art"
      }
    }
  },
  ar: {
    translation: {
      nav: {
        home: "الرئيسية",
        artworks: "الأعمال الفنية",
        artists: "الفنانون",
        galleries: "المعارض",
        auctions: "المزادات",
        workshops: "ورش العمل",
        events: "الفعاليات",
        commissions: "الطلبات المخصصة",
        dashboard: "لوحة التحكم"
      },
      auth: {
        welcome: "مرحباً بك في",
        artSouk: "سوق آرت",
        subtitle: "اكتشف واجمع وتواصل مع المشهد الفني المعاصر النابض بالحياة في السعودية ودول الخليج.",
        login: "تسجيل الدخول",
        signin: "تسجيل الدخول",
        signup: "إنشاء حساب",
        logout: "تسجيل الخروج",
        backToHome: "العودة للرئيسية",
        badge: "منصة فنية متميزة",
        features: {
          discover: "اكتشف الفن",
          discoverDesc: "اكتشف آلاف الأعمال المعاصرة",
          galleries: "أفضل المعارض",
          galleriesDesc: "تواصل مع المساحات الفنية الرائدة في الخليج",
          collections: "مجموعات مميزة",
          collectionsDesc: "اطلع على المختارات المنسقة",
          community: "مجتمع الفن",
          communityDesc: "انضم لجامعي الفنون والهواة"
        },
        benefits: {
          favorites: "احفظ ونظم أعمالك الفنية المفضلة",
          inquiries: "تواصل مباشر مع الفنانين والمعارض",
          auctions: "شارك في مزادات حية حصرية",
          personalized: "احصل على توصيات فنية شخصية"
        }
      },
      hero: {
        title: "اكتشف فن السعودية ودول مجلس التعاون",
        subtitle: "المعاصر",
        description: "تواصل مع أكثر الفنانين والمعارض والجامعين موهبة في المنطقة. استكشف الخط العربي التقليدي والأعمال المعاصرة والمواهب الناشئة من جميع أنحاء الخليج.",
        featuredArt: "معرض الفن السعودي المعاصر",
        featuredArtist: "فنان مميز",
        cta: {
          browse: "تصفح الفنانين",
          start: "ابدأ الجمع"
        }
      },
      home: {
        welcome: "مرحباً بك في سوق آرت",
        subtitle: "اكتشف الفن الاستثنائي من المنطقة",
        user: "المستخدم",
        stats: {
          artists: "الفنانون",
          artworks: "الأعمال الفنية",
          galleries: "المعارض",
          favorites: "المفضلات",
          trending: "الأكثر رواجاً",
          liveAuctions: "المزادات المباشرة"
        }
      },
      social: {
        follow: "تابع",
        following: "متابع",
        followed: "تم المتابعة",
        followedDesc: "أنت تتابع هذا المستخدم الآن",
        unfollowed: "إلغاء المتابعة",
        unfollowedDesc: "لقد ألغيت متابعة هذا المستخدم",
        like: "إعجاب",
        liked: "أعجبني",
        likedDesc: "أعجبك هذا العنصر",
        unlike: "إلغاء الإعجاب",
        unliked: "لم يعد معجباً",
        unlikedDesc: "ألغيت إعجابك بهذا العنصر",
        commentAdded: "تمت إضافة التعليق",
        commentAddedDesc: "تمت إضافة تعليقك",
        commentUpdated: "تم تحديث التعليق",
        commentUpdatedDesc: "تم تحديث تعليقك",
        commentDeleted: "تم حذف التعليق"
      },
      common: {
        siteName: "سوق آرت",
        siteNameAr: "سوق آرت",
        error: "خطأ",
        loading: "جاري التحميل...",
        save: "حفظ",
        cancel: "إلغاء",
        edit: "تعديل",
        delete: "حذف",
        back: "العودة",
        featured: "مميز",
        viewAll: "عرض الكل",
        allCategories: "جميع الفئات",
        allStatus: "جميع الحالات",
        published: "منشور",
        sortBy: "ترتيب حسب",
        anonymous: "مجهول"
      },
      site: {
        name: "سوق آرت",
        tagline: "فن السعودية ودول مجلس التعاون"
      }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "en",
  debug: true,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  keySeparator: '.',
  nsSeparator: ':',
  returnEmptyString: false,
  returnNull: false,
  returnObjects: false,
});

// Log to verify
console.log('i18n initialized with inline resources');
console.log('Sample translation nav.home:', i18n.t('nav.home'));
console.log('Sample translation auth.login:', i18n.t('auth.login'));
console.log('Sample translation hero.title:', i18n.t('hero.title'));

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export { i18n };
