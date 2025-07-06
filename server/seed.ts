import { db } from "./db";
import { 
  artists, galleries, artworks, auctions, bids, collections, collectionArtworks, 
  articles, inquiries, favorites, users 
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
      medium: "Copper, Leather, Painting"
    },
    {
      name: "Lulwah AlHomoud",
      nameAr: "لولوة الحمود",
      biography: "Contemporary Saudi artist known for her vibrant abstract paintings that explore color, form, and cultural identity in the modern Gulf context.",
      biographyAr: "فنانة سعودية معاصرة معروفة بلوحاتها التجريدية النابضة بالحياة التي تستكشف اللون والشكل والهوية الثقافية في سياق الخليج الحديث.",
      nationality: "Saudi Arabia",
      birthYear: 1987,
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face",
      coverImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=400&fit=crop",
      style: "Abstract, Contemporary",
      medium: "Acrylic, Oil Painting"
    }
  ],

  galleries: [
    {
      name: "Athr Gallery",
      nameAr: "معرض أثر",
      description: "Athr Gallery is a leading contemporary art gallery in Jeddah, Saudi Arabia, showcasing cutting-edge works by regional and international artists.",
      descriptionAr: "معرض أثر هو معرض فني معاصر رائد في جدة، المملكة العربية السعودية، يعرض أعمالاً متطورة لفنانين إقليميين وعالميين.",
      location: "Jeddah, Saudi Arabia",
      locationAr: "جدة، المملكة العربية السعودية",
      address: "Prince Sultan Street, Al-Balad, Jeddah 21421",
      addressAr: "شارع الأمير سلطان، البلد، جدة ٢١٤٢١",
      website: "https://athrgallery.com",
      phone: "+966 12 692 2592",
      email: "info@athrgallery.com",
      instagram: "athrgallery",
      founded: 2009,
      specialties: "Contemporary Art, Regional Artists, Experimental Media",
      specialtiesAr: "الفن المعاصر، الفنانون الإقليميون، الوسائط التجريبية",
      curatorName: "Hamza Serafi",
      curatorNameAr: "حمزة سرافي",
      profileImage: "https://images.unsplash.com/photo-1554774853-d50f9c681404?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=400&fit=crop",
      featured: true,
      openingHours: "Sunday - Thursday: 10:00 AM - 8:00 PM\nFriday - Saturday: 2:00 PM - 8:00 PM",
      openingHoursAr: "الأحد - الخميس: ١٠:٠٠ ص - ٨:٠٠ م\nالجمعة - السبت: ٢:٠٠ م - ٨:٠٠ م"
    },
    {
      name: "Hafez Gallery",
      nameAr: "معرض حافظ",
      description: "Located in the heart of Jeddah, Hafez Gallery has been a cornerstone of the Saudi art scene since 1990, representing established and emerging artists.",
      descriptionAr: "يقع في قلب جدة، وكان معرض حافظ حجر الزاوية في المشهد الفني السعودي منذ عام ١٩٩٠، ويمثل فنانين راسخين وناشئين.",
      location: "Jeddah, Saudi Arabia",
      locationAr: "جدة، المملكة العربية السعودية",
      address: "Tahlia Street, Jeddah 23442",
      addressAr: "شارع التحلية، جدة ٢٣٤٤٢",
      phone: "+966 12 665 8887",
      email: "info@hafezgallery.com",
      founded: 1990,
      specialties: "Saudi Contemporary Art, Calligraphy, Traditional Arts",
      specialtiesAr: "الفن السعودي المعاصر، الخط العربي، الفنون التقليدية",
      profileImage: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=400&fit=crop",
      featured: true
    },
    {
      name: "Green Art Gallery",
      nameAr: "معرض الفن الأخضر",
      description: "Dubai's premier contemporary art gallery, featuring works by Middle Eastern and international artists with a focus on emerging talent.",
      descriptionAr: "معرض الفن المعاصر الرائد في دبي، يعرض أعمال فنانين من الشرق الأوسط والعالم مع التركيز على المواهب الناشئة.",
      location: "Dubai, UAE",
      locationAr: "دبي، الإمارات العربية المتحدة",
      address: "Al Quoz Industrial Area 1, Dubai",
      addressAr: "المنطقة الصناعية القوز ١، دبي",
      website: "https://greenartgallery.ae",
      phone: "+971 4 346 9305",
      email: "info@greenartgallery.ae",
      founded: 1995,
      specialties: "Contemporary Art, Photography, Sculpture",
      specialtiesAr: "الفن المعاصر، التصوير الفوتوغرافي، النحت",
      profileImage: "https://images.unsplash.com/photo-1554774853-d50f9c681404?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1200&h=400&fit=crop"
    },
    {
      name: "Cuadro Gallery", 
      nameAr: "معرض كوادرو",
      description: "A contemporary art gallery in Dubai specializing in modern and contemporary works by established Middle Eastern artists.",
      descriptionAr: "معرض فني معاصر في دبي متخصص في الأعمال الحديثة والمعاصرة لفنانين راسخين من الشرق الأوسط.",
      location: "Dubai, UAE",
      locationAr: "دبي، الإمارات العربية المتحدة", 
      address: "DIFC, Gate Village Building 3, Dubai",
      addressAr: "مركز دبي المالي العالمي، مبنى جيت فيليج ٣، دبي",
      website: "https://cuadrogallery.com",
      phone: "+971 4 425 0400",
      founded: 2008,
      specialties: "Modern Art, Contemporary Painting, Regional Artists",
      specialtiesAr: "الفن الحديث، الرسم المعاصر، الفنانون الإقليميون",
      profileImage: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=300&h=300&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=400&fit=crop"
    }
  ],

  artworks: [
    {
      title: "Evolution of a City",
      titleAr: "تطور المدينة",
      description: "A powerful multimedia installation exploring the rapid urban development of Jeddah through archival photography and contemporary video art.",
      descriptionAr: "تركيب متعدد الوسائط قوي يستكشف التطوير الحضري السريع لجدة من خلال التصوير الأرشيفي وفن الفيديو المعاصر.",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"
      ],
      artistId: 1,
      galleryId: 1,
      year: 2023,
      medium: "Video Installation, Photography",
      mediumAr: "تركيب فيديو، تصوير فوتوغرافي",
      dimensions: "300 x 400 cm",
      price: "85000",
      currency: "SAR",
      availability: "available",
      category: "Installation",
      categoryAr: "تركيب فني",
      featured: true,
      curatorsPick: true
    },
    {
      title: "Desert Metamorphosis",
      titleAr: "تحول الصحراء", 
      description: "A series of large-scale photographs documenting the transformation of the Saudi landscape through modernization and development.",
      descriptionAr: "سلسلة من الصور الفوتوغرافية واسعة النطاق توثق تحول المناظر الطبيعية السعودية من خلال التحديث والتطوير.",
      images: [
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop"
      ],
      artistId: 2,
      galleryId: 1,
      year: 2022,
      medium: "Photography",
      mediumAr: "تصوير فوتوغرافي",
      dimensions: "120 x 180 cm each",
      price: "45000",
      currency: "SAR", 
      availability: "available",
      category: "Photography",
      categoryAr: "تصوير فوتوغرافي",
      featured: true
    },
    {
      title: "Calligraphy in Motion",
      titleAr: "الخط في حركة",
      description: "An abstract painting series that reimagines traditional Arabic calligraphy through contemporary gestural brushwork and vibrant colors.",
      descriptionAr: "سلسلة لوحات تجريدية تعيد تخيل الخط العربي التقليدي من خلال ضربات الفرشاة الإيمائية المعاصرة والألوان النابضة بالحياة.",
      images: [
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
      ],
      artistId: 3,
      galleryId: 2,
      year: 2023,
      medium: "Acrylic on Canvas",
      mediumAr: "أكريليك على قماش",
      dimensions: "150 x 200 cm",
      price: "65000",
      currency: "SAR",
      availability: "available",
      category: "Painting",
      categoryAr: "رسم",
      curatorsPick: true
    },
    {
      title: "Memory Palace",
      titleAr: "قصر الذاكرة",
      description: "A mixed media work exploring themes of cultural memory and identity in the modern Arab world through layered imagery and text.",
      descriptionAr: "عمل بوسائط مختلطة يستكشف موضوعات الذاكرة الثقافية والهوية في العالم العربي الحديث من خلال الصور والنصوص المتراكبة.",
      images: [
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop"
      ],
      artistId: 4,
      galleryId: 3,
      year: 2021,
      medium: "Mixed Media",
      mediumAr: "وسائط مختلطة",
      dimensions: "100 x 140 cm",
      price: "38000",
      currency: "SAR",
      availability: "sold",
      category: "Mixed Media",
      categoryAr: "وسائط مختلطة"
    },
    {
      title: "Copper Dreams",
      titleAr: "أحلام نحاسية",
      description: "A sculptural work combining traditional copper craftsmanship with contemporary artistic vision, reflecting on heritage and modernity.",
      descriptionAr: "عمل نحتي يجمع بين الحرفية النحاسية التقليدية والرؤية الفنية المعاصرة، ويتأمل في التراث والحداثة.",
      images: [
        "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"
      ],
      artistId: 5,
      galleryId: 3,
      year: 2020,
      medium: "Copper, Leather",
      mediumAr: "نحاس، جلد",
      dimensions: "80 x 60 x 40 cm",
      price: "55000",
      currency: "SAR",
      availability: "available",
      category: "Sculpture",
      categoryAr: "نحت",
      featured: true
    },
    {
      title: "Gulf Horizons",
      titleAr: "آفاق الخليج",
      description: "A vibrant abstract painting capturing the essence of the Gulf landscape through bold colors and dynamic compositions.",
      descriptionAr: "لوحة تجريدية نابضة بالحياة تلتقط جوهر المناظر الطبيعية الخليجية من خلال الألوان الجريئة والتراكيب الديناميكية.",
      images: [
        "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop"
      ],
      artistId: 6,
      galleryId: 4,
      year: 2023,
      medium: "Acrylic on Canvas",
      mediumAr: "أكريليك على قماش", 
      dimensions: "120 x 160 cm",
      price: "42000",
      currency: "SAR",
      availability: "available",
      category: "Painting",
      categoryAr: "رسم"
    },
    {
      title: "Urban Reflections",
      titleAr: "انعكاسات حضرية",
      description: "A photographic series capturing the interplay between traditional architecture and modern urban development in Riyadh.",
      descriptionAr: "سلسلة تصوير فوتوغرافي تلتقط التفاعل بين العمارة التقليدية والتطوير الحضري الحديث في الرياض.",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop"
      ],
      artistId: 2,
      galleryId: 2,
      year: 2023,
      medium: "Photography",
      mediumAr: "تصوير فوتوغرافي",
      dimensions: "100 x 150 cm each",
      price: "32000",
      currency: "SAR",
      availability: "available",
      category: "Photography",
      categoryAr: "تصوير فوتوغرافي"
    }
  ],

  auctions: [
    {
      title: "Contemporary Saudi Art Auction",
      titleAr: "مزاد الفن السعودي المعاصر",
      description: "A curated auction featuring exceptional works by leading Saudi contemporary artists, showcasing the evolution of the Kingdom's art scene.",
      descriptionAr: "مزاد منسق يضم أعمالاً استثنائية لفنانين سعوديين معاصرين رائدين، ويعرض تطور المشهد الفني في المملكة.",
      artworkId: 1,
      startingPrice: "50000",
      currentBid: "75000",
      currency: "SAR",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Ends in 3 days
      status: "live",
      bidCount: 12,
      estimateLow: "60000",
      estimateHigh: "90000",
      hasReserve: true
    },
    {
      title: "Gulf Modern Masters",
      titleAr: "أساتذة الخليج الحديث",
      description: "An exclusive auction of rare works by pioneering artists from the Gulf region, representing the foundation of modern Middle Eastern art.",
      descriptionAr: "مزاد حصري لأعمال نادرة لفنانين رائدين من منطقة الخليج، يمثل أساس الفن الشرق أوسطي الحديث.",
      artworkId: 4,
      startingPrice: "25000",
      currentBid: "38000",
      currency: "SAR",
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Starts in 7 days
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Ends in 14 days
      status: "upcoming",
      bidCount: 0,
      estimateLow: "35000",
      estimateHigh: "50000",
      hasReserve: false
    },
    {
      title: "Heritage and Innovation",
      titleAr: "التراث والابتكار",
      description: "A special auction celebrating the dialogue between traditional craftsmanship and contemporary artistic expression.",
      descriptionAr: "مزاد خاص يحتفل بالحوار بين الحرفية التقليدية والتعبير الفني المعاصر.",
      artworkId: 5,
      startingPrice: "35000",
      currentBid: "55000",
      currency: "SAR",
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // Started 10 days ago
      endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Ended 3 days ago
      status: "ended",
      bidCount: 8,
      estimateLow: "40000",
      estimateHigh: "60000",
      hasReserve: true
    }
  ],

  collections: [
    {
      name: "Saudi Contemporary Voices",
      nameAr: "أصوات سعودية معاصرة",
      description: "A carefully curated collection showcasing the diversity and innovation of contemporary Saudi artists working across various media.",
      descriptionAr: "مجموعة منسقة بعناية تعرض تنوع وابتكار الفنانين السعوديين المعاصرين العاملين عبر وسائط مختلفة.",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      featured: true
    },
    {
      name: "Gulf Heritage & Modernity",
      nameAr: "تراث وحداثة الخليج",
      description: "An exploration of how traditional Gulf culture informs and inspires contemporary artistic practice in the region.",
      descriptionAr: "استكشاف لكيفية إعلام الثقافة الخليجية التقليدية وإلهام الممارسة الفنية المعاصرة في المنطقة.",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
      featured: true
    },
    {
      name: "Emerging Talents",
      nameAr: "المواهب الناشئة",
      description: "Highlighting the next generation of Middle Eastern artists who are reshaping the contemporary art landscape.",
      descriptionAr: "تسليط الضوء على الجيل القادم من فنانين الشرق الأوسط الذين يعيدون تشكيل المشهد الفني المعاصر.",
      coverImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop",
      featured: true
    }
  ],

  articles: [
    {
      title: "The Renaissance of Saudi Art: A New Golden Age",
      titleAr: "نهضة الفن السعودي: عصر ذهبي جديد",
      slug: "renaissance-saudi-art-new-golden-age",
      content: "Saudi Arabia is experiencing an unprecedented cultural renaissance. With the launch of Vision 2030 and initiatives like the Saudi Art Council, the Kingdom has positioned itself as a major player in the global art scene. This transformation is not just about infrastructure – it's about nurturing a generation of artists who are redefining what it means to be Saudi in the 21st century.\n\nThe emergence of world-class galleries like Athr Gallery in Jeddah and the upcoming cultural districts in Riyadh and Al-Ula represent a fundamental shift in how the Kingdom approaches cultural expression. Artists like Manal AlDowayan and Ahmed Mater have gained international recognition, showcasing Saudi perspectives on globalization, tradition, and modernity.\n\nThis artistic awakening coincides with broader social changes in the Kingdom. As Saudi society opens up to new ideas and experiences, artists are finding their voices and audiences are eager to engage with contemporary art that speaks to their lived experiences.\n\nThe future looks bright for Saudi art, with increased government support, private investment, and international collaboration creating an ecosystem where creativity can flourish.",
      contentAr: "تشهد المملكة العربية السعودية نهضة ثقافية لم يسبق لها مثيل. مع إطلاق رؤية ٢٠٣٠ ومبادرات مثل مجلس الفنون السعودي، وضعت المملكة نفسها كلاعب رئيسي في المشهد الفني العالمي...",
      excerpt: "Exploring how Vision 2030 and cultural initiatives are transforming Saudi Arabia into a global art powerhouse.",
      excerptAr: "استكشاف كيف تعمل رؤية ٢٠٣٠ والمبادرات الثقافية على تحويل المملكة العربية السعودية إلى قوة فنية عالمية.",
      coverImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      category: "Art Scene",
      categoryAr: "المشهد الفني",
      authorId: "user1",
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      readTime: 8,
      viewCount: 1250,
      likeCount: 89,
      featured: true,
      status: "published",
      tags: ["Saudi Art", "Vision 2030", "Contemporary Art", "Cultural Renaissance"],
      tagsAr: ["الفن السعودي", "رؤية ٢٠٣٠", "الفن المعاصر", "النهضة الثقافية"]
    },
    {
      title: "Digital Art Revolution in the Gulf: NFTs and Beyond",
      titleAr: "ثورة الفن الرقمي في الخليج: الرموز غير القابلة للاستبدال وما بعدها",
      slug: "digital-art-revolution-gulf-nfts-beyond",
      content: "The Gulf region is at the forefront of the digital art revolution, with artists and collectors embracing new technologies to create, exhibit, and trade digital artworks. From NFT marketplaces to virtual reality exhibitions, the region is proving that innovation and tradition can coexist in the art world.\n\nEmirates like Dubai and Abu Dhabi have become hubs for digital art experimentation, while Saudi Arabia's NEOM project promises to integrate cutting-edge technology with artistic expression. Artists are exploring how blockchain technology can democratize art ownership and create new revenue streams.\n\nThis digital transformation is particularly significant for younger artists who grew up in the digital age. They're using tools like AI, VR, and blockchain to tell stories that resonate with global audiences while maintaining their cultural roots.\n\nThe intersection of technology and art in the Gulf represents more than just a trend – it's a fundamental shift in how we create, experience, and value art in the digital age.",
      contentAr: "منطقة الخليج في المقدمة من ثورة الفن الرقمي، حيث يتبنى الفنانون والمجمعون تقنيات جديدة لإنشاء وعرض وتجارة الأعمال الفنية الرقمية...",
      excerpt: "How Gulf artists are pioneering the digital art revolution through NFTs, virtual reality, and blockchain technology.",
      excerptAr: "كيف يقود فنانو الخليج ثورة الفن الرقمي من خلال الرموز غير القابلة للاستبدال والواقع الافتراضي وتقنية البلوك تشين.",
      coverImage: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop",
      category: "Technology",
      categoryAr: "التكنولوجيا",
      authorId: "user2",
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      readTime: 6,
      viewCount: 892,
      likeCount: 67,
      featured: true,
      status: "published",
      tags: ["Digital Art", "NFT", "Gulf Art", "Technology", "Innovation"],
      tagsAr: ["الفن الرقمي", "الرموز غير القابلة للاستبدال", "فن الخليج", "التكنولوجيا", "الابتكار"]
    },
    {
      title: "Collecting Middle Eastern Art: A Beginner's Guide",
      titleAr: "جمع الفن الشرق أوسطي: دليل المبتدئين",
      slug: "collecting-middle-eastern-art-beginners-guide",
      content: "Starting an art collection can feel overwhelming, especially in the dynamic and rapidly evolving Middle Eastern art market. This guide aims to help new collectors navigate the landscape, understand market trends, and make informed decisions about their first acquisitions.\n\nThe Middle Eastern art market has seen significant growth over the past decade, with works by regional artists appreciating substantially. However, collecting should be about more than investment potential – it's about supporting artists and preserving cultural heritage.\n\nWhen starting your collection, consider focusing on a specific medium, time period, or geographic region. This helps develop expertise and creates a cohesive collection narrative. Don't be afraid to start small – emerging artists often offer exceptional value and the satisfaction of supporting developing careers.\n\nResearch is crucial. Visit galleries, attend exhibitions, and read about artists and art movements. Building relationships with gallery owners and curators can provide valuable insights and access to exceptional works.",
      contentAr: "بدء مجموعة فنية يمكن أن يكون مربكاً، خاصة في سوق الفن الشرق أوسطي الديناميكي والمتطور بسرعة...",
      excerpt: "Essential tips and insights for new collectors entering the vibrant Middle Eastern art market.",
      excerptAr: "نصائح ورؤى أساسية للمجمعين الجدد الذين يدخلون سوق الفن الشرق أوسطي النابض بالحياة.",
      coverImage: "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop",
      category: "Collecting",
      categoryAr: "جمع الأعمال الفنية",
      authorId: "user3",
      publishedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      readTime: 10,
      viewCount: 654,
      likeCount: 43,
      featured: false,
      status: "published",
      tags: ["Art Collecting", "Investment", "Middle Eastern Art", "Beginner Guide"],
      tagsAr: ["جمع الفن", "الاستثمار", "الفن الشرق أوسطي", "دليل المبتدئين"]
    }
  ]
};

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("Clearing existing data...");
    await db.delete(favorites);
    await db.delete(inquiries);
    await db.delete(articles);
    await db.delete(collectionArtworks);
    await db.delete(collections);
    await db.delete(bids);
    await db.delete(auctions);
    await db.delete(artworks);
    await db.delete(galleries);
    await db.delete(artists);
    await db.delete(users);

    // Insert users
    console.log("Inserting users...");
    await db.insert(users).values(mockData.users);

    // Insert artists
    console.log("Inserting artists...");
    const insertedArtists = await db.insert(artists).values(mockData.artists).returning();

    // Insert galleries
    console.log("Inserting galleries...");
    const insertedGalleries = await db.insert(galleries).values(mockData.galleries).returning();

    // Update artwork data with actual artist and gallery IDs
    const artworkData = mockData.artworks.map((artwork, index) => ({
      ...artwork,
      artistId: insertedArtists[artwork.artistId - 1]?.id || insertedArtists[0].id,
      galleryId: insertedGalleries[artwork.galleryId - 1]?.id || insertedGalleries[0].id,
    }));

    // Insert artworks
    console.log("Inserting artworks...");
    const insertedArtworks = await db.insert(artworks).values(artworkData).returning();

    // Update auction data with actual artwork IDs
    const auctionData = mockData.auctions.map((auction) => ({
      ...auction,
      artworkId: insertedArtworks[auction.artworkId - 1]?.id || insertedArtworks[0].id,
    }));

    // Insert auctions
    console.log("Inserting auctions...");
    const insertedAuctions = await db.insert(auctions).values(auctionData).returning();

    // Insert sample bids
    console.log("Inserting sample bids...");
    const sampleBids = [
      {
        auctionId: insertedAuctions[0].id,
        userId: "user1",
        amount: "60000",
        currency: "SAR"
      },
      {
        auctionId: insertedAuctions[0].id,
        userId: "user2",
        amount: "65000",
        currency: "SAR"
      },
      {
        auctionId: insertedAuctions[0].id,
        userId: "user3",
        amount: "70000",
        currency: "SAR"
      },
      {
        auctionId: insertedAuctions[0].id,
        userId: "user1",
        amount: "75000",
        currency: "SAR"
      }
    ];
    await db.insert(bids).values(sampleBids);

    // Insert collections
    console.log("Inserting collections...");
    const insertedCollections = await db.insert(collections).values(mockData.collections).returning();

    // Insert collection artworks
    console.log("Inserting collection artworks...");
    const collectionArtworkData = [
      { collectionId: insertedCollections[0].id, artworkId: insertedArtworks[0].id },
      { collectionId: insertedCollections[0].id, artworkId: insertedArtworks[1].id },
      { collectionId: insertedCollections[0].id, artworkId: insertedArtworks[2].id },
      { collectionId: insertedCollections[1].id, artworkId: insertedArtworks[4].id },
      { collectionId: insertedCollections[1].id, artworkId: insertedArtworks[3].id },
      { collectionId: insertedCollections[2].id, artworkId: insertedArtworks[5].id },
      { collectionId: insertedCollections[2].id, artworkId: insertedArtworks[6].id }
    ];
    await db.insert(collectionArtworks).values(collectionArtworkData);

    // Insert articles
    console.log("Inserting articles...");
    await db.insert(articles).values(mockData.articles);

    // Insert sample favorites
    console.log("Inserting sample favorites...");
    const sampleFavorites = [
      { userId: "user1", artworkId: insertedArtworks[0].id },
      { userId: "user1", artworkId: insertedArtworks[2].id },
      { userId: "user1", artworkId: insertedArtworks[4].id },
      { userId: "user2", artworkId: insertedArtworks[1].id },
      { userId: "user2", artworkId: insertedArtworks[3].id },
      { userId: "user3", artworkId: insertedArtworks[0].id },
      { userId: "user3", artworkId: insertedArtworks[5].id }
    ];
    await db.insert(favorites).values(sampleFavorites);

    // Insert sample inquiries
    console.log("Inserting sample inquiries...");
    const sampleInquiries = [
      {
        artworkId: insertedArtworks[0].id,
        userId: "user2",
        message: "I'm interested in learning more about this piece. Could you provide additional details about the installation requirements?",
        status: "pending" as const
      },
      {
        artworkId: insertedArtworks[2].id,
        userId: "user1", 
        message: "Beautiful work! I would like to discuss purchasing this piece. What is the availability and payment process?",
        status: "responded" as const,
        response: "Thank you for your interest! This piece is available for purchase. Our gallery coordinator will contact you within 24 hours to discuss the details."
      },
      {
        artworkId: insertedArtworks[4].id,
        userId: "user3",
        message: "Could you tell me more about the artist's background and the cultural significance of this copper work?",
        status: "pending" as const
      }
    ];
    await db.insert(inquiries).values(sampleInquiries);

    console.log("✅ Database seeding completed successfully!");
    console.log(`
📊 Seeded data summary:
- ${mockData.users.length} users
- ${mockData.artists.length} artists
- ${mockData.galleries.length} galleries  
- ${mockData.artworks.length} artworks
- ${mockData.auctions.length} auctions
- ${sampleBids.length} bids
- ${mockData.collections.length} collections
- ${collectionArtworkData.length} collection artworks
- ${mockData.articles.length} articles
- ${sampleFavorites.length} favorites
- ${sampleInquiries.length} inquiries
    `);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}