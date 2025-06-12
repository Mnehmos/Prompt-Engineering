/**
 * Interactive Prompt Builder for Prompt Engineering Taxonomy
 * Helps users construct effective prompts using selected techniques
 */

class PromptBuilder {
    constructor() {
        this.selectedTechniques = [];
        /**
         * Complete technique data for offline/local use from techniques.json
         * Format: { [techniqueId]: { ...technique, categoryId, categoryName } }
         */
        this.techniqueData = {};
        /**
         * Store the raw text version of the prompt (without HTML formatting)
         * This is used for copying to clipboard
         */
        this.rawPromptText = "";
        this.templateBlocks = {
            "basic": {
                id: "basic",
                name: "Basic Prompt",
                description: "A simple instruction-based prompt.",
                template: "Please {task_description}.\n\n{output_format}"
            },
            "persona": {
                id: "persona",
                name: "Persona/Role-Based",
                description: "Establish an expert persona for the AI to assume.",
                template: "You are an expert {role} with {experience} years of experience. Your task is to {task_description}.\n\n{output_format}"
            },
            "step-by-step": {
                id: "step-by-step",
                name: "Step-by-Step Reasoning",
                description: "Guide the AI through explicit reasoning steps.",
                template: "I need you to think through the following problem step by step:\n\n{task_description}\n\nBreak down your approach into clear steps and show your reasoning process.\n\n{output_format}"
            },
            "question-answering": {
                id: "question-answering",
                name: "Question Answering",
                description: "Format for asking specific questions.",
                template: "Answer the following question with detailed explanations:\n\nQuestion: {task_description}\n\n{output_format}"
            },
            "few-shot": {
                id: "few-shot",
                name: "Few-Shot Examples",
                description: "Provide examples before the main task.",
                template: "Here are some examples of how to {context}:\n\nExample 1: {example1}\nExample 2: {example2}\n\nNow, please {task_description}\n\n{output_format}"
            },
            "creative": {
                id: "creative",
                name: "Creative Generation",
                description: "For creative writing or content generation.",
                template: "Create a {content_type} about {topic} with the following characteristics:\n- {characteristic1}\n- {characteristic2}\n- {characteristic3}\n\n{additional_constraints}\n\n{output_format}"
            },
            "code": {
                id: "code",
                name: "Code Generation",
                description: "For generating code with specific requirements.",
                template: "Write a {language} function that {function_purpose}. The function should:\n- {requirement1}\n- {requirement2}\n- {requirement3}\n\nInclude comments to explain your approach.\n\n{output_format}"
            },
            "interactive": {
                id: "interactive",
                name: "Interactive/Multi-turn",
                description: "For multi-turn interactions with the AI.",
                template: "We're going to work through {task_description} together.\n\nFirst, {initial_step}.\n\nAfter you complete this step, I'll provide additional guidance.\n\n{output_format}"
            }
        };

        // Load techniques data from the embedded techniques.json structure
        this.loadTechniquesData();
        this.basePrompt = "";
        this.taskDescription = "";
        this.outputFormat = "";
        this.skillLevel = "intermediate"; // default
        this.selectedTemplate = null;
        this.savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
        this.currentTemplateFields = {};
    }

    /**
     * Initialize the prompt builder
     */
    init() {
        // Initialize UI components
        this.initUI();

        // Add event listeners
        this.addEventListeners();
        
        // Load saved prompts if any
        this.loadSavedPrompts();
        
        // Initialize wizard navigation
        this.initWizardNavigation();
        
        // Update technique count badge
        this.updateTechniqueCount();
    }
    
    /**
     * Initialize wizard navigation
     */
    initWizardNavigation() {
        // Add click event to wizard steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            step.addEventListener('click', () => {
                const stepNumber = parseInt(step.dataset.step);
                this.goToStep(stepNumber);
            });
        });
        
        // Add click event to next/prev buttons
        document.getElementById('next-step-1')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('next-step-2')?.addEventListener('click', () => this.goToStep(3));
        document.getElementById('next-step-3')?.addEventListener('click', () => this.goToStep(4));
        document.getElementById('prev-step-2')?.addEventListener('click', () => this.goToStep(1));
        document.getElementById('prev-step-3')?.addEventListener('click', () => this.goToStep(2));
        document.getElementById('prev-step-4')?.addEventListener('click', () => this.goToStep(3));
        
        // Start over button
        document.getElementById('start-over-button')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to start over? This will clear all your current selections.')) {
                this.clearPrompt();
                this.goToStep(1);
            }
        });
    }
    
    /**
     * Go to a specific step in the wizard
     * @param {number} stepNumber - The step number to go to
     */
    goToStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.wizard-content').forEach(content => {
            content.style.display = 'none';
        });
        
        // Show the selected step
        const stepContent = document.getElementById(`step-${stepNumber}-content`);
        if (stepContent) {
            stepContent.style.display = 'block';
        }
        
        // Update step indicators
        document.querySelectorAll('.wizard-step').forEach(step => {
            const currentStep = parseInt(step.dataset.step);
            step.classList.remove('active', 'completed');
            
            if (currentStep === stepNumber) {
                step.classList.add('active');
            } else if (currentStep < stepNumber) {
                step.classList.add('completed');
            }
        });
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${(stepNumber / 4) * 100}%`;
        }
        
        // Enable/disable next buttons based on content
        if (stepNumber === 1) {
            const nextButton = document.getElementById('next-step-1');
            if (nextButton) {
                nextButton.disabled = this.selectedTechniques.length === 0;
            }
        }
        
        if (stepNumber === 3) {
            const nextButton = document.getElementById('next-step-3');
            if (nextButton) {
                nextButton.disabled = !this.taskDescription;
            }
        }
    }
    
    /**
     * Update the technique count badge
     */
    updateTechniqueCount() {
        const countBadge = document.getElementById('technique-count');
        if (countBadge) {
            countBadge.textContent = this.selectedTechniques.length;
        }
    }

    /**
     * Initialize UI components
     */
    initUI() {
        // Create technique selection area
        this.createTechniqueSelectors();
        
        // Create template blocks
        this.createTemplateBlocks();
        
        // Initialize prompt preview area
        this.updatePromptPreview();
        
        // Initialize token counter
        this.updateTokenCount();
    }

    /**
     * Load techniques data from embedded JSON structure
     */
    loadTechniquesData() {
        // This function converts the nested category/technique structure
        // into a flat map with extra category information for easy access
        
        // Comprehensive technique data (embedded to avoid CORS issues)
        // SYNCHRONIZED with data/processed/techniques.json - Contains all 9 categories and complete technique definitions
        const techniquesData = {
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
                            "example": "You are a professional translator. Translate the following English text to Spanish, maintaining the same tone and formality level:",
                            "tips": "Be explicit and detailed in your instructions. Use clear, imperative language. Break down complex instructions into steps. Specify what to avoid as well as what to do.",
                            "commonMistakes": "Being too vague or ambiguous in instructions. Not providing enough detail about the expected process. Conflicting or contradictory instructions."
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
                            "id": "few-shot-cot",
                            "name": "Few-Shot CoT",
                            "description": "CoT prompting using multiple CoT exemplars to demonstrate the reasoning process.",
                            "sources": ["Schulhoff et al.", "Vatsal & Dubey"],
                            "relatedTechniques": ["chain-of-thought", "zero-shot-cot"],
                            "useCase": "Complex reasoning tasks where the model needs to learn specific reasoning patterns.",
                            "example": "Q: Roger has 5 tennis balls. He buys 2 cans, each with 3 tennis balls. How many tennis balls does he have now?\nA: Roger starts with 5 tennis balls. He buys 2 cans, each with 3 tennis balls. So he gets 2×3=6 more tennis balls. In total, he has 5+6=11 tennis balls.\n\nQ: Alice has 7 books. She gives 2 books to Bob and buys 3 more books. How many books does she have now?"
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
                            "id": "skeleton-of-thought",
                            "name": "Skeleton-of-Thought (SoT)",
                            "description": "A two-stage approach: first generating a skeleton (outline) and then expanding points in parallel.",
                            "sources": ["Ning et al.", "Schulhoff et al."],
                            "relatedTechniques": ["tree-of-thoughts", "parallel-point-expanding"],
                            "useCase": "Long-form content generation where structure is important, like essays or reports.",
                            "example": "Task: Write an essay about climate change.\n\nSkeleton:\n1. Introduction to climate change\n2. Causes of climate change\n3. Effects on ecosystems\n4. Economic impacts\n5. Potential solutions\n6. Conclusion\n\n[Then each point is expanded in parallel]"
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
                    "name": "Self-Improvement",
                    "description": "Techniques that guide the model to refine its own outputs",
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
                        },
                        {
                            "id": "self-refine",
                            "name": "Self-Refine",
                            "description": "Iteratively refining outputs through self-feedback without additional training.",
                            "sources": ["Madaan et al."],
                            "relatedTechniques": ["self-correction", "self-critique"],
                            "useCase": "Improving output quality through iterative refinement.",
                            "example": "Generate initial output, provide self-feedback, then refine based on that feedback."
                        }
                    ]
                },
                {
                    "id": "agent-tool-use",
                    "name": "Agent & Tool Use",
                    "description": "Techniques that enable LLMs to interact with external tools and environments",
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
                },
                {
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
                },
                {
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
                },
                {
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
                },
                {
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
                }
           ]
        };
        
        // Process the techniques data into the flat map
        techniquesData.categories.forEach(category => {
            category.techniques.forEach(technique => {
                this.techniqueData[technique.id] = {
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                };
            });
        });
    }

    /**
     * Create technique selector elements
     */
    createTechniqueSelectors() {
        const container = document.getElementById('technique-selector');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        // Group techniques by category
        const categorizedTechniques = {};
        
        Object.values(this.techniqueData).forEach(technique => {
            if (!categorizedTechniques[technique.categoryId]) {
                categorizedTechniques[technique.categoryId] = {
                    name: technique.categoryName,
                    techniques: []
                };
            }
            
            categorizedTechniques[technique.categoryId].techniques.push(technique);
        });
        
        // Create category sections
        Object.keys(categorizedTechniques).forEach(categoryId => {
            const category = categorizedTechniques[categoryId];
            
            // Create category section
            const categorySection = document.createElement('div');
            categorySection.className = 'technique-category-section';
            
            // Create category header
            const categoryHeader = document.createElement('h3');
            categoryHeader.textContent = category.name;
            categorySection.appendChild(categoryHeader);
            
            // Create technique list
            const techniqueList = document.createElement('div');
            techniqueList.className = 'technique-list';
            
            category.techniques.forEach(technique => {
                const techniqueItem = document.createElement('div');
                techniqueItem.className = 'technique-selector-item';
                techniqueItem.dataset.id = technique.id;
                
                // Create checkbox
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.id = `technique-${technique.id}`;
                
                // Create label
                const label = document.createElement('label');
                label.htmlFor = `technique-${technique.id}`;
                label.textContent = technique.name;
                
                // Create info icon
                const infoIcon = document.createElement('i');
                infoIcon.className = 'fas fa-info-circle technique-info-icon';
                infoIcon.title = 'View technique details';
                
                techniqueItem.appendChild(checkbox);
                techniqueItem.appendChild(label);
                techniqueItem.appendChild(infoIcon);
                techniqueList.appendChild(techniqueItem);
                
                // Add click event for technique selection
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        this.addTechnique(technique.id);
                    } else {
                        this.removeTechnique(technique.id);
                    }
                });
                
                // Add click event for info icon
                infoIcon.addEventListener('click', () => {
                    this.showTechniqueDetails(technique.id);
                });
            });
            
            categorySection.appendChild(techniqueList);
            container.appendChild(categorySection);
        });
    }

    /**
     * Add a technique to the selected techniques
     */
    addTechnique(techniqueId) {
        if (!this.selectedTechniques.includes(techniqueId)) {
            this.selectedTechniques.push(techniqueId);
            this.updateSelectedTechniques();
            this.updatePromptPreview();
            
            // Enable next button in step 1 if there are selected techniques
            const nextButton = document.getElementById('next-step-1');
            if (nextButton) {
                nextButton.disabled = this.selectedTechniques.length === 0;
            }
        }
    }

    /**
     * Remove a technique from the selected techniques
     */
    removeTechnique(techniqueId) {
        this.selectedTechniques = this.selectedTechniques.filter(id => id !== techniqueId);
        this.updateSelectedTechniques();
        this.updatePromptPreview();
        
        // Disable next button in step 1 if there are no selected techniques
        const nextButton = document.getElementById('next-step-1');
        if (nextButton) {
            nextButton.disabled = this.selectedTechniques.length === 0;
        }
    }

    /**
     * Update the selected techniques list UI
     */
    updateSelectedTechniques() {
        const container = document.getElementById('selected-techniques');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.selectedTechniques.length === 0) {
            container.innerHTML = '<p class="empty-state">No techniques selected. Select techniques from the list to build your prompt.</p>';
            return;
        }
        
        // Create list of selected techniques
        const techniqueList = document.createElement('div');
        techniqueList.className = 'selected-techniques-list';
        
        this.selectedTechniques.forEach(techniqueId => {
            const technique = this.techniqueData[techniqueId];
            if (!technique) return;
            
            const techniqueItem = document.createElement('div');
            techniqueItem.className = 'selected-technique-item';
            
            // Create remove button
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-technique-button';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            removeButton.title = 'Remove technique';
            
            // Create technique name
            const techniqueName = document.createElement('span');
            techniqueName.className = 'selected-technique-name';
            techniqueName.textContent = technique.name;
            
            // Create category badge
            const categoryBadge = document.createElement('span');
            categoryBadge.className = 'selected-technique-category';
            categoryBadge.textContent = technique.categoryName;
            
            techniqueItem.appendChild(removeButton);
            techniqueItem.appendChild(techniqueName);
            techniqueItem.appendChild(categoryBadge);
            techniqueList.appendChild(techniqueItem);
            
            // Add click event for remove button
            removeButton.addEventListener('click', () => {
                this.removeTechnique(techniqueId);
                
                // Uncheck the corresponding checkbox
                const checkbox = document.getElementById(`technique-${techniqueId}`);
                if (checkbox) checkbox.checked = false;
            });
        });
        
        container.appendChild(techniqueList);
    }

    /**
     * Create template block elements in the UI
     */
    createTemplateBlocks() {
        const container = document.querySelector('.prompt-inputs-container');
        if (!container) return;
        
        // Template selection dropdown is already in the HTML structure,
        // so we just need to populate it with options
        const templateSelector = document.getElementById('template-selector');
        if (templateSelector) {
            // Clear existing options except the first one
            while (templateSelector.options.length > 1) {
                templateSelector.remove(1);
            }
            
            // Add template options
            Object.values(this.templateBlocks).forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.name;
                templateSelector.appendChild(option);
            });
            
            // Add event listener for template selection
            templateSelector.addEventListener('change', (e) => {
                const templateId = e.target.value;
                this.selectTemplate(templateId);
            });
        }
        
        // Ensure template fields container exists
        let templateFieldsContainer = document.getElementById('template-fields-container');
        if (!templateFieldsContainer) {
            templateFieldsContainer = document.createElement('div');
            templateFieldsContainer.id = 'template-fields-container';
            templateFieldsContainer.className = 'template-fields-container';
            
            // Find the base-prompt group to insert before
            const basePromptGroup = document.getElementById('base-prompt')?.closest('.input-group');
            if (basePromptGroup) {
                container.insertBefore(templateFieldsContainer, basePromptGroup);
            } else {
                container.appendChild(templateFieldsContainer);
            }
        }
    }
    
    /**
     * Select a template and show its fields
     * @param {string} templateId - ID of the selected template
     */
    selectTemplate(templateId) {
        this.selectedTemplate = templateId ? this.templateBlocks[templateId] : null;
        
        // Update template description
        const templateDescription = document.getElementById('template-description');
        if (templateDescription) {
            templateDescription.textContent = this.selectedTemplate?.description || '';
        }
        
        // Get template fields container
        const templateFieldsContainer = document.getElementById('template-fields-container');
        if (!templateFieldsContainer) return;
        
        // Clear existing fields
        templateFieldsContainer.innerHTML = '';
        
        if (!this.selectedTemplate) return;
        
        // Enable next button in step 2
        const nextButton = document.getElementById('next-step-2');
        if (nextButton) {
            nextButton.disabled = false;
        }
        
        // Extract template field placeholders
        const placeholderRegex = /{([^}]+)}/g;
        let match;
        const fields = [];
        
        while ((match = placeholderRegex.exec(this.selectedTemplate.template)) !== null) {
            const fieldName = match[1];
            if (!fields.includes(fieldName)) {
                fields.push(fieldName);
            }
        }
        
        // Create input fields for each placeholder
        fields.forEach(field => {
            // Skip task_description and output_format as they're already in the main form
            if (field === 'task_description' || field === 'output_format') return;
            
            const fieldElement = document.createElement('div');
            fieldElement.className = 'input-group template-field';
            
            // Format field name for display (convert snake_case to Title Case)
            const fieldDisplayName = field
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            // Determine the input type based on field name
            let inputType = 'text';
            let inputHtml;
            
            if (field.includes('description') || field.includes('constraints') ||
                field.includes('characteristics') || field.includes('requirement') ||
                field.includes('example') || field.includes('additional')) {
                // Use textarea for longer content
                inputHtml = `<textarea id="template-${field}" placeholder="Enter ${fieldDisplayName.toLowerCase()}..."></textarea>`;
            } else {
                // Use text input for shorter content
                inputHtml = `<input type="${inputType}" id="template-${field}" placeholder="Enter ${fieldDisplayName.toLowerCase()}...">`;
            }
            
            fieldElement.innerHTML = `
                <label for="template-${field}">${fieldDisplayName}:</label>
                ${inputHtml}
            `;
            
            templateFieldsContainer.appendChild(fieldElement);
            
            // Add event listener for input
            const inputElement = document.getElementById(`template-${field}`);
            if (inputElement) {
                // Set initial value from saved fields if available
                if (this.currentTemplateFields[field]) {
                    inputElement.value = this.currentTemplateFields[field];
                }
                
                inputElement.addEventListener('input', (e) => {
                    this.currentTemplateFields[field] = e.target.value;
                    this.updatePromptPreview();
                });
            }
        });
        
        // Update the preview
        this.updatePromptPreview();
    }

    /**
     * Update the prompt preview based on selected techniques and inputs
     */
    updatePromptPreview() {
        const previewContainer = document.getElementById('prompt-preview');
        if (!previewContainer) return;
        
        // Get input values
        this.taskDescription = document.getElementById('task-description')?.value || "";
        this.basePrompt = document.getElementById('base-prompt')?.value || "";
        this.outputFormat = document.getElementById('output-format')?.value || "";
        
        // Build the prompt
        let finalPrompt = "";
        
        // If using a template
        if (this.selectedTemplate) {
            // Get template text
            let templateText = this.selectedTemplate.template;
            
            // Replace placeholders with values
            templateText = templateText.replace(/{task_description}/g, this.taskDescription);
            templateText = templateText.replace(/{output_format}/g, this.outputFormat);
            
            // Replace other template fields
            Object.keys(this.currentTemplateFields).forEach(field => {
                const value = this.currentTemplateFields[field] || `[${field}]`;
                templateText = templateText.replace(new RegExp(`{${field}}`, 'g'), value);
            });
            
            finalPrompt = templateText;
        } else {
            // Add selected techniques guidance
            if (this.selectedTechniques.length > 0) {
                finalPrompt += this.constructTechniquePrompt();
            }
            
            // Add user inputs
            if (this.basePrompt) {
                finalPrompt += this.basePrompt + "\n\n";
            }
            
            if (this.taskDescription) {
                finalPrompt += "Task: " + this.taskDescription + "\n\n";
            }
            
            if (this.outputFormat) {
                finalPrompt += "Output format: " + this.outputFormat + "\n";
            }
        }
        
        // Add placeholder if prompt is empty
        if (!finalPrompt.trim()) {
            finalPrompt = "Your prompt will appear here. Select techniques and fill in the input fields to build your prompt.";
        }
        
        // Store the raw text version for clipboard copying
        this.rawPromptText = finalPrompt.trim();
        
        // Set the preview with syntax highlighting
        this.renderHighlightedPrompt(previewContainer, this.rawPromptText);
        
        // Update token count
        this.updateTokenCount(finalPrompt);
        
        // Update copy button state
        const copyButton = document.getElementById('copy-prompt-button');
        if (copyButton) {
            copyButton.disabled = !finalPrompt.trim() || finalPrompt.includes("Your prompt will appear here");
        }
        
        // Generate suggestions if not using a template
        if (!this.selectedTemplate && this.selectedTechniques.length > 0) {
            this.generateSuggestions();
        } else {
            document.getElementById('suggestions-container')?.remove();
        }
    }
    
    /**
     * Apply syntax highlighting to the preview
     */
    renderHighlightedPrompt(container, promptText) {
        // Apply highlighting
        let highlighted = promptText;
        
        // Highlight task directives
        highlighted = highlighted.replace(/^Task:.*$/gm, match =>
            `<span class="highlight-directive">${match}</span>`);
            
        // Highlight output format
        highlighted = highlighted.replace(/^Output format:.*$/gm, match =>
            `<span class="highlight-format">${match}</span>`);
            
        // Highlight technique-specific phrases
        this.selectedTechniques.forEach(techniqueId => {
            const technique = this.techniqueData[techniqueId];
            if (technique && technique.example) {
                // Extract key phrases from the example
                const keyPhrases = technique.example
                    .split('\n')
                    .filter(line => line.trim().length > 5 && !line.includes("Example"))
                    .map(line => line.trim())
                    .filter(phrase => phrase.length > 8);
                    
                keyPhrases.forEach(phrase => {
                    // Only highlight exact key phrases that appear in the final prompt
                    if (promptText.includes(phrase)) {
                        highlighted = highlighted.replace(
                            new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                            `<span class="highlight-technique">${phrase}</span>`
                        );
                    }
                });
            }
        });
        
        // Set HTML content
        container.innerHTML = highlighted;
    }
    
    /**
     * Update the token count
     */
    updateTokenCount(text = '') {
        const tokenCountElement = document.getElementById('token-count');
        if (!tokenCountElement) {
            // Create token counter if it doesn't exist
            const promptActionsContainer = document.querySelector('.prompt-actions');
            if (promptActionsContainer) {
                const tokenCounter = document.createElement('div');
                tokenCounter.id = 'token-count';
                tokenCounter.className = 'token-counter';
                promptActionsContainer.prepend(tokenCounter);
            }
        }
        
        // Estimate token count (approx 4 chars = 1 token)
        if (text && text !== "Your prompt will appear here. Select techniques and fill in the input fields to build your prompt.") {
            const tokenCount = Math.ceil(text.length / 4);
            const charCount = text.length;
            
            const tokenCountElement = document.getElementById('token-count');
            if (tokenCountElement) {
                tokenCountElement.textContent = `~${tokenCount} tokens (${charCount} characters)`;
                
                // Add warning class if too many tokens
                if (tokenCount > 500) {
                    tokenCountElement.classList.add('token-count-warning');
                } else {
                    tokenCountElement.classList.remove('token-count-warning');
                }
            }
        } else {
            const tokenCountElement = document.getElementById('token-count');
            if (tokenCountElement) {
                tokenCountElement.textContent = '0 tokens (0 characters)';
                tokenCountElement.classList.remove('token-count-warning');
            }
        }
    }
    
    /**
     * Generate suggestions based on selected techniques
     */
    generateSuggestions() {
        if (this.selectedTechniques.length === 0) return;
        
        // Remove existing suggestions
        document.getElementById('suggestions-container')?.remove();
        
        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'suggestions-container';
        suggestionsContainer.className = 'suggestions-container';
        
        const suggestionsTitle = document.createElement('h4');
        suggestionsTitle.textContent = 'Suggestions';
        suggestionsContainer.appendChild(suggestionsTitle);
        
        const suggestionsList = document.createElement('ul');
        suggestionsList.className = 'suggestions-list';
        
        // Generate technique-specific suggestions
        let suggestions = [];
        
        // Check for technique combinations
        if (this.selectedTechniques.includes('chain-of-thought') &&
            this.selectedTechniques.includes('self-consistency')) {
            suggestions.push("Consider adding explicit instructions to generate multiple different reasoning paths and then select the most consistent answer.");
        }
        
        if (this.selectedTechniques.includes('chain-of-thought') &&
            !this.taskDescription.includes("step")) {
            suggestions.push("Add 'step-by-step' to your task description to reinforce the Chain-of-Thought technique.");
        }
        
        if (this.selectedTechniques.includes('tree-of-thoughts') &&
            !this.outputFormat.includes("paths")) {
            suggestions.push("Specify in the output format that you want to see multiple reasoning paths explored.");
        }
        
        if (this.selectedTechniques.includes('zero-shot-learning') &&
            this.selectedTechniques.includes('few-shot-learning')) {
            suggestions.push("Zero-shot and Few-shot techniques are usually mutually exclusive. Consider choosing one approach.");
        }
        
        if (this.selectedTechniques.includes('self-correction') &&
            !this.outputFormat.includes("review")) {
            suggestions.push("Add an instruction to review and correct the output in your output format section.");
        }
        
        // Add complementary technique suggestions
        if (this.selectedTechniques.includes('chain-of-thought') &&
            !this.selectedTechniques.includes('self-correction')) {
            suggestions.push("Consider adding Self-Correction technique to improve the reasoning accuracy.");
        }
        
        if (this.selectedTechniques.includes('basic-prompting') &&
            !this.selectedTechniques.includes('role-prompting')) {
            suggestions.push("Add Role Prompting to establish expertise context for better results.");
        }
        
        // Check for missing key elements
        if (!this.basePrompt && this.selectedTechniques.includes('role-prompting')) {
            suggestions.push("Add a role description in the base prompt (e.g., 'You are an expert...').");
        }
        
        if (!this.taskDescription) {
            suggestions.push("Add a clear task description to guide the AI.");
        }
        
        if (!this.outputFormat && this.taskDescription) {
            suggestions.push("Specify an output format to get more consistent results.");
        }
        
        // If no specific suggestions, add generic ones
        if (suggestions.length === 0) {
            if (this.selectedTechniques.length === 1) {
                const technique = this.techniqueData[this.selectedTechniques[0]];
                suggestions.push(`Try adding complementary techniques to "${technique.name}" for better results.`);
            } else {
                suggestions.push("Your prompt looks good! Consider adding more specific output constraints if needed.");
            }
        }
        
        // Render suggestions
        suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = suggestion;
            suggestionsList.appendChild(suggestionItem);
        });
        
        suggestionsContainer.appendChild(suggestionsList);
        
        // Add to the DOM
        const previewContainer = document.querySelector('.prompt-preview-container');
        if (previewContainer) {
            previewContainer.insertBefore(suggestionsContainer, document.getElementById('prompt-preview').nextSibling);
        }
    }

    /**
     * Construct a prompt based on selected techniques
     */
    constructTechniquePrompt() {
        let prompt = "";
        
        // Add role context if Chain-of-Thought is selected
        if (this.selectedTechniques.includes('chain-of-thought')) {
            prompt += "I want you to think through this problem step by step and show your reasoning.\n\n";
        }
        
        // Add self-consistency if selected
        if (this.selectedTechniques.includes('self-consistency')) {
            prompt += "Generate multiple different reasoning paths to solve this problem, then select the most consistent answer.\n\n";
        }
        
        // Add Zero-Shot CoT if selected
        if (this.selectedTechniques.includes('zero-shot-cot')) {
            prompt += "Let's think about this step by step.\n\n";
        }
        
        // Add Tree-of-Thoughts if selected
        if (this.selectedTechniques.includes('tree-of-thoughts')) {
            prompt += "For this problem, explore multiple possible approaches. For each approach, think about the next steps and evaluate whether the approach is likely to succeed.\n\n";
        }
        
        // Add ReAct if selected
        if (this.selectedTechniques.includes('react')) {
            prompt += "Let's break down this problem:\n1. Thought: Reflect on what we need to do\n2. Action: Determine what information or steps we need\n3. Observation: Note the results\n\nRepeat this process until we reach a solution.\n\n";
        }
        
        // Add self-evaluation prompt if selected
        if (this.selectedTechniques.includes('self-correction')) {
            prompt += "After generating your initial response, review it for errors or improvements, then provide a revised version.\n\n";
        }
        
        // Add role prompting if selected
        if (this.selectedTechniques.includes('role-prompting')) {
            prompt += "You are an expert with deep knowledge and experience in this domain. Approach this task with professional insight.\n\n";
        }
        
        // Add few-shot learning if selected
        if (this.selectedTechniques.includes('few-shot-learning')) {
            prompt += "Here are some examples to guide your approach:\n\nExample 1: [Input: Simple question] [Output: Clear answer]\nExample 2: [Input: Complex question] [Output: Detailed answer]\n\n";
        }
        
        // Add one-shot learning if selected
        if (this.selectedTechniques.includes('one-shot-learning')) {
            prompt += "Here's an example of how to approach this: [Input: Example question] [Output: Example answer]\n\n";
        }
        
        // Add basic prompting if selected
        if (this.selectedTechniques.includes('basic-prompting')) {
            prompt += "Please provide a direct and clear response to the following task.\n\n";
        }
        
        return prompt;
    }

    /**
     * Show details for a specific technique
     */
    showTechniqueDetails(techniqueId) {
        const technique = this.techniqueData[techniqueId];
        if (!technique) return;
        
        // Get or create modal
        let modal = document.getElementById('technique-detail-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'technique-detail-modal';
            modal.className = 'modal';
            
            // Create modal content
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            
            // Create close button
            const closeButton = document.createElement('span');
            closeButton.className = 'close';
            closeButton.innerHTML = '&times;';
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
            
            modalContent.appendChild(closeButton);
            
            // Create technique details container
            const detailsContainer = document.createElement('div');
            detailsContainer.id = 'technique-details-container';
            modalContent.appendChild(detailsContainer);
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Close modal when clicking outside
            window.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        // Update modal content
        const detailsContainer = document.getElementById('technique-details-container');
        
        if (detailsContainer) {
            // Clear container
            detailsContainer.innerHTML = '';
            
            // Add technique name
            const title = document.createElement('h2');
            title.textContent = technique.name;
            detailsContainer.appendChild(title);
            
            // Add category
            const category = document.createElement('div');
            category.className = 'technique-category';
            category.textContent = technique.categoryName;
            detailsContainer.appendChild(category);
            
            // Add description
            const description = document.createElement('p');
            description.className = 'technique-description';
            description.textContent = technique.description || 'No description available.';
            detailsContainer.appendChild(description);
            
            // Add aliases if available
            if (technique.aliases && technique.aliases.length > 0) {
                const aliasesSection = document.createElement('div');
                aliasesSection.className = 'technique-detail-section';
                
                const aliasesTitle = document.createElement('h4');
                aliasesTitle.textContent = 'Also Known As';
                
                const aliasesList = document.createElement('p');
                aliasesList.textContent = technique.aliases.join(', ');
                
                aliasesSection.appendChild(aliasesTitle);
                aliasesSection.appendChild(aliasesList);
                detailsContainer.appendChild(aliasesSection);
            }
            
            // Add use case if available
            if (technique.useCase) {
                const useCaseSection = document.createElement('div');
                useCaseSection.className = 'technique-detail-section';
                
                const useCaseTitle = document.createElement('h4');
                useCaseTitle.textContent = 'Use Case';
                
                const useCaseText = document.createElement('p');
                useCaseText.textContent = technique.useCase;
                
                useCaseSection.appendChild(useCaseTitle);
                useCaseSection.appendChild(useCaseText);
                detailsContainer.appendChild(useCaseSection);
            }
            
            // Add example if available
            if (technique.example) {
                const exampleSection = document.createElement('div');
                exampleSection.className = 'technique-detail-section';
                
                const exampleTitle = document.createElement('h4');
                exampleTitle.textContent = 'Example';
                
                const exampleCode = document.createElement('div');
                exampleCode.className = 'example-code';
                exampleCode.textContent = technique.example;
                
                exampleSection.appendChild(exampleTitle);
                exampleSection.appendChild(exampleCode);
                detailsContainer.appendChild(exampleSection);
            }
            
            // Add sources if available
            if (technique.sources && technique.sources.length > 0) {
                const sourcesSection = document.createElement('div');
                sourcesSection.className = 'technique-detail-section';
                
                const sourcesTitle = document.createElement('h4');
                sourcesTitle.textContent = 'Sources';
                
                const sourcesList = document.createElement('ul');
                sourcesList.className = 'sources-list';
                
                technique.sources.forEach(source => {
                    const sourceItem = document.createElement('li');
                    sourceItem.textContent = source;
                    sourcesList.appendChild(sourceItem);
                });
                
                sourcesSection.appendChild(sourcesTitle);
                sourcesSection.appendChild(sourcesList);
                detailsContainer.appendChild(sourcesSection);
            }
            
            // Add related techniques if available
            if (technique.relatedTechniques && technique.relatedTechniques.length > 0) {
                const relatedSection = document.createElement('div');
                relatedSection.className = 'technique-detail-section';
                
                const relatedTitle = document.createElement('h4');
                relatedTitle.textContent = 'Related Techniques';
                
                const relatedList = document.createElement('div');
                relatedList.className = 'related-techniques';
                
                technique.relatedTechniques.forEach(relatedId => {
                    const relatedTechnique = this.techniqueData[relatedId];
                    if (relatedTechnique) {
                        const relatedItem = document.createElement('span');
                        relatedItem.className = 'related-technique';
                        relatedItem.textContent = relatedTechnique.name;
                        relatedItem.dataset.id = relatedId;
                        
                        relatedItem.addEventListener('click', () => {
                            this.showTechniqueDetails(relatedId);
                        });
                        
                        relatedList.appendChild(relatedItem);
                    }
                });
                
                relatedSection.appendChild(relatedTitle);
                relatedSection.appendChild(relatedList);
                detailsContainer.appendChild(relatedSection);
            }
            
            // Add "Add to Prompt" button
            const addButton = document.createElement('button');
            addButton.className = 'button primary add-to-prompt-button';
            addButton.textContent = this.selectedTechniques.includes(techniqueId) ? 'Remove from Prompt' : 'Add to Prompt';
            
            addButton.addEventListener('click', () => {
                const checkbox = document.getElementById(`technique-${techniqueId}`);
                
                if (this.selectedTechniques.includes(techniqueId)) {
                    this.removeTechnique(techniqueId);
                    addButton.textContent = 'Add to Prompt';
                    if (checkbox) checkbox.checked = false;
                } else {
                    this.addTechnique(techniqueId);
                    addButton.textContent = 'Remove from Prompt';
                    if (checkbox) checkbox.checked = true;
                }
            });
            
            detailsContainer.appendChild(addButton);
        }
        
        // Show modal
        modal.style.display = 'block';
    }

    /**
     * Load saved prompts from localStorage and add to dropdown
     */
    loadSavedPrompts() {
        const promptActionsContainer = document.querySelector('.prompt-actions');
        if (!promptActionsContainer) return;
        
        // Get existing elements
        const actionsRight = document.querySelector('.prompt-actions-right');
        
        // Add event listener to save button
        const saveButton = document.getElementById('save-prompt-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveCurrentPrompt();
            });
        }
        
        // Add saved prompts dropdown if there are saved prompts
        if (this.savedPrompts.length > 0) {
            // Create or get dropdown
            let savedPromptsSelect = document.getElementById('saved-prompts-select');
            
            if (!savedPromptsSelect) {
                savedPromptsSelect = document.createElement('select');
                savedPromptsSelect.id = 'saved-prompts-select';
                savedPromptsSelect.className = 'saved-prompts-select';
                
                // Add to the DOM - insert at the beginning of prompt actions
                if (actionsRight) {
                    actionsRight.insertBefore(savedPromptsSelect, actionsRight.firstChild);
                } else {
                    promptActionsContainer.insertBefore(savedPromptsSelect, promptActionsContainer.firstChild);
                }
            }
            
            // Clear existing options
            savedPromptsSelect.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- Load saved prompt --';
            savedPromptsSelect.appendChild(defaultOption);
            
            // Add saved prompts with timestamps
            this.savedPrompts.forEach((savedPrompt, index) => {
                const option = document.createElement('option');
                option.value = index.toString();
                
                // Format timestamp if available
                let timeDisplay = '';
                if (savedPrompt.timestamp) {
                    try {
                        const date = new Date(savedPrompt.timestamp);
                        timeDisplay = ` (${date.toLocaleDateString()})`;
                    } catch (e) {
                        // Ignore date parsing errors
                    }
                }
                
                option.textContent = savedPrompt.name || `Saved Prompt ${index + 1}${timeDisplay}`;
                savedPromptsSelect.appendChild(option);
            });
            
            // Add event listener
            savedPromptsSelect.addEventListener('change', (e) => {
                const index = parseInt(e.target.value);
                if (!isNaN(index)) {
                    this.loadSavedPrompt(index);
                }
            });
        }
    }
    
    /**
     * Save current prompt to localStorage
     */
    saveCurrentPrompt() {
        const promptText = document.getElementById('prompt-preview')?.textContent;
        if (!promptText || promptText.includes("Your prompt will appear here")) return;
        
        // Prompt for name
        const promptName = prompt("Enter a name for this prompt:", "");
        if (promptName === null) return; // User canceled
        
        const newSavedPrompt = {
            name: promptName || `Saved Prompt ${this.savedPrompts.length + 1}`,
            prompt: promptText,
            techniques: [...this.selectedTechniques],
            basePrompt: this.basePrompt,
            taskDescription: this.taskDescription,
            outputFormat: this.outputFormat,
            template: this.selectedTemplate ? this.selectedTemplate.id : null,
            templateFields: {...this.currentTemplateFields},
            timestamp: new Date().toISOString()
        };
        
        this.savedPrompts.push(newSavedPrompt);
        localStorage.setItem('savedPrompts', JSON.stringify(this.savedPrompts));
        
        // Update the UI
        this.loadSavedPrompts();
        
        // Show success message
        this.showMessage('Prompt saved successfully!', 'success');
    }
    
    /**
     * Load a saved prompt
     */
    loadSavedPrompt(index) {
        if (index < 0 || index >= this.savedPrompts.length) return;
        
        const savedPrompt = this.savedPrompts[index];
        
        // Clear current selections
        this.clearPrompt();
        
        // Set template if applicable
        if (savedPrompt.template) {
            const templateSelector = document.getElementById('template-selector');
            if (templateSelector) {
                templateSelector.value = savedPrompt.template;
                this.selectTemplate(savedPrompt.template);
            }
        }
        
        // Set fields
        const basePromptElement = document.getElementById('base-prompt');
        if (basePromptElement) basePromptElement.value = savedPrompt.basePrompt || '';
        
        const taskDescriptionElement = document.getElementById('task-description');
        if (taskDescriptionElement) taskDescriptionElement.value = savedPrompt.taskDescription || '';
        
        const outputFormatElement = document.getElementById('output-format');
        if (outputFormatElement) outputFormatElement.value = savedPrompt.outputFormat || '';
        
        // Set template fields
        if (savedPrompt.templateFields) {
            this.currentTemplateFields = {...savedPrompt.templateFields};
            Object.keys(savedPrompt.templateFields).forEach(field => {
                const fieldElement = document.getElementById(`template-${field}`);
                if (fieldElement) {
                    fieldElement.value = savedPrompt.templateFields[field] || '';
                }
            });
        }
        
        // Select techniques
        savedPrompt.techniques.forEach(techniqueId => {
            const checkbox = document.getElementById(`technique-${techniqueId}`);
            if (checkbox) {
                checkbox.checked = true;
                this.addTechnique(techniqueId);
            }
        });
        
        // Update preview
        this.updatePromptPreview();
        
        // Reset dropdown
        const savedPromptsSelect = document.getElementById('saved-prompts-select');
        if (savedPromptsSelect) {
            savedPromptsSelect.value = '';
        }
    }
    
    /**
     * Show a message to the user
     */
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;
        
        // Find container to append to
        const container = document.querySelector('.prompt-builder-container') || document.body;
        container.prepend(messageElement);
        
        // Remove after delay
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }

    /**
     * Add event listeners to all interactive elements
     */
    addEventListeners() {
        // Input field change events
        const inputFields = [
            document.getElementById('task-description'),
            document.getElementById('base-prompt'),
            document.getElementById('output-format')
        ];
        
        inputFields.forEach(field => {
            if (field) {
                field.addEventListener('input', (e) => {
                    this.updatePromptPreview();
                    
                    // Enable/disable next button in step 3 based on task description
                    if (field.id === 'task-description') {
                        const nextButton = document.getElementById('next-step-3');
                        if (nextButton) {
                            nextButton.disabled = !e.target.value.trim();
                        }
                    }
                });
            }
        });
        
        // Copy button
        const copyButton = document.getElementById('copy-prompt-button');
        if (copyButton) {
            copyButton.addEventListener('click', () => {
                this.copyPromptToClipboard();
            });
        }
        
        // Clear button
        const clearButton = document.getElementById('clear-prompt-button');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                this.clearPrompt();
            });
        }
        
        // Export button
        const exportButton = document.getElementById('export-prompt-button');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                this.exportPrompt();
            });
        }
        
        // Skill level selector
        const skillLevelSelector = document.getElementById('skill-level-selector');
        if (skillLevelSelector) {
            skillLevelSelector.addEventListener('change', () => {
                this.skillLevel = skillLevelSelector.value;
                this.updatePromptPreview();
                
                // Filter techniques based on skill level
                this.filterTechniquesBySkillLevel(this.skillLevel);
            });
        }
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter or Cmd+Enter to copy to clipboard
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (copyButton && !copyButton.disabled) {
                    this.copyPromptToClipboard();
                    e.preventDefault();
                }
            }
            
            // Ctrl+S or Cmd+S to save prompt
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                this.saveCurrentPrompt();
                e.preventDefault();
            }
            
            // Escape to close any open modals
            if (e.key === 'Escape') {
                const modal = document.getElementById('technique-detail-modal');
                if (modal && modal.style.display === 'block') {
                    modal.style.display = 'none';
                }
            }
        });
        
        // Add listeners to example tabs and buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                button.classList.add('active');
                const tabId = `${button.dataset.tab}-tab`;
                document.getElementById(tabId)?.classList.add('active');
            });
        });
    }
    
    /**
     * Filter techniques based on skill level
     * @param {string} skillLevel - Beginner, intermediate, or advanced
     */
    filterTechniquesBySkillLevel(skillLevel) {
        // Get all technique items
        const techniqueItems = document.querySelectorAll('.technique-selector-item');
        
        if (techniqueItems.length === 0) return;
        
        // Get basic techniques that are suitable for beginners
        const beginnerTechniques = [
            'basic-prompting', 'zero-shot-learning', 'one-shot-learning',
            'few-shot-learning', 'role-prompting', 'instructed-prompting'
        ];
        
        // Get advanced techniques
        const advancedTechniques = [
            'tree-of-thoughts', 'react', 'agent-based-prompting',
            'self-consistency', 'tool-use-agents', 'self-verification'
        ];
        
        // For each technique, show/hide based on skill level
        techniqueItems.forEach(item => {
            const techniqueId = item.dataset.id;
            
            if (skillLevel === 'beginner') {
                // Show only beginner-friendly techniques
                item.style.display = beginnerTechniques.includes(techniqueId) ? 'flex' : 'none';
            } else if (skillLevel === 'intermediate') {
                // Show all except the most advanced techniques
                item.style.display = advancedTechniques.includes(techniqueId) ? 'none' : 'flex';
            } else {
                // Show all techniques for advanced users
                item.style.display = 'flex';
            }
        });
    }
    
    /**
     * Export prompt to a file
     */
    exportPrompt() {
        const promptText = document.getElementById('prompt-preview')?.textContent;
        if (!promptText || promptText.includes("Your prompt will appear here")) return;
        
        // Create export data
        const exportData = {
            prompt: promptText,
            techniques: this.selectedTechniques.map(id => {
                const technique = this.techniqueData[id];
                return {
                    id,
                    name: technique?.name,
                    description: technique?.description
                };
            }),
            basePrompt: this.basePrompt,
            taskDescription: this.taskDescription,
            outputFormat: this.outputFormat,
            template: this.selectedTemplate ? {
                id: this.selectedTemplate.id,
                name: this.selectedTemplate.name
            } : null,
            templateFields: this.currentTemplateFields,
            metadata: {
                timestamp: new Date().toISOString(),
                version: "1.0",
                tokenEstimate: Math.ceil(promptText.length / 4)
            }
        };
        
        // Create download link
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "prompt-export.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    /**
     * Copy the generated prompt to clipboard
     */
    copyPromptToClipboard() {
        // Use the stored raw text version instead of getting textContent from the DOM
        // This ensures we don't copy any HTML formatting tags
        const promptText = this.rawPromptText;
        
        if (promptText && !promptText.includes("Your prompt will appear here")) {
            navigator.clipboard.writeText(promptText)
                .then(() => {
                    // Show success message
                    const copyButton = document.getElementById('copy-prompt-button');
                    if (copyButton) {
                        const originalText = copyButton.textContent;
                        copyButton.textContent = 'Copied!';
                        
                        setTimeout(() => {
                            copyButton.textContent = originalText;
                        }, 2000);
                    }
                })
                .catch(error => {
                    console.error('Error copying to clipboard:', error);
                });
        }
    }

    /**
     * Clear the prompt (deselect all techniques and clear inputs)
     */
    clearPrompt() {
        // Clear selected techniques
        this.selectedTechniques = [];
        
        // Clear template
        const templateSelector = document.getElementById('template-selector');
        if (templateSelector) {
            templateSelector.value = '';
            this.selectTemplate('');
        }
        
        // Uncheck all checkboxes
        document.querySelectorAll('#technique-selector input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear input fields
        const taskDescription = document.getElementById('task-description');
        if (taskDescription) taskDescription.value = '';
        
        const basePrompt = document.getElementById('base-prompt');
        if (basePrompt) basePrompt.value = '';
        
        const outputFormat = document.getElementById('output-format');
        if (outputFormat) outputFormat.value = '';
        
        // Reset skill level
        const skillLevelSelector = document.getElementById('skill-level-selector');
        if (skillLevelSelector) skillLevelSelector.value = 'intermediate';
        this.skillLevel = 'intermediate';
        
        // Clear template fields
        this.currentTemplateFields = {};
        
        // Update UI
        this.updateSelectedTechniques();
        this.updatePromptPreview();
        
        // Remove suggestions
        document.getElementById('suggestions-container')?.remove();
        
        // Go to step 1
        this.goToStep(1);
        
        // Disable next buttons
        document.getElementById('next-step-1')?.setAttribute('disabled', 'disabled');
        document.getElementById('next-step-3')?.setAttribute('disabled', 'disabled');
    }

    /**
     * Show error message
     */
    showError(message) {
        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${message}</p>`;
        
        // Find container to append to
        const container = document.querySelector('.prompt-builder-container') || document.body;
        container.prepend(errorElement);
        
        // Remove after delay
        setTimeout(() => {
            errorElement.remove();
        }, 5000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const promptBuilder = new PromptBuilder();
    promptBuilder.init();
});