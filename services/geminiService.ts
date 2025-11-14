



import { GoogleGenAI, Chat, GenerateContentResponse, Type, Modality } from "@google/genai";
import { ContentType, ToneOfVoice, BlogBrief } from '../types';


const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Audio & Base64 Helpers ---
export function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}
  
export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
}

export const generateBrief = async (topic: string): Promise<BlogBrief> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `You are an expert SEO strategist and content architect. Your task is to generate a comprehensive blog brief and outline based on a given topic.

    **Topic:** "${topic}"
    
    **Instructions:**
    1.  Create one, compelling, SEO-friendly title for the blog post.
    2.  Identify 5-7 relevant primary and secondary keywords.
    3.  Develop a logical and detailed content outline in Markdown format. The outline should include H2 and H3 headings to structure the article effectively.
    
    Return the response as a single, minified JSON object.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'The SEO-friendly title for the blog post.'
          },
          keywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of 5-7 relevant keywords.'
          },
          outline: {
            type: Type.STRING,
            description: 'The detailed content outline in Markdown format.'
          },
        },
        required: ["title", "keywords", "outline"],
      },
    },
  });

  try {
    // The response text is a JSON string that needs to be parsed.
    const jsonResponse = response.text;
    return JSON.parse(jsonResponse) as BlogBrief;
  } catch (error) {
    console.error("Failed to parse brief from Gemini API:", error);
    throw new Error("Failed to generate a valid blog brief. The AI response was not valid JSON.");
  }
};


const generatePrompt = (
  contentType: ContentType,
  topic: string, // Main input, can be topic, text to modify, theme, etc.
  audience: string, // Secondary input
  tone: ToneOfVoice | string, // Tertiary input or tone
  goal: string // Quaternary input or goal
): string => {
  switch (contentType) {
    // --- Existing Prompts ---
    case ContentType.BLOG_POST:
      return `You are a world-class content marketing expert specializing in writing engaging and SEO-optimized blog posts.
      Your task is to write a complete, high-quality blog post.

      **Topic:** ${topic}
      **Target Audience:** ${audience}
      **Tone of Voice:** ${tone}
      **Primary Goal:** ${goal}

      **Instructions:**
      1.  Create 3-5 compelling, SEO-friendly title suggestions.
      2.  Write a captivating introduction that hooks the reader.
      3.  Structure the body with clear headings (H2) and subheadings (H3). Use bullet points and bold text to improve readability.
      4.  Ensure the content is informative, well-researched, and provides real value to the reader.
      5.  Conclude with a powerful summary and a clear call-to-action related to the goal.
      6.  The entire output should be in well-formatted Markdown. Start with the title suggestions.`;

    case ContentType.BLOG_POST_FROM_BRIEF:
        const briefPayload = JSON.parse(goal);
        const targetWordCount = parseInt(briefPayload.wordCount, 10) || 1500;
        const minWords = Math.round(targetWordCount * 0.9);
        const maxWords = Math.round(targetWordCount * 1.1);

        return `You are an expert content writer. Your task is to write a blog article that strictly follows all instructions.

        **PRIMARY GOAL: WORD COUNT**
        This is your most important instruction. The final article body MUST be between **${minWords} and ${maxWords} words**. This is a non-negotiable requirement. Adjust content depth to fit these constraints precisely. Failure to meet this word count will result in an unsuccessful task.

        **Blog Title:** ${topic}
        **Keywords to include:** ${audience}
        **Tone of Voice:** ${tone}
        
        **Content Outline:**
        \`\`\`markdown
        ${briefPayload.outline}
        \`\`\`
  
        **Instructions:**
        1.  **Word Count:** The absolute priority is to ensure the final output is between ${minWords} and ${maxWords} words.
        2.  **Outline:** Follow the provided outline strictly. Do not add, remove, or reorder sections.
        3.  **Keywords:** Integrate the specified keywords naturally.
        4.  **Tone:** Write in a ${tone} tone.
        5.  **Image Placeholders:** Strategically place 2-3 relevant image placeholders within the content. Each placeholder must be on its own line and formatted as: \`[A descriptive prompt for an AI image generator]\`. For example: \`[A happy customer unboxing a beautifully packaged product from an online store.]\`.
        6.  **Output:** Provide ONLY the complete article body in well-formatted Markdown. Do not include the H1 title or any other text before or after the article.`;

    case ContentType.SEO_BRIEF:
      return `You are a senior SEO strategist. Create a comprehensive content brief for a writer.

      **Main Topic/Keyword:** ${topic}
      **Target Audience:** ${audience}
      **Desired Tone:** ${tone}
      **Content Goal:** ${goal}

      **Instructions:**
      1.  **Primary Keyword:** Suggest the primary keyword.
      2.  **Secondary Keywords:** List 5-10 related LSI (Latent Semantic Indexing) keywords.
      3.  **Search Intent:** Define the user's search intent (e.g., informational, commercial, transactional).
      4.  **Proposed Title:** Suggest an SEO-optimized title.
      5.  **Meta Description:** Write a compelling meta description (under 160 characters).
      6.  **Content Outline:** Provide a detailed H2/H3 structure with key points to cover in each section.
      7.  **Internal/External Linking:** Suggest opportunities for internal and external links.
      8.  **Call to Action:** Specify the desired CTA.
      Format the entire output as clean, well-structured Markdown.`;

    case ContentType.TWEET_THREAD:
      return `You are a viral social media manager. Create a compelling Twitter thread.

      **Topic:** ${topic}
      **Audience:** ${audience}
      **Tone:** ${tone}
      **Goal:** ${goal}

      **Instructions:**
      1.  Write a powerful hook for the first tweet to grab attention.
      2.  Break down the topic into 5-8 numbered tweets.
      3.  Keep each tweet concise and impactful.
      4.  Use relevant hashtags and emojis.
      5.  End with a concluding tweet that summarizes the thread and includes a call to action.
      Format the output clearly separating each tweet (e.g., "1/8:", "2/8:", etc.).`;

    case ContentType.LINKEDIN_POST:
      return `You are a B2B marketing expert and LinkedIn thought leader. Write a professional and engaging LinkedIn post.

      **Topic:** ${topic}
      **Target Audience:** ${audience}
      **Tone:** ${tone}
      **Goal:** ${goal}

      **Instructions:**
      1.  Start with a strong hook to stop the scroll.
      2.  Elaborate on the topic with 3-5 clear, value-driven points. Use bullet points or numbered lists.
      3.  Pose a question to encourage comments and engagement.
      4.  Include 3-5 relevant hashtags.
      5.  Keep the post professional and aligned with the LinkedIn platform.
      Format the output as a single, ready-to-publish post.`;
    
    case ContentType.MARKETING_STRATEGY:
        return `You are a Chief Marketing Officer (CMO) with 20 years of experience. Create a high-level, actionable marketing strategy.
  
        **Product/Service Description:** ${topic}
        **Target Audience:** ${audience}
        **Primary Campaign Goal:** ${goal}
        **Campaign Duration:** ${tone} 
  
        **Instructions:**
        Create a comprehensive marketing strategy in well-formatted Markdown. Structure your response with the following sections:
  
        1.  **Campaign Name & Slogan:** Suggest 3 creative names and slogans.
        2.  **Core Messaging & Value Proposition:** Define what the campaign will communicate and its key value.
        3.  **Key Channels & Tactics:** Recommend the most effective marketing channels (e.g., Content Marketing, SEO, Paid Social, Email) and specific tactics.
        4.  **Phased Rollout Plan:** Break down the campaign into phases based on the duration. Outline key activities and objectives for each phase.
        5.  **Key Performance Indicators (KPIs):** List the most important metrics to track to measure success, tailored to the primary goal.`;

    case ContentType.CAMPAIGN_REPORT:
        return `You are a senior marketing data analyst with a knack for storytelling. Your job is to analyze campaign performance data and present it as a clear, insightful narrative report.
        
        **Campaign Name:** ${topic}
        **Campaign Objective:** ${goal}
        **Key Metrics Data:**
        \`\`\`
        ${audience}
        \`\`\`
        **Requested Analysis Focus:** ${tone}

        **Instructions:**
        Generate a comprehensive campaign performance report in well-formatted Markdown. Structure your response with the following sections:

        1.  **Executive Summary:** Start with a brief, high-level summary of the campaign's performance against its stated objective.
        2.  **Key Findings:** Present 3-5 bullet points highlighting the most important, data-backed insights.
        3.  **Deep Dive Analysis:** Provide a more detailed analysis based on the 'Requested Analysis Focus'. Interpret the key metrics (e.g., CTR, CVR, CPA, ROAS) and explain what they mean in the context of the campaign.
        4.  **What Went Well:** Identify the strengths and successful aspects of the campaign, citing specific data points.
        5.  **Areas for Improvement:** Point out weaknesses or areas where performance can be optimized, citing specific data points.
        6.  **Actionable Recommendations:** Conclude with a list of concrete, actionable steps to take to improve performance or apply learnings to future campaigns.

        Maintain a professional and data-driven tone throughout.`;

    // --- New Tool Prompts from User Request ---

    // Social Media
    case ContentType.SOCIAL_POST_WITH_NOTES:
        return `You are a social media manager. Create a social media post based on the provided notes and add your own strategic notes for posting.
        **Platform:** ${goal}
        **Core Message/Notes:**
        \`\`\`
        ${topic}
        \`\`\`
        **Tone:** ${tone}
        **Instructions:**
        1. Write a compelling social media post for the specified platform.
        2. Below the post, add a "Manager's Notes" section with recommendations for hashtags, best time to post, and potential visuals.
        3. Format the entire output in Markdown.`;

    case ContentType.SOCIAL_POST_WITH_LINK:
        return `You are a content curator. Write a social media post that introduces and shares a link.
        **Link URL:** ${topic}
        **Post Commentary/Context:** 
        \`\`\`
        ${audience}
        \`\`\`
        **Tone:** ${tone}
        **Platform:** ${goal}
        **Instructions:**
        1. Write a caption that provides context or a compelling hook for the link.
        2. Encourage clicks and discussion.
        3. Include 3-5 relevant hashtags.
        4. The final post should just be the caption text, ready to be pasted.`;

    case ContentType.SOCIAL_POST_WITH_THEME:
        return `You are a creative social media content creator. Write a social media post based on a theme.
        **Theme/Keyword:** ${topic}
        **Tone:** ${tone}
        **Platform:** ${goal}
        **Instructions:**
        1. Craft an engaging post that captures the essence of the theme.
        2. Include relevant emojis and 3-5 hashtags.
        3. Format as a ready-to-publish post.`;

    case ContentType.SOCIAL_HOLIDAY_POST:
        return `You are a brand's social media manager. Create a post for an upcoming holiday or special day.
        **Holiday/Special Day:** ${topic}
        **Key Message:** ${audience}
        **Tone:** ${tone}
        **Platform:** ${goal}
        **Instructions:**
        1. Write a creative and appropriate post celebrating the day.
        2. Connect the holiday to the brand's message if possible.
        3. Include relevant hashtags.`;
    
    case ContentType.X_THREAD_FROM_BLOG:
        return `You are an expert at repurposing content. Convert the following blog post/webpage content into a viral X (Twitter) thread.
        **Pasted Blog/Webpage Content:**
        \`\`\`
        ${topic}
        \`\`\`
        **Instructions:**
        1. Create a powerful hook tweet (1/n).
        2. Break down the key points of the content into a thread of 5-10 tweets.
        3. Number each tweet (e.g., 1/8, 2/8).
        4. Use emojis and simple language.
        5. End with a concluding tweet and a call to action.`;

    case ContentType.X_THREAD_FROM_THEME:
        return `You are a skilled X (Twitter) writer. Create a compelling thread based on a theme.
        **Theme:** ${topic}
        **Tone:** ${tone}
        **Instructions:**
        1. Write a strong hook tweet (1/n).
        2. Develop the theme across 5-8 tweets.
        3. Provide value, insights, or a story.
        4. Number each tweet and use relevant hashtags.`;

    case ContentType.SOCIAL_MEDIA_POLL:
        return `You are an engaging social media manager. Create a poll for LinkedIn or X.
        **Topic/Question:** ${topic}
        **Platform:** ${audience}
        **Instructions:**
        1. Write a brief, engaging intro for the poll.
        2. Provide 2-4 clear, concise poll options.
        3. Format it clearly, separating the intro from the options.`;

    case ContentType.SOCIAL_MEDIA_PAGE_INTRODUCTION:
        return `Write a compelling introduction or bio for a social media page.
        **Business/Person Name:** ${topic}
        **Key Information/Notes:**
        \`\`\`
        ${audience}
        \`\`\`
        **Platform:** ${tone}
        **Instructions:**
        1. Concisely describe who you are and what you do.
        2. Highlight your value proposition.
        3. Include a call to action (e.g., "Follow for tips," "Visit our site").
        4. Keep it within the character limits of the specified platform.`;

    case ContentType.SOCIAL_POST_WITH_QUOTE:
        return `You are a social media content creator. Create a post centered around a quote.
        **Quote by:** ${topic}
        **Pasted Quote:**
        \`\`\`
        ${audience}
        \`\`\`
        **Your Commentary/Context:** ${tone}
        **Platform:** ${goal}
        **Instructions:**
        1. Present the quote clearly.
        2. Add your own commentary to provide context or a related insight.
        3. Include relevant hashtags.`;

    case ContentType.MEMES:
        return `You are a witty, meme-savvy marketer. Generate 3 meme ideas for a specific topic.
        **Topic:** ${topic}
        **Target Audience:** ${audience}
        **Instructions:**
        For each idea, provide:
        1.  **Meme Format:** (e.g., "Drakeposting," "Distracted Boyfriend").
        2.  **Top Text/Caption:** The text that goes with the meme.
        3.  **Context:** A brief explanation of why it's funny or relevant to the audience.
        Format the output clearly for each of the 3 ideas.`;

    // Repurposing
    case ContentType.REPURPOSE_CONTENT:
        return `You are an expert content strategist. Repurpose the following text into a different format.
        **Original Content:**
        \`\`\`
        ${topic}
        \`\`\`
        **Desired New Format:** ${audience} (e.g., LinkedIn Article, Email Newsletter, Key Takeaways for a Video)
        **Tone:** ${tone}
        **Instructions:**
        1.  Analyze the original content and extract the core message.
        2.  Rewrite and restructure it for the desired new format.
        3.  Adapt the tone and style appropriately.
        4.  Output the repurposed content in well-formatted Markdown.`;
    
    case ContentType.SUMMARIZE_TEXT:
        return `Summarize the following text concisely.
        **Original Text:**
        \`\`\`
        ${topic}
        \`\`\`
        **Desired Format:** ${audience} (e.g., "a short paragraph" or "5 bullet points")
        **Instructions:**
        Extract the most important points and present them in the desired format.`;
        
    case ContentType.SUMMARY_FROM_NOTES:
        return `Create a cohesive summary from the following notes.
        **Notes:**
        \`\`\`
        ${topic}
        \`\`\`
        **Desired Format:** ${audience} (e.g., "a paragraph" or "bullet points")
        **Instructions:**
        Synthesize the notes into a coherent summary in the specified format.`;

    // Copywriting
    case ContentType.AIDA_COPY:
        return `You are an expert copywriter. Write copy for the following product/service using the AIDA (Attention, Interest, Desire, Action) framework.
        **Product/Service:** ${topic}
        **Target Audience:** ${audience}
        **Instructions:**
        Structure your response with four sections, clearly labeled:
        - **Attention:** A powerful hook.
        - **Interest:** Engaging details and benefits.
        - **Desire:** Create an emotional connection and longing.
        - **Action:** A clear and compelling call to action.`;

    case ContentType.BAB_COPY:
        return `You are an expert copywriter. Write copy for the following product/service using the BAB (Before-After-Bridge) framework.
        **Product/Service:** ${topic}
        **Target Audience:** ${audience}
        **Instructions:**
        Structure your response with three sections, clearly labeled:
        - **Before:** Describe the customer's problem or pain point.
        - **After:** Paint a picture of their life after using your product.
        - **Bridge:** Explain how your product is the bridge to get them there.`;

    case ContentType.PAS_COPY:
        return `You are an expert copywriter. Write copy for the following product/service using the PAS (Problem-Agitate-Solution) framework.
        **Product/Service:** ${topic}
        **Target Audience:** ${audience}
        **Instructions:**
        Structure your response with three sections, clearly labeled:
        - **Problem:** State the customer's problem.
        - **Agitate:** Agitate the problem, making them feel the pain more acutely.
        - **Solution:** Present your product as the perfect solution.`;

    // Descriptions
    case ContentType.PRODUCT_DESCRIPTION:
        return `Write a compelling product description.
        **Product Name:** ${topic}
        **Features/Notes:**
        \`\`\`
        ${audience}
        \`\`\`
        **Tone:** ${tone}
        **Instructions:**
        1.  Start with a captivating hook.
        2.  Translate features into benefits for the customer.
        3.  Use bullet points for readability.
        4.  End with a persuasive closing statement.`;

    case ContentType.PROPERTY_DESCRIPTION:
        return `You are a real estate copywriter. Write an enticing property description.
        **Property Address/Type:** ${topic}
        **Key Features (beds, baths, sqft, amenities):**
        \`\`\`
        ${audience}
        \`\`\`
        **Tone:** ${tone}
        **Instructions:**
        1.  Create an attention-grabbing headline.
        2.  Write a narrative that helps potential buyers envision living there.
        3.  Highlight the most desirable features and benefits.
        4.  End with a clear call to action (e.g., "Schedule your private tour today!").`;
        
    case ContentType.WEBPAGE_COPY:
        return `Write compelling copy for a webpage or landing page.
        **Page Topic/Goal:** ${topic}
        **Key Points to Include:**
        \`\`\`
        ${audience}
        \`\`\`
        **Tone:** ${tone}
        **Instructions:**
        1.  Write a clear and powerful headline (H1).
        2.  Develop a persuasive introductory paragraph.
        3.  Create subheadings (H2, H3) with benefit-driven body copy.
        4.  Weave in a clear call-to-action throughout.
        5.  Output as well-formatted Markdown.`;

    case ContentType.EVENT_PROMOTION_PAGE:
        return `You are a professional copywriter specializing in event marketing. Write compelling copy for an event promotion page.
        **Event Name/Topic:** ${topic}
        **Target Audience:** ${audience}
        **Key Details (Date, Time, Venue, Price):**
        \`\`\`
        ${tone}
        \`\`\`
        **Goal:** ${goal}
        **Instructions:**
        1.  Create a powerful headline.
        2.  Write an engaging introduction to what the event is about.
        3.  Detail the key benefits for attendees.
        4.  Include a clear and urgent call to action.
        5.  Format as well-structured Markdown.`;

    case ContentType.LOCAL_BUSINESS_DESCRIPTION:
        return `Write a friendly and inviting description for a local business.
        **Business Name:** ${topic}
        **Business Type/Services:** ${audience}
        **Key Information (Address, Hours, Unique Selling Points):**
        \`\`\`
        ${tone}
        \`\`\`
        **Instructions:**
        1.  Write a warm and welcoming description.
        2.  Highlight what makes the business unique.
        3.  Include a call to action (e.g., "Visit us today!").`;

    case ContentType.EVENT_DESCRIPTION:
        return `Write a concise and exciting description for an event listing.
        **Event Name:** ${topic}
        **Key Details:**
        \`\`\`
        ${audience}
        \`\`\`
        **Tone:** ${tone}
        **Instructions:**
        1.  Summarize the event in a compelling way.
        2.  Highlight the key activities or speakers.
        3.  Keep it brief and engaging for listings like Eventbrite or Facebook Events.`;
        
    case ContentType.JOB_DESCRIPTION:
        return `You are a professional recruiter. Write a clear, inclusive, and appealing job description.
        **Job Title:** ${topic}
        **Key Responsibilities & Requirements:**
        \`\`\`
        ${audience}
        \`\`\`
        **Company Information:** ${tone}
        **Instructions:**
        1.  Start with a compelling summary of the role.
        2.  Clearly list responsibilities and qualifications using bullet points.
        3.  Include a section about the company culture and benefits.
        4.  End with instructions on how to apply.
        5.  Use inclusive language.`;
    
    // Email
    case ContentType.COLD_OUTREACH_EMAIL:
        return `Write a personalized cold outreach email.
        **My Product/Service:** ${topic}
        **Recipient's Role/Company:** ${audience}
        **Goal of Email:** ${tone}
        **Instructions:**
        1.  Write a compelling and non-generic subject line.
        2.  Personalize the opening line based on the recipient's role.
        3.  Clearly and concisely state your value proposition.
        4.  End with a low-friction call to action (e.g., asking for a brief call, not a sale).`;
        
    case ContentType.PROMOTION_EMAIL:
        return `Write a marketing email for a promotion or offer.
        **Promotion Details:** ${topic}
        **Target Audience:** ${audience}
        **Tone:** ${tone}
        **Instructions:**
        1.  Create a click-worthy subject line.
        2.  Clearly state the offer in the email body.
        3.  Highlight the benefits for the customer.
        4.  Include a clear call-to-action button text (e.g., "Shop Now & Save 25%").
        5.  Add a sense of urgency (e.g., "Offer ends Friday!").`;
        
    case ContentType.SALES_EMAIL_SEQUENCE:
        return `You are a sales expert. Create a sequence of sales emails.
        **Product/Service:** ${topic}
        **Target Prospect:** ${audience}
        **Number of Emails in Sequence:** ${tone}
        **Goal:** ${goal}
        **Instructions:**
        1.  Create a sequence of ${tone} emails (e.g., Intro, Follow-up, Breakup).
        2.  Each email should have a clear subject line and call to action.
        3.  The tone should be professional and value-driven.
        4.  Format the output clearly, separating each email.`;
        
    case ContentType.EMAIL_SUBJECT_LINE:
        return `Generate 10 compelling email subject lines.
        **Email Content/Topic:** ${topic}
        **Target Audience:** ${audience}
        **Instructions:**
        1.  Create a variety of subject lines (e.g., curiosity-driven, urgent, benefit-oriented).
        2.  Keep them short and mobile-friendly.
        3.  Output as a numbered list.`;

    case ContentType.EMAIL_FROM_OUTLINE:
        return `Write a complete email based on the provided outline.
        **Email Outline:**
        \`\`\`
        ${topic}
        \`\`\`
        **Audience:** ${audience}
        **Tone:** ${tone}
        **Instructions:**
        1.  Flesh out each point in the outline into full sentences.
        2.  Ensure a logical flow and a clear call to action.
        3.  Write a compelling subject line.
        4.  Output the full email text.`;
        
    case ContentType.NEWSLETTER:
        return `You are a newsletter editor. Create content for a newsletter.
        **Newsletter Theme/Topics:**
        \`\`\`
        ${topic}
        \`\`\`
        **Audience:** ${audience}
        **Tone:** ${tone}
        **Instructions:**
        1.  Write a catchy subject line.
        2.  Create a brief, engaging introduction.
        3.  For each topic, write a short blurb (2-3 sentences) with a "Read More" link placeholder.
        4.  Conclude with a final thought or call to action.`;

    case ContentType.EVENT_PROMOTION_EMAIL:
        return `Write an email to promote an upcoming event.
        **Event Details:** ${topic}
        **Target Audience:** ${audience}
        **Tone:** ${tone}
        **Instructions:**
        1.  Craft an exciting subject line.
        2.  Clearly state the event's value proposition.
        3.  Include key details (date, time, location/link).
        4.  Have a clear call to action to register or learn more.`;

    // Video
    case ContentType.VIDEO_DESCRIPTION:
        return `Write an SEO-optimized video description.
        **Video Title:** ${topic}
        **Keywords:** ${audience}
        **Tone:** ${tone}
        **Instructions:**
        1.  Write a 2-3 sentence summary of the video.
        2.  Naturally include the keywords.
        3.  Add relevant links (e.g., to your website, social media).
        4.  Include 5-10 relevant hashtags.`;
        
    case ContentType.VIDEO_SCRIPT:
        return `Write a script for a video.
        **Topic:** ${topic}
        **Tone:** ${audience}
        **Desired Duration (in minutes):** ${tone}
        **Number of Hosts:** ${goal}
        **Instructions:**
        1.  Start with a strong hook.
        2.  Structure the script with clear sections (Intro, Main Points, Outro).
        3.  Write conversational dialogue for the specified number of hosts.
        4.  Include visual cues or on-screen text suggestions in parentheses (e.g., "(Show B-roll of...")).
        5.  End with a clear call to action.`;

    // Ads
    case ContentType.GOOGLE_AD_COPY:
        return `You are a Google Ads expert. Write ad copy for a product/service.
        **Product/Service:** ${topic}
        **Keywords to Target:** ${audience}
        **Instructions:**
        Generate 3 variations of Google Ad copy. For each variation, provide:
        - **Headline 1 (30 chars max):**
        - **Headline 2 (30 chars max):**
        - **Headline 3 (30 chars max):**
        - **Description 1 (90 chars max):**
        - **Description 2 (90 chars max):**
        Ensure the copy is compelling and includes a strong call to action.`;
        
    case ContentType.INSTAGRAM_FACEBOOK_AD_COPY:
        return `You are a social media ads specialist. Write ad copy for Instagram or Facebook.
        **Product/Service:** ${topic}
        **Target Audience:** ${audience}
        **Tone:** ${tone}
        **Instructions:**
        1.  **Primary Text:** Write compelling copy that stops the scroll and highlights benefits.
        2.  **Headline:** Create a short, punchy headline.
        3.  **Call to Action:** Suggest a CTA button (e.g., "Shop Now," "Learn More").
        Provide 2-3 variations.`;

    case ContentType.LINKEDIN_AD_COPY:
        return `You are a B2B ad specialist. Write ad copy for LinkedIn.
        **Product/Service:** ${topic}
        **Target Audience:** ${audience}
        **Tone:** ${tone}
        **Instructions:**
        1.  **Introductory Text:** Write professional copy that highlights a pain point or benefit.
        2.  **Headline:** Create a concise, powerful headline.
        3.  **Call to Action:** Suggest a CTA button (e.g., "Request a Demo," "Download Whitepaper").
        4.  Provide 2-3 variations.`;
    
    case ContentType.SHORT_AD_COPY:
        return `Write 5 short, punchy ad copy variations (under 15 words).
        **Product/Service:** ${topic}
        **Key Benefit:** ${audience}
        **Instructions:**
        Focus on being concise, benefit-driven, and creating a strong hook. Output as a numbered list.`;

    case ContentType.CLASSIFIEDS_AD:
        return `Write a classifieds ad.
        **Item/Service for Sale:** ${topic}
        **Details (Condition, Price, Location):**
        \`\`\`
        ${audience}
        \`\`\`
        **Instructions:**
        1.  Create a clear and descriptive title.
        2.  Write a concise body with all necessary details.
        3.  Include contact information or next steps.`;

    case ContentType.TRANSLATE_TEXT:
        return `Translate the following text.
        **Text to Translate:**
        \`\`\`
        ${topic}
        \`\`\`
        **Translate to (Language):** ${audience}
        **Instructions:** Provide only the translated text as the output.`;

    // --- Other Tool Prompts ---
    case ContentType.PRESS_RELEASE:
        return `You are a PR professional. Write a press release based on the following information.
        **Announcement/Key Information:**
        \`\`\`
        ${topic}
        \`\`\`
        **Company:** ${audience}
        **Instructions:**
        Follow standard press release format:
        - FOR IMMEDIATE RELEASE
        - Compelling Headline
        - Dateline (City, State – Date)
        - Introduction (who, what, when, where, why)
        - Body paragraphs with more details and a quote.
        - Boilerplate about the company.
        - Media Contact information.
        - ### (at the end).`;

    case ContentType.CUSTOMER_CASE_STUDY:
        return `You are a marketing writer. Create a customer case study from the provided notes.
        **Customer Name:** ${topic}
        **Product/Service Used:** ${audience}
        **Notes (Problem, Solution, Results):**
        \`\`\`
        ${tone}
        \`\`\`
        **Instructions:**
        Structure the case study with the following sections:
        - A compelling headline.
        - **The Challenge:** Describe the customer's problem.
        - **The Solution:** Explain how your product/service helped.
        - **The Results:** Showcase the positive outcomes with data if possible.
        - Include a customer quote.`;

    case ContentType.HEADLINES:
        return `Generate 10 compelling headlines for the following topic.
        **Topic/Product:** ${topic}
        **Target Audience:** ${audience}
        **Instructions:**
        Create a variety of headlines (e.g., question-based, benefit-driven, controversial).
        Output as a numbered list.`;

    case ContentType.CTAS:
        return `Generate 10 clear and compelling Call to Actions (CTAs).
        **Context/Goal:** ${topic}
        **Instructions:**
        Create a list of 10 varied CTAs. They can be for buttons, links, or email closers.
        Output as a numbered list.`;

    case ContentType.COPY_IN_BULLETS:
        return `Convert the following notes or paragraph into a compelling bulleted list for use in marketing copy.
        **Notes/Paragraph:**
        \`\`\`
        ${topic}
        \`\`\`
        **Instructions:**
        - Transform features into benefits.
        - Start each bullet with a strong action verb.
        - Keep bullets concise and scannable.`;

    case ContentType.BROCHURE:
        return `Write the copy for a tri-fold brochure.
        **Product/Business:** ${topic}
        **Key Information:**
        \`\`\`
        ${audience}
        \`\`\`
        **Tone:** ${tone}
        **Instructions:**
        Structure the copy for a tri-fold layout:
        - **Front Panel:** Company name, logo, and tagline.
        - **Inside Flap:** Introduction or key problem.
        - **Inside Middle & Right Panels:** Detailed information, features, and benefits.
        - **Back Panel:** About Us, contact information, and call to action.`;

    case ContentType.PRODUCT_BUSINESS_NAMES:
        return `You are a branding expert. Generate 10 creative name ideas.
        **Product/Business Concept:**
        \`\`\`
        ${topic}
        \`\`\`
        **Keywords to consider:** ${audience}
        **Instructions:**
        Provide a list of 10 unique and memorable names. Add a brief rationale for your top 3 choices.`;

    case ContentType.WEBPAGE_OUTLINE:
        return `You are a UX copywriter and information architect. Create a logical outline for a webpage or landing page.
        **Page Topic/Goal:** ${topic}
        **Key Information to Include:**
        \`\`\`
        ${audience}
        \`\`\`
        **Instructions:**
        - Structure the outline with clear section headings (e.g., Hero, Features, Social Proof, CTA).
        - For each section, list the key messages and content elements.
        - Output as a Markdown list.`;
        
    case ContentType.REAL_ESTATE_BROCHURE:
        return `You are a luxury real estate marketer. Write the copy for a high-end property brochure.
        **Property Address/Type:** ${topic}
        **Key Features & Amenities:**
        \`\`\`
        ${audience}
        \`\`\`
        **Tone:** ${tone}
        **Instructions:**
        1.  Create an elegant and evocative headline.
        2.  Write a compelling narrative that tells a story about the lifestyle.
        3.  Use descriptive and aspirational language to describe features.
        4.  Structure copy for different sections (e.g., The Residence, The Amenities, The Neighborhood).`;

    case ContentType.POEM:
        return `Write a poem on the given topic.
        **Topic/Theme:** ${topic}
        **Style/Tone:** ${audience}
        **Instructions:**
        Create a poem that captures the essence of the topic in the desired style.`;

    // --- Existing Blog/Content Prompts (from previous implementation) ---
    case ContentType.AI_TOPIC_GENERATOR:
        return `You are an expert content strategist. Generate a list of 10-15 engaging and SEO-friendly topic ideas based on the following theme.
        
        **Theme:** ${topic}
        
        **Output Format:** A Markdown numbered list of topic ideas.`;

    case ContentType.LONG_BLOG_FROM_URL_DOC:
        return `You are an expert writer and researcher. Synthesize the provided reference material into a coherent, original, and well-structured long-form blog post.
        
        **Reference Material:**
        \`\`\`
        ${topic}
        \`\`\`
        
        **Desired Tone:** ${audience}
        **Target Word Count:** ~${tone} words

        **Instructions:**
        1.  Do not plagiarize. Extract key ideas and rephrase them in your own words.
        2.  Create a logical structure with an introduction, body (H2/H3 headings), and conclusion.
        3.  Ensure the final article is high-quality, readable, and engaging.
        4.  Output as a single, complete Markdown document.`;

    case ContentType.SHORT_BLOG_ARTICLE:
        return `Generate a concise and engaging blog post (600-900 words) suitable for a quick read.
        
        **Topic:** ${topic}
        **Tone:** ${audience}
        
        **Instructions:**
        1.  Write a clear introduction, a few body paragraphs, and a conclusion.
        2.  Focus on providing actionable insights.
        3.  Output as well-formatted Markdown.`;
    
    case ContentType.BLOG_POST_OUTLINE:
        return `You are an SEO and content structure expert. Create a logical and detailed outline for a blog post based on the given title.
        
        **Blog Title:** ${topic}
        
        **Instructions:**
        - Create a structure using H1 for the title, and multiple H2s and H3s for the main sections and sub-points.
        - The outline should be comprehensive and guide a writer to create a well-structured article.
        - Output as a Markdown list.`;

    case ContentType.BLOG_POST_INTRODUCTION:
        return `Write a compelling and engaging introduction paragraph for a blog post.
        
        **Blog Title:** ${topic}
        **Target Audience:** ${audience}
        **Tone:** ${tone}
        
        **Instructions:**
        - Hook the reader immediately.
        - Clearly state the article's purpose.
        - Keep it between 100-150 words.
        - Output the paragraph directly.`;
        
    case ContentType.CONTENT_IMPROVER:
        return `You are an expert editor. Improve the following text for clarity, structure, grammar, and style, while rewriting it in the specified tone.
        
        **Original Text:**
        \`\`\`
        ${topic}
        \`\`\`
        
        **Desired Tone:** ${audience}
        
        **Output:** The improved and polished version of the text.`;

    case ContentType.PARAPHRASE_REWRITE:
        return `Rewrite and paraphrase the following text. The goal is to make it sound completely original while preserving the core meaning.
        
        **Original Text:**
        \`\`\`
        ${topic}
        \`\`\`
        
        **Output:** The rewritten version of the text.`;

    case ContentType.BLOG_SECTIONAL_CONTENT:
        return `Write a detailed and informative blog section for the given subheading.
        
        **Section Subheading/Topic:** ${topic}
        **Broader Article Context:** ${audience}
        **Tone:** ${tone}
        
        **Instructions:**
        - Write 2-3 paragraphs.
        - Provide explanations, examples, or supporting points.
        - Ensure the content is self-contained but fits the given context.
        - Output as Markdown.`;
        
    case ContentType.BLOG_ARTICLE_FROM_OUTLINE:
        return `You are a skilled writer. Expand the following outline into a complete, well-written blog article.
        
        **Article Outline:**
        \`\`\`
        ${topic}
        \`\`\`
        
        **Article Topic:** ${audience}
        **Tone:** ${tone}
        
        **Instructions:**
        - Flesh out each point in the outline into full paragraphs.
        - Ensure smooth transitions between sections.
        - Write an introduction and conclusion if not specified in the outline.
        - Output as a complete Markdown article.`;

    case ContentType.FAQ_GENERATOR:
        return `Generate a list of frequently asked questions (FAQs) with clear, concise answers for the given topic, product, or service.
        
        **Topic/Product/Service:** ${topic}
        
        **Instructions:**
        - Identify 5-7 common user questions.
        - Provide helpful and direct answers.
        - Format the output as a list of questions and answers in Markdown (e.g., using bold for questions).`;

    case ContentType.QA_GENERATOR:
        return `Provide a clear, factual, and concise answer to the following question.
        
        **Question:** "${topic}"
        
        **Output:** A direct answer to the question.`;
        
    case ContentType.BLOG_POST_CONCLUSION:
        return `Write a strong and effective conclusion paragraph for a blog post.
        
        **Blog Title:** ${topic}
        **Target Audience:** ${audience}
        **Tone:** ${tone}

        **Instructions:**
        - Summarize the key takeaways.
        - Provide a final thought or call-to-action.
        - Keep it between 100-150 words.
        - Output the paragraph directly.`;

    case ContentType.PARAGRAPHS_TO_BULLETS:
        return `Convert the following paragraph(s) into a concise, easy-to-read bulleted list. Extract the main points.
        
        **Original Text:**
        \`\`\`
        ${topic}
        \`\`\`
        
        **Output:** A Markdown bulleted list.`;

    case ContentType.SENTENCE_EXPANDER:
        return `Expand the following short sentence into a more detailed and descriptive paragraph.
        
        **Sentence:** "${topic}"
        **Tone:** ${audience}
        
        **Instructions:**
        - Add context, examples, and explanations.
        - Maintain the specified tone.
        - Output a single, well-formed paragraph.`;
        
    case ContentType.SEO_META_DESCRIPTION:
        return `Write a compelling, SEO-friendly meta description (120-160 characters) for a web page.
        
        **Page Title/Topic:** ${topic}
        **Primary Keywords:** ${audience}
        
        **Instructions:**
        - Include the primary keywords naturally.
        - Create a hook to encourage clicks from SERPs.
        - Adhere to the character limit.`;
        
    case ContentType.CORRECT_SPELLING_GRAMMAR:
        return `Correct all spelling, grammar, and punctuation errors in the following text. Do not change the meaning.
        
        **Original Text:**
        \`\`\`
        ${topic}
        \`\`\`
        
        **Output:** The corrected text.`;

    case ContentType.SIMPLIFY_TEXT:
        return `Rewrite the following text to make it simpler and easier to understand. Use clearer vocabulary and shorter sentences.
        
        **Original Text:**
        \`\`\`
        ${topic}
        \`\`\`
        
        **Output:** The simplified version of the text.`;
        
    case ContentType.SEARCH_KEYWORDS:
        return `You are an SEO expert. Generate a list of relevant keywords for the given theme.
        
        **Theme/Product/Service:** ${topic}
        **Industry:** ${audience}
        **Target Audience:** ${tone}
        
        **Instructions:**
        - Provide a list of 5-7 Primary Keywords.
        - Provide a list of 10-15 Secondary/Long-tail Keywords.
        - Provide a list of 5-7 LSI (Latent Semantic Indexing) Keywords.
        - Format the output clearly using Markdown headings.`;
    
// Fix: Add missing cases for ContentType to ensure exhaustive check.
    case ContentType.BLOG_BRIEF_AND_OUTLINE:
    case ContentType.SPEECH_GENERATION:
    case ContentType.IMAGE_EDITING:
        // These are handled by other services and should not use generatePrompt
        return `This content type is not supported for generic content generation.`;
    // Default case
    default:
        // A comprehensive fallback.
        const exhaustiveCheck: never = contentType;
        return `Generate content for topic: ${topic}`;
  }
};

export const generateContent = async (
  contentType: ContentType,
  topic: string,
  audience: string,
  tone: ToneOfVoice | string,
  goal: string
): Promise<string> => {
  const prompt = generatePrompt(contentType, topic, audience, tone, goal);
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating content:", error);
    return "An error occurred while generating content. Please check your API key and try again.";
  }
};

export const generateImage = async (prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' = '1:1'): Promise<string> => {
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
      });
  
      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
      } else {
        throw new Error("No image was generated.");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      throw new Error("An error occurred while generating the image. Please try again.");
    }
};

export const editImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const base64ImageBytes: string = part.inlineData.data;
              const imageMimeType = part.inlineData.mimeType;
              return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("No edited image was returned from the API.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("An error occurred while editing the image. Please try again.");
    }
};

export const generateSpeech = async (text: string, voice: string = 'Kore'): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voice },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("An error occurred while generating speech. Please try again.");
    }
};

export const generateMarketingTip = async (): Promise<string> => {
    const prompt = `You are a veteran marketing expert like Seth Godin. Provide one concise, insightful, and actionable marketing tip for today. The tip should be creative and thought-provoking. Keep it under 40 words.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Error generating marketing tip:", error);
      return "Could not fetch a tip right now. Please try again later.";
    }
  };

export const createChat = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: `You are 'Marvin', a world-class AI marketing strategist. Your persona is professional, insightful, and slightly witty. Your goal is to provide concise, actionable, and creative marketing advice. Always stay in character.`,
    }
  });
};