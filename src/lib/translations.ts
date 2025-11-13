export const translations = {
  en: {
    header: {
      myAccount: 'My Account',
      profile: 'Profile',
      logout: 'Logout',
    },
    sidebar: {
      dashboard: 'Dashboard',
      createAd: 'Create Ad',
      reviewAd: 'Review Ad',
      siteAI: 'Site AI',
      financials: 'Financials',
      agency: 'Agency',
      adminPanel: 'Admin Panel',
      settings: 'Settings',
      support: 'Support',
    },
    dashboard: {
      metrics: {
        balance: {
          title: 'Current Balance',
          description: 'Includes $4.00 welcome bonus',
        },
        activeCampaigns: {
          title: 'Active Campaigns',
          one: '1 campaign is currently running',
          none: 'No active campaigns',
        },
        referralEarnings: {
          title: 'Referral Earnings',
          description: 'From 0 referrals',
        },
        totalSpent: {
          title: 'Total Spent',
          description: 'Across all campaigns',
        },
      },
      campaignPerformance: {
        title: 'Campaign Performance',
        description: 'Overview of your ad spend over the last year.',
      },
    },
  },
  ar: {
    header: {
      myAccount: 'حسابي',
      profile: 'الملف الشخصي',
      logout: 'تسجيل الخروج',
    },
    sidebar: {
      dashboard: 'لوحة التحكم',
      createAd: 'إنشاء إعلان',
      reviewAd: 'مراجعة إعلان',
      siteAI: 'AI الموقع',
      financials: 'الماليات',
      agency: 'الوكالة',
      adminPanel: 'لوحة المسؤول',
      settings: 'الإعدادات',
      support: 'الدعم',
    },
    dashboard: {
      metrics: {
        balance: {
          title: 'الرصيد الحالي',
          description: 'يشمل 4.00$ مكافأة ترحيبية',
        },
        activeCampaigns: {
          title: 'الحملات النشطة',
          one: 'حملة واحدة نشطة حاليًا',
          none: 'لا توجد حملات نشطة',
        },
        referralEarnings: {
          title: 'أرباح الإحالة',
          description: 'من 0 إحالات',
        },
        totalSpent: {
          title: 'إجمالي المصروفات',
          description: 'عبر كل الحملات',
        },
      },
      campaignPerformance: {
        title: 'أداء الحملة',
        description: 'نظرة عامة على إنفاقك الإعلاني خلال العام الماضي.',
      },
    },
  },
};

export type Translations = typeof translations;
