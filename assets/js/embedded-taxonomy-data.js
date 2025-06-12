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
                        "example": "Translate English to French:\nEnglish: The weather is beautiful today.\nFrench: Le temps est beau aujourd'hui.\n\nEnglish: I would like to order dinner.",
                        "tips": "Choose the most representative example possible. Ensure the example is clear and unambiguous. Make sure the pattern is obvious from one example.",
                        "commonMistakes": "Choosing an example that doesn't clearly show the pattern. Using edge cases as the single example. Overcomplicating the example."
                    },
                    {
                        "id": "in-context-learning",
                        "name": "In-Context Learning (ICL)",
                        "description": "The model's ability to learn from demonstrations/instructions within the prompt at inference time, without updating weights.",
                        "sources": ["Brown et al.", "Schulhoff et al."],
                        "relatedTechniques": ["few-shot-learning", "exemplar-selection", "exemplar-ordering"],
                        "useCase": "Achieving task-specific behavior without fine-tuning, particularly effective for classification, translation, and reasoning tasks.",
                        "example": "Q: What is the capital of France?\nA: Paris\n\nQ: What is the capital of Japan?\nA: Tokyo\n\nQ: What is the capital of Australia?\nA:",
                        "tips": "Provide clear, consistent examples. Maintain the same format throughout. Use examples that cover the range of expected inputs.",
                        "commonMistakes": "Inconsistent formatting between examples. Examples that don't represent the full scope of the task. Too much variation in example quality."
                    },
                    {
                        "id": "role-prompting",
                        "name": "Role Prompting",
                        "description": "Assigning a specific role or persona to the model.",
                        "sources": ["Nori et al."],
                        "relatedTechniques": ["instructed-prompting"],
                        "useCase": "Tasks requiring domain expertise or specific tone/style.",
                        "example": "You are an experienced tax accountant with expertise in small business taxation. Help me understand the tax implications of...",
                        "tips": "Choose roles that match the required expertise. Be specific about the role's background and experience. Maintain consistency throughout the interaction.",
                        "commonMistakes": "Choosing roles that don't match the task. Being too vague about the role's qualifications. Switching between roles inconsistently."
                    },
                    {
                        "id": "instructed-prompting",
                        "name": "Instructed Prompting",
                        "description": "Explicitly instructing the LLM with clear directions about the task.",
                        "sources": ["Vatsal & Dubey"],
                        "relatedTechniques": ["basic-prompting", "zero-shot-learning"],
                        "useCase": "Any task where specific behavioral guidance is needed.",
                        "example": "You are a professional translator. Translate the following English text to Spanish, maintaining the same tone and formality level:",
                        "tips": "Be explicit and detailed in your instructions. Use clear, imperative language. Break down complex instructions into steps. Specify what to avoid as well as what to do.",
                        "commonMistakes": "Being too vague or ambiguous in instructions. Not providing enough detail about the expected process. Conflicting or contradictory instructions."
                    }
                ]
            },
            {
                "id": "reasoning-frameworks",
                "techniques": [
                    {
                        "id": "chain-of-thought",
                        "name": "Chain-of-Thought (CoT) Prompting",
                        "description": "Eliciting step-by-step reasoning before the final answer, usually via few-shot exemplars.",
                        "sources": ["Wei et al.", "Schulhoff et al.", "Vatsal & Dubey", "Wang et al. - Self-Consistency"],
                        "relatedTechniques": ["zero-shot-cot", "few-shot-cot", "self-consistency"],
                        "useCase": "Complex reasoning tasks, math problems, logical deductions, and multi-step decision processes.",
                        "example": "Question: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?\n\nLet's think about this step-by-step:\n1. Roger starts with 5 tennis balls\n2. He buys 2 cans of tennis balls, with 3 balls per can\n3. So he gets 2 × 3 = 6 new tennis balls\n4. In total, he has 5 + 6 = 11 tennis balls\n\nAnswer: 11 tennis balls",
                        "tips": "Provide clear, detailed reasoning steps in your examples. Break down complex problems into smaller, logical steps. Use natural language that matches how humans reason through problems.",
                        "commonMistakes": "Skipping intermediate steps in reasoning chains. Using overly complex examples that confuse the model. Not adapting the reasoning style to the specific problem domain."
                    },
                    {
                        "id": "zero-shot-cot",
                        "name": "Zero-Shot CoT",
                        "description": "Appending a thought-inducing phrase without CoT exemplars, like 'Let's think step by step'.",
                        "sources": ["Schulhoff et al.", "Vatsal & Dubey"],
                        "relatedTechniques": ["chain-of-thought", "few-shot-cot"],
                        "useCase": "When example chains of reasoning aren't available but step-by-step thinking is still beneficial.",
                        "example": "Question: If a store has 10 apples and 3 people each buy 2 apples, how many apples are left?\n\nLet's think step by step.",
                        "tips": "Use clear thought-inducing phrases like \"Let's think step by step\" or \"Let's work through this systematically.\" Be explicit about wanting reasoning.",
                        "commonMistakes": "Not being explicit enough about wanting step-by-step reasoning. Using phrases that don't actually trigger reasoning. Expecting detailed reasoning without proper prompting."
                    },
                    {
                        "id": "tree-of-thoughts",
                        "name": "Tree-of-Thoughts (ToT)",
                        "description": "Exploring multiple reasoning paths in a tree structure using generate, evaluate, and search methods.",
                        "sources": ["Yao et al.", "Vatsal & Dubey", "Schulhoff et al."],
                        "relatedTechniques": ["chain-of-thought", "graph-of-thoughts", "self-consistency"],
                        "useCase": "Complex problems with multiple possible approaches, where exploring alternatives is beneficial.",
                        "example": "Problem: Find the optimal strategy for the game of 24 (reach 24 using +, -, *, / with cards 3, 9, 4, 1).\n\nPath 1: (3 + 9) * (4 - 1) = 12 * 3 = 36 (invalid)\nPath 2: (3 * 9 - 4) - 1 = 27 - 4 - 1 = 22 (invalid)\nPath 3: (3 + 1) * 9 - 4 = 4 * 9 - 4 = 36 - 4 = 32 (invalid)\nPath 4: 3 * (9 - 1) - 4 = 3 * 8 - 4 = 24 - 4 = 20 (invalid)\nPath 5: (9 - 1) * (4 - 3) = 8 * 1 = 8 (invalid)\nPath 6: 3 * 9 - 4 - 1 = 27 - 4 - 1 = 22 (invalid)\nPath 7: 3 * (9 - 4) + 1 = 3 * 5 + 1 = 15 + 1 = 16 (invalid)\nPath 8: (3 + 9) * 4 / (1 + 3) = 12 * 4 / 4 = 12 (invalid)\nPath 9: 9 * 4 / 3 + 1 = 36 / 3 + 1 = 12 + 1 = 13 (invalid)\nPath 10: (9 - 1) * 3 = 8 * 3 = 24 (valid!)",
                        "tips": "Encourage exploration of multiple paths. Use evaluation criteria for different approaches. Be prepared for longer response times. Structure the exploration systematically.",
                        "commonMistakes": "Not providing clear evaluation criteria. Allowing too much branching without focus. Not synthesizing insights from different paths."
                    },
                    {
                        "id": "self-consistency",
                        "name": "Self-Consistency",
                        "description": "Generates multiple reasoning paths and selects the most consistent answer.",
                        "sources": ["Wang et al., 2022"],
                        "relatedTechniques": ["chain-of-thought", "tree-of-thoughts"],
                        "useCase": "Improving answer reliability in complex reasoning tasks.",
                        "example": "Generate several distinct reasoning paths for this problem, then select the most consistent answer that appears across multiple paths.",
                        "tips": "Generate multiple reasoning paths with different approaches. Look for the most common final answer. Use temperature > 0 for diversity in reasoning.",
                        "commonMistakes": "Not generating enough diverse paths. Focusing only on the final answer rather than reasoning quality. Using identical reasoning approaches."
                    },
                    {
                        "id": "react",
                        "name": "ReAct",
                        "description": "Combines reasoning and acting in an iterative loop.",
                        "sources": ["Yao et al., 2022"],
                        "relatedTechniques": ["tree-of-thoughts", "chain-of-thought"],
                        "useCase": "Complex tasks requiring both reasoning and actions like tool use.",
                        "example": "Thought: I need to understand what the question is asking.\nAction: Analyze the question\nObservation: The question is about calculating compound interest.\nThought: To calculate compound interest, I need the formula A = P(1 + r/n)^(nt).",
                        "tips": "Clearly separate the Thought, Action, and Observation steps. Be explicit about which tools are available. Encourage the model to reflect on observations before taking new actions.",
                        "commonMistakes": "Not providing enough context about available tools. Allowing the model to skip the reasoning step. Failing to incorporate observations into subsequent reasoning."
                    }
                ]
            },
            {
                "id": "self-improvement",
                "techniques": [
                    {
                        "id": "self-correction",
                        "name": "Self-Correction",
                        "description": "Model reviews and revises its own output.",
                        "sources": ["Madaan et al., 2023"],
                        "relatedTechniques": ["self-critique", "self-evaluation"],
                        "useCase": "Error reduction, iterative improvement.",
                        "example": "After generating your answer, review it for any errors or issues, and provide a corrected version.",
                        "tips": "Be explicit about the review process. Provide specific criteria for evaluation. Encourage honest self-assessment. Allow multiple revision rounds if needed.",
                        "commonMistakes": "Not providing clear evaluation criteria. Being too lenient or too harsh in self-evaluation. Not actually making meaningful corrections."
                    },
                    {
                        "id": "self-critique",
                        "name": "Self-Critique",
                        "description": "Model critiques its own output without necessarily revising it.",
                        "sources": ["Saunders et al."],
                        "relatedTechniques": ["self-correction", "self-evaluation"],
                        "useCase": "Identifying weaknesses in generated content.",
                        "example": "After writing your response, critically evaluate it based on accuracy, completeness, and relevance."
                    },
                    {
                        "id": "self-verification",
                        "name": "Self-Verification",
                        "description": "Model verifies its own answers before providing the final response.",
                        "sources": ["Weng et al., 2023"],
                        "relatedTechniques": ["self-correction", "self-evaluation"],
                        "useCase": "Fact-checking, ensuring solution validity before presenting to users.",
                        "example": "Solve this problem. Then verify your answer by solving it again with a different approach. Only present your answer if both methods yield the same result."
                    }
                ]
            },
            {
                "id": "agent-tool-use",
                "techniques": [
                    {
                        "id": "agent-based-prompting",
                        "name": "Agent-Based Prompting",
                        "description": "Framing the LLM as an agent with agency to solve problems.",
                        "sources": ["Yao et al., 2022", "Shinn et al."],
                        "relatedTechniques": ["react", "tool-use-agents"],
                        "useCase": "Complex tasks requiring planning, reasoning, and tool use.",
                        "example": "You are TaskSolver, an AI agent that can use tools to accomplish tasks. You have access to these tools: [tool description]. To use a tool, write: [tool name][arguments]. Solve the user's request step-by-step."
                    },
                    {
                        "id": "tool-use-agents",
                        "name": "Tool-Use Agents",
                        "description": "Explicitly instructing LLMs to use specific tools with defined APIs.",
                        "sources": ["Qin et al.", "Schick et al."],
                        "relatedTechniques": ["agent-based-prompting", "react"],
                        "useCase": "Tasks requiring access to external knowledge, computation, or services.",
                        "example": "You can use the following tools to help with this task:\n1. Search(query): Search the web\n2. Calculator(expression): Evaluate mathematical expressions\n\nUse tools when needed by writing [tool][arguments]."
                    }
                ]
            },
            {
                "id": "retrieval-augmentation",
                "techniques": [
                    {
                        "id": "rag",
                        "name": "Retrieval-Augmented Generation (RAG)",
                        "description": "Enhancing LLM responses by retrieving relevant information from external sources.",
                        "sources": ["Lewis et al.", "Vatsal & Dubey"],
                        "relatedTechniques": ["dsp"],
                        "useCase": "Tasks requiring specific factual information beyond the model's training data.",
                        "example": "Question: What were the key provisions of the Paris Climate Agreement? [System retrieves relevant documents...]"
                    }
                ]
            },
            {
                "id": "prompt-optimization",
                "techniques": [
                    {
                        "id": "ape",
                        "name": "Automatic Prompt Engineer (APE)",
                        "description": "Automatically generates and optimizes prompts for a given task.",
                        "sources": ["Zhou et al."],
                        "relatedTechniques": ["grips"],
                        "useCase": "Automating prompt design for large-scale or complex tasks.",
                        "example": "Given a task, APE generates multiple candidate prompts and selects the best-performing one."
                    }
                ]
            },
            {
                "id": "multimodal-techniques",
                "techniques": [
                    {
                        "id": "image-prompting",
                        "name": "Image Prompting",
                        "description": "Incorporating images as part of the prompt to guide model outputs.",
                        "sources": ["Tsimpoukelli et al."],
                        "relatedTechniques": ["multimodal-chain-of-thought"],
                        "useCase": "Tasks requiring visual context or image-based reasoning.",
                        "example": "Prompt: [Image of a cat] Describe what you see."
                    }
                ]
            },
            {
                "id": "specialized-application",
                "techniques": [
                    {
                        "id": "code-generation-agents",
                        "name": "Code Generation Agents",
                        "description": "Agents specialized for generating and refining code.",
                        "sources": ["Chen et al."],
                        "relatedTechniques": ["chain-of-thought"],
                        "useCase": "Automated code writing and debugging.",
                        "example": "Write a Python function to reverse a string."
                    }
                ]
            },
            {
                "id": "multi-agent-systems",
                "techniques": [
                    {
                        "id": "boomerang-task-delegation",
                        "name": "Boomerang Task Delegation",
                        "description": "A hierarchical task decomposition pattern where complex requests are broken into subtasks, delegated to specialized modes, and their results 'boomerang' back for integration.",
                        "sources": ["Mnehmos (2024)", "Building Structured AI Teams"],
                        "relatedTechniques": ["mode-based-specialization", "task-boundary-enforcement"],
                        "useCase": "Complex multi-step projects requiring coordination between specialized AI agents with different capabilities.",
                        "example": "Orchestrator receives 'Build a web app' → Creates subtasks → Delegates 'Design architecture' to Architect mode → Delegates 'Write code' to Code mode → Integrates results"
                    },
                    {
                        "id": "mode-based-specialization",
                        "name": "Mode-Based Agent Specialization",
                        "description": "Organizing AI systems into specialized operational modes, each with distinct capabilities, roles, and system prompts optimized for specific types of tasks.",
                        "sources": ["Mnehmos (2024)", "Building Structured AI Teams"],
                        "relatedTechniques": ["boomerang-task-delegation", "semantic-guardrails"],
                        "useCase": "Systems requiring diverse capabilities where different types of tasks benefit from specialized approaches and constraints.",
                        "example": "Code mode: Optimized for implementation with tool permissions for file operations. Architect mode: Focused on design with restricted file access."
                    }
                ]
            }
        ]
    }
};