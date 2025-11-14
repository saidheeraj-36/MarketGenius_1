
export enum ContentType {
  BLOG_POST = 'Complete Blog Post',
  SEO_BRIEF = 'SEO Content Brief',
  TWEET_THREAD = 'Tweet Thread',
  LINKEDIN_POST = 'LinkedIn Post',
  MARKETING_STRATEGY = 'Marketing Strategy',
  CAMPAIGN_REPORT = 'Campaign Performance Report',
  
  // New two-step blog generation types
  BLOG_BRIEF_AND_OUTLINE = 'Blog Brief and Outline',
  BLOG_POST_FROM_BRIEF = 'Blog Post from Brief',

  // --- New Feature Types ---
  SPEECH_GENERATION = 'Speech Generation (TTS)',
  IMAGE_EDITING = 'AI Image Editing',

  // --- New Tool Types from User Request ---

  // Social Media
  SOCIAL_POST_WITH_NOTES = 'Social Media Post with Notes',
  SOCIAL_POST_WITH_LINK = 'Social Media Post with Link',
  SOCIAL_POST_WITH_THEME = 'Social Media Post with a Theme',
  SOCIAL_HOLIDAY_POST = 'Social Media Post for Holiday',
  X_THREAD_FROM_BLOG = 'X (Twitter) Thread from Blog/Webpage',
  X_THREAD_FROM_THEME = 'X (Twitter) Thread from a Theme',
  SOCIAL_MEDIA_POLL = 'Social Media Poll',
  SOCIAL_MEDIA_PAGE_INTRODUCTION = 'Social Media Page Introduction',
  SOCIAL_POST_WITH_QUOTE = 'Social Media Post with Quote',
  MEMES = 'Memes',

  // Repurposing & Summarization
  REPURPOSE_CONTENT = 'Repurpose Content',
  SUMMARIZE_TEXT = 'Summarize Text',
  SUMMARY_FROM_NOTES = 'Summary from Notes',

  // Copywriting Frameworks
  AIDA_COPY = 'AIDA Copy',
  BAB_COPY = 'BAB Copy',
  PAS_COPY = 'PAS Copy',

  // Descriptions
  PRODUCT_DESCRIPTION = 'Product Description',
  PROPERTY_DESCRIPTION = 'Property Description',
  VIDEO_DESCRIPTION = 'Video Description',
  WEBPAGE_COPY = 'Webpage or Landing Page Copy',
  EVENT_PROMOTION_PAGE = 'Event Promotion Page Copy',
  LOCAL_BUSINESS_DESCRIPTION = 'Local Business Description',
  EVENT_DESCRIPTION = 'Event Description',
  JOB_DESCRIPTION = 'Job Description',

  // Email
  COLD_OUTREACH_EMAIL = 'Cold Outreach Email',
  PROMOTION_EMAIL = 'Promotion or Offer Email',
  SALES_EMAIL_SEQUENCE = 'Sales Email Sequence',
  EMAIL_SUBJECT_LINE = 'Email Subject Line',
  EMAIL_FROM_OUTLINE = 'Email from Outline',
  NEWSLETTER = 'Newsletter',
  EVENT_PROMOTION_EMAIL = 'Event Promotion Email',

  // Video
  VIDEO_SCRIPT = 'Video Script',

  // Ads
  GOOGLE_AD_COPY = 'Google Ad Copy',
  INSTAGRAM_FACEBOOK_AD_COPY = 'Instagram or Facebook Ad Copy',
  LINKEDIN_AD_COPY = 'LinkedIn Ad Copy',
  SHORT_AD_COPY = 'Short Ad Copy',
  CLASSIFIEDS_AD = 'Classifieds Ad',

  // Misc & Other
  TRANSLATE_TEXT = 'Translate Text',
  PRESS_RELEASE = 'Press Release',
  CUSTOMER_CASE_STUDY = 'Customer Case Study',
  HEADLINES = 'Headlines',
  CTAS = 'CTAs (Call to Actions)',
  COPY_IN_BULLETS = 'Copy in Bullets',
  BROCHURE = 'Brochure',
  PRODUCT_BUSINESS_NAMES = 'Product or Business Names',
  WEBPAGE_OUTLINE = 'Website or Landing Page Outline',
  REAL_ESTATE_BROCHURE = 'Real Estate Property Brochure',
  POEM = 'Poem',

  // Blog (Existing from previous implementation)
  AI_TOPIC_GENERATOR = 'AI Topic Generator',
  LONG_BLOG_FROM_URL_DOC = 'Long Blog from URL/Doc',
  SHORT_BLOG_ARTICLE = 'Short Blog Article',
  BLOG_POST_OUTLINE = 'Blog Post Outline',
  BLOG_POST_INTRODUCTION = 'Blog Post Introduction',
  CONTENT_IMPROVER = 'Content Improver',
  PARAPHRASE_REWRITE = 'Paraphrase or Rewrite',
  BLOG_SECTIONAL_CONTENT = 'Blog Sectional Content',
  BLOG_ARTICLE_FROM_OUTLINE = 'Blog Article from Outline',
  FAQ_GENERATOR = 'FAQ Generator',
  QA_GENERATOR = 'Q&A Generator',
  BLOG_POST_CONCLUSION = 'Blog Post Conclusion',
  PARAGRAPHS_TO_BULLETS = 'Paragraphs to Bullets',
  SENTENCE_EXPANDER = 'Sentence Expander',
  SEO_META_DESCRIPTION = 'SEO Meta Description',
  CORRECT_SPELLING_GRAMMAR = 'Correct Spelling & Grammar',
  SIMPLIFY_TEXT = 'Simplify Text',
  SEARCH_KEYWORDS = 'Search Keywords',
}

export enum ToneOfVoice {
  PROFESSIONAL = 'Professional',
  CASUAL = 'Casual',
  FRIENDLY = 'Friendly',
  WITTY = 'Witty',
  FORMAL = 'Formal',
  INFORMATIVE = 'Informative',
  APPRECIATIVE = 'Appreciative',
  ASSERTIVE = 'Assertive',
  AWESTRUCK = 'Awestruck',
  BOLD = 'Bold',
  CANDID = 'Candid',
  COMPASSIONATE = 'Compassionate',
  CONFIDENT = 'Confident',
  CONVINCING = 'Convincing',
  CRITICAL = 'Critical',
  EARNEST = 'Earnest',
  ENTHUSIASTIC = 'Enthusiastic',
  HUMOROUS = 'Humorous',
  INSPIRATIONAL = 'Inspirational',
  JOYFUL = 'Joyful',
  PASSIONATE = 'Passionate',
  THOUGHTFUL = 'Thoughtful',
  URGENT = 'Urgent',
}

export enum CampaignGoal {
    BRAND_AWARENESS = 'Brand Awareness',
    LEAD_GENERATION = 'Lead Generation',
    SALES_CONVERSION = 'Sales Conversion',
    CUSTOMER_ENGAGEMENT = 'Customer Engagement',
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface BlogBrief {
  title: string;
  keywords: string[];
  outline: string;
}