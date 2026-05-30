import dns from 'dns';
dns.setServers(['8.8.8.8']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Toolkit from './models/Toolkit.js';
import Tool from './models/Tool.js';

await mongoose.connect(process.env.MONGO_URI);

await Toolkit.deleteMany({ isOfficial: true });
console.log('Cleared existing official toolkits...');

const SEEDS = [
  {
    name: 'Freelancer Starter Kit',
    description: 'Everything a freelancer needs — from writing proposals to managing clients and delivering work faster.',
    emoji: '💼',
    color: 'indigo',
    tags: ['Freelance', 'Productivity'],
    categories: ['Writing', 'Productivity', 'Marketing'],
  },
  {
    name: 'Content Creator Pack',
    description: 'Create stunning videos, write viral captions, generate images, and publish consistently.',
    emoji: '🎬',
    color: 'rose',
    tags: ['Content', 'Video'],
    categories: ['Video', 'Image', 'Writing'],
  },
  {
    name: 'Developer Toolbox',
    description: 'AI tools that make coding faster — from auto-complete to code review and debugging.',
    emoji: '💻',
    color: 'cyan',
    tags: ['Dev', 'Coding'],
    categories: ['Coding', 'Automation', 'Data'],
  },
  {
    name: 'Startup Growth Stack',
    description: 'Launch and grow your startup with AI tools for marketing, finance, and product development.',
    emoji: '🚀',
    color: 'amber',
    tags: ['Startup', 'Marketing'],
    categories: ['Marketing', 'Finance', 'Productivity'],
  },
  {
    name: 'Student Learning Bundle',
    description: 'Ace your studies with AI tutors, summarizers, quiz makers, and research assistants.',
    emoji: '🎓',
    color: 'emerald',
    tags: ['Education', 'Research'],
    categories: ['Education', 'Writing', 'Data'],
  },
  {
    name: 'Design & Creative Suite',
    description: 'From logo to brand identity — AI tools for designers, artists, and creative professionals.',
    emoji: '🎨',
    color: 'purple',
    tags: ['Design', 'Art'],
    categories: ['Design', 'Image', 'Video', 'Logo Maker'],
  },
];

const created = [];
for (const seed of SEEDS) {
  const tools = await Tool.find({
    isApproved: { $ne: false },
    category: { $in: seed.categories },
  })
    .sort({ rating: -1 })
    .limit(8);

  if (tools.length > 0) {
    const kit = new Toolkit({
      name: seed.name,
      description: seed.description,
      emoji: seed.emoji,
      color: seed.color,
      tags: seed.tags,
      tools: tools.map((t) => t._id),
      isOfficial: true,
    });
    await kit.save();
    created.push(`${seed.emoji} ${seed.name} (${tools.length} tools)`);
  }
}

console.log(`✅ Seeded ${created.length} toolkits:`);
created.forEach((c) => console.log(' -', c));
process.exit(0);
