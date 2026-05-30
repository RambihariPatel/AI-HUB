import dns from 'dns';
dns.setServers(['8.8.8.8']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tool from '../models/Tool.js';

dotenv.config();
dotenv.config({ path: 'backend/.env' });

// Helper to create tool with all required fields
const createTool = (data, index) => {
  let image = data.image;
  // If image is a generic favicon or broken source, use Clearbit instead for a cleaner start
  if (image && (image.includes('favicon.ico') || image.includes('seeklogo.com'))) {
    const domain = data.link.replace('https://', '').replace('http://', '').split('/')[0];
    image = `https://logo.clearbit.com/${domain}`;
  }

  // Force 80/20 ratio if not explicitly set (every 5th tool is Paid)
  const forcedPricing = (index + 1) % 5 === 0 ? 'Paid' : (data.pricing === 'Paid' ? 'Freemium' : data.pricing);

  // Dynamic model names based on category
  const modelNames = {
    'Writing': 'GPT-3.5 Turbo',
    'Coding': 'Codex Base',
    'Image': 'SDXL Turbo',
    'Video': 'Motion-V1',
    'Audio': 'Voice-Sync',
    'Data': 'Analyst-L1',
    'Productivity': 'Task-Core',
    'Logo Maker': 'Vector-Gen'
  };

  const modelName = data.modelInfo?.modelName || modelNames[data.category] || 'Neural-Core';
  const credits = data.modelInfo?.credits || (forcedPricing === 'Free' ? 'Unlimited' : '50 Monthly');

  return {
    ...data,
    pricing: forcedPricing,
    image: image || '/placeholder-tool.png',
    descriptionLong: data.descriptionLong || `${data.name} is a powerful ${data.category} tool designed to help users with ${data.tagline.toLowerCase()}`,
    features: data.features || ['AI-powered', 'User-friendly', 'Real-time results'],
    plans: data.plans || { free: 'Basic access', pro: 'Full features' },
    modelInfo: data.modelInfo || { 
      modelName, 
      modelType: 'Proprietary', 
      freeAvailable: forcedPricing !== 'Paid', 
      paidAvailable: true, 
      credits, 
      apiAccess: true 
    },
    useCases: data.useCases || ['Personal use', 'Professional workflow'],
    pros: data.pros || ['Easy to use', 'Fast results'],
    cons: data.cons || ['Requires internet', 'Learning curve'],
    clicks: data.clicks || 0,
    monthlyUsers: data.monthlyUsers || (
      data.popularity === 'High' 
        ? `${(Math.random() * 150 + 50).toFixed(0)}M+` 
        : data.popularity === 'Medium' 
        ? `${(Math.random() * 800 + 100).toFixed(0)}k+` 
        : `${(Math.random() * 80 + 10).toFixed(0)}k+`
    ),
    isApproved: true
  };
};

const toolsData = [
  // --- WRITING ---
  { name: 'ChatGPT', tagline: 'The world\'s most popular AI assistant.', category: 'Writing', descriptionShort: 'Versatile AI for writing and coding.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', link: 'https://chat.openai.com' },
  { name: 'Claude', tagline: 'Safe and high-context AI.', category: 'Writing', descriptionShort: 'Advanced LLM for high-quality writing.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://anthropic.com/images/icons/apple-touch-icon.png', link: 'https://claude.ai' },
  { name: 'Grammarly', tagline: 'AI writing suggestions.', category: 'Writing', descriptionShort: 'Advanced grammar and style checker.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Grammarly_logo.svg', link: 'https://grammarly.com' },
  { name: 'Rytr', tagline: 'Fast and affordable writer.', category: 'Writing', descriptionShort: 'AI writing assistant for everyone.', pricing: 'Freemium', rating: 4.4, popularity: 'Medium', image: 'https://rytr.me/favicon.ico', link: 'https://rytr.me' },
  { name: 'QuillBot', tagline: 'Your paraphrasing partner.', category: 'Writing', descriptionShort: 'Paraphrasing and grammar tool.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://quillbot.com/favicon.ico', link: 'https://quillbot.com' },
  { name: 'Writesonic', tagline: 'SEO article writer.', category: 'Writing', descriptionShort: 'AI content creation with SEO focus.', pricing: 'Freemium', rating: 4.6, popularity: 'Medium', image: 'https://writesonic.com/static/images/logo.png', link: 'https://writesonic.com' },
  { name: 'Jasper', tagline: 'Marketing copy copilot.', category: 'Writing', descriptionShort: 'Optimized for marketing and brand consistency.', pricing: 'Paid', rating: 4.6, popularity: 'Medium', image: 'https://seeklogo.com/images/J/jasper-ai-logo-B13936E7B4-seeklogo.com.png', link: 'https://jasper.ai' },
  { name: 'Wordtune', tagline: 'Sentence rewriter.', category: 'Writing', descriptionShort: 'AI that helps you rephrase perfectly.', pricing: 'Freemium', rating: 4.6, popularity: 'Medium', image: 'https://www.wordtune.com/favicon.ico', link: 'https://wordtune.com' },
  { name: 'Anyword', tagline: 'Predictive performance copy.', category: 'Writing', descriptionShort: 'Data-driven AI copy that converts.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://anyword.com/favicon.ico', link: 'https://anyword.com' },
  { name: 'Simplified', tagline: 'All-in-one marketing app.', category: 'Writing', descriptionShort: 'AI writing, design, and video.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://simplified.com/favicon.ico', link: 'https://simplified.com' },

  // --- CODING ---
  { name: 'Cursor', tagline: 'The AI Code Editor.', category: 'Coding', descriptionShort: 'VS Code fork with deep AI integration.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://cursor.sh/logo.png', link: 'https://cursor.com' },
  { name: 'GitHub Copilot', tagline: 'Your AI pair programmer.', category: 'Coding', descriptionShort: 'AI suggestions directly in your IDE.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://github.githubassets.com/images/modules/site/copilot/copilot-logo.png', link: 'https://github.com/features/copilot' },
  { name: 'Tabnine', tagline: 'Private code completion.', category: 'Coding', descriptionShort: 'Secure AI code completion for teams.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://www.tabnine.com/favicon.ico', link: 'https://tabnine.com' },
  { name: 'Codeium', tagline: 'Free-forever AI toolkit.', category: 'Coding', descriptionShort: 'Powerful AI completion for individuals.', pricing: 'Free', rating: 4.8, popularity: 'High', image: 'https://codeium.com/favicon.ico', link: 'https://codeium.com' },
  { name: 'Phind', tagline: 'AI search for developers.', category: 'Coding', descriptionShort: 'Coding answers with web citations.', pricing: 'Free', rating: 4.7, popularity: 'High', image: 'https://phind.com/favicon.ico', link: 'https://phind.com' },
  { name: 'Sourcegraph Cody', tagline: 'AI that knows your codebase.', category: 'Coding', descriptionShort: 'Code search and understanding.', pricing: 'Freemium', rating: 4.7, popularity: 'Medium', image: 'https://sourcegraph.com/favicon.ico', link: 'https://sourcegraph.com/cody' },
  { name: 'Replit Ghostwriter', tagline: 'Cloud coding with AI.', category: 'Coding', descriptionShort: 'In-browser AI coding assistant.', pricing: 'Freemium', rating: 4.6, popularity: 'High', image: 'https://replit.com/public/images/logo.png', link: 'https://replit.com/ai' },
  { name: 'Blackbox AI', tagline: 'Universal code autocomplete.', category: 'Coding', descriptionShort: 'Code search from any source.', pricing: 'Freemium', rating: 4.3, popularity: 'Medium', image: 'https://www.useblackbox.io/favicon.ico', link: 'https://useblackbox.io' },
  { name: 'Mintlify', tagline: 'Auto-doc generation.', category: 'Coding', descriptionShort: 'Beautiful docs that sync with code.', pricing: 'Freemium', rating: 4.8, popularity: 'Medium', image: 'https://mintlify.com/favicon.ico', link: 'https://mintlify.com' },
  { name: 'Codiga', tagline: 'Smart snippets & analysis.', category: 'Coding', descriptionShort: 'Clean and safe code faster.', pricing: 'Freemium', rating: 4.2, popularity: 'Low', image: 'https://www.codiga.io/favicon.ico', link: 'https://codiga.io' },

  // --- IMAGE ---
  { name: 'Midjourney', tagline: 'Artistic image generation.', category: 'Image', descriptionShort: 'High-fidelity artistic imagery.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://midjourney.com/favicon.ico', link: 'https://midjourney.com' },
  { name: 'DALL-E 3', tagline: 'Hyper-realistic AI visuals.', category: 'Image', descriptionShort: 'OpenAI\'s flagship image model.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg', link: 'https://openai.com/dall-e-3' },
  { name: 'Stable Diffusion', tagline: 'Open-source AI imagery.', category: 'Image', descriptionShort: 'Customizable and locally hostable.', pricing: 'Free', rating: 4.7, popularity: 'High', image: 'https://stability.ai/favicon.ico', link: 'https://stability.ai' },
  { name: 'Leonardo.ai', tagline: 'Premium web-based imagery.', category: 'Image', descriptionShort: 'Browser-based alternative to Midjourney.', pricing: 'Freemium', rating: 4.7, popularity: 'Medium', image: 'https://leonardo.ai/favicon.ico', link: 'https://leonardo.ai' },
  { name: 'Ideogram', tagline: 'Typography and poster AI.', category: 'Image', descriptionShort: 'Best at rendering text in images.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://ideogram.ai/favicon.ico', link: 'https://ideogram.ai' },
  { name: 'Adobe Firefly', tagline: 'Commercially safe creative AI.', category: 'Image', descriptionShort: 'Adobe\'s generative AI for pros.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://www.adobe.com/favicon.ico', link: 'https://firefly.adobe.com' },
  { name: 'Canva Magic Media', tagline: 'Design made easy.', category: 'Image', descriptionShort: 'AI images inside Canva design flow.', pricing: 'Freemium', rating: 4.6, popularity: 'High', image: 'https://www.canva.com/favicon.ico', link: 'https://canva.com' },
  { name: 'Photoroom', tagline: 'Product photo studio.', category: 'Image', descriptionShort: 'Background removal for e-commerce.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://www.photoroom.com/favicon.ico', link: 'https://photoroom.com' },
  { name: 'Lexica', tagline: 'Artistic prompt search.', category: 'Image', descriptionShort: 'High-quality artistic generator.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://lexica.art/favicon.ico', link: 'https://lexica.art' },
  { name: 'Pixlr AI', tagline: 'Online AI photo editor.', category: 'Image', descriptionShort: 'Quick browser-based AI edits.', pricing: 'Freemium', rating: 4.3, popularity: 'Medium', image: 'https://pixlr.com/favicon.ico', link: 'https://pixlr.com' },

  // --- VIDEO ---
  { name: 'Runway Gen-3', tagline: 'Next-gen video tools.', category: 'Video', descriptionShort: 'Professional AI video generation.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://runwayml.com/favicon.ico', link: 'https://runwayml.com' },
  { name: 'Pika Labs', tagline: 'Idea-to-video platform.', category: 'Video', descriptionShort: 'Creative animations and cinematic clips.', pricing: 'Freemium', rating: 4.6, popularity: 'Medium', image: 'https://pika.art/favicon.ico', link: 'https://pika.art' },
  { name: 'Luma Dream Machine', tagline: 'Realistic video generator.', category: 'Video', descriptionShort: 'High-quality realistic clips.', pricing: 'Freemium', rating: 4.5, popularity: 'High', image: 'https://lumalabs.ai/favicon.ico', link: 'https://lumalabs.ai/dream-machine' },
  { name: 'HeyGen', tagline: 'AI avatars for business.', category: 'Video', descriptionShort: 'Realistic avatars and video translation.', pricing: 'Paid', rating: 4.7, popularity: 'High', image: 'https://heygen.com/favicon.ico', link: 'https://heygen.com' },
  { name: 'Synthesia', tagline: 'Enterprise AI video.', category: 'Video', descriptionShort: 'Professional avatars for teams.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://synthesia.io/favicon.ico', link: 'https://synthesia.io' },
  { name: 'Descript', tagline: 'Edit video like text.', category: 'Video', descriptionShort: 'AI video and podcast editor.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://descript.com/favicon.ico', link: 'https://descript.com' },
  { name: 'InVideo AI', tagline: 'Full video in minutes.', category: 'Video', descriptionShort: 'AI that scripts and edits videos.', pricing: 'Freemium', rating: 4.4, popularity: 'Medium', image: 'https://invideo.io/favicon.ico', link: 'https://invideo.io' },
  { name: 'CapCut AI', tagline: 'Mobile video mastery.', category: 'Video', descriptionShort: 'Advanced AI for quick social edits.', pricing: 'Free', rating: 4.8, popularity: 'High', image: 'https://www.capcut.com/favicon.ico', link: 'https://capcut.com' },
  { name: 'Fliki', tagline: 'Text to video with voice.', category: 'Video', descriptionShort: 'Easy social media video creation.', pricing: 'Freemium', rating: 4.3, popularity: 'Medium', image: 'https://fliki.ai/favicon.ico', link: 'https://fliki.ai' },
  { name: 'Kaiber', tagline: 'AI video for artists.', category: 'Video', descriptionShort: 'Stylized artistic animations.', pricing: 'Freemium', rating: 4.6, popularity: 'Medium', image: 'https://kaiber.ai/favicon.ico', link: 'https://kaiber.ai' },

  // --- AUDIO ---
  { name: 'ElevenLabs', tagline: 'Realistic AI voices.', category: 'Audio', descriptionShort: 'Industry-leading speech synthesis.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://elevenlabs.io/favicon.ico', link: 'https://elevenlabs.io' },
  { name: 'Suno AI', tagline: 'Make any song imagine.', category: 'Audio', descriptionShort: 'Incredible AI music generation.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://suno.com/favicon.ico', link: 'https://suno.com' },
  { name: 'Udio', tagline: 'High-fidelity music gen.', category: 'Audio', descriptionShort: 'Competitor for professional music.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://udio.com/favicon.ico', link: 'https://udio.com' },
  { name: 'Adobe Enhance', tagline: 'Studio sound anywhere.', category: 'Audio', descriptionShort: 'AI background noise removal.', pricing: 'Free', rating: 4.9, popularity: 'Medium', image: 'https://www.adobe.com/favicon.ico', link: 'https://podcast.adobe.com/enhance' },
  { name: 'Otter.ai', tagline: 'AI meeting notes.', category: 'Audio', descriptionShort: 'Real-time transcription and summary.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://otter.ai/favicon.ico', link: 'https://otter.ai' },
  { name: 'Voicemod', tagline: 'Live voice changer.', category: 'Audio', descriptionShort: 'Real-time AI voice manipulation.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://voicemod.net/favicon.ico', link: 'https://voicemod.net' },
  { name: 'Speechify', tagline: 'Text-to-speech app.', category: 'Audio', descriptionShort: 'Turn text into natural audio.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://speechify.com/favicon.ico', link: 'https://speechify.com' },
  { name: 'Moises.ai', tagline: 'Musician\'s AI app.', category: 'Audio', descriptionShort: 'Split music into stems.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://moises.ai/favicon.ico', link: 'https://moises.ai' },
  { name: 'Soundraw', tagline: 'AI background music.', category: 'Audio', descriptionShort: 'Customizable music for creators.', pricing: 'Paid', rating: 4.5, popularity: 'Medium', image: 'https://soundraw.io/favicon.ico', link: 'https://soundraw.io' },
  { name: 'LALAL.AI', tagline: 'High-res stem splitter.', category: 'Audio', descriptionShort: 'Extract vocals and instruments.', pricing: 'Paid', rating: 4.6, popularity: 'Medium', image: 'https://lalal.ai/favicon.ico', link: 'https://lalal.ai' },

  // --- DATA ---
  { name: 'Julius AI', tagline: 'Personal data analyst.', category: 'Data', descriptionShort: 'Analyze and visualize data with chat.', pricing: 'Freemium', rating: 4.7, popularity: 'Medium', image: 'https://julius.ai/favicon.ico', link: 'https://julius.ai' },
  { name: 'Rows AI', tagline: 'Spreadsheet with AI.', category: 'Data', descriptionShort: 'Modern spreadsheet for teams.', pricing: 'Free', rating: 4.6, popularity: 'Medium', image: 'https://rows.com/favicon.ico', link: 'https://rows.com' },
  { name: 'Akkio', tagline: 'Predictive analytics AI.', category: 'Data', descriptionShort: 'No-code predictive modeling.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://akkio.com/favicon.ico', link: 'https://akkio.com' },
  { name: 'Polymer Search', tagline: 'Visual data search.', category: 'Data', descriptionShort: 'Turn spreadsheets into databases.', pricing: 'Freemium', rating: 4.4, popularity: 'Medium', image: 'https://polymersearch.com/favicon.ico', link: 'https://polymersearch.com' },
  { name: 'Tableau Pulse', tagline: 'Automated insights.', category: 'Data', descriptionShort: 'Gen AI for business intelligence.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://www.tableau.com/favicon.ico', link: 'https://tableau.com' },
  { name: 'SheetAI', tagline: 'AI for Google Sheets.', category: 'Data', descriptionShort: 'AI formulas directly in cells.', pricing: 'Freemium', rating: 4.3, popularity: 'Medium', image: 'https://sheetai.app/favicon.ico', link: 'https://sheetai.app' },
  { name: 'MonkeyLearn', tagline: 'No-code text analysis.', category: 'Data', descriptionShort: 'Sentiment and topic detection.', pricing: 'Paid', rating: 4.6, popularity: 'Medium', image: 'https://monkeylearn.com/favicon.ico', link: 'https://monkeylearn.com' },
  { name: 'DataRobot', tagline: 'Enterprise AutoML.', category: 'Data', descriptionShort: 'Build and deploy ML at scale.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://www.datarobot.com/favicon.ico', link: 'https://datarobot.com' },
  { name: 'Gemini Data', tagline: 'Multi-modal analysis.', category: 'Data', descriptionShort: 'Analyze Drive files with Google AI.', pricing: 'Free', rating: 4.7, popularity: 'High', image: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Gemini_logo.svg', link: 'https://gemini.google.com' },
  { name: 'Rationalbi', tagline: 'No-code data science.', category: 'Data', descriptionShort: 'Automated ML for everyone.', pricing: 'Freemium', rating: 4.2, popularity: 'Low', image: 'https://rationalbi.com/favicon.ico', link: 'https://rationalbi.com' },

  // --- PRODUCTIVITY ---
  { name: 'Notion AI', tagline: 'Smart workspace companion.', category: 'Productivity', descriptionShort: 'AI inside your notes and docs.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://www.notion.so/images/favicon.ico', link: 'https://notion.so/product/ai' },
  { name: 'Perplexity', tagline: 'AI search engine.', category: 'Productivity', descriptionShort: 'Cited answers to any question.', pricing: 'Free', rating: 4.9, popularity: 'High', image: 'https://www.perplexity.ai/favicon.ico', link: 'https://perplexity.ai' },
  { name: 'Taskade', tagline: 'AI agent workforce.', category: 'Productivity', descriptionShort: 'Unified task and agent management.', pricing: 'Free', rating: 4.7, popularity: 'Medium', image: 'https://www.taskade.com/favicon.ico', link: 'https://www.taskade.com' },
  { name: 'Fireflies.ai', tagline: 'Meeting transcription.', category: 'Productivity', descriptionShort: 'Record and search your meetings.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://fireflies.ai/favicon.ico', link: 'https://fireflies.ai' },
  { name: 'Motion', tagline: 'Auto-daily schedule.', category: 'Productivity', descriptionShort: 'AI that plans your day for you.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://usemotion.com/favicon.ico', link: 'https://usemotion.com' },
  { name: 'Tome', tagline: 'One-click presentations.', category: 'Productivity', descriptionShort: 'Stunning decks from a prompt.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://tome.app/favicon.ico', link: 'https://tome.app' },
  { name: 'Reclaim AI', tagline: 'Smart calendar assistant.', category: 'Productivity', descriptionShort: 'Auto-find time for tasks & habits.', pricing: 'Paid', rating: 4.8, popularity: 'Medium', image: 'https://reclaim.ai/favicon.ico', link: 'https://reclaim.ai' },
  { name: 'Monic.ai', tagline: 'AI study platform.', category: 'Productivity', descriptionShort: 'Flashcards from any material.', pricing: 'Freemium', rating: 4.6, popularity: 'Medium', image: 'https://monic.ai/favicon.ico', link: 'https://monic.ai' },
  { name: 'Rize', tagline: 'Focus time tracking.', category: 'Productivity', descriptionShort: 'Automated focus and break coaching.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://rize.io/favicon.ico', link: 'https://rize.io' },
  { name: 'Xembly', tagline: 'AI chief of staff.', category: 'Productivity', descriptionShort: 'Automate schedules and notes.', pricing: 'Freemium', rating: 4.6, popularity: 'Low', image: 'https://xembly.com/favicon.ico', link: 'https://xembly.com' },

  // --- MARKETING ---
  { name: 'AdCreative.ai', tagline: 'Convert-focused ads.', category: 'Marketing', descriptionShort: 'Generate ad banners and copy.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://adcreative.ai/favicon.ico', link: 'https://adcreative.ai' },
  { name: 'Predis.ai', tagline: 'Social media autopilot.', category: 'Marketing', descriptionShort: 'Reels and posts from a prompt.', pricing: 'Free', rating: 4.6, popularity: 'Medium', image: 'https://predis.ai/favicon.ico', link: 'https://predis.ai' },
  { name: 'Surfer SEO', tagline: 'Rank higher with AI.', category: 'Marketing', descriptionShort: 'Content optimization for search.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://surferseo.com/favicon.ico', link: 'https://surferseo.com' },
  { name: 'AnswerThePublic', tagline: 'Search listening tool.', category: 'Marketing', descriptionShort: 'Discover what people are asking.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://answerthepublic.com/favicon.ico', link: 'https://answerthepublic.com' },
  { name: 'Ocoya', tagline: 'Social media scale.', category: 'Marketing', descriptionShort: 'Schedule and generate content.', pricing: 'Freemium', rating: 4.3, popularity: 'Medium', image: 'https://ocoya.com/favicon.ico', link: 'https://ocoya.com' },
  { name: 'Mutiny', tagline: 'Web personalization AI.', category: 'Marketing', descriptionShort: 'Convert every visitor uniquely.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://mutinyhq.com/favicon.ico', link: 'https://mutinyhq.com' },
  { name: 'MarketMuse', tagline: 'Content strategy AI.', category: 'Marketing', descriptionShort: 'AI-driven content audits.', pricing: 'Freemium', rating: 4.7, popularity: 'Medium', image: 'https://www.marketmuse.com/favicon.ico', link: 'https://marketmuse.com' },
  { name: 'Pencil', tagline: 'Creative ad testing.', category: 'Marketing', descriptionShort: 'AI video ads that sell.', pricing: 'Paid', rating: 4.5, popularity: 'Medium', image: 'https://www.trypencil.com/favicon.ico', link: 'https://trypencil.com' },
  { name: 'Smartly.io', tagline: 'Social advertising scale.', category: 'Marketing', descriptionShort: 'Automate social ad campaigns.', pricing: 'Paid', rating: 4.6, popularity: 'High', image: 'https://www.smartly.io/favicon.ico', link: 'https://smartly.io' },
  { name: 'Loomly', tagline: 'Social brand management.', category: 'Marketing', descriptionShort: 'Plan and optimize social posts.', pricing: 'Freemium', rating: 4.4, popularity: 'Medium', image: 'https://www.loomly.com/favicon.ico', link: 'https://www.loomly.com' },

  // --- EDUCATION ---
  { name: 'Khanmigo', tagline: 'Socratic AI tutor.', category: 'Education', descriptionShort: 'AI help from Khan Academy.', pricing: 'Free', rating: 4.9, popularity: 'High', image: 'https://www.khanacademy.org/favicon.ico', link: 'https://khanacademy.org/khanmigo' },
  { name: 'Gamma AI', tagline: 'AI for lectures.', category: 'Education', descriptionShort: 'Presentation and deck generation.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://gamma.app/favicon.ico', link: 'https://gamma.app' },
  { name: 'ChatPDF', tagline: 'Paper analysis bot.', category: 'Education', descriptionShort: 'Talk to any research PDF.', pricing: 'Free', rating: 4.7, popularity: 'High', image: 'https://www.chatpdf.com/favicon.ico', link: 'https://chatpdf.com' },
  { name: 'Consensus', tagline: 'Evidence-based search.', category: 'Education', descriptionShort: 'Answers from 200M papers.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://consensus.app/favicon.ico', link: 'https://consensus.app' },
  { name: 'Socratic', tagline: 'Google homework help.', category: 'Education', descriptionShort: 'Visual search for homework.', pricing: 'Free', rating: 4.8, popularity: 'High', image: 'https://socratic.org/favicon.ico', link: 'https://socratic.org' },
  { name: 'Duolingo Max', tagline: 'AI language partner.', category: 'Education', descriptionShort: 'GPT-4 for language learning.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://www.duolingo.com/favicon.ico', link: 'https://duolingo.com' },
  { name: 'Summarize.tech', tagline: 'YouTube summaries.', category: 'Education', descriptionShort: 'Condensed video lectures.', pricing: 'Free', rating: 4.4, popularity: 'Medium', image: 'https://summarize.tech/favicon.ico', link: 'https://summarize.tech' },
  { name: 'Brilliant', tagline: 'Interactive STEM.', category: 'Education', descriptionShort: 'Master concepts by doing.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://brilliant.org/favicon.ico', link: 'https://brilliant.org' },
  { name: 'Coursera', tagline: 'Global AI degrees.', category: 'Education', descriptionShort: 'Courses from top universities.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://www.coursera.org/favicon.ico', link: 'https://coursera.org' },
  { name: 'Mindgrasp', tagline: 'Smart note taking.', category: 'Education', descriptionShort: 'Summaries from any audio/video.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://mindgrasp.ai/favicon.ico', link: 'https://mindgrasp.ai' },

  // --- AUTOMATION ---
  { name: 'Make.com', tagline: 'Visual app glue.', category: 'Automation', descriptionShort: 'Powerful multi-step workflows.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://www.make.com/favicon.ico', link: 'https://make.com' },
  { name: 'Zapier Central', tagline: 'Build AI agents.', category: 'Automation', descriptionShort: 'Autonomous agents for business.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://zapier.com/favicon.ico', link: 'https://zapier.com/central' },
  { name: 'Bardeen', tagline: 'Browser automation.', category: 'Automation', descriptionShort: 'AI scraping and shortcuts.', pricing: 'Free', rating: 4.7, popularity: 'High', image: 'https://www.bardeen.ai/favicon.ico', link: 'https://bardeen.ai' },
  { name: 'n8n', tagline: 'Fair-code automation.', category: 'Automation', descriptionShort: 'Self-hosted workflow tool.', pricing: 'Free', rating: 4.6, popularity: 'Medium', image: 'https://n8n.io/favicon.ico', link: 'https://n8n.io' },
  { name: 'Browse AI', tagline: 'Site monitoring.', category: 'Automation', descriptionShort: 'Train a robot to scrape data.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://browse.ai/favicon.ico', link: 'https://browse.ai' },
  { name: 'Lyzard', tagline: 'Voice call AI.', category: 'Automation', descriptionShort: 'Automate business phone calls.', pricing: 'Freemium', rating: 4.4, popularity: 'Low', image: 'https://lyzard.ai/favicon.ico', link: 'https://lyzard.ai' },
  { name: 'Cheat Layer', tagline: 'Custom SaaS builder.', category: 'Automation', descriptionShort: 'Agentic business automation.', pricing: 'Freemium', rating: 4.4, popularity: 'Medium', image: 'https://cheatlayer.com/favicon.ico', link: 'https://cheatlayer.com' },
  { name: 'Levity', tagline: 'Ops automation.', category: 'Automation', descriptionShort: 'Classify images and text.', pricing: 'Paid', rating: 4.5, popularity: 'Medium', image: 'https://levity.ai/favicon.ico', link: 'https://levity.ai' },
  { name: 'UiPath', tagline: 'Enterprise RPA.', category: 'Automation', descriptionShort: 'Complete corporate automation.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://www.uipath.com/favicon.ico', link: 'https://uipath.com' },
  { name: 'AutoGPT', tagline: 'Autonomous AI agents.', category: 'Automation', descriptionShort: 'Goal-driven AI that works for you.', pricing: 'Free', rating: 4.2, popularity: 'High', image: 'https://autogpt.net/favicon.ico', link: 'https://autogpt.net' },

  // --- DESIGN ---
  { name: 'Uizard', tagline: 'AI for UI design.', category: 'Design', descriptionShort: 'Turn wireframes into designs.', pricing: 'Freemium', rating: 4.7, popularity: 'High', image: 'https://uizard.io/favicon.ico', link: 'https://uizard.io' },
  { name: 'Vectary', tagline: 'AI 3D design.', category: 'Design', descriptionShort: 'Build 3D assets with AI.', pricing: 'Freemium', rating: 4.5, popularity: 'Medium', image: 'https://www.vectary.com/favicon.ico', link: 'https://www.vectary.com' },
  { name: 'Galileo AI', tagline: 'Interface generation.', category: 'Design', descriptionShort: 'Text-to-UI in seconds.', pricing: 'Paid', rating: 4.8, popularity: 'Medium', image: 'https://www.usegalileo.ai/favicon.ico', link: 'https://www.usegalileo.ai' },
  { name: 'Framer AI', tagline: 'Build sites with AI.', category: 'Design', descriptionShort: 'Zero-code professional websites.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://www.framer.com/favicon.ico', link: 'https://framer.com' },
  { name: 'Khroma', tagline: 'AI color tool.', category: 'Design', descriptionShort: 'Personalized color palettes.', pricing: 'Free', rating: 4.4, popularity: 'Medium', image: 'https://khroma.co/favicon.ico', link: 'https://khroma.co' },
  { name: 'Fontjoy', tagline: 'AI font pairing.', category: 'Design', descriptionShort: 'Find perfect font matches.', pricing: 'Free', rating: 4.3, popularity: 'Low', image: 'https://fontjoy.com/favicon.ico', link: 'https://fontjoy.com' },
  { name: 'Flair.ai', tagline: 'Product photo AI.', category: 'Design', descriptionShort: 'Stunning visuals for brands.', pricing: 'Freemium', rating: 4.7, popularity: 'Medium', image: 'https://flair.ai/favicon.ico', link: 'https://flair.ai' },
  { name: 'Spline AI', tagline: '3D modeling for all.', category: 'Design', descriptionShort: 'Generate 3D scenes with text.', pricing: 'Freemium', rating: 4.6, popularity: 'High', image: 'https://spline.design/favicon.ico', link: 'https://spline.design' },
  { name: 'Mokker AI', tagline: 'Background removal pro.', category: 'Design', descriptionShort: 'E-commerce photo enhancement.', pricing: 'Freemium', rating: 4.5, popularity: 'Low', image: 'https://mokker.ai/favicon.ico', link: 'https://mokker.ai' },

  // --- LOGO ---
  { name: 'Looka', tagline: 'AI logo maker and branding generator.', category: 'Logo Maker', descriptionShort: 'Generate professional logos and brand kits in minutes.', pricing: 'Paid', rating: 4.6, popularity: 'High', image: 'https://looka.com/favicon.ico', link: 'https://looka.com' },
  { name: 'Hatchful', tagline: 'Free logo creator by Shopify.', category: 'Logo Maker', descriptionShort: 'Create stunning logos in seconds with templates.', pricing: 'Free', rating: 4.5, popularity: 'High', image: 'https://hatchful.shopify.com/favicon.ico', link: 'https://hatchful.shopify.com' },
  { name: 'Namecheap Logo Maker', tagline: '100% free logo builder with SVG vector downloads.', category: 'Logo Maker', descriptionShort: 'Create custom logo designs and download high-quality assets completely free.', pricing: 'Free', rating: 4.8, popularity: 'High', image: 'https://www.namecheap.com/assets/img/nc-logo/nc-logo-share.png', link: 'https://www.namecheap.com/logo-maker/' },
  { name: 'Canva Logo Maker', tagline: 'Design professional logos for free.', category: 'Logo Maker', descriptionShort: 'Beautiful pre-made templates with an easy drag-and-drop editor for fast brand logos.', pricing: 'Free', rating: 4.9, popularity: 'High', image: 'https://www.canva.com/favicon.ico', link: 'https://www.canva.com/create/logos/' },
  { name: 'Brandmark', tagline: 'AI-powered logo design tool.', category: 'Logo Maker', descriptionShort: 'Create a unique logo, business card and social graphics.', pricing: 'Freemium', rating: 4.7, popularity: 'Medium', image: 'https://brandmark.io/favicon.ico', link: 'https://brandmark.io' },
  { name: 'LogoAI', tagline: 'Smart logo maker & brand automation.', category: 'Logo Maker', descriptionShort: 'Generate logos, mockups, and corporate brand identities.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://www.logoai.com/favicon.ico', link: 'https://www.logoai.com' },
  { name: 'Logomaster.ai', tagline: 'Professional AI logo builder.', category: 'Logo Maker', descriptionShort: 'Beautiful vector logos generated in seconds for startups.', pricing: 'Paid', rating: 4.4, popularity: 'Medium', image: 'https://logomaster.ai/favicon.ico', link: 'https://logomaster.ai' },

  // --- FINANCE ---
  { name: 'Kavout', tagline: 'AI stock analysis.', category: 'Finance', descriptionShort: 'Predictive equity scores.', pricing: 'Paid', rating: 4.5, popularity: 'Medium', image: 'https://www.kavout.com/favicon.ico', link: 'https://www.kavout.com' },
  { name: 'Zest AI', tagline: 'AI for lending.', category: 'Finance', descriptionShort: 'Better risk assessment.', pricing: 'Paid', rating: 4.6, popularity: 'High', image: 'https://www.zest.ai/favicon.ico', link: 'https://zest.ai' },
  { name: 'V7 Stack', tagline: 'Crypto trading bots.', category: 'Finance', descriptionShort: 'Automated crypto signals.', pricing: 'Paid', rating: 4.4, popularity: 'Low', image: 'https://v7.com/favicon.ico', link: 'https://v7.com' },
  { name: 'Cleo', tagline: 'AI money assistant.', category: 'Finance', descriptionShort: 'Roasts your spending habits.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://www.meetcleo.com/favicon.ico', link: 'https://meetcleo.com' },
  { name: 'Indy AI', tagline: 'Invoicing and tracking.', category: 'Finance', descriptionShort: 'Freelancer finance management.', pricing: 'Freemium', rating: 4.3, popularity: 'Medium', image: 'https://weareindy.com/favicon.ico', link: 'https://weareindy.com' },
  { name: 'Plaid AI', tagline: 'Connect bank data.', category: 'Finance', descriptionShort: 'Secure financial integrations.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://plaid.com/favicon.ico', link: 'https://plaid.com' },
  { name: 'Trullion', tagline: 'AI accounting.', category: 'Finance', descriptionShort: 'Automated lease and revenue.', pricing: 'Paid', rating: 4.7, popularity: 'Low', image: 'https://trullion.com/favicon.ico', link: 'https://trullion.com' },
  { name: 'Glean AI', tagline: 'Strategic accounts payable.', category: 'Finance', descriptionShort: 'Intelligent spend management.', pricing: 'Paid', rating: 4.6, popularity: 'Medium', image: 'https://www.glean.ai/favicon.ico', link: 'https://glean.ai' },
  { name: 'Booke.ai', tagline: 'AI bookkeeping.', category: 'Finance', descriptionShort: 'Categorize transactions automatically.', pricing: 'Paid', rating: 4.5, popularity: 'Low', image: 'https://booke.ai/favicon.ico', link: 'https://booke.ai' },
  { name: 'Datarails', tagline: 'FP&A for Excel.', category: 'Finance', descriptionShort: 'Consolidate financial data.', pricing: 'Paid', rating: 4.7, popularity: 'Medium', image: 'https://www.datarails.com/favicon.ico', link: 'https://datarails.com' },

  // --- LEGAL ---
  { name: 'Luminance', tagline: 'Next-gen legal AI.', category: 'Legal', descriptionShort: 'Document review and analysis.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://www.luminance.com/favicon.ico', link: 'https://www.luminance.com' },
  { name: 'Ironclad', tagline: 'Contract lifecycle AI.', category: 'Legal', descriptionShort: 'Automated contract management.', pricing: 'Paid', rating: 4.7, popularity: 'High', image: 'https://ironcladapp.com/favicon.ico', link: 'https://ironcladapp.com' },
  { name: 'Casetext', tagline: 'AI legal research.', category: 'Legal', descriptionShort: 'Find cases and write briefs.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://casetext.com/favicon.ico', link: 'https://casetext.com' },
  { name: 'Spellbook', tagline: 'AI in Microsoft Word.', category: 'Legal', descriptionShort: 'Draft contracts faster.', pricing: 'Paid', rating: 4.8, popularity: 'Medium', image: 'https://www.spellbook.legal/favicon.ico', link: 'https://spellbook.legal' },
  { name: 'LawGeex', tagline: 'Contract review bot.', category: 'Legal', descriptionShort: 'Automated legal approvals.', pricing: 'Paid', rating: 4.6, popularity: 'Medium', image: 'https://www.lawgeex.com/favicon.ico', link: 'https://lawgeex.com' },
  { name: 'DoNotPay', tagline: 'The world\'s first robot lawyer.', category: 'Legal', descriptionShort: 'Fight tickets and bureaucracy.', pricing: 'Paid', rating: 4.5, popularity: 'High', image: 'https://donotpay.com/favicon.ico', link: 'https://donotpay.com' },
  { name: 'Darrow', tagline: 'Justice intelligence.', category: 'Legal', descriptionShort: 'Find legal violations at scale.', pricing: 'Paid', rating: 4.7, popularity: 'Low', image: 'https://www.darrow.ai/favicon.ico', link: 'https://www.darrow.ai' },
  { name: 'Pactum', tagline: 'AI negotiation.', category: 'Legal', descriptionShort: 'Autonomous vendor negotiations.', pricing: 'Paid', rating: 4.6, popularity: 'Low', image: 'https://pactum.com/favicon.ico', link: 'https://pactum.com' },
  { name: 'Robin AI', tagline: 'Contract copilot.', category: 'Legal', descriptionShort: 'Legal review for everyone.', pricing: 'Freemium', rating: 4.7, popularity: 'Medium', image: 'https://www.robinai.com/favicon.ico', link: 'https://robinai.com' },
  { name: 'Legito', tagline: 'Document automation.', category: 'Legal', descriptionShort: 'Smart legal document drafts.', pricing: 'Paid', rating: 4.4, popularity: 'Low', image: 'https://www.legito.com/favicon.ico', link: 'https://legito.com' },

  // --- HR ---
  { name: 'Eightfold AI', tagline: 'Talent intelligence.', category: 'HR', descriptionShort: 'Hiring and retention at scale.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://eightfold.ai/favicon.ico', link: 'https://eightfold.ai' },
  { name: 'HiredScore', tagline: 'AI for recruiters.', category: 'HR', descriptionShort: 'Fair and fast hiring scores.', pricing: 'Paid', rating: 4.7, popularity: 'Medium', image: 'https://www.hiredscore.com/favicon.ico', link: 'https://www.hiredscore.com' },
  { name: 'Paradox', tagline: 'Conversational hiring.', category: 'HR', descriptionShort: 'Meet Olivia, the AI assistant.', pricing: 'Paid', rating: 4.6, popularity: 'High', image: 'https://www.paradox.ai/favicon.ico', link: 'https://www.paradox.ai' },
  { name: 'Textio', tagline: 'Inclusive writing AI.', category: 'HR', descriptionShort: 'Better job posts and feedback.', pricing: 'Paid', rating: 4.9, popularity: 'Medium', image: 'https://textio.com/favicon.ico', link: 'https://textio.com' },
  { name: 'Beamery', tagline: 'Talent lifecycle management.', category: 'HR', descriptionShort: 'CRM for modern recruiters.', pricing: 'Paid', rating: 4.7, popularity: 'Medium', image: 'https://beamery.com/favicon.ico', link: 'https://beamery.com' },
  { name: 'Fetcher', tagline: 'Automated sourcing.', category: 'HR', descriptionShort: 'Find candidates on autopilot.', pricing: 'Paid', rating: 4.5, popularity: 'Medium', image: 'https://fetcher.ai/favicon.ico', link: 'https://fetcher.ai' },
  { name: 'Rezi', tagline: 'AI resume builder.', category: 'HR', descriptionShort: 'Optimized resumes for ATS.', pricing: 'Freemium', rating: 4.8, popularity: 'High', image: 'https://rezi.ai/favicon.ico', link: 'https://rezi.ai' },
  { name: 'Talview', tagline: 'AI interview platform.', category: 'HR', descriptionShort: 'Remote proctoring and assessment.', pricing: 'Paid', rating: 4.4, popularity: 'Low', image: 'https://www.talview.com/favicon.ico', link: 'https://www.talview.com' },
  { name: 'Kula', tagline: 'Referral automation.', category: 'HR', descriptionShort: 'Turn employees into recruiters.', pricing: 'Paid', rating: 4.6, popularity: 'Low', image: 'https://www.kula.ai/favicon.ico', link: 'https://www.kula.ai' },
  { name: 'Appcast', tagline: 'Programmatic job ads.', category: 'HR', descriptionShort: 'AI for job advertising.', pricing: 'Paid', rating: 4.7, popularity: 'Medium', image: 'https://www.appcast.io/favicon.ico', link: 'https://www.appcast.io' },

  // --- CYBERSECURITY ---
  { name: 'Darktrace', tagline: 'Self-learning AI.', category: 'Cybersecurity', descriptionShort: 'Autonomous threat defense.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://www.darktrace.com/favicon.ico', link: 'https://www.darktrace.com' },
  { name: 'Vectra AI', tagline: 'Network detection response.', category: 'Cybersecurity', descriptionShort: 'Find hidden attackers in cloud.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://www.vectra.ai/favicon.ico', link: 'https://vectra.ai' },
  { name: 'Snyk', tagline: 'Developer security.', category: 'Cybersecurity', descriptionShort: 'Find vulnerabilities in code.', pricing: 'Freemium', rating: 4.9, popularity: 'High', image: 'https://snyk.io/favicon.ico', link: 'https://snyk.io' },
  { name: 'SentinelOne', tagline: 'AI endpoint protection.', category: 'Cybersecurity', descriptionShort: 'Singularity platform for XDR.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://www.sentinelone.com/favicon.ico', link: 'https://sentinelone.com' },
  { name: 'Tessian', tagline: 'Email security AI.', category: 'Cybersecurity', descriptionShort: 'Stop phishing and data loss.', pricing: 'Paid', rating: 4.7, popularity: 'Medium', image: 'https://www.tessian.com/favicon.ico', link: 'https://tessian.com' },
  { name: 'CrowdStrike', tagline: 'Cloud-native security.', category: 'Cybersecurity', descriptionShort: 'Stop breaches with Falcon AI.', pricing: 'Paid', rating: 4.9, popularity: 'High', image: 'https://www.crowdstrike.com/favicon.ico', link: 'https://crowdstrike.com' },
  { name: 'Cylance', tagline: 'Predictive security.', category: 'Cybersecurity', descriptionShort: 'AI-based antivirus.', pricing: 'Paid', rating: 4.6, popularity: 'Medium', image: 'https://www.blackberry.com/favicon.ico', link: 'https://blackberry.com/cylance' },
  { name: 'Lacework', tagline: 'Cloud security automation.', category: 'Cybersecurity', descriptionShort: 'Anomaly detection for AWS/GCP.', pricing: 'Paid', rating: 4.7, popularity: 'Medium', image: 'https://www.lacework.com/favicon.ico', link: 'https://lacework.com' },
  { name: 'Exabeam', tagline: 'AI SIEM.', category: 'Cybersecurity', descriptionShort: 'User behavior analytics.', pricing: 'Paid', rating: 4.8, popularity: 'Medium', image: 'https://www.exabeam.com/favicon.ico', link: 'https://exabeam.com' },
  { name: 'Abnormal Security', tagline: 'Next-gen email protection.', category: 'Cybersecurity', descriptionShort: 'Stop advanced social engineering.', pricing: 'Paid', rating: 4.8, popularity: 'High', image: 'https://abnormalsecurity.com/favicon.ico', link: 'https://abnormalsecurity.com' }
];

const tools = toolsData.map((t, index) => createTool(t, index));

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');
    await Tool.deleteMany({});
    await Tool.insertMany(tools);
    console.log(`Successfully seeded ${tools.length} tools across 15 categories.`);
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
