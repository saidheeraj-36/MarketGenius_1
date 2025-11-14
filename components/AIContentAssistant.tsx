
import React, { useState, useMemo } from 'react';
import { View } from '../App';
import { ContentType, ToneOfVoice } from '../types';

type InputType = 'text' | 'textarea' | 'select';

interface FormInput {
    readonly id: 'topic' | 'audience' | 'tone' | 'goal';
    readonly label: string;
    readonly placeholder: string;
    readonly type: InputType;
    readonly options?: { [key: string]: string }; // For select type
    readonly rows?: number; // For textarea
}

export interface Tool {
    id: number;
    title: string;
    description: string;
    categories: string[];
    bulkEnabled: boolean;
    linkedView?: View;
    // --- New properties for ToolRunner ---
    componentType?: 'generic' | 'transformer';
    contentType?: ContentType;
    inputs?: readonly FormInput[];
}

// The comprehensive list of all tools available in the assistant
const allTools: Tool[] = [
    // --- LINKED VIEWS (Existing Complex Modules) ---
    { id: 1, title: 'Long blog article', description: 'Generate a blog article from topic or keywords based on word count and tone.', categories: ['Blog'], bulkEnabled: false, linkedView: 'content' },
    { id: 2, title: 'AI SEO Content Brief Generator', description: 'Generate content briefs with SEO guidelines like keywords, questions, length, etc.', categories: ['Blog', 'SEO'], bulkEnabled: false, linkedView: 'briefs' },
    
    // --- NEWLY IMPLEMENTED CREATIVE TOOLS ---
    { id: 3, title: 'AI Image Generator', description: 'Generate images based on a description and desired style.', categories: ['Images'], bulkEnabled: false, linkedView: 'image_gen' },
    { id: 12, title: 'AI Image Editor', description: 'Edit images using text prompts like "add a retro filter".', categories: ['Images'], bulkEnabled: false, linkedView: 'image_edit' },
    { id: 13, title: 'AI Speech Generation', description: 'Convert text into high-quality spoken audio (TTS).', categories: ['Other', 'Video'], bulkEnabled: false, linkedView: 'speech' },

    // --- COMING SOON (Placeholders for Complex Features) ---
    { id: 4, title: 'Bulk product descriptions', description: 'Generate multiple product descriptions with CSV input.', categories: ['Descriptions', 'eCommerce'], bulkEnabled: true, linkedView: 'coming_soon' },
    { id: 5, title: 'Create an AI template', description: 'Create your own AI content template.', categories: ['Other'], bulkEnabled: false, linkedView: 'coming_soon' },
    { id: 6, title: 'Search & Repurpose News', description: 'Search latest news and repurpose into a social media post, blog, or a summary.', categories: ['Repurpose', 'Social Media'], bulkEnabled: false, linkedView: 'social' },
    { id: 7, title: 'Repurpose video or audio', description: 'Repurpose the content from video or audio into another format.', categories: ['Repurpose', 'Video'], bulkEnabled: false, linkedView: 'coming_soon' },
    { id: 8, title: 'Royalty free images', description: 'Find royalty free images from platforms like Unsplash, Pexels etc.', categories: ['Images'], bulkEnabled: false, linkedView: 'coming_soon' },
    { id: 9, title: 'GIFs', description: 'Find gifs from Giphy.', categories: ['Images', 'Social Media'], bulkEnabled: false, linkedView: 'coming_soon' },
    { id: 10, title: 'Social media post from image', description: 'Create a social media post from an image.', categories: ['Social Media', 'Images'], bulkEnabled: false, linkedView: 'coming_soon' },
    { id: 11, title: 'Repurpose image', description: 'Repurpose content from an image or infographic into another format.', categories: ['Repurpose', 'Images'], bulkEnabled: false, linkedView: 'coming_soon' },

    // --- GENERIC & TRANSFORMER TOOLS (Powered by ToolRunner) ---
    // Blog
    { id: 100, title: 'AI Topic Generator', description: 'Generate topic ideas from a theme.', categories: ['Blog'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.AI_TOPIC_GENERATOR, inputs: [ { id: 'topic', label: 'Theme or Category', placeholder: 'e.g., "Sustainable fashion"', type: 'text' } ] },
    { id: 101, title: 'Long blog article from URLs or documents', description: 'Generate a long blog article from reference URLs or documents.', categories: ['Blog', 'Repurpose'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.LONG_BLOG_FROM_URL_DOC, inputs: [ { id: 'topic', label: 'Pasted Content from URLs/Docs', placeholder: 'Paste the full text from your sources here...', type: 'textarea', rows: 8 }, { id: 'audience', label: 'Desired Tone', placeholder: 'e.g., "Informative and authoritative"', type: 'text' }, { id: 'tone', label: 'Target Word Count', placeholder: 'e.g., 1500', type: 'text' } ] },
    { id: 102, title: 'Blog article', description: 'Create a short blog article for a topic in a specific tone.', categories: ['Blog'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SHORT_BLOG_ARTICLE, inputs: [ { id: 'topic', label: 'Topic', placeholder: 'e.g., "Why every startup needs a content strategy"', type: 'text' }, { id: 'audience', label: 'Tone', placeholder: 'e.g., "Casual and encouraging"', type: 'text' } ] },
    { id: 103, title: 'Blog post outline', description: 'Generate a blog post based on a specific title.', categories: ['Blog'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.BLOG_POST_OUTLINE, inputs: [ { id: 'topic', label: 'Blog Title', placeholder: 'e.g., "The Ultimate Guide to Digital Marketing in 2024"', type: 'text' } ] },
    { id: 104, title: 'Blog post introduction', description: 'Generate an introductory paragraph based on a title, audience, and tone.', categories: ['Blog'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.BLOG_POST_INTRODUCTION, inputs: [ { id: 'topic', label: 'Blog Title', placeholder: 'e.g., "The Ultimate Guide to Digital Marketing in 2024"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Small business owners"', type: 'text' }, { id: 'tone', label: 'Tone of Voice', placeholder: 'e.g., "Authoritative yet accessible"', type: 'text' } ] },
    { id: 105, title: 'Blog sectional content from topic', description: 'Writes a blog section.', categories: ['Blog'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.BLOG_SECTIONAL_CONTENT, inputs: [ { id: 'topic', label: 'Section Topic / Subheading', placeholder: 'e.g., "Analyzing Competitor Backlinks"', type: 'text' }, { id: 'audience', label: 'Broader Article Context', placeholder: 'e.g., "An ultimate guide to SEO for beginners"', type: 'text' }, { id: 'tone', label: 'Tone of Voice', placeholder: 'e.g., "Informative"', type: 'text' } ] },
    { id: 106, title: 'Blog article from outline', description: 'Write an article based on a specific topic, tone, and outline.', categories: ['Blog'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.BLOG_ARTICLE_FROM_OUTLINE, inputs: [ { id: 'topic', label: 'Article Outline', placeholder: 'Paste your full outline here...', type: 'textarea', rows: 8 }, { id: 'audience', label: 'Article Topic', placeholder: 'e.g., "The History of AI"', type: 'text' }, { id: 'tone', label: 'Tone of Voice', placeholder: 'e.g., "Academic and formal"', type: 'text' } ] },
    { id: 107, title: 'Blog post conclusion', description: 'Generate a concluding paragraph based on a title, audience, and tone.', categories: ['Blog'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.BLOG_POST_CONCLUSION, inputs: [ { id: 'topic', label: 'Blog Title', placeholder: 'e.g., "The Ultimate Guide to Digital Marketing in 2024"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Small business owners"', type: 'text' }, { id: 'tone', label: 'Tone of Voice', placeholder: 'e.g., "Inspirational"', type: 'text' } ] },
    
    // Social Media
    { id: 200, title: 'Social media post with notes', description: 'Create a social media post with notes.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SOCIAL_POST_WITH_NOTES, inputs: [ { id: 'topic', label: 'Core Message / Notes', placeholder: 'Key points for the post...', type: 'textarea' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., Witty, Professional', type: 'text' }, { id: 'goal', label: 'Platform', placeholder: 'e.g., LinkedIn, Instagram', type: 'text' } ] },
    { id: 201, title: 'Social media post with link', description: 'Create a social media post with a link.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SOCIAL_POST_WITH_LINK, inputs: [ { id: 'topic', label: 'Link URL', placeholder: 'https://example.com/article', type: 'text' }, { id: 'audience', label: 'Post Commentary', placeholder: 'Check out this great article!', type: 'textarea' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., Excited', type: 'text' }, { id: 'goal', label: 'Platform', placeholder: 'e.g., X (Twitter)', type: 'text' } ] },
    { id: 202, title: 'Social media post with a theme', description: 'Create a social media post with a theme or keyword.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SOCIAL_POST_WITH_THEME, inputs: [ { id: 'topic', label: 'Theme or Keyword', placeholder: 'e.g., "Monday Motivation"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., Inspirational', type: 'text' }, { id: 'goal', label: 'Platform', placeholder: 'e.g., Facebook', type: 'text' } ] },
    { id: 203, title: 'X thread from a blog or webpage', description: 'Create an X thread based on a blog post or webpage.', categories: ['Social Media', 'Repurpose'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.X_THREAD_FROM_BLOG, inputs: [ { id: 'topic', label: 'Pasted Blog/Webpage Content', placeholder: 'Paste content here...', type: 'textarea', rows: 10 } ] },
    { id: 204, title: 'X thread from a theme', description: 'Create an X thread based on a theme.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.X_THREAD_FROM_THEME, inputs: [ { id: 'topic', label: 'Theme', placeholder: 'e.g., "The future of remote work"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., "Thought-provoking"', type: 'text' } ] },
    { id: 205, title: 'Social media poll', description: 'Create a Linkedin or X poll based on a theme.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SOCIAL_MEDIA_POLL, inputs: [ { id: 'topic', label: 'Topic / Question for Poll', placeholder: 'e.g., "What is the most important skill for marketers in 2024?"', type: 'text' }, { id: 'audience', label: 'Platform', placeholder: 'e.g., LinkedIn', type: 'text' } ] },
    { id: 206, title: 'Social media page introduction', description: 'Create a social media page introduction based on notes.', categories: ['Social Media', 'Copy'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SOCIAL_MEDIA_PAGE_INTRODUCTION, inputs: [ { id: 'topic', label: 'Business/Person Name', placeholder: 'e.g., "Acme Innovations"', type: 'text' }, { id: 'audience', label: 'Key Information/Notes', placeholder: 'We sell eco-friendly widgets...', type: 'textarea' }, { id: 'tone', label: 'Platform', placeholder: 'e.g., Instagram Bio', type: 'text' } ] },
    { id: 207, title: 'Social media post with quote', description: 'Create a social media post with a quote from a popular figure.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SOCIAL_POST_WITH_QUOTE, inputs: [ { id: 'topic', label: 'Quote by', placeholder: 'e.g., "Steve Jobs"', type: 'text' }, { id: 'audience', label: 'Pasted Quote', placeholder: 'Paste the quote here...', type: 'textarea' }, { id: 'tone', label: 'Your Commentary', placeholder: 'e.g., "This really resonates because..."', type: 'text' }, { id: 'goal', label: 'Platform', placeholder: 'e.g., LinkedIn', type: 'text' } ] },
    { id: 208, title: 'Memes', description: 'Generate meme ideas and captions.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.MEMES, inputs: [ { id: 'topic', label: 'Topic for Meme', placeholder: 'e.g., "Monday morning meetings"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Office workers"', type: 'text' } ] },
    { id: 209, title: 'Social media post for holiday or special day', description: 'Create a holiday or special day social media post.', categories: ['Social Media'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SOCIAL_HOLIDAY_POST, inputs: [ { id: 'topic', label: 'Holiday / Special Day', placeholder: 'e.g., "World Environment Day"', type: 'text' }, { id: 'audience', label: 'Key Message', placeholder: 'e.g., "Highlighting our commitment to sustainability"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., "Hopeful"', type: 'text' }, { id: 'goal', label: 'Platform', placeholder: 'e.g., "Instagram"', type: 'text' } ] },

    // Copy & Copywriting Frameworks
    { id: 300, title: 'Content improver', description: 'Improves the given text and rewrites in a given tone.', categories: ['Copy'], bulkEnabled: false, componentType: 'transformer', contentType: ContentType.CONTENT_IMPROVER, inputs: [ { id: 'topic', label: 'Original Text', placeholder: 'Paste your content here...', type: 'textarea', rows: 8 }, { id: 'audience', label: 'Desired Tone', placeholder: 'e.g., "More professional"', type: 'text' } ] },
    { id: 301, title: 'Paraphrase or rewrite', description: 'Paraphrase the given text.', categories: ['Copy', 'Repurpose'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.PARAPHRASE_REWRITE, inputs: [ { id: 'topic', label: 'Original Text', placeholder: 'Paste content here to rewrite it...', type: 'textarea', rows: 8 } ] },
    { id: 302, title: 'AIDA copy', description: 'Generate copy using the Attention, Interest, Desire and Action framework.', categories: ['Copy', 'Ads'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.AIDA_COPY, inputs: [ { id: 'topic', label: 'Product/Service', placeholder: 'e.g., "A new project management app"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Freelancers and small teams"', type: 'text' } ] },
    { id: 303, title: 'BAB copy', description: 'Generate copy using the Before-After-Bridge framework.', categories: ['Copy', 'Ads'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.BAB_COPY, inputs: [ { id: 'topic', label: 'Product/Service', placeholder: 'e.g., "A new project management app"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Freelancers and small teams"', type: 'text' } ] },
    { id: 304, title: 'PAS copy', description: 'Generate copy using the Problem-Agitate-Solution framework.', categories: ['Copy', 'Ads'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.PAS_COPY, inputs: [ { id: 'topic', label: 'Product/Service', placeholder: 'e.g., "A new project management app"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Freelancers and small teams"', type: 'text' } ] },
    { id: 305, title: 'Headlines', description: 'Generates 10 headlines for a given product or service.', categories: ['Copy', 'Ads'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.HEADLINES, inputs: [ { id: 'topic', label: 'Topic/Product', placeholder: 'e.g., "AI-powered grammar checker"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Students and professionals"', type: 'text' } ] },
    { id: 306, title: 'CTAs', description: 'Generates 10 CTAs for given information.', categories: ['Copy', 'Ads'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.CTAS, inputs: [ { id: 'topic', label: 'Context / Goal for CTA', placeholder: 'e.g., "To get users to sign up for a free trial"', type: 'text' } ] },
    { id: 307, title: 'Copy in bullets', description: 'Creates bulleted copy with notes.', categories: ['Copy'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.COPY_IN_BULLETS, inputs: [ { id: 'topic', label: 'Notes or Paragraph', placeholder: 'Paste your notes or text here...', type: 'textarea', rows: 8 } ] },

    // Summary & Repurpose
    { id: 400, title: 'Repurpose content', description: 'Repurpose the content in videos, podcasts, documents, webpages and more.', categories: ['Repurpose'], bulkEnabled: false, componentType: 'transformer', contentType: ContentType.REPURPOSE_CONTENT, inputs: [ { id: 'topic', label: 'Original Content', placeholder: 'Paste your content here...', type: 'textarea', rows: 8 }, { id: 'audience', label: 'Desired New Format', placeholder: 'e.g., "LinkedIn Article", "Key takeaways for a video script"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., "Professional"', type: 'text' } ] },
    { id: 401, title: 'Summarize text', description: 'Create a summary of a long section of text.', categories: ['Summary'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.SUMMARIZE_TEXT, inputs: [ { id: 'topic', label: 'Original Text', placeholder: 'Paste text to summarize...', type: 'textarea', rows: 8 }, { id: 'audience', label: 'Desired Format', placeholder: 'e.g., "a short paragraph" or "5 bullet points"', type: 'text' } ] },
    { id: 402, title: 'Summary from notes', description: 'Creates a summary from notes as bullets or a paragraph.', categories: ['Summary'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.SUMMARY_FROM_NOTES, inputs: [ { id: 'topic', label: 'Pasted Notes', placeholder: 'Paste your notes here...', type: 'textarea', rows: 8 }, { id: 'audience', label: 'Desired Format', placeholder: 'e.g., "a paragraph" or "bullet points"', type: 'text' } ] },
    { id: 403, title: 'Paragraphs to bullets', description: 'Paraphrases the given text in the form of bullet points.', categories: ['Summary', 'Copy'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.PARAGRAPHS_TO_BULLETS, inputs: [ { id: 'topic', label: 'Original Paragraph(s)', placeholder: 'Paste your text here to convert it into a bulleted list.', type: 'textarea', rows: 8 } ] },
    
    // SEO
    { id: 500, title: 'SEO meta description', description: 'Writes an SEO meta description based on a page title and keywords.', categories: ['SEO', 'Descriptions'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SEO_META_DESCRIPTION, inputs: [ { id: 'topic', label: 'Page Title or Topic', placeholder: 'e.g., "High-Quality Dog Food for Active Breeds"', type: 'text' }, { id: 'audience', label: 'Primary Keywords', placeholder: 'e.g., "active dog food, high-protein kibble"', type: 'text' } ] },
    { id: 501, title: 'Search keywords', description: 'Generate keywords for a theme, product or service.', categories: ['SEO'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SEARCH_KEYWORDS, inputs: [ { id: 'topic', label: 'Theme / Product / Service', placeholder: 'e.g., "eco-friendly cleaning supplies"', type: 'text' }, { id: 'audience', label: 'Industry', placeholder: 'e.g., "Home Goods"', type: 'text' }, { id: 'tone', label: 'Target Audience', placeholder: 'e.g., "Environmentally conscious homeowners"', type: 'text' } ] },

    // Email
    { id: 600, title: 'Cold outreach email', description: 'Write a personalized cold email about a specific product or service.', categories: ['Email'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.COLD_OUTREACH_EMAIL, inputs: [ { id: 'topic', label: 'My Product/Service', placeholder: 'What I am offering', type: 'text' }, { id: 'audience', label: 'Recipient\'s Role/Company', placeholder: 'e.g., "Marketing Manager at Acme Corp"', type: 'text' }, { id: 'tone', label: 'Goal of Email', placeholder: 'e.g., "To schedule a 15-minute demo"', type: 'text' } ] },
    { id: 601, title: 'Promotion or offer email', description: 'Write a marketing campaign email to share a promotion or offer.', categories: ['Email'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.PROMOTION_EMAIL, inputs: [ { id: 'topic', label: 'Promotion Details', placeholder: 'e.g., "25% off all products for summer"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Existing customers"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., "Excited and urgent"', type: 'text' } ] },
    { id: 602, title: 'Sales email sequence', description: 'Generates a sales email sequence.', categories: ['Email'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.SALES_EMAIL_SEQUENCE, inputs: [ { id: 'topic', label: 'Product/Service', placeholder: 'e.g., "Our new CRM software"', type: 'text' }, { id: 'audience', label: 'Target Prospect', placeholder: 'e.g., "Sales Directors"', type: 'text' }, { id: 'tone', label: 'Number of Emails', placeholder: 'e.g., "3"', type: 'text' }, { id: 'goal', label: 'Overall Goal', placeholder: 'e.g., "Book a discovery call"', type: 'text' } ] },
    { id: 603, title: 'Email subject line', description: 'Generate email subject line ideas.', categories: ['Email'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.EMAIL_SUBJECT_LINE, inputs: [ { id: 'topic', label: 'Email Content/Topic', placeholder: 'e.g., "A new feature announcement"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Power users"', type: 'text' } ] },
    { id: 604, title: 'Email from outline', description: 'Write an email based on a specific outline.', categories: ['Email'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.EMAIL_FROM_OUTLINE, inputs: [ { id: 'topic', label: 'Email Outline', placeholder: 'Paste your email outline here...', type: 'textarea', rows: 8 }, { id: 'audience', label: 'Audience', placeholder: 'e.g., "New subscribers"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., "Welcoming and helpful"', type: 'text' } ] },
    { id: 605, title: 'Newsletter', description: 'Generate a newsletter outline, introduction, and call to action (CTA).', categories: ['Email'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.NEWSLETTER, inputs: [ { id: 'topic', label: 'Newsletter Theme/Topics', placeholder: 'e.g., "Monthly product updates, AI news, team spotlight"', type: 'textarea' }, { id: 'audience', label: 'Audience', placeholder: 'e.g., "Investors and partners"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., "Professional and informative"', type: 'text' } ] },
    { id: 606, title: 'Event promotion email', description: 'Write an email announcing an event and offering an invitation.', categories: ['Email'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.EVENT_PROMOTION_EMAIL, inputs: [ { id: 'topic', label: 'Event Name and Details', placeholder: 'e.g., "Webinar: The Future of Marketing, Dec 15th"', type: 'text' }, { id: 'audience', label: 'Target Audience', placeholder: 'e.g., "Marketing professionals"', type: 'text' }, { id: 'tone', label: 'Tone', placeholder: 'e.g., "Exciting and exclusive"', type: 'text' } ] },

    // General Text / Other
    { id: 900, title: 'FAQ', description: 'Generates FAQs for a topic.', categories: ['Other', 'Blog'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.FAQ_GENERATOR, inputs: [ { id: 'topic', label: 'Topic, Product, or Service', placeholder: 'e.g., "Our new CRM software"', type: 'text' } ] },
    { id: 901, title: 'Q&A', description: 'Answer a question with stated facts.', categories: ['Other'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.QA_GENERATOR, inputs: [ { id: 'topic', label: 'Your Question', placeholder: 'e.g., "What was the first social media platform?"', type: 'text' } ] },
    { id: 902, title: 'Sentence expander', description: 'Expand a sentence into a paragraph.', categories: ['Copy'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.SENTENCE_EXPANDER, inputs: [ { id: 'topic', label: 'Sentence to Expand', placeholder: 'e.g., "AI is changing marketing."', type: 'text' }, { id: 'audience', label: 'Tone of Voice', placeholder: 'e.g., "Detailed and professional"', type: 'text' } ] },
    { id: 903, title: 'Correct spelling and grammar', description: 'Correct spelling and grammar of given text.', categories: ['Copy'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.CORRECT_SPELLING_GRAMMAR, inputs: [ { id: 'topic', label: 'Text with Errors', placeholder: 'Paste your text here to correct it.', type: 'textarea', rows: 8 } ] },
    { id: 904, title: 'Simplify text', description: 'Simplify the given text.', categories: ['Copy'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.SIMPLIFY_TEXT, inputs: [ { id: 'topic', label: 'Complex Text', placeholder: 'Paste your text here to simplify it.', type: 'textarea', rows: 8 } ] },
    { id: 905, title: 'Translate', description: 'Translate the given text.', categories: ['Translate'], bulkEnabled: true, componentType: 'transformer', contentType: ContentType.TRANSLATE_TEXT, inputs: [ { id: 'topic', label: 'Text to Translate', placeholder: 'Enter text...', type: 'textarea', rows: 6 }, { id: 'audience', label: 'Translate to (Language)', placeholder: 'e.g., "Spanish"', type: 'text' } ] },
    { id: 906, title: 'Press release', description: 'Creates press release from notes.', categories: ['Other', 'Copy'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.PRESS_RELEASE, inputs: [ { id: 'topic', label: 'Announcement / Key Information', placeholder: 'e.g., "Launched new product X, secured $5M in funding"', type: 'textarea', rows: 6 }, { id: 'audience', label: 'Company Name', placeholder: 'e.g., "Innovate Inc."', type: 'text' } ] },
    { id: 907, title: 'Customer case study', description: 'Creates customer case studies with notes.', categories: ['Other', 'Copy'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.CUSTOMER_CASE_STUDY, inputs: [ { id: 'topic', label: 'Customer Name', placeholder: 'e.g., "Global Corp"', type: 'text' }, { id: 'audience', label: 'Product/Service Used', placeholder: 'e.g., "Our enterprise analytics platform"', type: 'text' }, { id: 'tone', label: 'Key Results/Notes', placeholder: 'Problem: ... Solution: ... Results: 30% increase in ROI...', type: 'textarea', rows: 6 } ] },
    { id: 908, title: 'Poem', description: 'Creates a poem on a topic or theme.', categories: ['Other'], bulkEnabled: false, componentType: 'generic', contentType: ContentType.POEM, inputs: [ { id: 'topic', label: 'Topic / Theme', placeholder: 'e.g., "The ocean at dawn"', type: 'text' }, { id: 'audience', label: 'Style / Tone', placeholder: 'e.g., "Haiku", "Limerick", "Free verse"', type: 'text' } ] },
    { id: 909, title: 'Product or business names', description: 'Generate 10 name ideas for a product or service.', categories: ['Other'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.PRODUCT_BUSINESS_NAMES, inputs: [ { id: 'topic', label: 'Product/Business Concept', placeholder: 'e.g., "A subscription box for rare indoor plants"', type: 'textarea' }, { id: 'audience', label: 'Keywords to consider', placeholder: 'e.g., "green, growth, urban"', type: 'text' } ] },
    { id: 910, title: 'Job description', description: 'Generates a job description based on inputs.', categories: ['Descriptions'], bulkEnabled: true, componentType: 'generic', contentType: ContentType.JOB_DESCRIPTION, inputs: [ { id: 'topic', label: 'Job Title', placeholder: 'e.g., "Senior Product Manager"', type: 'text' }, { id: 'audience', label: 'Key Responsibilities', placeholder: 'Own the product roadmap, work with engineering...', type: 'textarea', rows: 6 }, { id: 'tone', label: 'Company Information', placeholder: 'e.g., "We are a fast-growing SaaS startup..."', type: 'text' } ] },
];


const categories = ['All', 'Blog', 'Social Media', 'Copy', 'SEO', 'Email', 'Descriptions', 'Summary', 'Repurpose', 'Ads', 'Video', 'Images', 'Translate', 'Other', 'Favorites'];

const ToolCard: React.FC<{ tool: Tool; isFavorite: boolean; onToggleFavorite: (id: number) => void; onClick: () => void; }> = ({ tool, isFavorite, onToggleFavorite, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="bg-white p-6 rounded-lg border border-slate-200 hover:shadow-lg hover:border-primary-400 transition-all duration-200 cursor-pointer flex flex-col justify-between h-full group"
        >
            <div>
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(tool.id); }}
                        className="text-slate-300 hover:text-yellow-400"
                        aria-label="Toggle favorite"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                </div>
                <h3 className="text-md font-bold text-slate-800 mt-4">{tool.title}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-3">{tool.description}</p>
            </div>
            {tool.bulkEnabled && (
                <div className="mt-4 flex items-center text-xs text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10m16-10v10M8 7v10m8-10v10M4 4h16v3H4zM4 17h16v3H4z" />
                    </svg>
                    <span>Bulk generation enabled</span>
                </div>
            )}
        </div>
    );
};


const AIContentAssistant: React.FC<{
    setActiveView: (view: View) => void;
    onLaunchTool: (tool: Tool) => void;
}> = ({setActiveView, onLaunchTool}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [favorites, setFavorites] = useState<number[]>(() => {
        const saved = localStorage.getItem('assistantFavorites');
        return saved ? JSON.parse(saved) : [];
    });

    const handleToggleFavorite = (id: number) => {
        const newFavorites = favorites.includes(id)
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];
        setFavorites(newFavorites);
        localStorage.setItem('assistantFavorites', JSON.stringify(newFavorites));
    };

    const filteredTools = useMemo(() => {
        const sortedTools = [...allTools].sort((a, b) => a.title.localeCompare(b.title));
        return sortedTools.filter(tool => {
            const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase());
            
            if (activeCategory === 'All') {
                return matchesSearch;
            }
            if (activeCategory === 'Favorites') {
                return matchesSearch && favorites.includes(tool.id);
            }
            return matchesSearch && tool.categories.includes(activeCategory);
        });
    }, [searchTerm, activeCategory, favorites]);

    const handleCardClick = (tool: Tool) => {
        if (tool.linkedView) {
            if (tool.linkedView === 'coming_soon') {
                onLaunchTool(tool); // Special handler for coming soon
            } else {
                setActiveView(tool.linkedView);
            }
        } else if (tool.componentType) {
            onLaunchTool(tool);
        } else {
            alert(`"${tool.title}" is not yet connected.`);
        }
    }

    return (
        <div className="space-y-6">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Search your use case"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition"
                />
            </div>

            <div className="flex items-center overflow-x-auto pb-2 -mx-4 px-4">
                 <div className="flex space-x-2">
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                                activeCategory === category
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                 </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredTools.map(tool => (
                    <ToolCard 
                        key={tool.id} 
                        tool={tool} 
                        isFavorite={favorites.includes(tool.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onClick={() => handleCardClick(tool)}
                    />
                ))}
            </div>
            {filteredTools.length === 0 && (
                <div className="text-center py-12 col-span-full">
                    <p className="text-slate-500 font-medium">No tools found.</p>
                    <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default AIContentAssistant;
