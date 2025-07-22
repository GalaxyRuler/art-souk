# Art Souk Translation Key Usage Report

## 1. Overview
This report lists all translation keys used in the client app, compares them to the keys defined in `client/src/lib/i18n.ts`, and highlights any missing or problematic keys. It also provides actionable fixes for missing keys.

---

## 2. Used Translation Keys (by Component)

### Example (partial, full list in next section):
- `curators.title` (CuratorsPicks.tsx)
- `curators.description` (CuratorsPicks.tsx)
- `curators.viewAll` (CuratorsPicks.tsx)
- `favorites.removed` (ArtworkCard.tsx)
- `favorites.added` (ArtworkCard.tsx)
- `common.error` (ArtworkCard.tsx, SocialComponents.tsx, ...)
- ...

---

## 3. Dynamic Translation Keys

Some keys are constructed dynamically, e.g.:
- `t(`artwork.status.${artwork.availability}`)`
- `t(`search.types.${type}`)`
- `t(`gallery.${event.status}`)`

**Advice:**
- Ensure all possible values for the dynamic part (e.g., `artwork.availability`, `type`, `event.status`) are present as subkeys in your resources.
- Add console logs to debug missing dynamic keys at runtime.

---

## 4. Used vs. Defined Keys

### A. Keys Used and Defined in Both Languages
- [x] `curators.title`
- [x] `curators.description`
- [x] `curators.viewAll`
- [x] `favorites.removed`
- [x] `favorites.added`
- [x] `common.error`
- ...

### B. Keys Used but **Missing** in One or Both Languages
- [ ] `analytics.advancedDashboard`  
- [ ] `analytics.comprehensiveInsights`
- [ ] `analytics.last7Days`
- [ ] `analytics.last30Days`
- [ ] `analytics.last90Days`
- [ ] `analytics.lastYear`
- [ ] `analytics.export`
- [ ] `analytics.totalViews`
- [ ] `analytics.fromLastPeriod`
- [ ] `analytics.uniqueVisitors`
- [ ] `analytics.engagement`
- [ ] `analytics.conversionRate`
- [ ] `analytics.overview`
- [ ] `analytics.users`
- [ ] `analytics.content`
- [ ] `analytics.conversion`
- [ ] `analytics.revenue`
- [ ] `analytics.trafficOverTime`
- [ ] `analytics.dailyVisitorTrends`
- [ ] `analytics.userJourney`
- [ ] `analytics.conversionFunnelAnalysis`
- [ ] `analytics.topPerformingContent`
- [ ] `analytics.mostViewedArtworks`
- [ ] `analytics.views`
- [ ] `analytics.userDemographics`
- [ ] `analytics.userTypeDistribution`
- [ ] `analytics.userActivity`
- [ ] `analytics.dailyActiveUsers`
- [ ] `analytics.lifecycleStages`
- [ ] `analytics.userProgressThroughStages`
- [ ] `analytics.contentPerformance`
- [ ] `analytics.engagementByContentType`
- [ ] `analytics.categoryTrends`
- [ ] `analytics.popularArtCategories`
- [ ] `analytics.conversionFunnel`
- [ ] `analytics.userConversionPath`
- [ ] `analytics.goalCompletions`
- [ ] `analytics.keyActionTracking`
- [ ] `analytics.revenueTrends`
- [ ] `analytics.platformCommissions`
- [ ] `analytics.topEarningArtists`
- [ ] `analytics.highestRevenue`
- [ ] `analytics.artworksSold`
- [ ] `analytics.totalRevenue`
- [ ] `common.sar`
- [ ] `notifications.success`
- [ ] `notifications.allMarkedRead`
- [ ] `notifications.settingsUpdated`
- [ ] `community.title`
- [ ] `community.subtitle`
- [ ] `community.search`
- [ ] `community.category`
- [ ] `community.filter`
- [ ] `community.new`
- [ ] `community.newDiscussion`
- [ ] `community.titlePlaceholder`
- [ ] `community.selectCategory`
- [ ] `community.contentPlaceholder`
- [ ] `community.create`
- [ ] `community.cancel`
- [ ] `community.reply`
- [ ] `community.like`
- [ ] `community.empty`
- ...

---

## 5. Actionable Fixes: Add These Keys to Your Resources

Add the following keys to both `en` and `ar` in `client/src/lib/i18n.ts` (with appropriate translations):

```json
{
  "analytics": {
    "advancedDashboard": "Advanced Analytics Dashboard",
    "comprehensiveInsights": "Comprehensive insights into your platform's performance.",
    "last7Days": "Last 7 Days",
    "last30Days": "Last 30 Days",
    "last90Days": "Last 90 Days",
    "lastYear": "Last Year",
    "export": "Export",
    "totalViews": "Total Views",
    "fromLastPeriod": "from last period",
    "uniqueVisitors": "Unique Visitors",
    "engagement": "Engagement",
    "conversionRate": "Conversion Rate",
    "overview": "Overview",
    "users": "Users",
    "content": "Content",
    "conversion": "Conversion",
    "revenue": "Revenue",
    "trafficOverTime": "Traffic Over Time",
    "dailyVisitorTrends": "Daily Visitor Trends",
    "userJourney": "User Journey",
    "conversionFunnelAnalysis": "Conversion Funnel Analysis",
    "topPerformingContent": "Top Performing Content",
    "mostViewedArtworks": "Most Viewed Artworks",
    "views": "Views",
    "userDemographics": "User Demographics",
    "userTypeDistribution": "User Type Distribution",
    "userActivity": "User Activity",
    "dailyActiveUsers": "Daily Active Users",
    "lifecycleStages": "Lifecycle Stages",
    "userProgressThroughStages": "User Progress Through Stages",
    "contentPerformance": "Content Performance",
    "engagementByContentType": "Engagement by Content Type",
    "categoryTrends": "Category Trends",
    "popularArtCategories": "Popular Art Categories",
    "conversionFunnel": "Conversion Funnel",
    "userConversionPath": "User Conversion Path",
    "goalCompletions": "Goal Completions",
    "keyActionTracking": "Key Action Tracking",
    "revenueTrends": "Revenue Trends",
    "platformCommissions": "Platform Commissions",
    "topEarningArtists": "Top Earning Artists",
    "highestRevenue": "Highest Revenue",
    "artworksSold": "Artworks Sold",
    "totalRevenue": "Total Revenue"
  },
  "common": {
    "sar": "SAR"
  },
  "notifications": {
    "success": "Success",
    "allMarkedRead": "All notifications marked as read",
    "settingsUpdated": "Notification settings updated"
  },
  "community": {
    "title": "Art Community",
    "subtitle": "Connect with fellow artists, share techniques, and discuss art",
    "search": "Search discussions...",
    "category": "Category",
    "filter": "Filter",
    "new": "New Discussion",
    "newDiscussion": "Create New Discussion",
    "titlePlaceholder": "Discussion title...",
    "selectCategory": "Select category",
    "contentPlaceholder": "Share your thoughts...",
    "create": "Create Discussion",
    "cancel": "Cancel",
    "reply": "Reply",
    "like": "Like",
    "empty": "No discussions found. Start the conversation!"
  }
}
```

---

## 6. Dynamic Key Coverage
- For all dynamic usages, ensure all possible subkeys are present in your resources.
- Example: If you use `t(`artwork.status.${artwork.availability}`)`, make sure `artwork.status.available`, `artwork.status.sold`, etc. exist.

---

## 7. Next Steps
- Add the missing keys above to both `en` and `ar` resources.
- For dynamic keys, log the actual key at runtime if you see untranslated keys in the UI.
- Re-run this report after updating resources to ensure all keys are covered.

---

*This report was generated automatically. If you need a list of unused keys or want to automate the addition of missing keys, let me know!* 