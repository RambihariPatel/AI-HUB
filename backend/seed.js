require('dotenv').config();
const mongoose = require('mongoose');
const Tool = require('./models/Tool');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const sampleTools = [
    // 1. WRITING (10) - Mostly Free/Freemium
    { name: 'ChatGPT', tagline: 'Conversational AI for everything.', category: 'Writing', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: 'Unlimited (GPT-4o mini)' }, link: 'https://chat.openai.com' },
    { name: 'Gemini', tagline: 'Google\'s powerful free AI.', category: 'Writing', pricing: 'Free', rating: 4.7, modelInfo: { credits: 'Unlimited for students' }, link: 'https://gemini.google.com' },
    { name: 'Rytr', tagline: 'Best budget-friendly AI writer.', category: 'Writing', pricing: 'Free', rating: 4.4, modelInfo: { credits: '10k characters/mo' }, link: 'https://rytr.me' },
    { name: 'Hugging Face Chat', tagline: 'Open-source and 100% free chat.', category: 'Writing', pricing: 'Free', rating: 4.5, modelInfo: { credits: 'Unlimited' }, link: 'https://huggingface.co/chat' },
    { name: 'Copy.ai', tagline: 'Marketing copy made easy.', category: 'Writing', pricing: 'Free', rating: 4.6, modelInfo: { credits: '2000 words/mo' }, link: 'https://copy.ai' },
    { name: 'Quillbot', tagline: 'Paraphrasing and summary tool.', category: 'Writing', pricing: 'Freemium', rating: 4.5, modelInfo: { credits: '125 words free' }, link: 'https://quillbot.com' },
    { name: 'Wordtune', tagline: 'Rewrite and refine sentences.', category: 'Writing', pricing: 'Freemium', rating: 4.5, modelInfo: { credits: '10 rewrites/day' }, link: 'https://wordtune.com' },
    { name: 'Writesonic', tagline: 'AI for blogs and articles.', category: 'Writing', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: '25 credits free' }, link: 'https://writesonic.com' },
    { name: 'Jasper', tagline: 'Professional AI content.', category: 'Writing', pricing: 'Paid', rating: 4.7, modelInfo: { credits: 'Enterprise' }, link: 'https://jasper.ai' },
    { name: 'Anyword', tagline: 'Copywriting for growth.', category: 'Writing', pricing: 'Paid', rating: 4.3, modelInfo: { credits: 'Usage based' }, link: 'https://anyword.com' },

    // 2. CODING (10) - Heavily Free
    { name: 'Codeium', tagline: '100% Free AI coding for individuals.', category: 'Coding', pricing: 'Free', rating: 4.8, modelInfo: { credits: 'Unlimited' }, link: 'https://codeium.com' },
    { name: 'Amazon CodeWhisperer', tagline: 'Free AI coding assistant from AWS.', category: 'Coding', pricing: 'Free', rating: 4.5, modelInfo: { credits: 'Free for personal' }, link: 'https://aws.amazon.com/codewhisperer' },
    { name: 'Cursor', tagline: 'The AI-first Code Editor.', category: 'Coding', pricing: 'Freemium', rating: 4.9, modelInfo: { credits: '2000 comps/mo' }, link: 'https://cursor.com' },
    { name: 'Blackbox AI', tagline: 'Code search and generation.', category: 'Coding', pricing: 'Free', rating: 4.5, modelInfo: { credits: 'Unlimited free tier' }, link: 'https://useblackbox.io' },
    { name: 'Sourcegraph Cody', tagline: 'AI that knows your codebase.', category: 'Coding', pricing: 'Free', rating: 4.7, modelInfo: { credits: 'Free for personal' }, link: 'https://sourcegraph.com/cody' },
    { name: 'Tabnine', tagline: 'Private AI code completion.', category: 'Coding', pricing: 'Freemium', rating: 4.4, modelInfo: { credits: 'Basic free' }, link: 'https://tabnine.com' },
    { name: 'CodeRabbit', tagline: 'AI code review for students.', category: 'Coding', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: 'Free for OSS' }, link: 'https://coderabbit.ai' },
    { name: 'GitHub Copilot', tagline: 'Your AI pair programmer.', category: 'Coding', pricing: 'Paid', rating: 4.7, modelInfo: { credits: 'Subscription' }, link: 'https://github.com' },
    { name: 'Replit Ghostwriter', tagline: 'AI inside your online IDE.', category: 'Coding', pricing: 'Paid', rating: 4.6, modelInfo: { credits: 'Subscription' }, link: 'https://replit.com' },
    { name: 'Mintlify', tagline: 'Auto-documentation for code.', category: 'Coding', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: 'Free basic' }, link: 'https://mintlify.com' },

    // 3. IMAGE (10)
    { name: 'Stable Diffusion', tagline: 'Open-source image generation.', category: 'Image', pricing: 'Free', rating: 4.6, modelInfo: { credits: 'Unlimited (Local)' }, link: 'https://stability.ai' },
    { name: 'Artbreeder', tagline: 'Create unique art with AI.', category: 'Image', pricing: 'Free', rating: 4.5, modelInfo: { credits: 'Unlimited basic' }, link: 'https://artbreeder.com' },
    { name: 'Leonardo.ai', tagline: 'High-quality assets and art.', category: 'Image', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: '150 tokens/day' }, link: 'https://leonardo.ai' },
    { name: 'Adobe Firefly', tagline: 'Safe for commercial use AI.', category: 'Image', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: '25 credits/mo' }, link: 'https://firefly.adobe.com' },
    { name: 'Canva Magic Media', tagline: 'AI generation for everyone.', category: 'Image', pricing: 'Freemium', rating: 4.5, modelInfo: { credits: '50 uses free' }, link: 'https://canva.com' },
    { name: 'Lexica', tagline: 'Searchable art gallery.', category: 'Image', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: '100 images/mo' }, link: 'https://lexica.art' },
    { name: 'BlueWillow', tagline: 'Free alternative to Midjourney.', category: 'Image', pricing: 'Free', rating: 4.3, modelInfo: { credits: 'Unlimited prompts' }, link: 'https://bluewillow.ai' },
    { name: 'DALL-E 3', tagline: 'The image model by OpenAI.', category: 'Image', pricing: 'Paid', rating: 4.8, modelInfo: { credits: 'Requires Plus' }, link: 'https://openai.com/dall-e-3' },
    { name: 'Midjourney', tagline: 'Artistic AI generator.', category: 'Image', pricing: 'Paid', rating: 4.9, modelInfo: { credits: 'GPU-hour based' }, link: 'https://midjourney.com' },
    { name: 'NightCafe', tagline: 'Community focused AI art.', category: 'Image', pricing: 'Freemium', rating: 4.4, modelInfo: { credits: '5 credits/day' }, link: 'https://nightcafe.studio' },

    // 4. VIDEO (10)
    { name: 'Pika Art', tagline: 'Animate ideas with ease.', category: 'Video', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: '30 credits/day' }, link: 'https://pika.art' },
    { name: 'Luma Dream Machine', tagline: 'Highly realistic video gen.', category: 'Video', pricing: 'Freemium', rating: 4.9, modelInfo: { credits: '30 gens/mo free' }, link: 'https://lumalabs.ai' },
    { name: 'Runway Gen-2', tagline: 'Advanced text-to-video.', category: 'Video', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: '125 one-time free' }, link: 'https://runwayml.com' },
    { name: 'InVideo AI', tagline: 'Instant AI video creator.', category: 'Video', pricing: 'Freemium', rating: 4.5, modelInfo: { credits: '10 mins/mo free' }, link: 'https://invideo.io' },
    { name: 'Fliki', tagline: 'Turn text into video.', category: 'Video', pricing: 'Free', rating: 4.3, modelInfo: { credits: '5 mins/mo free' }, link: 'https://fliki.ai' },
    { name: 'Descript', tagline: 'Edit video like a text doc.', category: 'Video', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: '1 hour free' }, link: 'https://descript.com' },
    { name: 'Synthesia', tagline: 'Enterprise video avatars.', category: 'Video', pricing: 'Paid', rating: 4.6, modelInfo: { credits: 'Credits based' }, link: 'https://synthesia.io' },
    { name: 'HeyGen', tagline: 'Professional AI avatars.', category: 'Video', pricing: 'Paid', rating: 4.6, modelInfo: { credits: '1 credit/mo' }, link: 'https://heygen.com' },
    { name: 'Pictory', tagline: 'Articles to videos.', category: 'Video', pricing: 'Paid', rating: 4.4, modelInfo: { credits: 'Free trial' }, link: 'https://pictory.ai' },
    { name: 'Kaiber', tagline: 'Creative AI video.', category: 'Video', pricing: 'Paid', rating: 4.6, modelInfo: { credits: 'Trial credits' }, link: 'https://kaiber.ai' },

    // 5. AUDIO (10)
    { name: 'Adobe Podcast', tagline: 'Professional audio cleanup.', category: 'Audio', pricing: 'Free', rating: 4.7, modelInfo: { credits: 'Unlimited Basic' }, link: 'https://podcast.adobe.com' },
    { name: 'Voice.ai', tagline: 'Real-time voice changer.', category: 'Audio', pricing: 'Free', rating: 4.2, modelInfo: { credits: 'Unlimited' }, link: 'https://voice.ai' },
    { name: 'ElevenLabs', tagline: 'The best AI voices.', category: 'Audio', pricing: 'Freemium', rating: 4.9, modelInfo: { credits: '10k chars/mo' }, link: 'https://elevenlabs.io' },
    { name: 'Suno AI', tagline: 'Generate high-quality songs.', category: 'Audio', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: '50 credits/day' }, link: 'https://suno.com' },
    { name: 'Speechify', tagline: 'Read texts with AI voices.', category: 'Audio', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: 'Free basic' }, link: 'https://speechify.com' },
    { name: 'Udio', tagline: 'Next gen music generation.', category: 'Audio', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: 'Free beta tier' }, link: 'https://udio.com' },
    { name: 'Murf AI', tagline: 'Professional voiceovers.', category: 'Audio', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: '10 mins free' }, link: 'https://murf.ai' },
    { name: 'Otter.ai', tagline: 'AI transcription for meetings.', category: 'Audio', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: '300 mins/mo' }, link: 'https://otter.ai' },
    { name: 'Resemble AI', tagline: 'Custom AI voice cloning.', category: 'Audio', pricing: 'Paid', rating: 4.5, modelInfo: { credits: 'Subscription' }, link: 'https://resemble.ai' },
    { name: 'Mubert', tagline: 'AI music for creators.', category: 'Audio', pricing: 'Freemium', rating: 4.4, modelInfo: { credits: '25 tracks free' }, link: 'https://mubert.com' },

    // 6. AUTOMATION (10)
    { name: 'Bardeen', tagline: 'AI automation in your browser.', category: 'Automation', pricing: 'Free', rating: 4.6, modelInfo: { credits: 'Unlimited basic' }, link: 'https://bardeen.ai' },
    { name: 'n8n', tagline: 'The automation tool for coders.', category: 'Automation', pricing: 'Free', rating: 4.8, modelInfo: { credits: 'Unlimited (Self-hosted)' }, link: 'https://n8n.io' },
    { name: 'Flowise', tagline: 'Build LLM apps visually.', category: 'Automation', pricing: 'Free', rating: 4.8, modelInfo: { credits: 'Open source' }, link: 'https://flowiseai.com' },
    { name: 'LangChain', tagline: 'Framework for LLM apps.', category: 'Automation', pricing: 'Free', rating: 4.9, modelInfo: { credits: 'Open source' }, link: 'https://langchain.com' },
    { name: 'Zapier Central', tagline: 'Automate with AI agents.', category: 'Automation', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: '100 tasks/mo' }, link: 'https://zapier.com' },
    { name: 'Make.com', tagline: 'Powerful workflow automation.', category: 'Automation', pricing: 'Freemium', rating: 4.5, modelInfo: { credits: '1000 ops/mo' }, link: 'https://make.com' },
    { name: 'IFTTT', tagline: 'Everyday app automation.', category: 'Automation', pricing: 'Freemium', rating: 4.4, modelInfo: { credits: '5 applets free' }, link: 'https://ifttt.com' },
    { name: 'ClickUp Brain', tagline: 'Project management AI.', category: 'Automation', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: 'Free basic' }, link: 'https://clickup.com' },
    { name: 'ActiveCampaign AI', tagline: 'Marketing automation.', category: 'Automation', pricing: 'Paid', rating: 4.5, modelInfo: { credits: 'Subscription' }, link: 'https://activecampaign.com' },
    { name: 'HubSpot AI', tagline: 'CRM and marketing AI.', category: 'Automation', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: 'Free tools tier' }, link: 'https://hubspot.com' },

    // 7. MARKETING (10)
    { name: 'Copy.ai', tagline: 'AI for marketing copy.', category: 'Marketing', pricing: 'Free', rating: 4.6, modelInfo: { credits: '2000 words/mo' }, link: 'https://copy.ai' },
    { name: 'Buffer AI', tagline: 'Social post planning AI.', category: 'Marketing', pricing: 'Free', rating: 4.5, modelInfo: { credits: 'Free basic tier' }, link: 'https://buffer.com' },
    { name: 'Pensight', tagline: 'AI for creators.', category: 'Marketing', pricing: 'Free', rating: 4.7, modelInfo: { credits: 'Unlimited basic' }, link: 'https://pensight.com' },
    { name: 'Predis.ai', tagline: 'AI social media design.', category: 'Marketing', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: '15 posts/mo free' }, link: 'https://predis.ai' },
    { name: 'MarketMuse', tagline: 'Content strategy AI.', category: 'Marketing', pricing: 'Freemium', rating: 4.5, modelInfo: { credits: '10 queries free' }, link: 'https://marketmuse.com' },
    { name: 'Rytr Marketing', tagline: 'Copywriting for students.', category: 'Marketing', pricing: 'Free', rating: 4.4, modelInfo: { credits: '10k chars/mo' }, link: 'https://rytr.me' },
    { name: 'Surfer SEO', tagline: 'SEO optimization tool.', category: 'Marketing', pricing: 'Paid', rating: 4.7, modelInfo: { credits: 'Subscription' }, link: 'https://surferseo.com' },
    { name: 'AdCreative.ai', tagline: 'Conversion focused ads.', category: 'Marketing', pricing: 'Paid', rating: 4.4, modelInfo: { credits: 'Credits based' }, link: 'https://adcreative.ai' },
    { name: 'SEMrush', tagline: 'Professional marketing suite.', category: 'Marketing', pricing: 'Paid', rating: 4.6, modelInfo: { credits: 'Enterprise' }, link: 'https://semrush.com' },
    { name: 'Lately AI', tagline: 'Long content to social posts.', category: 'Marketing', pricing: 'Paid', rating: 4.1, modelInfo: { credits: 'Subscription' }, link: 'https://lately.ai' },

    // 8. EDUCATION (10) - Purely for Students
    { name: 'Photomath', tagline: 'Snap and solve math instantly.', category: 'Education', pricing: 'Free', rating: 4.9, modelInfo: { credits: 'Unlimited scans' }, link: 'https://photomath.com' },
    { name: 'Socratic', tagline: 'Google\'s AI help for homework.', category: 'Education', pricing: 'Free', rating: 4.7, modelInfo: { credits: '100% Free' }, link: 'https://socratic.org' },
    { name: 'WolframAlpha', tagline: 'The computational search engine.', category: 'Education', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: 'Basic free' }, link: 'https://wolframalpha.com' },
    { name: 'Perplexity for Research', tagline: 'Academic AI search tool.', category: 'Education', pricing: 'Free', rating: 4.9, modelInfo: { credits: 'Unlimited basic' }, link: 'https://perplexity.ai' },
    { name: 'Grammarly', tagline: 'Writing assistant for students.', category: 'Education', pricing: 'Free', rating: 4.7, modelInfo: { credits: 'Free basic' }, link: 'https://grammarly.com' },
    { name: 'Quizlet Q-Chat', tagline: 'AI tutor for study sets.', category: 'Education', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: 'Limited free use' }, link: 'https://quizlet.com' },
    { name: 'Khanmigo', tagline: 'AI tutor by Khan Academy.', category: 'Education', pricing: 'Paid', rating: 4.7, modelInfo: { credits: 'Subscription' }, link: 'https://khanacademy.org' },
    { name: 'Duolingo Max', tagline: 'Learn languages with AI.', category: 'Education', pricing: 'Paid', rating: 4.8, modelInfo: { credits: 'Subscription' }, link: 'https://duolingo.com' },
    { name: 'Gradescope', tagline: 'AI grading for teachers.', category: 'Education', pricing: 'Paid', rating: 4.6, modelInfo: { credits: 'Institutional' }, link: 'https://gradescope.com' },
    { name: 'Chegg AI', tagline: 'Homework help service.', category: 'Education', pricing: 'Paid', rating: 4.4, modelInfo: { credits: 'Subscription' }, link: 'https://chegg.com' },

    // 9. PRODUCTIVITY (10)
    { name: 'Perplexity AI', tagline: 'Best AI search for students.', category: 'Productivity', pricing: 'Free', rating: 4.9, modelInfo: { credits: 'Unlimited' }, link: 'https://perplexity.ai' },
    { name: 'Todoist AI', tagline: 'Organize life with AI.', category: 'Productivity', pricing: 'Free', rating: 4.5, modelInfo: { credits: 'Free for personal' }, link: 'https://todoist.com' },
    { name: 'Claude 3', tagline: 'Smartest assistant for work.', category: 'Productivity', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: 'Usage limited' }, link: 'https://claude.ai' },
    { name: 'Otter.ai', tagline: 'Note taking for lectures.', category: 'Productivity', pricing: 'Freemium', rating: 4.7, modelInfo: { credits: '300 mins/mo' }, link: 'https://otter.ai' },
    { name: 'Fireflies.ai', tagline: 'Record and transcribe meetings.', category: 'Productivity', pricing: 'Free', rating: 4.6, modelInfo: { credits: 'Free for personal' }, link: 'https://fireflies.ai' },
    { name: 'Taskade AI', tagline: 'AI workspaces for students.', category: 'Productivity', pricing: 'Free', rating: 4.5, modelInfo: { credits: 'Unlimited basic' }, link: 'https://taskade.com' },
    { name: 'Notion AI', tagline: 'All-in-one student workspace.', category: 'Productivity', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: 'Free basic' }, link: 'https://notion.so' },
    { name: 'Superhuman AI', tagline: 'Fastest email with AI.', category: 'Productivity', pricing: 'Paid', rating: 4.8, modelInfo: { credits: 'Subscription' }, link: 'https://superhuman.com' },
    { name: 'Mem.ai', tagline: 'Self-organizing notes.', category: 'Productivity', pricing: 'Paid', rating: 4.4, modelInfo: { credits: 'Subscription' }, link: 'https://mem.ai' },
    { name: 'Read AI', tagline: 'Meeting summaries.', category: 'Productivity', pricing: 'Freemium', rating: 4.6, modelInfo: { credits: 'Free basic' }, link: 'https://read.ai' },

    // 10. DATA (10)
    { name: 'RapidMiner', tagline: 'Data science for everyone.', category: 'Data', pricing: 'Free', rating: 4.4, modelInfo: { credits: 'Free educational tier' }, link: 'https://rapidminer.com' },
    { name: 'Coefficient.io', tagline: 'AI inside Google Sheets.', category: 'Data', pricing: 'Free', rating: 4.6, modelInfo: { credits: 'Free basic' }, link: 'https://coefficient.io' },
    { name: 'Julius AI', tagline: 'Free data analyst bot.', category: 'Data', pricing: 'Freemium', rating: 4.8, modelInfo: { credits: '15 messages free' }, link: 'https://julius.ai' },
    { name: 'Tableau Pulse', tagline: 'Business data with AI.', category: 'Data', pricing: 'Paid', rating: 4.6, modelInfo: { credits: 'Subscription' }, link: 'https://tableau.com' },
    { name: 'Polymer Search', tagline: 'Visualize data instantly.', category: 'Data', pricing: 'Paid', rating: 4.3, modelInfo: { credits: 'Usage based' }, link: 'https://polymersearch.com' },
    { name: 'Akkio', tagline: 'No-code predictive AI.', category: 'Data', pricing: 'Paid', rating: 4.5, modelInfo: { credits: 'Enterprise' }, link: 'https://akkio.com' },
    { name: 'MonkeyLearn', tagline: 'Text analysis platform.', category: 'Data', pricing: 'Paid', rating: 4.2, modelInfo: { credits: 'Usage based' }, link: 'https://monkeylearn.com' },
    { name: 'Exploratory', tagline: 'Data science UI.', category: 'Data', pricing: 'Free', rating: 4.4, modelInfo: { credits: 'Free for public data' }, link: 'https://exploratory.io' },
    { name: 'Glean AI', tagline: 'Enterprise search.', category: 'Data', pricing: 'Paid', rating: 4.7, modelInfo: { credits: 'Enterprise' }, link: 'https://glean.com' },
    { name: 'Obviously AI', tagline: 'Predictive analytics.', category: 'Data', pricing: 'Paid', rating: 4.5, modelInfo: { credits: 'Subscription' }, link: 'https://obviously.ai' }
];

// Map all tools to include required fields from schema
const toolsToInsert = sampleTools.map(tool => ({
    ...tool,
    descriptionShort: tool.tagline,
    descriptionLong: `${tool.name} is a high-performance ${tool.category} engine known for its exceptional accuracy and reliability. ${tool.tagline} It delivers professional-grade results with high efficiency, making it a dependable choice for complex tasks. Whether you are a student or a professional, its precision and work capability ensure top-tier output every time.`,
    features: ['Industry-leading Accuracy', 'High-speed Processing', 'Professional Quality Output', 'Intelligent Workflows'],
    useCases: ['Academic Excellence', 'Professional Problem Solving', 'High-precision Tasks'],
    pros: ['Extremely Accurate', 'Proven Performance', 'User-friendly'],
    cons: ['Requires Internet', 'Premium features for enterprise'],
    popularityLevel: 'High'
}));

const seedDB = async () => {
    await connectDB();
    try {
        await Tool.deleteMany();
        console.log('Existing tools cleared');
        await Tool.insertMany(toolsToInsert);
        console.log(`Database updated! Total 100 tools (10 per category). Mostly Free/Freemium for students.`);
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedDB();
