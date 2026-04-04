import { getGeminiModel } from "../config/gemini.js";
import prisma from "../config/database.js";

const MAX_RETRIES = 3;
const QUALITY_THRESHOLD = 7.0;

class AIService {
    /**
     * UC5.1 – Generate text content from description/idea/image
     */
    async generateText({
        userId,
        description,
        tone,
        imageBase64,
        withHashtags = true,
        withCta = true,
        length = "Medium",
    }) {
        const model = getGeminiModel();
        const analysis = await this._analyzeInput(model, {
            description,
            tone,
            imageBase64,
        });
        let prompt = this._buildTextPrompt(analysis, description, tone, {
            withHashtags,
            withCta,
            length,
        });

        let bestResult = null;
        let bestScore = 0;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const parts = [{ text: prompt }];
            if (imageBase64 && attempt === 0) {
                parts.push({
                    inlineData: { mimeType: "image/jpeg", data: imageBase64 },
                });
            }

            const result = await model.generateContent(parts);
            const generated = result.response.text();

            const parsed = this._parseJsonOutput(generated);
            const evaluation = await this._evaluateText(
                model,
                description,
                parsed,
                { length },
            );

            if (evaluation.weightedScore > bestScore) {
                bestScore = evaluation.weightedScore;
                bestResult = { content: parsed, evaluation };
            }

            if (evaluation.weightedScore >= QUALITY_THRESHOLD) break;
            if (attempt < MAX_RETRIES - 1) {
                prompt = this._refineTextPrompt(prompt, evaluation, {
                    withHashtags,
                    withCta,
                    length,
                });
            }
        }

        await this._saveHistory(
            userId,
            description,
            "text",
            JSON.stringify(bestResult.content),
        );

        return {
            generatedText: bestResult.content,
            evaluationScores: bestResult.evaluation,
            status:
                bestScore >= QUALITY_THRESHOLD ? "approved" : "needs_review",
        };
    }

    /**
     * UC5.2 – Generate image + text
     */
    async generateImageText({
        userId,
        description,
        tone,
        imageBase64,
        withHashtags = true,
        withCta = true,
        length = "Medium",
    }) {
        const textResult = await this.generateText({
            userId,
            description,
            tone,
            imageBase64,
            withHashtags,
            withCta,
            length,
        });
        const model = getGeminiModel();

        const imagePrompt = this._buildImagePrompt(
            textResult.generatedText,
            description,
        );

        let bestImage = null;
        let bestImgScore = 0;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const imgResult = await model.generateContent(imagePrompt);
            const imgResponse = imgResult.response;

            const imageData = this._extractImageFromResponse(imgResponse);
            const imgEval = await this._evaluateImage(
                model,
                description,
                textResult.generatedText,
                imageData,
            );

            if (imgEval.weightedScore > bestImgScore) {
                bestImgScore = imgEval.weightedScore;
                bestImage = { data: imageData, evaluation: imgEval };
            }

            if (imgEval.weightedScore >= QUALITY_THRESHOLD) break;
            if (attempt < MAX_RETRIES - 1) {
                imagePrompt.text = this._refineImagePrompt(
                    imagePrompt.text,
                    imgEval,
                );
            }
        }

        return {
            generatedText: textResult.generatedText,
            generatedImage: bestImage?.data,
            textScores: textResult.evaluationScores,
            imageScores: bestImage?.evaluation,
            status: textResult.status,
        };
    }

    /**
     * UC5.3 – Generate video + images + text (delegates to Veo 2 for video)
     */
    async generateVideoImagesText({
        userId,
        description,
        tone,
        imageBase64,
        withHashtags = true,
        withCta = true,
        length = "Medium",
    }) {
        const imageTextResult = await this.generateImageText({
            userId,
            description,
            tone,
            imageBase64,
            withHashtags,
            withCta,
            length,
        });

        // Video generation placeholder — Google Veo 2 API access is limited.
        // When available, integrate here with the storyboard prompt builder.
        const videoResult = {
            generatedVideo: null,
            videoScores: null,
            videoStatus: "unavailable",
            message:
                "Video generation via Google Veo 2 will be integrated when API access is available.",
        };

        return {
            ...imageTextResult,
            ...videoResult,
        };
    }

    // ─── Internal helpers ───────────────────────────────────────

    async _analyzeInput(model, { description, tone, imageBase64 }) {
        const analysisPrompt = `Analyze this input for a social commerce post and return JSON:
{
  "entities": ["main product/subject"],
  "tone": "detected tone",
  "contentType": "promotional|sharing|educational|entertainment",
  "imageContext": "description of image if provided"
}

User input: "${description}"
Desired tone: "${tone || "auto-detect"}"`;

        const parts = [{ text: analysisPrompt }];
        if (imageBase64) {
            parts.push({
                inlineData: { mimeType: "image/jpeg", data: imageBase64 },
            });
        }

        const result = await model.generateContent(parts);
        return this._parseJsonOutput(result.response.text());
    }

    _buildTextPrompt(
        analysis,
        description,
        tone,
        { withHashtags = true, withCta = true, length = "Medium" } = {},
    ) {
        const lengthRanges = {
            Short: { min: 100, max: 140 },
            Medium: { min: 140, max: 220 },
            Long: { min: 220, max: 300 },
        };
        const selectedLength = lengthRanges[length] != null ? length : "Medium";
        const { min, max } = lengthRanges[selectedLength];

        return `You are an expert content creator for a Social Commerce platform.

CONTEXT:
- Platform: Social Commerce with integrated shopping
- Entities: ${JSON.stringify(analysis.entities || [])}
- Content type: ${analysis.contentType || "promotional"}
- Image context: ${analysis.imageContext || "none"}

USER INPUT:
${description}

CONSTRAINTS:
- Length: ${min}-${max} words
- Hashtags: ${withHashtags ? "5-10 relevant hashtags" : "[] (empty array)"}
- ${
            withCta
                ? "Must include a Call-to-Action"
                : 'No Call-to-Action: set callToAction to "" and do not include CTA text in body'
        }
- Language: Vietnamese
- Tone: ${tone || analysis.tone || "friendly"}
- No sensitive content

OUTPUT FORMAT (strict JSON only, no markdown):
{
  "title": "catchy title",
  "body": "main content",
  "hashtags": ${withHashtags ? '["#tag1", "#tag2"]' : "[]"},
  "callToAction": ${withCta ? '"CTA text"' : '""'},
  "tone": "detected/applied tone"
}`;
    }

    _buildImagePrompt(textContent, description) {
        return `Create a high-quality advertising image for a Social Commerce post.

POST CONTENT:
Title: ${textContent.title || ""}
Body: ${textContent.body || ""}

PRODUCT: ${description}

VISUAL SPEC:
- Style: modern, clean, commercial photography
- Aspect ratio: 1:1 (square, suitable for social media)
- Color palette: match product and brand identity
- Composition: product centered, clean background

CONSTRAINTS:
- No unwanted text or watermarks
- Professional quality suitable for e-commerce
- Engaging and eye-catching for social media feeds`;
    }

    async _evaluateText(
        model,
        originalInput,
        generatedContent,
        { length = "Medium" } = {},
    ) {
        const text =
            typeof generatedContent === "string"
                ? generatedContent
                : JSON.stringify(generatedContent);
        const body = generatedContent?.body || text;
        const wordCount = body.split(/\s+/).length;
        const hashtagCount = (generatedContent?.hashtags || []).length;
        const hasCTA = !!generatedContent?.callToAction;
        const hasTitle = !!generatedContent?.title;

        const lengthRanges = {
            Short: { min: 100, max: 140 },
            Medium: { min: 140, max: 220 },
            Long: { min: 220, max: 300 },
        };
        const selectedLength = lengthRanges[length] != null ? length : "Medium";
        const { min, max } = lengthRanges[selectedLength];

        const structureScore = (hasTitle ? 5 : 1) + (hasCTA ? 5 : 1);
        const lengthScore =
            wordCount >= min && wordCount <= max
                ? 9
                : wordCount >= 50 && wordCount <= 400
                  ? 6
                  : 3;
        const hashtagScore =
            hashtagCount >= 5 && hashtagCount <= 10
                ? 9
                : hashtagCount >= 3 && hashtagCount <= 15
                  ? 6
                  : 3;

        const evalPrompt = `Rate this social commerce post on a scale of 1-10 for each criterion.
Return strict JSON only:
{
  "relevance": <1-10>,
  "engagement": <1-10>,
  "language": <1-10>,
  "commercialValue": <1-10>,
  "reasoning": "brief explanation"
}

ORIGINAL REQUEST: ${originalInput}

GENERATED POST: ${text}`;

        let aiScores = {
            relevance: 5,
            engagement: 5,
            language: 5,
            commercialValue: 5,
        };
        try {
            const evalResult = await model.generateContent(evalPrompt);
            aiScores = this._parseJsonOutput(evalResult.response.text());
        } catch {
            /* fallback to defaults */
        }

        const criteria = {
            relevance: { score: aiScores.relevance || 5, weight: 0.25 },
            engagement: { score: aiScores.engagement || 5, weight: 0.2 },
            structure: { score: Math.min(structureScore, 10), weight: 0.15 },
            length: { score: lengthScore, weight: 0.1 },
            language: { score: aiScores.language || 5, weight: 0.15 },
            commercialValue: {
                score: aiScores.commercialValue || 5,
                weight: 0.15,
            },
        };

        const weightedScore = Object.values(criteria).reduce(
            (sum, c) => sum + c.score * c.weight,
            0,
        );

        const weakest = Object.entries(criteria)
            .sort(([, a], [, b]) => a.score - b.score)
            .slice(0, 2)
            .map(([name]) => name);

        return {
            criteria,
            weightedScore,
            weakestCriteria: weakest,
            suggestions: aiScores.reasoning || "",
        };
    }

    async _evaluateImage(model, description, textContent, imageData) {
        // Placeholder: real evaluation would send image to Gemini Vision
        return {
            criteria: {
                relevance: { score: 7, weight: 0.3 },
                technicalQuality: { score: 7, weight: 0.25 },
                aesthetic: { score: 7, weight: 0.25 },
                brandConsistency: { score: 7, weight: 0.2 },
            },
            weightedScore: 7.0,
            weakestCriteria: [],
            suggestions: "",
        };
    }

    _refineTextPrompt(
        currentPrompt,
        evaluation,
        { withHashtags = true, withCta = true, length = "Medium" } = {},
    ) {
        const lengthRanges = {
            Short: { min: 100, max: 140 },
            Medium: { min: 140, max: 220 },
            Long: { min: 220, max: 300 },
        };
        const selectedLength = lengthRanges[length] != null ? length : "Medium";
        const { min, max } = lengthRanges[selectedLength];

        const refinements = {
            relevance:
                "The post MUST directly mention the main product/subject. Be more specific.",
            engagement: withCta
                ? "Start with a compelling question or statistic. Add 2+ emojis. End with a strong CTA."
                : "Start with a compelling question or statistic. Add 2+ emojis. End with a strong benefit statement (no CTA).",
            structure:
                "Output MUST strictly follow the JSON schema. Every field is REQUIRED.",
            length: `Content body MUST be between ${min}-${max} words.`,
            language:
                "Write in natural Vietnamese. Tone should be friendly, avoid machine-translated language.",
            commercialValue:
                "Highlight 3 key product benefits. Create urgency. Give a reason to buy now.",
        };

        const additions = evaluation.weakestCriteria
            .map((c) => refinements[c])
            .filter(Boolean)
            .join("\n");

        return `${currentPrompt}\n\nADDITIONAL CONSTRAINTS (improve weak areas):\n${additions}`;
    }

    _refineImagePrompt(currentPrompt, evaluation) {
        return `${currentPrompt}\n\nREFINEMENT: Make the image more relevant to the product. Ensure clean composition.`;
    }

    _extractImageFromResponse(response) {
        try {
            const parts = response.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
                if (part.inlineData) return part.inlineData;
            }
        } catch {
            /* no image */
        }
        return null;
    }

    _parseJsonOutput(text) {
        try {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) return JSON.parse(match[0]);
        } catch {
            /* parse error */
        }
        return { raw: text };
    }

    async _saveHistory(userId, prompt, contentType, generatedContent) {
        try {
            await prisma.aiContentHistory.create({
                data: { userId, prompt, contentType, generatedContent },
            });
        } catch {
            /* non-critical */
        }
    }
}

export default new AIService();
