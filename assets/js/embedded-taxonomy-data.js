/**
 * Complete Taxonomy Data - Embedded to avoid CORS issues
 * This contains the full restored dataset with all 9 categories and complete technique definitions
 */
window.embeddedTaxonomyData = {
    "categoriesData": {
        "categories": [
            {
                "id": "basic-concepts",
                "name": "Basic Concepts",
                "description": "Fundamental prompting structures and conceptual frameworks",
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "reasoning-frameworks", 
                "name": "Reasoning Frameworks",
                "description": "Techniques that guide the model through explicit reasoning steps",
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "self-improvement",
                "name": "Self-Improvement", 
                "description": "Techniques that guide the model to refine its own outputs",
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "agent-tool-use",
                "name": "Agent & Tool Use",
                "description": "Techniques that enable LLMs to interact with external tools and environments", 
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "retrieval-augmentation",
                "name": "Retrieval & Augmentation",
                "description": "Techniques that incorporate external knowledge into prompts",
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "prompt-optimization",
                "name": "Prompt Optimization",
                "description": "Techniques to automate and improve prompt engineering",
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "multimodal-techniques",
                "name": "Multimodal Techniques", 
                "description": "Techniques involving non-text modalities like images, audio, and video",
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "specialized-application",
                "name": "Specialized Application Techniques",
                "description": "Techniques optimized for specific domains or applications",
                "sources": ["Embedded Restored Data"]
            },
            {
                "id": "multi-agent-systems",
                "name": "Multi-Agent Systems & Team Frameworks",
                "description": "Advanced techniques for organizing and coordinating multiple AI agents",
                "sources": ["Embedded Restored Data"]
            }
        ]
    },
    "techniquesData": {
        "categories": [
            {
                "id": "basic-concepts",
                "name": "Basic Concepts",
                "description": "Fundamental prompting structures and conceptual frameworks",
                "techniques": [
                    {
                        "id": "basic-prompting",
                        "name": "Basic Prompting",
                        "aliases": ["Standard Prompting", "Vanilla Prompting"],
                        "description": "The simplest form of prompting, usually consisting of an instruction and input, without exemplars or complex reasoning steps.",
                        "sources": ["Vatsal & Dubey", "Schulhoff et al.", "Wei et al."],
                        "relatedTechniques": ["instructed-prompting", "zero-shot-learning"],
                        "useCase": "Simple, direct tasks where clarity is paramount. Effective for well-defined tasks with clear instructions.",
                        "example": "Translate the following English text to French: 'Hello, how are you?'",
                        "tips": "Be specific and clear in your instructions. Avoid ambiguous language. Include context when necessary. State the desired output format explicitly.",
                        "commonMistakes": "Being too vague or general. Not providing enough context. Assuming the model knows unstated requirements. Using complex language when simple is better."
                    },
                    {
                        "id": "few-shot-learning",
                        "name": "Few-Shot Learning/Prompting",
                        "description": "Providing K > 1 demonstrations in the prompt to help the model understand patterns.",
                        "sources": ["Brown et al.", "Wei et al.", "Schulhoff et al."],
                        "relatedTechniques": ["one-shot-learning", "zero-shot-learning", "in-context-learning"],
                        "useCase": "Tasks where examples help illustrate the desired pattern or format of response.",
                        "example": "Classify the sentiment of the following restaurant reviews as positive or negative:\n\nExample 1: 'The food was delicious.' Sentiment: positive\nExample 2: 'Terrible service and cold food.' Sentiment: negative\n\nNew review: 'The atmosphere was nice but waiting time was too long.'",
                        "tips": "Choose diverse, high-quality examples. Ensure examples clearly demonstrate the pattern. Use 2-5 examples for best results. Keep examples concise but complete.",
                        "commonMistakes": "Using poor-quality or inconsistent examples. Too many examples that confuse rather than clarify. Examples that don't match the actual task."
                    },
                    {
                        "id": "zero-shot-learning",
                        "name": "Zero-Shot Learning/Prompting",
                        "description": "Prompting with instruction only, without any demonstrations or examples.",
                        "sources": ["Brown et al.", "Vatsal & Dubey", "Schulhoff et al."],
                        "relatedTechniques": ["few-shot-learning", "one-shot-learning", "instructed-prompting"],
                        "useCase": "Simple tasks or when working with capable models that don't require examples.",
                        "example": "Summarize the main points of the following article in 3 bullet points: [article text]",
                        "tips": "Make instructions as clear and specific as possible. Include output format requirements. Consider the model's capabilities and limitations.",
                        "commonMistakes": "Underestimating task complexity. Not providing sufficient context. Expecting perfect results without examples for complex tasks."
                    },
                    {
                        "id": "one-shot-learning",
                        "name": "One-Shot Learning/Prompting",
                        "description": "Providing exactly one demonstration in the prompt to help the model understand patterns.",
                        "sources": ["Brown et al.", "Schulhoff et al."],
                        "relatedTechniques": ["few-shot-learning", "zero-shot-learning", "in-context-learning"],
                        "useCase": "When a single example sufficiently conveys the pattern or when context length is limited.",
                        "example": "Translate English to French:\nEnglish: The weather is beautiful today.\nFrench: Le temps est beau aujourd'hui.\n\nEnglish: I would like to order dinner."
                    },
                    {
                        "id": "in-context-learning",
                        "name": "In-Context Learning (ICL)",
                        "description": "The model's ability to learn from demonstrations/instructions within the prompt at inference time, without updating weights.",
                        "sources": ["Brown et al.", "Schulhoff et al."],
                        "relatedTechniques": ["few-shot-learning", "exemplar-selection", "exemplar-ordering"],
                        "useCase": "Achieving task-specific behavior without fine-tuning, particularly effective for classification, translation, and reasoning tasks.",
                        "example": "Q: What is the capital of France?\nA: Paris\n\nQ: What is the capital of Japan?\nA: Tokyo\n\nQ: What is the capital of Australia?\nA:"
                    },
                    {
                        "id": "cloze-prompts",
                        "name": "Cloze Prompts",
                        "description": "Prompts with masked slots for prediction, often in the middle of the text.",
                        "sources": ["Wang et al. - Healthcare Survey", "Schulhoff et al."],
                        "relatedTechniques": ["prefix-prompts", "fill-in-the-blank-format"],
                        "useCase": "Extractive QA, knowledge probing, and logical completion tasks.",
                        "example": "The capital of France is _____."
                    },
                    {
                        "id": "prefix-prompts",
                        "name": "Prefix Prompts",
                        "description": "Standard prompt format where the prediction follows the input.",
                        "sources": ["Wang et al. - Healthcare Survey", "Schulhoff et al."],
                        "relatedTechniques": ["cloze-prompts", "continuous-prompt"],
                        "useCase": "Most general-purpose prompting scenarios where text completion is desired.",
                        "example": "Write a short poem about autumn:"
                    },
                    {
                        "id": "template-prompting",
                        "name": "Templating (Prompting)",
                        "description": "Using functions with variable slots to construct prompts in a systematic way.",
                        "sources": ["Schulhoff et al."],
                        "relatedTechniques": ["basic-prompting", "instruction-selection"],
                        "useCase": "When standardizing prompts across multiple inputs or creating programmatic interfaces.",
                        "example": "def generate_summary_prompt(text):\n    return f\"Summarize the following text in 3 sentences:\\n\\n{text}\""
                    },
                    {
                        "id": "instructed-prompting",
                        "name": "Instructed Prompting",
                        "description": "Explicitly instructing the LLM with clear directions about the task.",
                        "sources": ["Vatsal & Dubey"],
                        "relatedTechniques": ["basic-prompting", "zero-shot-learning"],
                        "useCase": "Any task where specific behavioral guidance is needed.",
                        "example": "You are a professional translator. Translate the following English text to Spanish, maintaining the same tone and formality level:"
                    },
                    {
                        "id": "role-prompting",
                        "name": "Role Prompting",
                        "description": "Assigning a specific role or persona to the model.",
                        "sources": ["Nori et al."],
                        "relatedTechniques": ["instructed-prompting"],
                        "useCase": "Tasks requiring domain expertise or specific tone/style.",
                        "example": "You are an experienced tax accountant with expertise in small business taxation. Help me understand the tax implications of..."
                    }
                ]
            }
        ]
    }
};