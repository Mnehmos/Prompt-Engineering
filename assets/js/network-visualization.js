/**
 * Network Visualization Script for Technique Relationships
 * Creates a force-directed graph visualization using D3.js
 */

class TechniqueNetworkVisualization {
    constructor() {
        this.nodes = [];
        this.links = [];
        this.simulation = null;
        this.svg = null;
        this.link = null;
        this.node = null;
        this.width = 0;
        this.height = 0;
        this.linkStrength = 0.5;
        this.nodeDistance = 150;
        this.selectedCategory = 'all';
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        this.selectedNode = null;
        this.categoriesData = null;
        this.techniquesData = null;
        this.zoom = null;
    }

    /**
     * Initialize the visualization
     */
    // Asynchronous init to fetch data from JSON files
    async init() {
        try {
            // Show loading indicator
            document.querySelector('.visualization-loading').style.display = 'flex';
            
            // Load data from JSON files
            await this.loadData();

            // Initialize the visualization
            this.setupVisualization();

            // Add event listeners
            this.addEventListeners();

            // Hide loading indicator
            document.querySelector('.visualization-loading').style.display = 'none';
        } catch (error) {
            console.error('Error initializing network visualization:', error);
            this.showError('Failed to load visualization data. Please try refreshing the page.');
        }
    }

    /**
     * Load data from JSON files
     */
    /**
     * Load data directly from embedded JSON
     * @returns {Promise} Promise that resolves when data is loaded
     */
    async loadData() {
        try {
            // Embedded categories data to avoid CORS issues with local files
            this.categoriesData = {
              "categories": [
                {
                  "id": "basic-concepts",
                  "name": "Basic Concepts",
                  "description": "Fundamental prompting structures and conceptual frameworks",
                  "techniques": [
                    "basic-prompting",
                    "few-shot-learning",
                    "zero-shot-learning",
                    "one-shot-learning",
                    "in-context-learning",
                    "cloze-prompts",
                    "prefix-prompts",
                    "template-prompting",
                    "instructed-prompting"
                  ]
                },
                {
                  "id": "reasoning-frameworks",
                  "name": "Reasoning Frameworks",
                  "description": "Techniques that guide the model through explicit reasoning steps",
                  "techniques": [
                    "chain-of-thought",
                    "zero-shot-cot",
                    "few-shot-cot",
                    "tree-of-thoughts",
                    "skeleton-of-thought",
                    "graph-of-thoughts",
                    "least-to-most-prompting",
                    "recursion-of-thought",
                    "plan-and-solve-prompting",
                    "step-back-prompting",
                    "program-of-thoughts",
                    "maieutic-prompting",
                    "chain-of-verification"
                  ]
                },
                {
                  "id": "agent-tool-use",
                  "name": "Agent & Tool Use",
                  "description": "Techniques that enable LLMs to interact with external tools and environments",
                  "techniques": [
                    "agent-based-prompting",
                    "react",
                    "mrkl-system",
                    "pal",
                    "critic",
                    "taskweaver",
                    "tool-use-agents",
                    "code-based-agents",
                    "gitm",
                    "reflexion",
                    "voyager",
                    "tora"
                  ]
                },
                {
                  "id": "self-improvement",
                  "name": "Self-Improvement Techniques",
                  "description": "Methods for the model to reflect on and improve its own outputs",
                  "techniques": [
                    "self-consistency",
                    "self-correction",
                    "self-refine",
                    "self-verification",
                    "self-calibration",
                    "reverse-chain-of-thought",
                    "self-ask",
                    "universal-self-consistency",
                    "metacognitive-prompting",
                    "self-generated-icl"
                  ]
                },
                {
                  "id": "retrieval-augmentation",
                  "name": "Retrieval & Augmentation",
                  "description": "Techniques that incorporate external knowledge into prompts",
                  "techniques": [
                    "rag",
                    "dsp",
                    "iterative-retrieval-augmentation",
                    "interleaved-retrieval-guided-cot",
                    "implicit-rag",
                    "verify-and-edit",
                    "cross-file-code-completion-prompting",
                    "retrieved-cross-file-context"
                  ]
                },
                {
                  "id": "prompt-optimization",
                  "name": "Prompt Optimization",
                  "description": "Techniques to automate and improve prompt engineering",
                  "techniques": [
                    "automated-prompt-optimization",
                    "ape",
                    "grips",
                    "continuous-prompt-optimization",
                    "discrete-prompt-optimization",
                    "hybrid-prompt-optimization",
                    "soft-prompt-tuning",
                    "rlprompt",
                    "fm-based-optimization",
                    "genetic-algorithm-optimization",
                    "gradient-based-optimization"
                  ]
                },
                {
                  "id": "multimodal-techniques",
                  "name": "Multimodal Techniques",
                  "description": "Techniques involving non-text modalities like images, audio, and video",
                  "techniques": [
                    "3d-prompting",
                    "audio-prompting",
                    "image-prompting",
                    "video-prompting",
                    "chain-of-images",
                    "multimodal-chain-of-thought",
                    "multimodal-graph-of-thought",
                    "multimodal-in-context-learning",
                    "image-as-text-prompting",
                    "negative-prompting-image",
                    "paired-image-prompting"
                  ]
                },
                {
                  "id": "specialized-application",
                  "name": "Specialized Application Techniques",
                  "description": "Techniques optimized for specific domains or applications",
                  "techniques": [
                    "alphacodium",
                    "code-generation-agents",
                    "scot",
                    "tab-cot",
                    "chain-of-table",
                    "dater",
                    "logicot",
                    "mathprompter",
                    "chain-of-code",
                    "modular-code-generation",
                    "flow-engineering",
                    "test-based-iterative-flow"
                  ]
                },
                {
                  "id": "multi-agent-systems",
                  "name": "Multi-Agent Systems & Team Frameworks",
                  "description": "Advanced techniques for organizing and coordinating multiple AI agents",
                  "techniques": [
                    "boomerang-task-delegation",
                    "mode-based-specialization",
                    "semantic-guardrails",
                    "task-boundary-enforcement",
                    "error-pattern-libraries"
                  ]
                }
              ]
            };
            
            // Embedded techniques data to avoid CORS issues with local files
            this.techniquesData = {
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
                      "example": "Translate the following English text to French: 'Hello, how are you?'"
                    },
                    {
                      "id": "few-shot-learning",
                      "name": "Few-Shot Learning/Prompting",
                      "description": "Providing K > 1 demonstrations in the prompt to help the model understand patterns.",
                      "sources": ["Brown et al.", "Wei et al.", "Schulhoff et al."],
                      "relatedTechniques": ["one-shot-learning", "zero-shot-learning", "in-context-learning"],
                      "useCase": "Tasks where examples help illustrate the desired pattern or format of response.",
                      "example": "Classify the sentiment of the following restaurant reviews as positive or negative:\n\nExample 1: 'The food was delicious.' Sentiment: positive\nExample 2: 'Terrible service and cold food.' Sentiment: negative\n\nNew review: 'The atmosphere was nice but waiting time was too long.'"
                    },
                    {
                      "id": "zero-shot-learning",
                      "name": "Zero-Shot Learning/Prompting",
                      "description": "Prompting with instruction only, without any demonstrations or examples.",
                      "sources": ["Brown et al.", "Vatsal & Dubey", "Schulhoff et al."],
                      "relatedTechniques": ["few-shot-learning", "one-shot-learning", "instructed-prompting"],
                      "useCase": "Simple tasks or when working with capable models that don't require examples.",
                      "example": "Summarize the main points of the following article in 3 bullet points: [article text]"
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
                    }
                  ]
                },
                {
                  "id": "reasoning-frameworks",
                  "name": "Reasoning Frameworks",
                  "description": "Techniques that guide the model through explicit reasoning steps",
                  "techniques": [
                    {
                      "id": "chain-of-thought",
                      "name": "Chain-of-Thought (CoT) Prompting",
                      "description": "Eliciting step-by-step reasoning before the final answer, usually via few-shot exemplars.",
                      "sources": ["Wei et al.", "Schulhoff et al.", "Vatsal & Dubey", "Wang et al. - Self-Consistency"],
                      "relatedTechniques": ["zero-shot-cot", "few-shot-cot", "self-consistency"],
                      "useCase": "Complex reasoning tasks, math problems, logical deductions, and multi-step decision processes.",
                      "example": "Question: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?\n\nLet's think about this step-by-step:\n1. Roger starts with 5 tennis balls\n2. He buys 2 cans of tennis balls, with 3 balls per can\n3. So he gets 2 × 3 = 6 new tennis balls\n4. In total, he has 5 + 6 = 11 tennis balls\n\nAnswer: 11 tennis balls"
                    },
                    {
                      "id": "zero-shot-cot",
                      "name": "Zero-Shot CoT",
                      "description": "Appending a thought-inducing phrase without CoT exemplars, like 'Let's think step by step'.",
                      "sources": ["Schulhoff et al.", "Vatsal & Dubey"],
                      "relatedTechniques": ["chain-of-thought", "few-shot-cot"],
                      "useCase": "When example chains of reasoning aren't available but step-by-step thinking is still beneficial.",
                      "example": "Question: If a store has 10 apples and 3 people each buy 2 apples, how many apples are left?\n\nLet's think step by step."
                    },
                    {
                      "id": "few-shot-cot",
                      "name": "Few-Shot CoT",
                      "description": "CoT prompting using multiple CoT exemplars to demonstrate the reasoning process.",
                      "sources": ["Schulhoff et al.", "Vatsal & Dubey"],
                      "relatedTechniques": ["chain-of-thought", "zero-shot-cot"],
                      "useCase": "Complex reasoning tasks where the model needs to learn specific reasoning patterns.",
                      "example": "Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 tennis balls. How many tennis balls does he have now?\nA: Roger starts with 5 tennis balls. He buys 2 cans, each with 3 tennis balls. So he gets 2×3=6 more tennis balls. In total, he has 5+6=11 tennis balls.\n\nQ: Alice has 7 books. She gives 2 books to Bob and buys 3 more books. How many books does she have now?"
                    },
                    {
                      "id": "tree-of-thoughts",
                      "name": "Tree-of-Thoughts (ToT)",
                      "description": "Exploring multiple reasoning paths in a tree structure using generate, evaluate, and search methods.",
                      "sources": ["Yao et al.", "Vatsal & Dubey", "Schulhoff et al."],
                      "relatedTechniques": ["chain-of-thought", "graph-of-thoughts", "self-consistency"],
                      "useCase": "Complex problems with multiple possible approaches, where exploring alternatives is beneficial.",
                      "example": "Problem: Find the optimal strategy for the game of 24 (reach 24 using +, -, *, / with cards 3, 9, 4, 1).\n\nPath 1: (3 + 9) * (4 - 1) = 12 * 3 = 36 (invalid)\nPath 2: (3 * 9 - 4) - 1 = 27 - 4 - 1 = 22 (invalid)\nPath 3: (3 + 1) * 9 - 4 = 4 * 9 - 4 = 36 - 4 = 32 (invalid)\nPath 4: 3 * (9 - 1) - 4 = 3 * 8 - 4 = 24 - 4 = 20 (invalid)\nPath 5: (9 - 1) * (4 - 3) = 8 * 1 = 8 (invalid)\nPath 6: 3 * 9 - 4 - 1 = 27 - 4 - 1 = 22 (invalid)\nPath 7: 3 * (9 - 4) + 1 = 3 * 5 + 1 = 15 + 1 = 16 (invalid)\nPath 8: (3 + 9) * 4 / (1 + 3) = 12 * 4 / 4 = 12 (invalid)\nPath 9: 9 * 4 / 3 + 1 = 36 / 3 + 1 = 12 + 1 = 13 (invalid)\nPath 10: (9 - 1) * 3 = 8 * 3 = 24 (valid!)"
                    },
                    {
                      "id": "skeleton-of-thought",
                      "name": "Skeleton-of-Thought (SoT)",
                      "description": "A two-stage approach: first generating a skeleton (outline) and then expanding points in parallel.",
                      "sources": ["Ning et al.", "Schulhoff et al."],
                      "relatedTechniques": ["tree-of-thoughts", "parallel-point-expanding"],
                      "useCase": "Long-form content generation where structure is important, like essays or reports.",
                      "example": "Task: Write an essay about climate change.\n\nSkeleton:\n1. Introduction to climate change\n2. Causes of climate change\n3. Effects on ecosystems\n4. Economic impacts\n5. Potential solutions\n6. Conclusion\n\n[Then each point is expanded in parallel]"
                    }
                  ]
                }
              ]
            };

            // --- PATCH: Add missing categories for full node mapping ---
            // Add Agent & Tool Use
            this.techniquesData.categories.push({
              "id": "agent-tool-use",
              "name": "Agent & Tool Use",
              "description": "Techniques that enable LLMs to interact with external tools and environments",
              "techniques": [
                {
                  "id": "agent-based-prompting",
                  "name": "Agent-Based Prompting",
                  "description": "Assigning an agent role to the LLM that can use tools, make decisions, and interact with the environment.",
                  "sources": ["Park et al.", "Vatsal & Dubey"],
                  "relatedTechniques": ["react", "tool-use-agents"],
                  "useCase": "Complex tasks requiring tool use, decision making, and multi-step reasoning.",
                  "example": "You are a research agent with access to a search tool. To use the tool, format your response as [SEARCH(query)]."
                },
                {
                  "id": "react",
                  "name": "ReAct (Reasoning + Acting)",
                  "description": "Combining reasoning traces and task-specific actions in an interleaved manner.",
                  "sources": ["Yao et al.", "Vatsal & Dubey"],
                  "relatedTechniques": ["agent-based-prompting", "chain-of-thought"],
                  "useCase": "Tasks requiring both reasoning and interaction with external tools/environments.",
                  "example": "Thought: I need to find when the Golden Gate Bridge was built. Action: Search(Golden Gate Bridge construction date)"
                }
              ]
            });

            // Add Self-Improvement
            this.techniquesData.categories.push({
              "id": "self-improvement",
              "name": "Self-Improvement Techniques",
              "description": "Methods for the model to reflect on and improve its own outputs",
              "techniques": [
                {
                  "id": "self-consistency",
                  "name": "Self-Consistency",
                  "description": "Generating multiple reasoning paths and selecting the most consistent answer.",
                  "sources": ["Wang et al. - Self-Consistency", "Vatsal & Dubey"],
                  "relatedTechniques": ["chain-of-thought", "self-verification"],
                  "useCase": "Complex reasoning tasks where multiple approaches might yield different answers.",
                  "example": "Problem: What is 17 × 36? Path 1: ... Path 2: ... Consistent Answer: 612"
                },
                {
                  "id": "self-verification",
                  "name": "Self-Verification",
                  "description": "Having the model verify the correctness of its own answers.",
                  "sources": ["Manakul et al.", "Vatsal & Dubey"],
                  "relatedTechniques": ["self-consistency"],
                  "useCase": "Tasks where verifying results is critical.",
                  "example": "Answer: The derivative of f(x) = x² is f'(x) = 2x. Verification: ..."
                }
              ]
            });

            // Add Retrieval & Augmentation
            this.techniquesData.categories.push({
              "id": "retrieval-augmentation",
              "name": "Retrieval & Augmentation",
              "description": "Techniques that incorporate external knowledge into prompts",
              "techniques": [
                {
                  "id": "rag",
                  "name": "Retrieval-Augmented Generation (RAG)",
                  "description": "Enhancing LLM responses by retrieving relevant information from external sources.",
                  "sources": ["Lewis et al.", "Vatsal & Dubey"],
                  "relatedTechniques": ["dsp"],
                  "useCase": "Tasks requiring specific factual information beyond the model's training data.",
                  "example": "Question: What were the key provisions of the Paris Climate Agreement? [System retrieves relevant documents...]"
                },
                {
                  "id": "dsp",
                  "name": "Demonstration-Search-Predict (DSP)",
                  "description": "A retrieval technique that searches for demonstrations relevant to the input query.",
                  "sources": ["Khattab et al.", "Vatsal & Dubey"],
                  "relatedTechniques": ["rag"],
                  "useCase": "Tasks benefiting from retrieving similar examples.",
                  "example": "Question: How does photosynthesis work? [System searches for relevant demonstrations...]"
                }
              ]
            });

            // Add Prompt Optimization
            this.techniquesData.categories.push({
              "id": "prompt-optimization",
              "name": "Prompt Optimization",
              "description": "Techniques to automate and improve prompt engineering",
              "techniques": [
                {
                  "id": "ape",
                  "name": "Automatic Prompt Engineer (APE)",
                  "description": "Automatically generates and optimizes prompts for a given task.",
                  "sources": ["Zhou et al."],
                  "relatedTechniques": ["grips"],
                  "useCase": "Automating prompt design for large-scale or complex tasks.",
                  "example": "Given a task, APE generates multiple candidate prompts and selects the best-performing one."
                },
                {
                  "id": "grips",
                  "name": "GRIPS",
                  "description": "Gradient-based prompt search for optimization.",
                  "sources": ["Prasad et al."],
                  "relatedTechniques": ["ape"],
                  "useCase": "Optimizing prompts using gradient-based methods.",
                  "example": "GRIPS iteratively updates prompt tokens to maximize task performance."
                }
              ]
            });

            // Add Multimodal Techniques
            this.techniquesData.categories.push({
              "id": "multimodal-techniques",
              "name": "Multimodal Techniques",
              "description": "Techniques involving non-text modalities like images, audio, and video",
              "techniques": [
                {
                  "id": "image-prompting",
                  "name": "Image Prompting",
                  "description": "Incorporating images as part of the prompt to guide model outputs.",
                  "sources": ["Tsimpoukelli et al."],
                  "relatedTechniques": ["multimodal-chain-of-thought"],
                  "useCase": "Tasks requiring visual context or image-based reasoning.",
                  "example": "Prompt: [Image of a cat] Describe what you see."
                },
                {
                  "id": "multimodal-chain-of-thought",
                  "name": "Multimodal Chain-of-Thought",
                  "description": "Combining reasoning over text and images in a step-by-step manner.",
                  "sources": ["Zhu et al."],
                  "relatedTechniques": ["image-prompting"],
                  "useCase": "Complex tasks involving both text and images.",
                  "example": "Given an image and a question, reason step by step using both modalities."
                }
              ]
            });

            // Add Specialized Application Techniques
            this.techniquesData.categories.push({
              "id": "specialized-application",
              "name": "Specialized Application Techniques",
              "description": "Techniques optimized for specific domains or applications",
              "techniques": [
                {
                  "id": "code-generation-agents",
                  "name": "Code Generation Agents",
                  "description": "Agents specialized for generating and refining code.",
                  "sources": ["Chen et al."],
                  "relatedTechniques": ["chain-of-thought"],
                  "useCase": "Automated code writing and debugging.",
                  "example": "Write a Python function to reverse a string."
                },
                {
                  "id": "mathprompter",
                  "name": "MathPrompter",
                  "description": "Prompting techniques specialized for mathematical problem solving.",
                  "sources": ["Wang et al."],
                  "relatedTechniques": ["chain-of-thought"],
                  "useCase": "Solving math word problems.",
                  "example": "Solve: If a train travels 60 miles in 1.5 hours, what is its average speed?"
                }
              ]
            });

            // Add Multi-Agent Systems & Team Frameworks
            this.techniquesData.categories.push({
              "id": "multi-agent-systems",
              "name": "Multi-Agent Systems & Team Frameworks",
              "description": "Advanced techniques for organizing and coordinating multiple AI agents",
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
                },
                {
                  "id": "semantic-guardrails",
                  "name": "Semantic Guardrails",
                  "description": "Mode-specific validation mechanisms that monitor AI outputs for semantic drift, ensuring responses align with expected behavior and role-appropriate content.",
                  "sources": ["Mnehmos (2024)", "Detecting and Correcting Emergent Errors"],
                  "relatedTechniques": ["mode-based-specialization", "error-pattern-libraries"],
                  "useCase": "Production AI systems where maintaining consistent, role-appropriate behavior is critical for reliability and user trust.",
                  "example": "Code mode guardrails: Check for implementation completeness, technical precision, code quality. Architect mode guardrails: Ensure structured planning, avoid direct implementation."
                },
                {
                  "id": "task-boundary-enforcement",
                  "name": "Task Boundary Enforcement",
                  "description": "Implementing strict schemas and validation to prevent errors from propagating between tasks in multi-agent systems through immutable inputs and sanitized outputs.",
                  "sources": ["Mnehmos (2024)", "Detecting and Correcting Emergent Errors"],
                  "relatedTechniques": ["boomerang-task-delegation", "semantic-guardrails"],
                  "useCase": "Complex multi-agent workflows where error containment and task isolation are essential for system stability and debugging.",
                  "example": "Define JSON schemas for task inputs/outputs → Validate at task creation → Treat contextual data as immutable → Sanitize results before parent integration"
                },
                {
                  "id": "error-pattern-libraries",
                  "name": "Error Pattern Libraries",
                  "description": "Community-maintained repositories of common AI system errors, their causes, reproduction steps, and correction strategies to enable systematic learning from failures.",
                  "sources": ["Mnehmos (2024)", "Detecting and Correcting Emergent Errors"],
                  "relatedTechniques": ["semantic-guardrails"],
                  "useCase": "Organizations and communities running AI systems that need to systematically capture, share, and learn from operational errors and edge cases.",
                  "example": "Error: 'Semantic drift in Code mode' → Cause: 'Overly general system prompt' → Reproduction: 'Ask code mode to write poetry' → Solution: 'Add technical focus guardrail'"
                }
              ]
            });
            
            // Process data into nodes and links
            this.processData();
        } catch (error) {
            console.error('Error loading data:', error);
            throw new Error('Failed to load data from JSON files');
        }
    }

    /**
     * Process data into nodes and links for the visualization
     */
    /**
     * Process data into nodes and links for the visualization
     */
    processData() {
        this.nodes = [];
        this.links = [];
        
        // Create a map of category IDs to colors with a better color scheme
        const categoryColors = {};
        const colorScheme = d3.schemeTableau10; // Using Tableau's color scheme for better distinction
        this.categoriesData.categories.forEach((category, index) => {
            categoryColors[category.id] = colorScheme[index % colorScheme.length];
        });
        
        // Process each technique into a node
        let nodeIndex = 0;
        this.techniquesData.categories.forEach(category => {
            const categoryId = category.id;
            
            category.techniques.forEach(technique => {
                // Create node for this technique
                this.nodes.push({
                    id: technique.id,
                    name: technique.name,
                    categoryId: categoryId,
                    color: categoryColors[categoryId],
                    description: technique.description,
                    sources: technique.sources,
                    aliases: technique.aliases,
                    useCase: technique.useCase,
                    example: technique.example,
                    relatedTechniques: technique.relatedTechniques || [],
                    index: nodeIndex++,
                    // Track connection count for node sizing
                    connectionCount: 0
                });
            });
        });
        
        // Add links based on related techniques
        this.nodes.forEach(node => {
            if (node.relatedTechniques && node.relatedTechniques.length > 0) {
                node.relatedTechniques.forEach(relatedId => {
                    // Find the related node
                    const targetNode = this.nodes.find(n => n.id === relatedId);
                    if (targetNode) {
                        // Increment connection count for both nodes
                        node.connectionCount++;
                        targetNode.connectionCount++;
                        
                        this.links.push({
                            source: node.id,
                            target: relatedId,
                            value: 1, // Link strength
                            // Determine if this is bidirectional
                            bidirectional: targetNode.relatedTechniques &&
                                          targetNode.relatedTechniques.includes(node.id)
                        });
                    }
                });
            }
        });
    }

    /**
     * Setup D3.js visualization
     */
    setupVisualization() {
        const container = document.getElementById('relationship-visualization');
        if (!container) return;
        
        // Get dimensions
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        // Create SVG
        this.svg = d3.select('#relationship-visualization')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height])
            .call(this.setupZoom());
        
        // Add a background rect to capture zoom events
        this.svg.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');
        
        // Create a group for all graph elements
        this.graph = this.svg.append('g')
            .attr('class', 'graph');
        
        // Create links with markers for directionality
        // First define arrow markers
        this.graph.append("defs").selectAll("marker")
            .data(["end", "end-bidirectional"])
            .enter().append("marker")
            .attr("id", d => d)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 25)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("fill", d => d === "end-bidirectional" ? "#666" : "#999")
            .attr("d", "M0,-5L10,0L0,5");

        // Create links
        this.link = this.graph.append('g')
            .attr('class', 'links')
            .selectAll('path')  // Using paths instead of lines for curved links
            .data(this.links)
            .enter()
            .append('path')
            .attr('stroke', d => d.bidirectional ? '#666' : '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.value) * 1.5)
            .attr('fill', 'none')
            .attr('marker-end', d => d.bidirectional ? "url(#end-bidirectional)" : "url(#end)");
        
        // Create nodes with scaled sizes based on connections
        this.node = this.graph.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.nodes)
            .enter()
            .append('circle')
            .attr('r', d => 5 + (d.connectionCount * 1.2))  // Scale by connection count
            .attr('fill', d => d.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 1.5)
            .attr('id', d => `node-${d.id}`)
            .attr('data-id', d => d.id)
            .on('click', this.handleNodeClick.bind(this))
            .on('mouseover', this.handleNodeMouseOver.bind(this))
            .on('mouseout', this.handleNodeMouseOut.bind(this))
            .call(this.setupDrag());
        
        // Add node labels
        this.nodeLabels = this.graph.append('g')
            .attr('class', 'node-labels')
            .selectAll('text')
            .data(this.nodes)
            .enter()
            .append('text')
            .attr('dy', 4)
            .attr('dx', d => 8 + (d.relatedTechniques.length * 0.5))
            .text(d => d.name)
            .attr('font-size', '10px')
            .attr('font-family', 'Inter, sans-serif')
            .style('pointer-events', 'none');
        
        // Create force simulation
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links).id(d => d.id).distance(this.nodeDistance))
            .force('charge', d3.forceManyBody().strength(-100))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('x', d3.forceX(this.width / 2).strength(0.01))
            .force('y', d3.forceY(this.height / 2).strength(0.01))
            .force('collision', d3.forceCollide().radius(d => 10 + (d.relatedTechniques.length * 0.5)))
            .on('tick', this.tick.bind(this));
    }

    /**
     * Setup zoom behavior
     */
    setupZoom() {
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.graph.attr('transform', event.transform);
            });
        
        return this.zoom;
    }

    /**
     * Setup drag behavior for nodes
     */
    setupDrag() {
        return d3.drag()
            .on('start', this.dragstarted.bind(this))
            .on('drag', this.dragged.bind(this))
            .on('end', this.dragended.bind(this));
    }

    /**
     * Handle node click
     */
    handleNodeClick(event, d) {
        // Highlight the selected node
        this.node.attr('stroke', n => n.id === d.id ? '#000' : '#fff')
                 .attr('stroke-width', n => n.id === d.id ? 2.5 : 1.5);
        
        // Store selected node
        this.selectedNode = d;
        
        // Update details panel
        this.updateDetailsPanel(d);
    }

    /**
     * Update details panel with selected node information
     */
    /**
     * Update details panel with selected node information
     */
    updateDetailsPanel(node) {
        const detailsPanel = document.querySelector('.technique-detail-panel');
        const title = document.getElementById('detail-panel-title');
        const details = document.getElementById('technique-details');
        const relatedList = document.getElementById('related-techniques-list');
        
        if (!detailsPanel || !title || !details || !relatedList) return;
        
        // Show panel
        detailsPanel.classList.add('active');
        
        // Set title
        title.textContent = node.name;
        
        // Set details
        let content = `<div class="technique-category">${this.getCategoryName(node.categoryId)}</div>`;
        
        content += `<p class="description">${node.description || 'No description available.'}</p>`;
        
        if (node.aliases && node.aliases.length > 0) {
            content += `<div class="detail-section">
                <h4>Also Known As</h4>
                <p>${node.aliases.join(', ')}</p>
            </div>`;
        }
        
        if (node.useCase) {
            content += `<div class="detail-section">
                <h4>Use Case</h4>
                <p>${node.useCase}</p>
            </div>`;
        }
        
        if (node.example) {
            content += `<div class="detail-section">
                <h4>Example</h4>
                <div class="example-code">${node.example}</div>
            </div>`;
        }
        
        // Add related papers section
        if (node.sources && node.sources.length > 0) {
            content += `<div class="detail-section">
                <h4>Related Papers</h4>
                <ul class="sources-list">
                    ${node.sources.map(source => `<li>${source}</li>`).join('')}
                </ul>
            </div>`;
        }
        
        details.innerHTML = content;
        
        // Set related techniques
        relatedList.innerHTML = '';
        
        if (node.relatedTechniques && node.relatedTechniques.length > 0) {
            node.relatedTechniques.forEach(relatedId => {
                const relatedNode = this.nodes.find(n => n.id === relatedId);
                if (relatedNode) {
                    const relatedItem = document.createElement('div');
                    relatedItem.className = 'related-item';
                    relatedItem.dataset.id = relatedId;
                    
                    const colorDot = document.createElement('span');
                    colorDot.className = 'related-color-dot';
                    colorDot.style.backgroundColor = relatedNode.color;
                    
                    const relatedName = document.createElement('span');
                    relatedName.className = 'related-name';
                    relatedName.textContent = relatedNode.name;
                    
                    relatedItem.appendChild(colorDot);
                    relatedItem.appendChild(relatedName);
                    relatedList.appendChild(relatedItem);
                    
                    // Add click event
                    relatedItem.addEventListener('click', () => {
                        // Find and highlight node
                        this.highlightNode(relatedId);
                    });
                }
            });
        } else {
            relatedList.innerHTML = '<p class="empty-state">No related techniques.</p>';
        }
    }

    /**
     * Get category name from category ID
     */
    getCategoryName(categoryId) {
        if (!this.categoriesData) return categoryId;
        
        const category = this.categoriesData.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    /**
     * Highlight a node by ID
     */
    highlightNode(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            // Highlight in graph
            this.node.attr('stroke', n => n.id === nodeId ? '#000' : '#fff')
                     .attr('stroke-width', n => n.id === nodeId ? 2.5 : 1.5);
            
            // Update details panel
            this.updateDetailsPanel(node);
            
            // Center view on node
            const nodeElement = document.getElementById(`node-${nodeId}`);
            if (nodeElement) {
                this.centerOnNode(node);
            }
        }
    }

    /**
     * Center view on a specific node
     */
    centerOnNode(node) {
        const transform = d3.zoomIdentity
            .translate(this.width / 2, this.height / 2)
            .scale(1.2)
            .translate(-node.x, -node.y);
        
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, transform);
    }

    /**
     * Filter nodes and links by category
     */
    filterByCategory(categoryId) {
        this.selectedCategory = categoryId;
        
        if (categoryId === 'all') {
            // Show all nodes and links
            this.node.style('display', 'block');
            this.nodeLabels.style('display', 'block');
            
            // Show links that connect visible nodes
            this.link.style('display', d => 'block');
        } else {
            // Show nodes in the selected category and their direct connections
            const connectedNodeIds = new Set();
            
            // First pass: identify all nodes in the selected category
            const categoryNodeIds = new Set();
            this.nodes.forEach(node => {
                if (node.categoryId === categoryId) {
                    categoryNodeIds.add(node.id);
                }
            });
            
            // Second pass: add all nodes directly connected to the selected category
            this.links.forEach(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                
                if (categoryNodeIds.has(sourceId)) {
                    connectedNodeIds.add(targetId);
                }
                if (categoryNodeIds.has(targetId)) {
                    connectedNodeIds.add(sourceId);
                }
            });
            
            // Add all category nodes to connected nodes
            categoryNodeIds.forEach(id => connectedNodeIds.add(id));
            
            // Show/hide nodes
            this.node.style('display', d => 
                connectedNodeIds.has(d.id) ? 'block' : 'none'
            );
            
            this.nodeLabels.style('display', d => 
                connectedNodeIds.has(d.id) ? 'block' : 'none'
            );
            
            // Show links where both source and target are visible
            this.link.style('display', d => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                
                return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId) ? 'block' : 'none';
            });
        }
        
        // Restart simulation with visible nodes only
        this.simulation.alpha(0.3).restart();
    }

    /**
     * Update force layout parameters
     */
    updateForceLayout() {
        // Update link strength
        this.simulation.force('link').strength(this.linkStrength);
        
        // Update node distance
        this.simulation.force('link').distance(this.nodeDistance);
        
        // Restart simulation
        this.simulation.alpha(0.3).restart();
    }

    /**
     * Reset the visualization layout
     */
    resetLayout() {
        // Reset zoom
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity);
        
        // Reset positions
        this.simulation
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('x', d3.forceX(this.width / 2).strength(0.1))
            .force('y', d3.forceY(this.height / 2).strength(0.1))
            .alpha(1)
            .restart();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const container = document.getElementById('relationship-visualization');
        if (!container) return;
        
        // Update dimensions
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        
        // Update SVG dimensions
        this.svg
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', [0, 0, this.width, this.height]);
        
        // Update background rect
        this.svg.select('rect')
            .attr('width', this.width)
            .attr('height', this.height);
        
        // Update force center
        this.simulation
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('x', d3.forceX(this.width / 2).strength(0.01))
            .force('y', d3.forceY(this.height / 2).strength(0.01))
            .alpha(0.3)
            .restart();
    }

    /**
     * Add event listeners
     */
    /**
     * Add event listeners
     */
    addEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-button').forEach(button => {
            button.addEventListener('click', () => {
                // Toggle active class
                document.querySelectorAll('.category-button').forEach(btn =>
                    btn.classList.remove('active')
                );
                button.classList.add('active');
                
                // Filter by category
                this.filterByCategory(button.dataset.category);
            });
        });
        
        // Link strength slider
        const linkStrengthSlider = document.getElementById('link-strength');
        if (linkStrengthSlider) {
            linkStrengthSlider.addEventListener('input', () => {
                this.linkStrength = linkStrengthSlider.value / 10;
                this.updateForceLayout();
            });
        }
        
        // Node distance slider
        const nodeDistanceSlider = document.getElementById('node-distance');
        if (nodeDistanceSlider) {
            nodeDistanceSlider.addEventListener('input', () => {
                this.nodeDistance = parseInt(nodeDistanceSlider.value);
                this.updateForceLayout();
            });
        }
        
        // Reset layout button
        const resetButton = document.getElementById('reset-layout');
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetLayout();
            });
        }
        
        // Close details panel
        const closePanel = document.getElementById('close-panel');
        if (closePanel) {
            closePanel.addEventListener('click', () => {
                document.querySelector('.technique-detail-panel').classList.remove('active');
                
                // Remove highlight from nodes
                this.node.attr('stroke', '#fff')
                         .attr('stroke-width', 1.5);
                
                this.selectedNode = null;
            });
        }
        
        // Export image button
        const exportButton = document.getElementById('export-image');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportAsImage();
            });
        }
        
        // Search input
        const searchInput = document.getElementById('technique-search');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.searchTechniques(searchInput.value);
            });
        }
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Search techniques by name
     */
    searchTechniques(query) {
        if (!query || query.trim() === '') {
            // Reset all nodes and links to visible
            this.node.style('display', 'block');
            this.nodeLabels.style('display', 'block');
            this.link.style('display', 'block');
            return;
        }
        
        query = query.toLowerCase();
        
        // Find matching nodes
        const matchingNodeIds = new Set();
        this.nodes.forEach(node => {
            if (node.name.toLowerCase().includes(query) ||
                (node.aliases && node.aliases.some(alias => alias.toLowerCase().includes(query)))) {
                matchingNodeIds.add(node.id);
            }
        });
        
        // Show matching nodes and their direct connections
        this.node.style('display', d => matchingNodeIds.has(d.id) ? 'block' : 'none');
        this.nodeLabels.style('display', d => matchingNodeIds.has(d.id) ? 'block' : 'none');
        
        // Show links between visible nodes
        this.link.style('display', d => {
            const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
            const targetId = typeof d.target === 'object' ? d.target.id : d.target;
            
            return matchingNodeIds.has(sourceId) && matchingNodeIds.has(targetId) ? 'block' : 'none';
        });
        
        // Restart simulation
        this.simulation.alpha(0.3).restart();
    }
    
    /**
     * Export current view as an image
     */
    exportAsImage() {
        try {
            // Create a clone of the SVG
            const svgElement = document.getElementById('relationship-visualization');
            const svgClone = svgElement.cloneNode(true);
            
            // Set background color
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('width', '100%');
            rect.setAttribute('height', '100%');
            rect.setAttribute('fill', 'white');
            svgClone.insertBefore(rect, svgClone.firstChild);
            
            // Convert SVG to data URL
            const svgData = new XMLSerializer().serializeToString(svgClone);
            const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
            const url = URL.createObjectURL(svgBlob);
            
            // Create image from SVG
            const img = new Image();
            img.onload = function() {
                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = svgElement.clientWidth;
                canvas.height = svgElement.clientHeight;
                const ctx = canvas.getContext('2d');
                
                // Draw image to canvas
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                
                // Convert to PNG and download
                const pngUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = pngUrl;
                downloadLink.download = 'technique-relationships.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                // Clean up
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (error) {
            console.error('Error exporting image:', error);
            alert('Failed to export image. Please try again.');
        }
    }

    /**
     * Handle drag start
     */
    dragstarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    /**
     * Handle drag
     */
    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    /**
     * Handle drag end
     */
    dragended(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    /**
     * Update positions on each simulation tick
     */
    /**
     * Update positions on each simulation tick
     */
    tick() {
        // Update link paths - curved if bidirectional
        this.link.attr('d', d => {
            const dx = d.target.x - d.source.x;
            const dy = d.target.y - d.source.y;
            const dr = d.bidirectional ? Math.sqrt(dx * dx + dy * dy) * 1.5 : 0;
            
            return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
        });
        
        this.node
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        this.nodeLabels
            .attr('x', d => d.x)
            .attr('y', d => d.y);
    }
    
    /**
     * Handle mouse over event on nodes
     */
    handleNodeMouseOver(event, d) {
        // Create tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', 'node-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '8px 12px')
            .style('border-radius', '4px')
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 1000);
            
        tooltip.html(`<strong>${d.name}</strong><br>${this.getCategoryName(d.categoryId)}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 0.9);
            
        // Store tooltip reference on the node
        d.tooltip = tooltip;
        
        // Highlight node and its connections
        this.node.attr('opacity', n => this.isConnected(d, n) ? 1 : 0.3);
        this.link.attr('opacity', l =>
            (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1
        );
        this.nodeLabels.attr('opacity', n => this.isConnected(d, n) ? 1 : 0.3);
    }
    
    /**
     * Handle mouse out event on nodes
     */
    handleNodeMouseOut(event, d) {
        // Remove tooltip
        if (d.tooltip) {
            d.tooltip.transition()
                .duration(200)
                .style('opacity', 0)
                .remove();
            d.tooltip = null;
        }
        
        // Reset opacity
        this.node.attr('opacity', 1);
        this.link.attr('opacity', 0.6);
        this.nodeLabels.attr('opacity', 1);
    }
    
    /**
     * Check if two nodes are connected
     */
    isConnected(a, b) {
        if (a.id === b.id) return true; // Same node
        
        // Check if there's a link between them
        return this.links.some(l =>
            (l.source.id === a.id && l.target.id === b.id) ||
            (l.source.id === b.id && l.target.id === a.id)
        );
    }

    /**
     * Show error message
     */
    showError(message) {
        const container = document.querySelector('.visualization-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
                </div>
            `;
        } else {
            console.error(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const networkVisualization = new TechniqueNetworkVisualization();
    networkVisualization.init();
});