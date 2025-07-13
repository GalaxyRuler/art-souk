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
        },
        recommendations: {
          title: "Recommended for You",
          subtitle: "Discover art based on your interests",
          exploreArtists: "Explore Artists"
        },
        featuredArtists: {
          title: "Featured Artists",
          subtitle: "Discover talented artists from the region"
        },
        liveAuctions: {
          title: "Live Auctions"
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
        anonymous: "Anonymous",
        retry: "Retry",
        search: "Search",
        filter: "Filter",
        clear: "Clear",
        apply: "Apply",
        close: "Close",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        confirm: "Confirm",
        yes: "Yes",
        no: "No",
        allCategories: "All Categories",
        allStatus: "All Status",
        published: "Published",
        featured: "Featured"
      },
      site: {
        name: "Art Souk",
        tagline: "Saudi Arabia & GCC Art"
      },
      collections: {
        featured: {
          title: "Featured Collections",
          description: "Discover curated art collections from leading galleries and collectors"
        }
      },
      footer: {
        newsletter: {
          title: "Stay Updated",
          description: "Get the latest art news and exclusive access to new collections",
          placeholder: "Enter your email",
          subscribe: "Subscribe"
        },
        explore: {
          title: "Explore"
        },
        resources: {
          title: "Resources",
          guide: "Collector's Guide",
          investment: "Art Investment",
          support: "Support"
        },
        copyright: "© 2025 Art Souk. All rights reserved."
      },
      auctions: {
        live: "Live",
        viewAll: "View All Auctions",
        bids: "bids",
        placeBid: "Place Bid",
        title: "Auctions",
        subtitle: "Participate in live art auctions",
        upcoming: "Upcoming",
        ended: "Ended",
        endingSoon: "Ending Soon",
        notFound: "Auction Not Found",
        browseAuctions: "Browse Auctions",
        liveAuction: "Live Auction",
        linkCopiedDesc: "Auction link copied to clipboard",
        backToAuctions: "Back to Auctions",
        estimate: "Estimate",
        yourBid: "Your Bid",
        enterBidAmount: "Enter bid amount",
        starts: "Starts",
        auctionEnded: "Auction Ended",
        finalBid: "Final Bid",
        liveBidding: "Live Bidding",
        updatesAutomatically: "Updates Automatically",
        biddingActivity: "Bidding Activity",
        leading: "Leading",
        noBidsYet: "No bids yet",
        beFirstToBid: "Be the first to bid",
        termsAndConditions: "Terms & Conditions",
        timeRemaining: {
          days: "{{count}} day remaining",
          days_plural: "{{count}} days remaining",
          hours: "{{count}} hour remaining", 
          hours_plural: "{{count}} hours remaining",
          minutes: "{{count}} minute remaining",
          minutes_plural: "{{count}} minutes remaining"
        },
        currentBid: "Current Bid",
        startingPrice: "Starting Price",
        bidCount: "Bid Count",
        timeLeft: "Time Left",
        auctionDetails: "Auction Details",
        bidHistory: "Bid History",
        placeBidButton: "Place Bid",
        loginToBid: "Login to Bid",
        bidding: {
          invalidAmount: "Invalid Bid Amount",
          invalidAmountDesc: "Please enter a valid bid amount",
          bidTooLow: "Bid Too Low",
          bidTooLowDesc: "Your bid must be higher than the current bid of {{amount}}",
          incrementTooSmall: "Increment Too Small",
          incrementTooSmallDesc: "Minimum bid increment is {{amount}}"
        },
        statusText: {
          liveNow: "Live Now",
          startingSoon: "Starting Soon",
          ended: "Ended"
        },
        tabs: {
          live: "Live",
          upcoming: "Upcoming",
          all: "All"
        },
        stats: {
          live: "Live",
          upcoming: "Upcoming",
          total: "Total",
          totalBids: "Total Bids"
        },
        noLive: {
          title: "No Live Auctions",
          description: "There are no live auctions at the moment"
        },
        noUpcoming: {
          title: "No Upcoming Auctions",
          description: "There are no upcoming auctions scheduled"
        },
        noAuctions: {
          title: "No Auctions",
          description: "There are no auctions available"
        },
        minimumBid: "Minimum Bid",
        biddingIncrements: "Bidding Increments",
        timeRemaining: "Time Remaining"
      },
      artist: {
        featured: "Featured",
        notFound: "Artist Not Found",
        browseArtists: "Browse Artists",
        linkCopied: "Link Copied",
        linkCopiedDescription: "Artist profile link copied to clipboard",
        backToArtists: "Back to Artists",
        born: "Born",
        died: "Died",
        artworks: "artworks",
        share: "Share",
        aboutArtist: "About Artist",
        statistics: "Statistics",
        totalArtworks: "Total Artworks",
        contactSocial: "Contact & Social",
        tabs: {
          artworks: "Artworks"
        },
        exhibitions: "Exhibitions",
        noExhibitionsTitle: "No Exhibitions",
        noExhibitionsDescription: "This artist has not participated in any exhibitions yet.",
        noArtworksTitle: "No Artworks",
        noArtworksDescription: "This artist has not uploaded any artworks yet.",
        totalSales: "Total Sales",
        averagePrice: "Average Price",
        categories: "Categories",
        website: "Website",
        instagram: "Instagram",
        email: "Email",
        additionalInfo: "Additional Info",
        style: "Style",
        primaryMedium: "Primary Medium",
        education: "Education",
        awards: "Awards",
        soloExhibitions: "Solo Exhibitions",
        groupExhibitions: "Group Exhibitions"
      },
      artists: {
        viewAll: "View All Artists"
      },
      artwork: {
        status: {
          available: "Available"
        }
      },
      artworks: {
        viewAll: "View All Artworks"
      },
      errors: {
        loadingArtists: "Error loading artists",
        loadingGalleries: "Error loading galleries", 
        tryAgainLater: "Please try again later"
      },
      artists: {
        title: "Artists",
        subtitle: "Discover talented artists from across the GCC region",
        featured: "Featured Artists",
        searchPlaceholder: "Search artists...",
        sortBy: "Sort by",
        nationality: "Nationality",
        all: "All",
        latest: "Latest",
        popular: "Popular",
        alphabetical: "Alphabetical",
        viewAll: "View All Artists",
        search: {
          placeholder: "Search artists..."
        },
        filters: {
          nationality: "Nationality",
          allCountries: "All Countries"
        },
        sort: {
          latest: "Latest",
          name: "Name",
          featured: "Featured"
        },
        results: "Results"
      },
      galleries: {
        title: "Galleries", 
        subtitle: "Explore premier art galleries in the region",
        featured: "Featured Galleries",
        searchPlaceholder: "Search galleries...",
        location: "Location",
        contact: "Contact",
        website: "Website",
        phone: "Phone",
        email: "Email",
        search: {
          placeholder: "Search galleries..."
        },
        filters: {
          location: "Location",
          allLocations: "All Locations"
        },
        sort: {
          latest: "Latest",
          name: "Name",
          featured: "Featured"
        },
        results: "{{count}} galleries found",
        noResults: {
          title: "No Galleries Found",
          description: "Try adjusting your search or filters to find galleries"
        }
      },
      gallery: {
        unfollowedGallery: "Unfollowed Gallery",
        followingGallery: "Following Gallery",
        unfollowDescription: "You are no longer following this gallery",
        followDescription: "You are now following this gallery",
        notFound: "Gallery Not Found",
        browseGalleries: "Browse Galleries",
        linkCopied: "Link Copied",
        linkCopiedDescription: "Gallery link has been copied to clipboard",
        backToGalleries: "Back to Galleries",
        featured: "Featured",
        established: "Established",
        artists: "Artists",
        share: "Share",
        aboutGallery: "About Gallery",
        contactInfo: "Contact Information",
        address: "Address",
        website: "Website",
        phone: "Phone",
        email: "Email",
        visitWebsite: "Visit Website",
        openingHours: "Opening Hours",
        galleryStats: "Gallery Statistics",
        representedArtists: "Represented Artists",
        availableArtworks: "Available Artworks",
        totalExhibitions: "Total Exhibitions",
        yearsInBusiness: "Years in Business",
        artworks: "Artworks",
        exhibitions: "Exhibitions",
        noArtworksAvailable: "No Artworks Available",
        noArtworksDescription: "This gallery has no artworks available at the moment",
        noArtistsRepresented: "No Artists Represented",
        noArtistsDescription: "This gallery is not representing any artists yet",
        currentExhibitions: "Current Exhibitions",
        current: "Current",
        solo: "Solo",
        group: "Group",
        artworksLowercase: "artworks",
        upcomingExhibitions: "Upcoming Exhibitions",
        upcoming: "Upcoming",
        starts: "Starts",
        pastExhibitions: "Past Exhibitions",
        noExhibitions: "No Exhibitions",
        noExhibitionsDescription: "This gallery has no exhibitions scheduled"
      },
      workshops: {
        title: "Workshops",
        subtitle: "Learn from expert artists and expand your skills",
        featured: "Featured Workshops",
        searchPlaceholder: "Search workshops...",
        category: "Category",
        level: "Level",
        register: "Register",
        registrationSuccess: "Registration Successful",
        registrationSuccessDesc: "You have successfully registered for the workshop",
        registrationFailed: "Registration Failed",
        registrationFailedDesc: "Unable to register for workshop. Please try again.",
        loginToRegister: "Please login to register for workshops",
        duration: "Duration",
        materials: "Materials",
        instructor: "Instructor",
        participants: "Participants",
        price: "Price",
        date: "Date",
        time: "Time",
        location: "Location",
        online: "Online",
        inPerson: "In Person",
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        all: "All Levels",
        loading: "Loading workshops...",
        search: "Search workshops...",
        filter: "Filter",
        categories: {
          painting: "Painting",
          sculpture: "Sculpture",
          drawing: "Drawing",
          digital_art: "Digital Art",
          photography: "Photography"
        },
        skillLevel: {
          all: "All Levels",
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced"
        }
      },
      events: {
        title: "Events",
        subtitle: "Join exclusive art events and exhibitions",
        featured: "Featured Events",
        searchPlaceholder: "Search events...",
        category: "Category",
        status: "Status",
        rsvp: "RSVP",
        rsvpSuccess: "RSVP Successful",
        rsvpSuccessDesc: "Your RSVP has been recorded",
        loginToRSVP: "Please login to RSVP for events",
        date: "Date",
        time: "Time",
        location: "Location",
        organizer: "Organizer",
        participants: "Participants",
        attendees: "Attendees",
        price: "Price",
        free: "Free",
        upcoming: "Upcoming",
        ongoing: "Ongoing",
        completed: "Completed",
        cancelled: "Cancelled",
        loading: "Loading events...",
        search: "Search events...",
        filter: "Filter",
        online: "Online",
        attending: "Attending",
        maybeAttending: "Maybe",
        all: "All Events",
        rsvpFailed: "RSVP Failed",
        rsvpFailedDesc: "Unable to process your RSVP. Please try again.",
        categories: {
          all: "All Categories",
          Exhibition: "Exhibition",
          Workshop: "Workshop",
          Conference: "Conference",
          Lecture: "Lecture",
          Opening: "Opening",
          Auction: "Auction",
          Fair: "Fair",
          Festival: "Festival",
          Competition: "Competition",
          Networking: "Networking",
          Panel: "Panel Discussion",
          Performance: "Performance",
          Screening: "Screening",
          Tour: "Tour",
          Other: "Other",
          exhibition: "Exhibition",
          workshop: "Workshop",
          talk: "Talk",
          networking: "Networking",
          Talk: "Talk",
          Technology: "Technology",
          "Traditional Arts": "Traditional Arts"
        }
      },
      commissions: {
        title: "Commissions",
        subtitle: "Commission custom artwork from talented artists",
        requests: {
          title: "Commission Requests",
          subtitle: "Browse available commission opportunities",
          postRequest: "Post Request",
          viewDetails: "View Details",
          placeBid: "Place Bid",
          bidsCount: "{{count}} bids",
          noRequests: "No commission requests available",
          noRequestsDescription: "Browse through available commission opportunities or post your own request.",
          postFirstRequest: "Post First Request"
        },
        featured: "Featured",
        status: {
          open: "Open",
          closed: "Closed",
          inProgress: "In Progress",
          completed: "Completed",
          cancelled: "Cancelled"
        },
        requestNotFound: "Commission request not found",
        description: "Description",
        details: "Details",
        category: "Category",
        medium: "Medium",
        style: "Style",
        dimensions: "Dimensions",
        budget: "Budget",
        deadline: "Deadline",
        materials: "Materials",
        requirements: "Requirements",
        bids: "Bids",
        messages: "Messages",
        artistBid: "Artist Bid",
        days: "days",
        noBidsYet: "No bids yet",
        noMessagesYet: "No messages yet",
        submitBid: "Submit Bid",
        bidAmount: "Bid Amount",
        enterBidAmount: "Enter your bid amount",
        timeline: "Timeline",
        enterTimeline: "Enter estimated timeline",
        proposal: "Proposal",
        enterProposal: "Enter your proposal",
        requestedBy: "Requested By",
        collector: "Collector",
        memberSince: "Member since {{date}}",
        referenceImages: "Reference Images",
        bidSubmitted: "Bid Submitted",
        bidSubmittedDescription: "Your bid has been submitted successfully",
        fillAllFields: "Please fill in all required fields"
      },
      countries: {
        saudiArabia: "Saudi Arabia",
        uae: "United Arab Emirates",
        kuwait: "Kuwait",
        qatar: "Qatar",
        bahrain: "Bahrain",
        oman: "Oman"
      },
      cities: {
        riyadh: "Riyadh",
        jeddah: "Jeddah",
        dammam: "Dammam",
        khobar: "Khobar",
        makkah: "Makkah",
        madinah: "Madinah",
        tabuk: "Tabuk",
        abha: "Abha",
        dubai: "Dubai",
        abuDhabi: "Abu Dhabi",
        sharjah: "Sharjah",
        ajman: "Ajman",
        fujairah: "Fujairah",
        rasAlKhaimah: "Ras Al Khaimah",
        kuwaitCity: "Kuwait City",
        doha: "Doha",
        manama: "Manama",
        muscat: "Muscat",
        salalah: "Salalah",
        sohar: "Sohar"
      },
      categories: {
        painting: "Painting",
        sculpture: "Sculpture",
        photography: "Photography",
        digital: "Digital Art",
        mixed_media: "Mixed Media",
        installation: "Installation",
        Installation: "Installation",
        performance: "Performance",
        video: "Video Art",
        drawing: "Drawing",
        printmaking: "Printmaking",
        ceramics: "Ceramics",
        jewelry: "Jewelry",
        textile: "Textile",
        calligraphy: "Calligraphy",
        Calligraphy: "Calligraphy",
        portrait: "Portrait",
        Portrait: "Portrait",
        other: "Other"
      },
      admin: {
        dashboard: "Admin Dashboard",
        dashboardDescription: "Manage platform settings and content",
        overview: "Overview",
        users: "Users",
        content: "Content",
        communication: "Communication",
        analytics: "Analytics",
        settings: "Settings",
        security: "Security",
        totalUsers: "Total Users",
        totalArtists: "Total Artists",
        totalGalleries: "Total Galleries",
        totalArtworks: "Total Artworks",
        totalAuctions: "Total Auctions",
        totalOrders: "Total Orders",
        monthlyRevenue: "Monthly Revenue",
        newUsersThisMonth: "New Users This Month",
        systemHealth: "System Health",
        activeUsers: "Active Users",
        recentActivity: "Recent Activity",
        userManagement: "User Management",
        contentModeration: "Content Moderation",
        success: "Success",
        error: "Error",
        adminSetupSuccess: "Admin privileges granted successfully",
        name: "Name",
        email: "Email",
        role: "Role",
        roles: "Roles",
        status: "Status",
        actions: "Actions",
        createdAt: "Created",
        updatedAt: "Updated",
        feature: "Feature",
        unfeature: "Unfeature",
        approve: "Approve",
        reject: "Reject",
        delete: "Delete",
        edit: "Edit",
        view: "View"
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
        required: "Authentication Required",
        unauthorized: "Unauthorized",
        loggingInAgain: "Logging in again...",
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
      editorial: {
        title: "Editorial",
        description: "Latest insights and stories from the GCC art world",
        viewAll: "View All Articles",
        readMore: "Read More",
        category: "Category",
        publishedOn: "Published on",
        byAuthor: "By",
        relatedArticles: "Related Articles"
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
        },
        recommendations: {
          title: "موصى لك",
          subtitle: "اكتشف الفن بناءً على اهتماماتك",
          exploreArtists: "استكشف الفنانين"
        },
        featuredArtists: {
          title: "الفنانون المميزون",
          subtitle: "اكتشف الفنانين الموهوبين من المنطقة"
        },
        liveAuctions: {
          title: "المزادات المباشرة"
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
        anonymous: "مجهول",
        retry: "إعادة المحاولة",
        search: "بحث",
        filter: "تصفية",
        clear: "مسح",
        apply: "تطبيق",
        close: "إغلاق",
        next: "التالي",
        previous: "السابق",
        submit: "إرسال",
        confirm: "تأكيد",
        yes: "نعم",
        no: "لا",
        upcoming: "قادم",
        completed: "مكتمل"
      },
      site: {
        name: "سوق آرت",
        tagline: "فن السعودية ودول مجلس التعاون"
      },
      collections: {
        featured: {
          title: "المجموعات المميزة",
          description: "اكتشف مجموعات فنية منتقاة من أهم المعارض والجامعين"
        }
      },
      footer: {
        newsletter: {
          title: "ابق على اطلاع",
          description: "احصل على آخر أخبار الفن والوصول الحصري للمجموعات الجديدة",
          placeholder: "أدخل بريدك الإلكتروني",
          subscribe: "اشترك"
        },
        explore: {
          title: "اكتشف"
        },
        resources: {
          title: "الموارد",
          guide: "دليل الجامع",
          investment: "الاستثمار في الفن",
          support: "الدعم"
        },
        copyright: "© 2025 سوق آرت. جميع الحقوق محفوظة."
      },
      auctions: {
        live: "مباشر",
        viewAll: "عرض جميع المزادات",
        bids: "عروض",
        placeBid: "ضع عرضاً",
        title: "المزادات",
        subtitle: "شارك في مزادات الفن المباشرة",
        upcoming: "قادم",
        ended: "انتهى",
        endingSoon: "ينتهي قريباً",
        notFound: "المزاد غير موجود",
        browseAuctions: "تصفح المزادات",
        liveAuction: "مزاد مباشر",
        linkCopiedDesc: "تم نسخ رابط المزاد",
        backToAuctions: "العودة للمزادات",
        estimate: "التقدير",
        yourBid: "عرضك",
        enterBidAmount: "أدخل مبلغ العرض",
        starts: "يبدأ",
        auctionEnded: "انتهى المزاد",
        finalBid: "العرض الأخير",
        liveBidding: "المزايدة المباشرة",
        updatesAutomatically: "يتم التحديث تلقائياً",
        biddingActivity: "نشاط المزايدة",
        leading: "الأول",
        noBidsYet: "لا توجد عروض حتى الآن",
        beFirstToBid: "كن أول من يضع عرضاً",
        termsAndConditions: "الشروط والأحكام",
        timeRemaining: {
          days: "يوم واحد متبقي",
          days_plural: "{{count}} أيام متبقية",
          hours: "ساعة واحدة متبقية",
          hours_plural: "{{count}} ساعات متبقية",
          minutes: "دقيقة واحدة متبقية",
          minutes_plural: "{{count}} دقائق متبقية"
        },
        currentBid: "العرض الحالي",
        startingPrice: "السعر الابتدائي",
        bidCount: "عدد العروض",
        timeLeft: "الوقت المتبقي",
        auctionDetails: "تفاصيل المزاد",
        bidHistory: "تاريخ العروض",
        placeBidButton: "ضع عرضاً",
        loginToBid: "سجل الدخول للمزايدة",
        bidding: {
          invalidAmount: "مبلغ العرض غير صحيح",
          invalidAmountDesc: "يرجى إدخال مبلغ عرض صحيح",
          bidTooLow: "العرض منخفض جداً",
          bidTooLowDesc: "يجب أن يكون عرضك أعلى من العرض الحالي {{amount}}",
          incrementTooSmall: "الزيادة صغيرة جداً",
          incrementTooSmallDesc: "الحد الأدنى لزيادة العرض هو {{amount}}"
        },
        statusText: {
          liveNow: "مباشر الآن",
          startingSoon: "يبدأ قريباً",
          ended: "انتهى"
        },
        tabs: {
          live: "مباشر",
          upcoming: "قادم",
          all: "الكل"
        },
        stats: {
          live: "مباشر",
          upcoming: "قادم",
          total: "المجموع",
          totalBids: "إجمالي العروض"
        },
        noLive: {
          title: "لا توجد مزادات مباشرة",
          description: "لا توجد مزادات مباشرة في الوقت الحالي"
        },
        noUpcoming: {
          title: "لا توجد مزادات قادمة",
          description: "لا توجد مزادات مجدولة قادمة"
        },
        noAuctions: {
          title: "لا توجد مزادات",
          description: "لا توجد مزادات متاحة"
        },
        minimumBid: "الحد الأدنى للمزايدة",
        biddingIncrements: "زيادات المزايدة",
        timeRemaining: "الوقت المتبقي"
      },
      artist: {
        featured: "مميز",
        notFound: "الفنان غير موجود",
        browseArtists: "تصفح الفنانين",
        linkCopied: "تم نسخ الرابط",
        linkCopiedDescription: "تم نسخ رابط الفنان إلى الحافظة",
        backToArtists: "العودة للفنانين",
        born: "مولود",
        died: "متوفى",
        artworks: "أعمال فنية",
        share: "مشاركة",
        aboutArtist: "عن الفنان",
        statistics: "الإحصائيات",
        totalArtworks: "إجمالي الأعمال الفنية",
        contactSocial: "التواصل والشبكات الاجتماعية",
        tabs: {
          artworks: "الأعمال الفنية"
        },
        exhibitions: "المعارض",
        noExhibitionsTitle: "لا توجد معارض",
        noExhibitionsDescription: "لم يشارك هذا الفنان في أي معارض حتى الآن.",
        noArtworksTitle: "لا توجد أعمال فنية",
        noArtworksDescription: "لم يقم هذا الفنان بتحميل أي أعمال فنية حتى الآن.",
        totalSales: "إجمالي المبيعات",
        averagePrice: "متوسط السعر",
        categories: "الفئات",
        website: "الموقع الإلكتروني",
        instagram: "إنستغرام",
        email: "البريد الإلكتروني",
        additionalInfo: "معلومات إضافية",
        style: "الأسلوب",
        primaryMedium: "الوسط الأساسي",
        education: "التعليم",
        awards: "الجوائز",
        soloExhibitions: "المعارض الفردية",
        groupExhibitions: "المعارض الجماعية"
      },
      commissions: {
        title: "الطلبات المخصصة",
        subtitle: "اطلب أعمالاً فنية مخصصة من فنانين موهوبين",
        requests: {
          title: "طلبات الأعمال المخصصة",
          subtitle: "تصفح الفرص المتاحة للطلبات المخصصة",
          postRequest: "نشر طلب",
          viewDetails: "عرض التفاصيل",
          placeBid: "ضع عرضاً",
          bidsCount: "{{count}} عروض",
          noRequests: "لا توجد طلبات أعمال مخصصة متاحة",
          noRequestsDescription: "تصفح الفرص المتاحة للطلبات المخصصة أو انشر طلبك الخاص.",
          postFirstRequest: "نشر أول طلب"
        },
        featured: "مميز",
        status: {
          open: "مفتوح",
          closed: "مغلق",
          inProgress: "قيد التنفيذ",
          completed: "مكتمل",
          cancelled: "ملغي"
        },
        requestNotFound: "طلب العمل المخصص غير موجود",
        description: "الوصف",
        details: "التفاصيل",
        category: "الفئة",
        medium: "الوسط",
        style: "الأسلوب",
        dimensions: "الأبعاد",
        budget: "الميزانية",
        deadline: "الموعد النهائي",
        materials: "المواد",
        requirements: "المتطلبات",
        bids: "العروض",
        messages: "الرسائل",
        artistBid: "عرض الفنان",
        days: "أيام",
        noBidsYet: "لا توجد عروض حتى الآن",
        noMessagesYet: "لا توجد رسائل حتى الآن",
        submitBid: "تقديم عرض",
        bidAmount: "مبلغ العرض",
        enterBidAmount: "أدخل مبلغ عرضك",
        timeline: "الجدولة الزمنية",
        enterTimeline: "أدخل الوقت المقدر للإنجاز",
        proposal: "الاقتراح",
        enterProposal: "أدخل اقتراحك",
        requestedBy: "مطلوب من",
        collector: "مجمع",
        memberSince: "عضو منذ {{date}}",
        referenceImages: "صور مرجعية",
        bidSubmitted: "تم تقديم العرض",
        bidSubmittedDescription: "تم تقديم عرضك بنجاح",
        fillAllFields: "يرجى ملء جميع الحقول المطلوبة"
      },
      categories: {
        painting: "رسم",
        sculpture: "نحت",
        photography: "تصوير",
        digital: "فن رقمي",
        mixed_media: "وسائط متعددة",
        installation: "تركيب",
        Installation: "تركيب",
        performance: "أداء",
        video: "فيديو آرت",
        drawing: "رسم",
        printmaking: "طباعة",
        ceramics: "سيراميك",
        jewelry: "مجوهرات",
        textile: "نسيج",
        calligraphy: "خط عربي",
        Calligraphy: "خط عربي",
        portrait: "بورتريه",
        Portrait: "بورتريه",
        other: "أخرى"
      },
      countries: {
        saudiArabia: "المملكة العربية السعودية",
        uae: "الإمارات العربية المتحدة",
        kuwait: "الكويت",
        qatar: "قطر",
        bahrain: "البحرين",
        oman: "عمان"
      },
      cities: {
        riyadh: "الرياض",
        jeddah: "جدة",
        dammam: "الدمام",
        khobar: "الخبر",
        makkah: "مكة المكرمة",
        madinah: "المدينة المنورة",
        tabuk: "تبوك",
        abha: "أبها",
        dubai: "دبي",
        abuDhabi: "أبو ظبي",
        sharjah: "الشارقة",
        ajman: "عجمان",
        fujairah: "الفجيرة",
        rasAlKhaimah: "رأس الخيمة",
        kuwaitCity: "مدينة الكويت",
        doha: "الدوحة",
        manama: "المنامة",
        muscat: "مسقط",
        salalah: "صلالة",
        sohar: "صحار"
      },
      artists: {
        title: "الفنانون",
        subtitle: "اكتشف الفنانين الموهوبين من منطقة دول الخليج",
        featured: "الفنانون المميزون",
        searchPlaceholder: "البحث عن الفنانين...",
        sortBy: "ترتيب حسب",
        nationality: "الجنسية",
        all: "الكل",
        latest: "الأحدث",
        popular: "الأكثر شعبية",
        alphabetical: "أبجدياً",
        viewAll: "عرض جميع الفنانين",
        search: {
          placeholder: "البحث عن الفنانين..."
        },
        filters: {
          nationality: "الجنسية",
          allCountries: "جميع البلدان"
        },
        sort: {
          latest: "الأحدث",
          name: "الاسم",
          featured: "مميز"
        },
        results: "النتائج"
      },
      artwork: {
        status: {
          available: "متاح"
        }
      },
      artworks: {
        viewAll: "عرض جميع الأعمال"
      },
      galleries: {
        title: "المعارض",
        subtitle: "استكشف معارض الفن الرائدة في المنطقة",
        featured: "المعارض المميزة",
        searchPlaceholder: "البحث عن المعارض...",
        location: "الموقع",
        contact: "الاتصال",
        website: "الموقع الإلكتروني",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        search: {
          placeholder: "البحث عن المعارض..."
        },
        filters: {
          location: "الموقع",
          allLocations: "جميع المواقع"
        },
        sort: {
          latest: "الأحدث",
          name: "الاسم",
          featured: "مميز"
        },
        results: "تم العثور على {{count}} معرض",
        noResults: {
          title: "لم يتم العثور على معارض",
          description: "حاول تعديل البحث أو المرشحات للعثور على معارض"
        }
      },
      gallery: {
        unfollowedGallery: "إلغاء متابعة المعرض",
        followingGallery: "متابعة المعرض",
        unfollowDescription: "لم تعد تتابع هذا المعرض",
        followDescription: "أنت الآن تتابع هذا المعرض",
        notFound: "المعرض غير موجود",
        browseGalleries: "تصفح المعارض",
        linkCopied: "تم نسخ الرابط",
        linkCopiedDescription: "تم نسخ رابط المعرض إلى الحافظة",
        backToGalleries: "العودة إلى المعارض",
        featured: "مميز",
        established: "تأسس",
        artists: "الفنانين",
        share: "مشاركة",
        aboutGallery: "عن المعرض",
        contactInfo: "معلومات الاتصال",
        address: "العنوان",
        website: "الموقع الإلكتروني",
        phone: "الهاتف",
        email: "البريد الإلكتروني",
        visitWebsite: "زيارة الموقع",
        openingHours: "ساعات العمل",
        galleryStats: "إحصائيات المعرض",
        representedArtists: "الفنانين الممثلين",
        availableArtworks: "الأعمال المتاحة",
        totalExhibitions: "إجمالي المعارض",
        yearsInBusiness: "سنوات العمل",
        artworks: "الأعمال الفنية",
        exhibitions: "المعارض",
        noArtworksAvailable: "لا توجد أعمال فنية متاحة",
        noArtworksDescription: "هذا المعرض لا يحتوي على أعمال فنية متاحة حالياً",
        noArtistsRepresented: "لا يمثل فنانين",
        noArtistsDescription: "هذا المعرض لا يمثل أي فنانين حتى الآن",
        currentExhibitions: "المعارض الحالية",
        current: "حالي",
        solo: "فردي",
        group: "جماعي",
        artworksLowercase: "أعمال فنية",
        upcomingExhibitions: "المعارض القادمة",
        upcoming: "قادم",
        starts: "يبدأ",
        pastExhibitions: "المعارض السابقة",
        noExhibitions: "لا توجد معارض",
        noExhibitionsDescription: "هذا المعرض لا يحتوي على معارض مجدولة"
      },
      editorial: {
        title: "الافتتاحية",
        description: "آخر المقالات والقصص من عالم الفن الخليجي",
        viewAll: "عرض جميع المقالات",
        readMore: "اقرأ المزيد",
        category: "الفئة",
        publishedOn: "نشر في",
        byAuthor: "بواسطة",
        relatedArticles: "مقالات ذات صلة"
      },
      events: {
        title: "الفعاليات",
        subtitle: "انضم إلى أحداث وفعاليات فنية حصرية",
        featured: "الفعاليات المميزة",
        searchPlaceholder: "البحث عن الفعاليات...",
        category: "الفئة",
        status: "الحالة",
        rsvp: "تأكيد الحضور",
        rsvpSuccess: "تم تأكيد الحضور بنجاح",
        rsvpSuccessDesc: "تم تسجيل تأكيد حضورك",
        loginToRSVP: "يرجى تسجيل الدخول لتأكيد الحضور",
        date: "التاريخ",
        time: "الوقت",
        location: "المكان",
        organizer: "المنظم",
        participants: "المشاركون",
        attendees: "الحضور",
        price: "السعر",
        free: "مجاني",
        upcoming: "قادم",
        ongoing: "جاري",
        completed: "مكتمل",
        cancelled: "ملغي",
        loading: "جاري تحميل الفعاليات...",
        search: "البحث عن الفعاليات...",
        filter: "تصفية",
        online: "عبر الإنترنت",
        attending: "سأحضر",
        maybeAttending: "ربما",
        all: "جميع الفعاليات",
        rsvpFailed: "فشل في تأكيد الحضور",
        rsvpFailedDesc: "لا يمكن معالجة تأكيد حضورك. يرجى المحاولة مرة أخرى.",
        categories: {
          all: "جميع الفئات",
          Exhibition: "معرض",
          Workshop: "ورشة عمل",
          Conference: "مؤتمر",
          Lecture: "محاضرة",
          Opening: "افتتاح",
          Auction: "مزاد",
          Fair: "معرض تجاري",
          Festival: "مهرجان",
          Competition: "مسابقة",
          Networking: "تواصل",
          Panel: "نقاش مائدة مستديرة",
          Performance: "أداء",
          Screening: "عرض",
          Tour: "جولة",
          Other: "أخرى",
          exhibition: "معرض",
          workshop: "ورشة عمل",
          talk: "محاضرة",
          networking: "تواصل",
          Talk: "محاضرة",
          Technology: "التكنولوجيا",
          "Traditional Arts": "الفنون التقليدية"
        }
      },
      workshops: {
        title: "ورش العمل",
        subtitle: "تعلم من الفنانين الخبراء وطور مهاراتك",
        featured: "ورش العمل المميزة",
        searchPlaceholder: "البحث عن ورش العمل...",
        category: "الفئة",
        level: "المستوى",
        register: "التسجيل",
        registrationSuccess: "تم التسجيل بنجاح",
        registrationSuccessDesc: "لقد تم تسجيلك بنجاح في ورشة العمل",
        registrationFailed: "فشل التسجيل",
        registrationFailedDesc: "لا يمكن التسجيل في ورشة العمل. يرجى المحاولة مرة أخرى.",
        loginToRegister: "يرجى تسجيل الدخول للتسجيل في ورش العمل",
        duration: "المدة",
        materials: "المواد",
        instructor: "المدرب",
        participants: "المشاركون",
        price: "السعر",
        date: "التاريخ",
        time: "الوقت",
        location: "المكان",
        online: "عبر الإنترنت",
        inPerson: "حضوري",
        beginner: "مبتدئ",
        intermediate: "متوسط",
        advanced: "متقدم",
        all: "جميع المستويات",
        loading: "جاري تحميل ورش العمل...",
        search: "البحث عن ورش العمل...",
        filter: "تصفية",
        categories: {
          painting: "الرسم",
          sculpture: "النحت",
          drawing: "الرسم",
          digital_art: "الفن الرقمي",
          photography: "التصوير"
        },
        skillLevel: {
          all: "جميع المستويات",
          beginner: "مبتدئ",
          intermediate: "متوسط",
          advanced: "متقدم"
        }
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
