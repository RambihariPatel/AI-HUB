const express = require('express');
const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Tool = require('../models/Tool');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const tools = await Tool.find({ status: 'approved' }).select('name category tagline');
        const toolsContext = tools.map(t => `- ${t.name}: ${t.tagline}`).join('\n');

        const prompt = `
            You are a minimalist AI Assistant for "AI HUB". 
            Your only job is to recommend tools from the list below.
            
            RULES:
            1. Be extremely concise. 
            2. Response MUST be under 3-4 sentences.
            3. Start with a 1-line friendly intro.
            4. List 2-3 most relevant tools directly.
            5. Do not give long explanations or bullet points with descriptions unless necessary.

            Available Tools:
            ${toolsContext}

            User Request: ${message}
        `;

        // Available models for this key are newer versions
        const modelNames = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-pro-latest"];
        
        let responseText = null;
        let lastError = null;

        for (const name of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                if (responseText) break;
            } catch (err) {
                lastError = err;
            }
        }

        if (responseText) {
            res.json({ reply: responseText });
        } else {
            throw lastError;
        }
    } catch (error) {
        console.error("AI Error:", error.message);
        res.status(500).json({ message: 'AI Error', error: error.message });
    }
});

module.exports = router;
