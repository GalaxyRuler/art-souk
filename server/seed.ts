import { db } from "./db";
import { sql } from "drizzle-orm";
import { 
  artists, galleries, artworks, auctions, bids, collections, collectionArtworks, 
  inquiries, favorites, users, workshops, events, commissionRequests, commissionBids,
  followers, auctionResults, shows, artistGalleries, priceAlerts
} from "@shared/schema";

// Comprehensive mock data for Art Souk marketplace
const mockData = {
  users: [
    {
      id: "user1",
      email: "ahmed@example.com",
      firstName: "Ahmed",
      lastName: "Al-Rashid",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "user2", 
      email: "fatima@example.com",
      firstName: "Fatima",
      lastName: "Al-Zahra",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "user3",
      email: "mohammed@example.com", 
      firstName: "Mohammed",
      lastName: "Al-Faisal",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "user4",
      email: "sara@example.com",
      firstName: "Sara",
      lastName: "Al-Mansouri",
      profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: "user5",
      email: "omar@example.com",
      firstName: "Omar",
      lastName: "Al-Khatib", 
      profileImageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=150&h=150&fit=crop&crop=face"
    }
  ],

  artists: [
    {
      name: "Manal AlDowayan",
      nameAr: "منال الدويان",
      biography: "Manal AlDowayan is a pioneering Saudi artist known for her multimedia installations and video art that explore themes of identity, memory, and social transformation in contemporary Saudi Arabia.",
      biographyAr: "منال الدويان فنانة سعودية رائدة معروفة بأعمالها التركيبية متعددة الوسائط وفن الفيديو التي تستكشف موضوعات الهوية والذاكرة والتحول الاجتماعي في المملكة العربية السعودية المعاصرة.",
      nationality: "Saudi Arabia",
      birthYear: 1973,
      profileImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      featured: true,
      website: "https://manaldowayan.com",
      instagram: "manaldowayan",
      style: "Contemporary, Multimedia",
      medium: "Installation, Video Art, Photography",
      education: "MFA from Central Saint Martins, London"
    },
    {
      name: "Ahmed Mater",
      nameAr: "أحمد ماطر",
      biography: "Ahmed Mater is a Saudi artist and physician whose work examines the rapid transformation of Saudi society through photography, sculpture, and installation art.",
      biographyAr: "أحمد ماطر فنان وطبيب سعودي يدرس في أعماله التحول السريع للمجتمع السعودي من خلال التصوير الفوتوغرافي والنحت والفن التركيبي.",
      nationality: "Saudi Arabia", 
      birthYear: 1979,
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop",
      featured: true,
      instagram: "ahmedmater",
      style: "Documentary, Conceptual",
      medium: "Photography, Sculpture, Installation"
    },
    {
      name: "Reem Al Faisal",
      nameAr: "ريم آل فيصل",
      biography: "Princess Reem Al Faisal is a renowned Saudi artist and curator known for her abstract paintings and her role in promoting contemporary art in the Kingdom.",
      biographyAr: "الأميرة ريم آل فيصل فنانة ومنسقة معارض سعودية مشهورة بلوحاتها التجريدية ودورها في تعزيز الفن المعاصر في المملكة.",
      nationality: "Saudi Arabia",
      birthYear: 1952,
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=400&fit=crop",
      featured: true,
      style: "Abstract, Contemporary",
      medium: "Painting, Mixed Media"
    },
    {
      name: "Shaker Hassan Al Said", 
      nameAr: "شاكر حسن آل سعيد",
      biography: "An influential Iraqi artist who developed the One Dimension Group and significantly influenced modern Arab art with his theoretical writings and paintings.",
      biographyAr: "فنان عراقي مؤثر طور جماعة البعد الواحد وأثر بشكل كبير على الفن العربي الحديث من خلال كتاباته النظرية ولوحاته.",
      nationality: "Iraq",
      birthYear: 1925,
      deathYear: 2004,
      profileImage: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      style: "Modern, Abstract",
      medium: "Painting, Calligraphy"
    },
    {
      name: "Farid Belkahia",
      nameAr: "فريد بلكاهية", 
      biography: "Moroccan artist who pioneered the use of traditional materials like copper and leather in contemporary art, bridging traditional and modern aesthetics.",
      biographyAr: "فنان مغربي رائد في استخدام المواد التقليدية مثل النحاس والجلد في الفن المعاصر، واصل بين الجماليات التقليدية والحديثة.",
      nationality: "Morocco",
      birthYear: 1934,
      deathYear: 2014,
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1200&h=400&fit=crop",
      style: "Contemporary, Traditional",
      medium: "Mixed Media, Sculpture"
    },
    {
      name: "Lalla Essaydi",
      nameAr: "لالة الصايدي",
      biography: "Moroccan photographer and installation artist known for her staged photographs that explore the intersection of tradition and modernity in Arab culture.",
      biographyAr: "مصورة ومفنانة تركيبية مغربية معروفة بصورها المنسقة التي تستكشف تقاطع التقليد والحداثة في الثقافة العربية.",
      nationality: "Morocco",
      birthYear: 1956,
      profileImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      featured: true,
      style: "Photography, Installation",
      medium: "Photography, Mixed Media"
    },
    {
      name: "Mona Saudi",
      nameAr: "منى السعودي",
      biography: "Jordanian sculptor and painter known for her abstract sculptures and advocacy for Arab women artists, one of the most prominent female artists in the Arab world.",
      biographyAr: "نحاتة ورسامة أردنية معروفة بمنحوتاتها التجريدية ودفاعها عن الفنانات العربيات، من أبرز الفنانات في العالم العربي.",
      nationality: "Jordan",
      birthYear: 1945,
      profileImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop",
      style: "Abstract, Contemporary",
      medium: "Sculpture, Painting"
    },
    {
      name: "Hassan Hajjaj",
      nameAr: "حسن حجاج",
      biography: "Moroccan-British artist known as the 'Andy Warhol of Marrakech' for his vibrant pop art photography and installation work.",
      biographyAr: "فنان مغربي-بريطاني معروف بـ'أندي وارهول مراكش' لأعماله الفوتوغرافية النابضة بالحياة والفن التركيبي.",
      nationality: "Morocco",
      birthYear: 1961,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1200&h=400&fit=crop",
      style: "Pop Art, Contemporary",
      medium: "Photography, Installation"
    }
  ],

  galleries: [
    {
      name: "Athr Gallery",
      nameAr: "أثر غاليري",
      description: "Athr Gallery is a contemporary art gallery in Jeddah, Saudi Arabia, dedicated to promoting contemporary art practice in the region.",
      descriptionAr: "أثر غاليري معرض فني معاصر في جدة، المملكة العربية السعودية، مخصص لتعزيز ممارسة الفن المعاصر في المنطقة.",
      location: "Jeddah, Saudi Arabia",
      establishedYear: 2009,
      website: "https://athrgallery.com",
      instagram: "athrgallery",
      profileImage: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      featured: true,
      specialties: "Contemporary Art, Saudi Artists"
    },
    {
      name: "Leila Heller Gallery",
      nameAr: "معرض ليلى هيلر",
      description: "Leila Heller Gallery Dubai specializes in contemporary art from the Middle East, South Asia, and Africa.",
      descriptionAr: "معرض ليلى هيلر دبي متخصص في الفن المعاصر من الشرق الأوسط وجنوب آسيا وأفريقيا.",
      location: "Dubai, UAE",
      establishedYear: 2015,
      website: "https://leilahellergallery.com",
      instagram: "leilahellergallery",
      profileImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop",
      featured: true,
      specialties: "Contemporary Art, Regional Artists"
    },
    {
      name: "Hafez Gallery",
      nameAr: "معرض حافظ",
      description: "Hafez Gallery is a contemporary art gallery in Jeddah showcasing both established and emerging artists from the region.",
      descriptionAr: "معرض حافظ معرض فني معاصر في جدة يعرض أعمال فنانين راسخين وناشئين من المنطقة.",
      location: "Jeddah, Saudi Arabia",
      establishedYear: 2012,
      instagram: "hafezgallery",
      profileImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1200&h=400&fit=crop",
      specialties: "Contemporary Art, Emerging Artists"
    },
    {
      name: "Warehouse421",
      nameAr: "مستودع 421",
      description: "Warehouse421 is a contemporary art space in Abu Dhabi that hosts exhibitions, workshops, and cultural events.",
      descriptionAr: "مستودع 421 مساحة فنية معاصرة في أبوظبي تستضيف معارض وورش عمل وفعاليات ثقافية.",
      location: "Abu Dhabi, UAE",
      establishedYear: 2016,
      website: "https://warehouse421.ae",
      instagram: "warehouse421",
      profileImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop",
      featured: true,
      specialties: "Contemporary Art, Cultural Events"
    }
  ],

  artworks: [
    {
      artistId: 1,
      galleryId: 1,
      title: "If I Were to Go Back, I Would...",
      titleAr: "لو كنت سأعود، فسأكون...",
      description: "A powerful multimedia installation exploring themes of memory, identity, and the hypothetical nature of looking back on one's life choices.",
      descriptionAr: "تركيب متعدد الوسائط قوي يستكشف موضوعات الذاكرة والهوية والطبيعة الافتراضية للنظر إلى الوراء في خيارات الحياة.",
      medium: "Video Installation, Mixed Media",
      dimensions: "Variable dimensions",
      year: 2023,
      price: 85000,
      currency: "SAR",
      status: "available",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"
      ]
    },
    {
      artistId: 2,
      galleryId: 1,
      title: "Magnetism",
      titleAr: "المغناطيسية",
      description: "A sculpture examining the magnetic pull of Mecca and its effect on global Muslim communities, created using metal filings and magnetic fields.",
      descriptionAr: "منحوتة تدرس الجذب المغناطيسي لمكة وتأثيره على المجتمعات المسلمة العالمية، مصنوعة باستخدام برادة المعادن والمجالات المغناطيسية.",
      medium: "Sculpture, Metal",
      dimensions: "120 x 120 x 50 cm",
      year: 2022,
      price: 120000,
      currency: "SAR",
      status: "available",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop"
      ]
    },
    {
      artistId: 3,
      galleryId: 2,
      title: "Desert Abstractions",
      titleAr: "تجريدات الصحراء",
      description: "Abstract paintings inspired by the colors and forms of the Arabian desert, exploring the spiritual connection between landscape and identity.",
      descriptionAr: "لوحات تجريدية مستوحاة من ألوان وأشكال الصحراء العربية، تستكشف الروابط الروحية بين المناظر الطبيعية والهوية.",
      medium: "Acrylic on Canvas",
      dimensions: "150 x 100 cm",
      year: 2023,
      price: 45000,
      currency: "SAR",
      status: "available",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ]
    },
    {
      artistId: 4,
      galleryId: 3,
      title: "Contemplation in Blue",
      titleAr: "تأمل في الأزرق",
      description: "A serene abstract painting that captures the meditative quality of Islamic art through geometric patterns and calligraphic elements.",
      descriptionAr: "لوحة تجريدية هادئة تلتقط الجودة التأملية للفن الإسلامي من خلال الأنماط الهندسية والعناصر الخطية.",
      medium: "Oil on Canvas",
      dimensions: "80 x 60 cm",
      year: 1995,
      price: 75000,
      currency: "SAR",
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ]
    },
    {
      artistId: 5,
      galleryId: 3,
      title: "Heritage and Modernity",
      titleAr: "التراث والحداثة",
      description: "A mixed media artwork combining traditional leather craftsmanship with contemporary artistic expression, bridging past and present.",
      descriptionAr: "عمل فني مختلط يجمع بين الحرفية التقليدية للجلود والتعبير الفني المعاصر، يربط بين الماضي والحاضر.",
      medium: "Leather, Copper, Mixed Media",
      dimensions: "200 x 150 cm",
      year: 2010,
      price: 95000,
      currency: "SAR",
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop"
      ]
    },
    {
      artistId: 6,
      galleryId: 2,
      title: "Harem Revisited",
      titleAr: "إعادة النظر في الحريم",
      description: "A photographic series that reclaims and recontextualizes the orientalist vision of Arab women, presenting them as empowered subjects rather than objects.",
      descriptionAr: "سلسلة فوتوغرافية تستعيد وتعيد تسياق الرؤية الاستشراقية للمرأة العربية، تقدمها كذوات مُمكنة بدلاً من أشياء.",
      medium: "Photography, Digital Print",
      dimensions: "120 x 80 cm (Series of 5)",
      year: 2020,
      price: 65000,
      currency: "SAR",
      status: "available",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"
      ]
    },
    {
      artistId: 7,
      galleryId: 4,
      title: "Carved Memories",
      titleAr: "ذكريات منحوتة",
      description: "An abstract sculpture that explores the relationship between memory and materiality, carved from local stone with contemporary techniques.",
      descriptionAr: "منحوتة تجريدية تستكشف العلاقة بين الذاكرة والمادية، منحوتة من الحجر المحلي بتقنيات معاصرة.",
      medium: "Stone Sculpture",
      dimensions: "180 x 60 x 60 cm",
      year: 2021,
      price: 110000,
      currency: "SAR",
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop"
      ]
    },
    {
      artistId: 8,
      galleryId: 4,
      title: "Marrakech Dreams",
      titleAr: "أحلام مراكش",
      description: "A vibrant pop art installation combining traditional Moroccan patterns with contemporary urban aesthetics, celebrating cultural fusion.",
      descriptionAr: "تركيب فني نابض بالحياة يجمع بين الأنماط المغربية التقليدية والجماليات الحضرية المعاصرة، احتفالاً بالاندماج الثقافي.",
      medium: "Mixed Media Installation",
      dimensions: "300 x 200 cm",
      year: 2022,
      price: 135000,
      currency: "SAR",
      status: "available",
      featured: true,
      images: [
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ]
    }
  ],

  auctions: [
    {
      artworkId: 1,
      title: "Contemporary Saudi Art Auction",
      titleAr: "مزاد الفن السعودي المعاصر",
      description: "A curated auction featuring works by prominent Saudi contemporary artists.",
      descriptionAr: "مزاد منتقى يضم أعمالاً لفنانين سعوديين معاصرين بارزين.",
      startDate: new Date("2025-01-20T19:00:00Z"),
      endDate: new Date("2025-01-22T22:00:00Z"),
      startingBid: 50000,
      currentBid: 85000,
      reservePrice: 80000,
      currency: "SAR",
      status: "live",
      bidCount: 12,
      viewCount: 245
    },
    {
      artworkId: 2,
      title: "Modern Middle Eastern Masters",
      titleAr: "أساتذة الشرق الأوسط الحديث",
      description: "Featuring works by established artists from across the Middle East region.",
      descriptionAr: "يضم أعمالاً لفنانين راسخين من منطقة الشرق الأوسط.",
      startDate: new Date("2025-01-25T20:00:00Z"),
      endDate: new Date("2025-01-27T23:00:00Z"),
      startingBid: 80000,
      currentBid: 120000,
      reservePrice: 100000,
      currency: "SAR",
      status: "live",
      bidCount: 8,
      viewCount: 189
    },
    {
      artworkId: 3,
      title: "Emerging Voices",
      titleAr: "أصوات ناشئة",
      description: "Spotlight on emerging artists from the GCC region.",
      descriptionAr: "تسليط الضوء على الفنانين الناشئين من منطقة دول مجلس التعاون الخليجي.",
      startDate: new Date("2025-02-01T18:00:00Z"),
      endDate: new Date("2025-02-03T21:00:00Z"),
      startingBid: 25000,
      currentBid: 45000,
      reservePrice: 40000,
      currency: "SAR",
      status: "upcoming",
      bidCount: 0,
      viewCount: 78
    }
  ],

  bids: [
    {
      auctionId: 1,
      userId: "user1",
      amount: 85000,
      currency: "SAR",
      timestamp: new Date("2025-01-17T15:30:00Z")
    },
    {
      auctionId: 1,
      userId: "user2",
      amount: 82000,
      currency: "SAR",
      timestamp: new Date("2025-01-17T14:45:00Z")
    },
    {
      auctionId: 2,
      userId: "user3",
      amount: 120000,
      currency: "SAR",
      timestamp: new Date("2025-01-17T16:20:00Z")
    }
  ],

  collections: [
    {
      name: "Saudi Contemporary Masters",
      nameAr: "أساتذة الفن السعودي المعاصر",
      description: "A curated selection of works by leading Saudi contemporary artists.",
      descriptionAr: "مجموعة منتقاة من أعمال الفنانين السعوديين المعاصرين الرائدين.",
      curatorId: 1,
      featured: true,
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
    },
    {
      name: "Desert Inspirations",
      nameAr: "إلهامات الصحراء",
      description: "Artworks inspired by the beauty and mystique of the Arabian desert.",
      descriptionAr: "أعمال فنية مستوحاة من جمال وغموض الصحراء العربية.",
      curatorId: 2,
      featured: true,
      coverImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"
    },
    {
      name: "Women Artists of the Gulf",
      nameAr: "فنانات الخليج",
      description: "Celebrating the contributions of female artists from the GCC region.",
      descriptionAr: "احتفاء بمساهمات الفنانات من منطقة دول مجلس التعاون الخليجي.",
      curatorId: 3,
      featured: true,
      coverImage: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop"
    }
  ],

  workshops: [
    {
      title: "Introduction to Arabic Calligraphy",
      titleAr: "مقدمة في الخط العربي",
      description: "Learn the fundamentals of Arabic calligraphy with master calligrapher. Explore traditional scripts including Naskh, Thuluth, and Ruq'ah.",
      descriptionAr: "تعلم أساسيات الخط العربي مع أستاذ الخط. استكشف الخطوط التقليدية بما في ذلك النسخ والثلث والرقعة.",
      instructorId: "89",
      instructorType: "artist",
      category: "Calligraphy",
      categoryAr: "الخط العربي",
      skillLevel: "beginner",
      duration: 3,
      maxParticipants: 20,
      currentParticipants: 12,
      price: 450,
      currency: "SAR",
      location: "Cultural Quarter, Riyadh",
      locationAr: "الحي الثقافي، الرياض",
      isOnline: false,
      materials: ["Calligraphy pens", "Traditional paper", "Ink"],
      materialsAr: ["أقلام الخط", "ورق تقليدي", "حبر"],
      startDate: new Date("2025-02-15T14:00:00Z"),
      endDate: new Date("2025-02-15T17:00:00Z"),
      registrationDeadline: new Date("2025-02-10T23:59:59Z"),
      status: "published",
      featured: true,
      isRecurring: false,
      averageRating: 4.8,
      totalReviews: 15,
      images: [
        "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop"
      ]
    },
    {
      title: "Contemporary Painting Techniques", 
      titleAr: "تقنيات الرسم المعاصر",
      description: "Explore modern painting techniques including abstract expressionism, color theory, and mixed media applications.",
      descriptionAr: "استكشف تقنيات الرسم الحديثة بما في ذلك التعبيرية التجريدية ونظرية الألوان وتطبيقات الوسائط المختلطة.",
      instructorId: "90",
      instructorType: "artist",
      category: "Painting",
      categoryAr: "الرسم",
      skillLevel: "intermediate",
      duration: 4,
      maxParticipants: 15,
      currentParticipants: 8,
      price: 650,
      currency: "SAR",
      location: "Art Studio, Jeddah",
      locationAr: "استوديو الفن، جدة",
      isOnline: false,
      materials: ["Canvas", "Acrylic paints", "Brushes", "Palette"],
      materialsAr: ["لوحة قماشية", "ألوان أكريليك", "فرش", "لوحة ألوان"],
      startDate: new Date("2025-02-20T10:00:00Z"),
      endDate: new Date("2025-02-20T14:00:00Z"),
      registrationDeadline: new Date("2025-02-15T23:59:59Z"),
      status: "published",
      featured: true,
      isRecurring: false,
      averageRating: 4.6,
      totalReviews: 22,
      images: [
        "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ]
    },
    {
      title: "Digital Art and NFTs",
      titleAr: "الفن الرقمي والرموز غير القابلة للاستبدال",
      description: "Master digital art creation techniques and understand the NFT marketplace. Learn industry-standard software and blockchain concepts.",
      descriptionAr: "أتقن تقنيات إنشاء الفن الرقمي وافهم سوق الرموز غير القابلة للاستبدال. تعلم البرامج المعيارية ومفاهيم البلوك تشين.",
      instructorId: "49",
      instructorType: "gallery",
      category: "Digital Arts",
      categoryAr: "الفنون الرقمية",
      skillLevel: "beginner",
      duration: 2,
      maxParticipants: 25,
      currentParticipants: 18,
      price: 350,
      currency: "SAR",
      location: "Online",
      locationAr: "عبر الإنترنت",
      isOnline: true,
      meetingLink: "https://zoom.us/j/workshop-digital-art",
      materials: ["Computer/Tablet", "Design software (provided)"],
      materialsAr: ["حاسوب/جهاز لوحي", "برنامج التصميم (متوفر)"],
      startDate: new Date("2025-02-25T16:00:00Z"),
      endDate: new Date("2025-02-25T18:00:00Z"),
      registrationDeadline: new Date("2025-02-20T23:59:59Z"),
      status: "published",
      featured: false,
      isRecurring: false,
      averageRating: 4.3,
      totalReviews: 31,
      images: [
        "https://images.unsplash.com/photo-1609205291628-681e4af6c0fc?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop"
      ]
    },
    {
      title: "Sculpture and 3D Art",
      titleAr: "النحت والفن ثلاثي الأبعاد",
      description: "Hands-on workshop exploring clay modeling, stone carving, and modern sculpture techniques with professional tools.",
      descriptionAr: "ورشة عملية لاستكشاف نمذجة الطين ونحت الحجر وتقنيات النحت الحديثة بالأدوات المهنية.",
      instructorId: "91",
      instructorType: "artist",
      category: "Sculpture",
      categoryAr: "النحت",
      skillLevel: "advanced",
      duration: 6,
      maxParticipants: 12,
      currentParticipants: 10,
      price: 850,
      currency: "SAR",
      location: "Sculpture Studio, Khobar",
      locationAr: "استوديو النحت، الخبر",
      isOnline: false,
      materials: ["Clay", "Carving tools", "Safety equipment"],
      materialsAr: ["طين", "أدوات النحت", "معدات السلامة"],
      startDate: new Date("2025-03-05T09:00:00Z"),
      endDate: new Date("2025-03-05T15:00:00Z"),
      registrationDeadline: new Date("2025-02-28T23:59:59Z"),
      status: "published",
      featured: true,
      isRecurring: false,
      averageRating: 4.9,
      totalReviews: 8,
      images: [
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop"
      ]
    },
    {
      title: "Art Business & Marketing",
      titleAr: "أعمال الفن والتسويق",
      description: "Essential workshop for artists to learn about pricing, marketing, gallery representation, and building an art career.",
      descriptionAr: "ورشة أساسية للفنانين لتعلم التسعير والتسويق وتمثيل المعارض وبناء مهنة فنية.",
      instructorId: "50",
      instructorType: "gallery",
      category: "Business",
      categoryAr: "الأعمال",
      skillLevel: "intermediate",
      duration: 3,
      maxParticipants: 30,
      currentParticipants: 22,
      price: 500,
      currency: "SAR",
      location: "Warehouse421, Abu Dhabi",
      locationAr: "مستودع421، أبوظبي",
      isOnline: false,
      materials: ["Workshop manual", "Business templates"],
      materialsAr: ["دليل الورشة", "قوالب الأعمال"],
      startDate: new Date("2025-03-12T13:00:00Z"),
      endDate: new Date("2025-03-12T16:00:00Z"),
      registrationDeadline: new Date("2025-03-07T23:59:59Z"),
      status: "published",
      featured: false,
      isRecurring: true,
      averageRating: 4.4,
      totalReviews: 18,
      images: [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
      ]
    }
  ],

  events: [
    {
      title: "Saudi Art Week Opening Night",
      titleAr: "ليلة افتتاح أسبوع الفن السعودي",
      description: "Join us for the grand opening of Saudi Art Week featuring contemporary exhibitions, live performances, artist talks, and networking opportunities with the region's leading art community.",
      descriptionAr: "انضم إلينا في الافتتاح الكبير لأسبوع الفن السعودي مع معارض معاصرة وعروض حية ومحاضرات فنانين وفرص التواصل مع مجتمع الفن الرائد في المنطقة.",
      organizerId: "49",
      organizerType: "gallery",
      category: "Exhibition",
      categoryAr: "معرض",
      venue: "King Abdulaziz Center for World Culture",
      venueAr: "مركز الملك عبد العزيز العالمي للثقافة",
      address: "Dhahran, Eastern Province, Saudi Arabia",
      addressAr: "الظهران، المنطقة الشرقية، المملكة العربية السعودية",
      isOnline: false,
      startDate: new Date("2025-03-01T19:00:00Z"),
      endDate: new Date("2025-03-01T23:00:00Z"),
      maxAttendees: 200,
      currentAttendees: 89,
      ticketPrice: 0,
      currency: "SAR",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"
      ],
      tags: ["Contemporary Art", "Saudi Artists", "Opening Night", "Networking"],
      tagsAr: ["الفن المعاصر", "فنانون سعوديون", "ليلة الافتتاح", "التواصل"],
      status: "published",
      featured: true,
      isRecurring: false,
      averageRating: 4.7,
      totalReviews: 45
    },
    {
      title: "Contemporary Art Forum: Future of Middle Eastern Art",
      titleAr: "منتدى الفن المعاصر: مستقبل الفن الشرق أوسطي",
      description: "A comprehensive panel discussion with leading contemporary artists, curators, and critics exploring the future directions of Middle Eastern contemporary art.",
      descriptionAr: "نقاش شامل مع الفنانين المعاصرين والقيمين والنقاد الرائدين لاستكشاف الاتجاهات المستقبلية للفن المعاصر الشرق أوسطي.",
      organizerId: "50",
      organizerType: "gallery",
      category: "Talk",
      categoryAr: "محاضرة",
      venue: "Athr Gallery",
      venueAr: "معرض أثر",
      address: "Prince Sultan Street, Jeddah, Saudi Arabia",
      addressAr: "شارع الأمير سلطان، جدة، المملكة العربية السعودية",
      isOnline: false,
      startDate: new Date("2025-03-10T15:00:00Z"),
      endDate: new Date("2025-03-10T18:00:00Z"),
      maxAttendees: 100,
      currentAttendees: 67,
      ticketPrice: 150,
      currency: "SAR",
      images: [
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1573152958734-1922c188fba3?w=800&h=600&fit=crop"
      ],
      tags: ["Panel Discussion", "Contemporary Art", "Middle East", "Art Criticism"],
      tagsAr: ["نقاش جماعي", "الفن المعاصر", "الشرق الأوسط", "النقد الفني"],
      status: "published",
      featured: true,
      isRecurring: false,
      averageRating: 4.8,
      totalReviews: 28
    },
    {
      title: "Young Collectors Circle: Building Your First Collection",
      titleAr: "دائرة الجامعين الشباب: بناء مجموعتك الأولى",
      description: "An exclusive networking event for emerging art collectors to learn collection strategies, meet established collectors, and view rare private collections.",
      descriptionAr: "حدث تواصل حصري لجامعي الفن الناشئين لتعلم استراتيجيات الجمع ولقاء الجامعين الراسخين ومشاهدة المجموعات الخاصة النادرة.",
      organizerId: "51",
      organizerType: "gallery",
      category: "Networking",
      categoryAr: "التواصل",
      venue: "Private Collector's Villa",
      venueAr: "فيلا جامع خاص",
      address: "Diplomatic Quarter, Riyadh, Saudi Arabia",
      addressAr: "الحي الدبلوماسي، الرياض، المملكة العربية السعودية",
      isOnline: false,
      startDate: new Date("2025-03-15T18:00:00Z"),
      endDate: new Date("2025-03-15T21:00:00Z"),
      maxAttendees: 50,
      currentAttendees: 38,
      ticketPrice: 300,
      currency: "SAR",
      images: [
        "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&h=600&fit=crop"
      ],
      tags: ["Art Collecting", "Young Collectors", "Private Collection", "Networking"],
      tagsAr: ["جمع الفن", "الجامعون الشباب", "مجموعة خاصة", "التواصل"],
      status: "published",
      featured: false,
      isRecurring: false,
      averageRating: 4.5,
      totalReviews: 19
    },
    {
      title: "Digital Art & Technology Summit",
      titleAr: "قمة الفن الرقمي والتكنولوجيا",
      description: "Explore the intersection of art and technology featuring VR installations, AI art, blockchain applications, and digital preservation methods.",
      descriptionAr: "استكشف تقاطع الفن والتكنولوجيا مع تركيبات الواقع الافتراضي وفن الذكاء الاصطناعي وتطبيقات البلوك تشين وطرق الحفظ الرقمي.",
      organizerId: "52",
      organizerType: "platform",
      category: "Technology",
      categoryAr: "التكنولوجيا",
      venue: "KAUST Innovation Hub",
      venueAr: "مركز كاوست للابتكار",
      address: "King Abdullah University, Thuwal, Saudi Arabia",
      addressAr: "جامعة الملك عبدالله، ثول، المملكة العربية السعودية",
      isOnline: true,
      meetingLink: "https://teams.microsoft.com/art-tech-summit",
      startDate: new Date("2025-03-22T14:00:00Z"),
      endDate: new Date("2025-03-22T18:00:00Z"),
      maxAttendees: 300,
      currentAttendees: 156,
      ticketPrice: 250,
      currency: "SAR",
      images: [
        "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=600&fit=crop"
      ],
      tags: ["Digital Art", "VR", "AI", "Blockchain", "Technology"],
      tagsAr: ["الفن الرقمي", "الواقع الافتراضي", "الذكاء الاصطناعي", "البلوك تشين", "التكنولوجيا"],
      status: "published",
      featured: true,
      isRecurring: false,
      averageRating: 4.6,
      totalReviews: 37
    },
    {
      title: "Traditional Crafts Revival Workshop",
      titleAr: "ورشة إحياء الحرف التقليدية",
      description: "Hands-on workshop dedicated to preserving and reviving traditional Saudi crafts including pottery, weaving, metalwork, and traditional jewelry making.",
      descriptionAr: "ورشة عملية مخصصة للحفاظ على الحرف التقليدية السعودية وإحيائها بما في ذلك الفخار والنسيج والأشغال المعدنية وصناعة المجوهرات التقليدية.",
      organizerId: "89",
      organizerType: "artist",
      category: "Traditional Arts",
      categoryAr: "الفنون التقليدية",
      venue: "Heritage Village",
      venueAr: "القرية التراثية",
      address: "Al-Janadriyah Festival Grounds, Riyadh, Saudi Arabia",
      addressAr: "أرض مهرجان الجنادرية، الرياض، المملكة العربية السعودية",
      isOnline: false,
      startDate: new Date("2025-04-05T10:00:00Z"),
      endDate: new Date("2025-04-05T16:00:00Z"),
      maxAttendees: 80,
      currentAttendees: 45,
      ticketPrice: 400,
      currency: "SAR",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop"
      ],
      tags: ["Traditional Crafts", "Heritage", "Pottery", "Weaving", "Metalwork"],
      tagsAr: ["الحرف التقليدية", "التراث", "الفخار", "النسيج", "الأشغال المعدنية"],
      status: "published",
      featured: false,
      isRecurring: false,
      averageRating: 4.9,
      totalReviews: 12
    }
  ],

  commissionRequests: [
    {
      userId: "user1",
      title: "Custom Calligraphy Artwork",
      titleAr: "عمل خط عربي مخصص",
      description: "Looking for a custom Arabic calligraphy piece for my home office, incorporating verses from classical Arabic poetry.",
      descriptionAr: "أبحث عن قطعة خط عربي مخصصة لمكتبي المنزلي، تتضمن آيات من الشعر العربي الكلاسيكي.",
      budget: 15000,
      currency: "SAR",
      deadline: new Date("2025-04-01T00:00:00Z"),
      medium: "Calligraphy, Mixed Media",
      dimensions: "80x60 cm",
      style: "Traditional",
      status: "open",
      category: "Calligraphy"
    },
    {
      userId: "user2",
      title: "Contemporary Portrait Commission",
      titleAr: "تكليف بورتريه معاصر",
      description: "Seeking an artist to create a contemporary portrait of my family in a modern abstract style.",
      descriptionAr: "أبحث عن فنان لإنشاء بورتريه معاصر لعائلتي بأسلوب تجريدي حديث.",
      budget: 25000,
      currency: "SAR",
      deadline: new Date("2025-04-15T00:00:00Z"),
      medium: "Oil on Canvas",
      dimensions: "120x100 cm",
      style: "Abstract Contemporary",
      status: "open",
      category: "Portrait"
    },
    {
      userId: "user3",
      title: "Corporate Art Installation",
      titleAr: "تركيب فني مؤسسي",
      description: "Need a large-scale installation for our corporate headquarters lobby, should reflect Saudi heritage and modern business values.",
      descriptionAr: "نحتاج تركيباً فنياً كبير الحجم لردهة مقر شركتنا، يجب أن يعكس التراث السعودي وقيم الأعمال الحديثة.",
      budget: 150000,
      currency: "SAR",
      deadline: new Date("2025-06-01T00:00:00Z"),
      medium: "Mixed Media Installation",
      dimensions: "5x3x2 meters",
      style: "Contemporary",
      status: "open",
      category: "Installation"
    }
  ],

  // New artist profile enhancement data
  followers: [
    { followerId: "user1", artistId: 1 },
    { followerId: "user2", artistId: 1 },
    { followerId: "user3", artistId: 1 },
    { followerId: "user1", artistId: 2 },
    { followerId: "user4", artistId: 2 },
    { followerId: "user5", artistId: 3 },
    { followerId: "user1", artistId: 3 },
    { followerId: "user2", artistId: 4 }
  ],

  auctionResults: [
    {
      artworkId: 1,
      artistId: 1,
      auctionDate: new Date("2024-12-15T19:00:00Z"),
      hammerPrice: "185000.00",
      estimateLow: "150000.00",
      estimateHigh: "200000.00",
      auctionHouse: "Christie's Dubai",
      lotNumber: "LOT 125",
      provenance: "Private collection, Riyadh"
    },
    {
      artworkId: 3,
      artistId: 2,
      auctionDate: new Date("2024-11-20T18:30:00Z"),
      hammerPrice: "95000.00",
      estimateLow: "80000.00",
      estimateHigh: "120000.00",
      auctionHouse: "Sotheby's London",
      lotNumber: "LOT 87",
      provenance: "Artist's studio"
    }
  ],

  shows: [
    {
      artistId: 1,
      title: "Visions of Tomorrow",
      titleAr: "رؤى الغد",
      venue: "National Museum of Saudi Arabia",
      venueAr: "المتحف الوطني السعودي",
      location: "Riyadh, Saudi Arabia",
      locationAr: "الرياض، المملكة العربية السعودية",
      startDate: new Date("2025-02-01"),
      endDate: new Date("2025-04-30"),
      type: "solo",
      status: "upcoming",
      description: "A comprehensive solo exhibition showcasing contemporary works exploring Saudi identity.",
      descriptionAr: "معرض شخصي شامل يعرض أعمالاً معاصرة تستكشف الهوية السعودية.",
      curator: "Dr. Sarah Al-Mahmoud",
      curatorAr: "د. سارة المحمود",
      website: "https://nationalmuseum.sa/exhibitions/visions-tomorrow",
      featured: true
    },
    {
      artistId: 2,
      title: "Echoes of Heritage",
      titleAr: "أصداء التراث",
      venue: "King Abdulaziz Center for World Culture",
      venueAr: "مركز الملك عبدالعزيز الثقافي العالمي",
      location: "Dhahran, Saudi Arabia",
      locationAr: "الظهران، المملكة العربية السعودية",
      startDate: new Date("2024-10-15"),
      endDate: new Date("2025-01-15"),
      type: "group",
      status: "current",
      description: "Group exhibition featuring contemporary Middle Eastern artists.",
      descriptionAr: "معرض جماعي يضم فنانين معاصرين من الشرق الأوسط.",
      curator: "Ahmed Al-Rashid",
      curatorAr: "أحمد الراشد",
      featured: false
    }
  ],

  artistGalleries: [
    {
      artistId: 1,
      galleryId: 1,
      featured: true,
      startDate: new Date("2023-01-01"),
      exclusivity: "exclusive",
      contractDetails: "Exclusive representation in the Middle East region"
    },
    {
      artistId: 2,
      galleryId: 2,
      featured: false,
      startDate: new Date("2024-06-01"),
      exclusivity: "non-exclusive",
      contractDetails: "Non-exclusive representation for contemporary works"
    }
  ],

  priceAlerts: [
    {
      userId: "user1",
      artistId: 1,
      priceThreshold: "50000.00",
      category: "Contemporary",
      alertType: "immediate",
      isActive: true
    },
    {
      userId: "user2",
      artistId: 2,
      priceThreshold: "75000.00",
      category: "Mixed Media",
      alertType: "weekly",
      isActive: true
    }
  ]
};

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");
  
  try {
    // Clear existing data using CASCADE to handle foreign key constraints
    await db.execute(sql`TRUNCATE TABLE bids CASCADE`);
    await db.execute(sql`TRUNCATE TABLE auctions CASCADE`);
    await db.execute(sql`TRUNCATE TABLE collection_artworks CASCADE`);
    await db.execute(sql`TRUNCATE TABLE collections CASCADE`);
    await db.execute(sql`TRUNCATE TABLE favorites CASCADE`);
    await db.execute(sql`TRUNCATE TABLE inquiries CASCADE`);
    await db.execute(sql`TRUNCATE TABLE commission_bids CASCADE`);
    await db.execute(sql`TRUNCATE TABLE commission_requests CASCADE`);
    await db.execute(sql`TRUNCATE TABLE workshop_registrations CASCADE`);
    await db.execute(sql`TRUNCATE TABLE workshops CASCADE`);
    await db.execute(sql`TRUNCATE TABLE event_rsvps CASCADE`);
    await db.execute(sql`TRUNCATE TABLE events CASCADE`);
    await db.execute(sql`TRUNCATE TABLE price_alerts CASCADE`);
    await db.execute(sql`TRUNCATE TABLE artist_galleries CASCADE`);
    await db.execute(sql`TRUNCATE TABLE shows CASCADE`);
    await db.execute(sql`TRUNCATE TABLE auction_results CASCADE`);
    await db.execute(sql`TRUNCATE TABLE followers CASCADE`);
    await db.execute(sql`TRUNCATE TABLE artworks CASCADE`);
    await db.execute(sql`TRUNCATE TABLE galleries CASCADE`);
    await db.execute(sql`TRUNCATE TABLE artists CASCADE`);
    await db.execute(sql`TRUNCATE TABLE users CASCADE`);
    
    console.log("🧹 Cleared existing data");

    // Seed Users
    const insertedUsers = await db.insert(users).values(mockData.users).returning();
    console.log(`👥 Seeded ${insertedUsers.length} users`);

    // Seed Artists
    const insertedArtists = await db.insert(artists).values(mockData.artists).returning();
    console.log(`🎨 Seeded ${insertedArtists.length} artists`);

    // Seed Galleries
    const insertedGalleries = await db.insert(galleries).values(mockData.galleries).returning();
    console.log(`🏛️ Seeded ${insertedGalleries.length} galleries`);

    // Seed Artworks with correct database references
    const artworkData = mockData.artworks.map((artwork, index) => ({
      ...artwork,
      artistId: insertedArtists[index % insertedArtists.length].id,
      galleryId: insertedGalleries[index % insertedGalleries.length].id
    }));
    const insertedArtworks = await db.insert(artworks).values(artworkData).returning();
    console.log(`🖼️ Seeded ${insertedArtworks.length} artworks`);

    // Seed Auctions with correct artwork references
    const auctionData = mockData.auctions.map((auction, index) => ({
      ...auction,
      artworkId: insertedArtworks[index % insertedArtworks.length].id
    }));
    const insertedAuctions = await db.insert(auctions).values(auctionData).returning();
    console.log(`🔨 Seeded ${insertedAuctions.length} auctions`);

    // Seed Bids with correct auction references
    const bidData = mockData.bids.map((bid, index) => ({
      ...bid,
      auctionId: insertedAuctions[index % insertedAuctions.length].id
    }));
    const insertedBids = await db.insert(bids).values(bidData).returning();
    console.log(`💰 Seeded ${insertedBids.length} bids`);

    // Seed Collections
    const insertedCollections = await db.insert(collections).values(mockData.collections).returning();
    console.log(`📚 Seeded ${insertedCollections.length} collections`);

    // Seed Collection Artworks relationships with correct IDs
    const collectionArtworkData = insertedCollections.map((collection, index) => ({
      collectionId: collection.id,
      artworkId: insertedArtworks[index % insertedArtworks.length].id
    }));
    await db.insert(collectionArtworks).values(collectionArtworkData);
    console.log(`🔗 Seeded ${collectionArtworkData.length} collection-artwork relationships`);

    // Seed Workshops with correct instructor references
    const workshopData = mockData.workshops.map(workshop => ({
      ...workshop,
      instructorId: workshop.instructorType === "artist" ? 
        insertedArtists.find(a => a.id.toString() === workshop.instructorId)?.id?.toString() || insertedArtists[0].id.toString() :
        insertedGalleries.find(g => g.id.toString() === workshop.instructorId)?.id?.toString() || insertedGalleries[0].id.toString()
    }));
    const insertedWorkshops = await db.insert(workshops).values(workshopData).returning();
    console.log(`🎓 Seeded ${insertedWorkshops.length} workshops`);

    // Seed Events with correct organizer references
    const eventData = mockData.events.map(event => ({
      ...event,
      organizerId: event.organizerType === "gallery" ? 
        insertedGalleries.find(g => g.id.toString() === event.organizerId)?.id?.toString() || insertedGalleries[0].id.toString() :
        insertedUsers[0].id
    }));
    const insertedEvents = await db.insert(events).values(eventData).returning();
    console.log(`🎉 Seeded ${insertedEvents.length} events`);

    // Seed Commission Requests with correct field names
    const commissionData = mockData.commissionRequests.map(request => ({
      ...request,
      collectorId: request.userId,
      titleEn: request.title,
      titleAr: request.titleAr,
      descriptionEn: request.description,
      descriptionAr: request.descriptionAr,
      budgetMin: request.budget ? request.budget * 0.8 : 1000, // 80% of budget as minimum
      budgetMax: request.budget || 10000 // use budget or default
    }));
    const insertedCommissions = await db.insert(commissionRequests).values(commissionData).returning();
    console.log(`💼 Seeded ${insertedCommissions.length} commission requests`);

    // Seed some sample favorites with correct artwork IDs
    const favoritesData = insertedUsers.flatMap((user, userIndex) => 
      insertedArtworks.slice(0, 2).map((artwork, artworkIndex) => ({
        userId: user.id,
        artworkId: artwork.id
      }))
    );
    await db.insert(favorites).values(favoritesData);
    console.log(`❤️ Seeded ${favoritesData.length} favorites`);

    // Seed some sample inquiries
    const inquiriesData = [
      {
        userId: "user1",
        artworkId: insertedArtworks[0].id,
        message: "I'm interested in learning more about this artwork. Could you provide additional details about the materials used?",
        email: "ahmed@example.com",
        phone: "+966501234567",
        status: "pending"
      },
      {
        userId: "user2",
        artworkId: insertedArtworks[1].id,
        message: "Beautiful sculpture! I'd like to know more about the artist's inspiration and if there are similar works available.",
        email: "fatima@example.com",
        status: "responded"
      },
      {
        userId: "user3",
        artworkId: insertedArtworks[2].id,
        message: "I'm considering this piece for my collection. Can we arrange a viewing?",
        email: "mohammed@example.com",
        phone: "+966507654321",
        status: "pending"
      }
    ];
    await db.insert(inquiries).values(inquiriesData);
    console.log(`📧 Seeded ${inquiriesData.length} inquiries`);

    // Seed new artist profile enhancement tables
    
    // Seed Followers
    const followerData = mockData.followers.map(follow => ({
      ...follow,
      followerId: insertedUsers.find(u => u.id === follow.followerId)?.id || insertedUsers[0].id,
      artistId: insertedArtists[follow.artistId - 1]?.id || insertedArtists[0].id
    }));
    const insertedFollowers = await db.insert(followers).values(followerData).returning();
    console.log(`👥 Seeded ${insertedFollowers.length} followers`);

    // Seed Auction Results
    const auctionResultData = mockData.auctionResults.map(result => ({
      ...result,
      artworkId: insertedArtworks[result.artworkId - 1]?.id || insertedArtworks[0].id,
      artistId: insertedArtists[result.artistId - 1]?.id || insertedArtists[0].id
    }));
    const insertedAuctionResults = await db.insert(auctionResults).values(auctionResultData).returning();
    console.log(`🔨 Seeded ${insertedAuctionResults.length} auction results`);

    // Seed Shows
    const showData = mockData.shows.map(show => ({
      ...show,
      artistId: insertedArtists[show.artistId - 1]?.id || insertedArtists[0].id
    }));
    const insertedShows = await db.insert(shows).values(showData).returning();
    console.log(`🎭 Seeded ${insertedShows.length} shows`);

    // Seed Artist Galleries
    const artistGalleryData = mockData.artistGalleries.map(ag => ({
      ...ag,
      artistId: insertedArtists[ag.artistId - 1]?.id || insertedArtists[0].id,
      galleryId: insertedGalleries[ag.galleryId - 1]?.id || insertedGalleries[0].id
    }));
    const insertedArtistGalleries = await db.insert(artistGalleries).values(artistGalleryData).returning();
    console.log(`🏛️ Seeded ${insertedArtistGalleries.length} artist-gallery relationships`);

    // Seed Price Alerts
    const priceAlertData = mockData.priceAlerts.map(alert => ({
      userId: insertedUsers.find(u => u.id === alert.userId)?.id || insertedUsers[0].id,
      artistId: insertedArtists[alert.artistId - 1]?.id || insertedArtists[0].id,
      priceThreshold: alert.priceThreshold,
      category: alert.category,
      alertType: alert.alertType,
      isActive: alert.isActive
    }));
    const insertedPriceAlerts = await db.insert(priceAlerts).values(priceAlertData).returning();
    console.log(`💰 Seeded ${insertedPriceAlerts.length} price alerts`);

    console.log("✅ Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}