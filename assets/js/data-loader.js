/**
 * Data Loader for Prompt Engineering Taxonomy
 * Handles loading and displaying technique data
 */

class TaxonomyDataLoader {
    constructor() {
        this.categoriesData = null;
        this.techniquesData = null;
        this.currentView = 'cards'; // Default view: 'cards' or 'list'
        this.currentCategory = null; // Selected category
        this.searchTerm = ''; // Current search term
        // Removed activeCardIndex property as we're showing all cards at once
    }

    /**
     * Initialize the data loader
     */
    // Synchronous init, no async/fetch needed
    init() {
        try {
            // Load hardcoded data
            this.loadData();

            // Initialize UI components
            this.initSearch();
            this.initCategoryButtons();
            this.initViewToggle();
            this.initModalHandlers();

            // Display all techniques initially
            this.displayTechniques();

            // Update URL based on initial state
            this.updateURLFromState();

            // Listen for URL changes (history navigation)
            window.addEventListener('popstate', this.handleURLChange.bind(this));
        } catch (error) {
            console.error('Error initializing taxonomy data:', error);
            this.showError('Failed to load taxonomy data. Please try refreshing the page.');
        }
    }

    /**
     * Load techniques and categories data from JSON files
     */
    // Synchronous, hardcoded data loader
    loadData() {
        // --- Hardcoded representative taxonomy data ---
        // === Expanded categories and techniques for full taxonomy ===
        this.categoriesData = {
            categories: [
                { id: "basic-concepts", name: "Basic Concepts" },
                { id: "reasoning-frameworks", name: "Reasoning Frameworks" },
                { id: "agent-tool-use", name: "Agent & Tool Use" },
                { id: "self-improvement", name: "Self-Improvement" },
                { id: "retrieval-augmentation", name: "Retrieval & Augmentation" },
                { id: "prompt-optimization", name: "Prompt Optimization" },
                { id: "multimodal-techniques", name: "Multimodal Techniques" },
                { id: "specialized-application", name: "Specialized Applications" }
            ]
        };

        this.techniquesData = {
            categories: [
                {
                    id: "basic-concepts",
                    techniques: [
                        {
                            id: "zero_shot",
                            name: "Zero-Shot Prompting",
                            description: "Ask the model to perform a task without providing examples.",
                            aliases: ["Zero Shot", "0S", "No Example Prompting"],
                            sources: ["Brown et al. (2020)", "OpenAI Cookbook"],
                            relatedTechniques: ["few_shot", "basic_prompting"],
                            example: "Translate 'Hello' to French.",
                            useCase: "General-purpose tasks where examples are not available."
                        },
                        {
                            id: "few_shot",
                            name: "Few-Shot Prompting",
                            description: "Provide a few examples in the prompt to guide the model.",
                            aliases: ["Few Shot", "FS"],
                            sources: ["Brown et al. (2020)"],
                            relatedTechniques: ["zero_shot", "chain_of_thought"],
                            example: "Translate 'Hello' to French: Bonjour. Translate 'Goodbye' to French:",
                            useCase: "Tasks where a small number of examples can clarify intent."
                        },
                        {
                            id: "one_shot",
                            name: "One-Shot Prompting",
                            description: "Provide exactly one demonstration in the prompt.",
                            aliases: ["1S", "Single Example"],
                            sources: ["Brown et al. (2020)"],
                            relatedTechniques: ["few_shot", "zero_shot"],
                            example: "Translate 'Good morning' to Spanish: Buenos días.",
                            useCase: "When a single example is sufficient to clarify the task."
                        },
                        {
                            id: "basic_prompting",
                            name: "Basic Prompting",
                            description: "The simplest form, usually instruction + input, without exemplars or complex reasoning steps.",
                            aliases: ["Standard Prompting", "Vanilla Prompting"],
                            sources: ["Wei et al. (2022)"],
                            relatedTechniques: ["zero_shot"],
                            example: "Summarize the following text.",
                            useCase: "Direct tasks with clear instructions."
                        },
                        {
                            id: "in_context_learning",
                            name: "In-Context Learning (ICL)",
                            description: "LLM ability to learn from demonstrations/instructions within the prompt at inference time.",
                            aliases: ["ICL"],
                            sources: ["Brown et al. (2020)"],
                            relatedTechniques: ["few_shot", "zero_shot"],
                            example: "Given several Q&A pairs, answer a new question.",
                            useCase: "Adapting to new tasks without retraining."
                        }
                    ]
                },
                {
                    id: "reasoning-frameworks",
                    techniques: [
                        {
                            id: "chain_of_thought",
                            name: "Chain-of-Thought (CoT) Prompting",
                            description: "Eliciting step-by-step reasoning before the final answer, usually via few-shot exemplars.",
                            aliases: ["CoT", "Step-by-step Reasoning"],
                            sources: ["Wei et al. (2022)", "Schulhoff et al."],
                            relatedTechniques: ["few_shot", "zero_shot_cot"],
                            example: "Q: If there are 3 cars and each car has 4 wheels, how many wheels? A: Let's think step by step...",
                            useCase: "Complex reasoning or multi-step problems.",
                            tips: "Provide clear, detailed reasoning steps in your examples. Break down complex problems into smaller, logical steps. Use natural language that matches how humans reason through problems.",
                            commonMistakes: "Skipping intermediate steps in reasoning chains. Using overly complex examples that confuse the model. Not adapting the reasoning style to the specific problem domain."
                        },
                        {
                            id: "zero_shot_cot",
                            name: "Zero-Shot CoT",
                            description: "Appends a thought-inducing phrase to a zero-shot prompt to elicit reasoning.",
                            aliases: ["Zero-Shot Chain-of-Thought"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["chain_of_thought", "zero_shot"],
                            example: "Q: What is 17 + 25? A: Let's think step by step.",
                            useCase: "Encouraging reasoning without exemplars."
                        },
                        {
                            id: "least_to_most",
                            name: "Least-to-Most Prompting",
                            description: "Decompose a problem into subproblems and solve sequentially.",
                            aliases: ["Decomposition Prompting"],
                            sources: ["Zhou et al.", "Schulhoff et al."],
                            relatedTechniques: ["chain_of_thought"],
                            example: "Break a math problem into smaller steps and solve each.",
                            useCase: "Complex tasks requiring decomposition."
                        },
                        {
                            id: "self_ask",
                            name: "Self-Ask",
                            description: "Model decides if follow-up questions are needed, asks/answers them, then gives the final answer.",
                            aliases: ["Self-Questioning"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["chain_of_thought"],
                            example: "Q: What is the capital of the country with the largest population in Africa? A: Let's find the country first...",
                            useCase: "Multi-hop or compositional questions."
                        },
                        {
                            id: "maieutic_prompting",
                            name: "Maieutic Prompting",
                            description: "Elicits consistent reasoning via recursive explanations and contradiction elimination.",
                            aliases: ["Recursive Explanation"],
                            sources: ["Vatsal & Dubey"],
                            relatedTechniques: ["chain_of_thought"],
                            example: "Explain your answer, then explain why that explanation is correct.",
                            useCase: "Ensuring answer consistency."
                        }
                    ]
                },
                {
                    id: "agent-tool-use",
                    techniques: [
                        {
                            id: "react",
                            name: "ReAct (Reason + Act)",
                            description: "Agent interleaves reasoning, action, and observation steps to solve tasks.",
                            aliases: ["Reason+Act"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["act", "tool_use_agents"],
                            example: "Thought: I need to search for X. Action: Search[X]. Observation: ...",
                            useCase: "Tasks requiring tool use or external actions.",
                            tips: "Clearly separate the Thought, Action, and Observation steps. Be explicit about which tools are available. Encourage the model to reflect on observations before taking new actions.",
                            commonMistakes: "Not providing enough context about available tools. Allowing the model to skip the reasoning step. Failing to incorporate observations into subsequent reasoning."
                        },
                        {
                            id: "tool_use_agents",
                            name: "Tool Use Agents",
                            description: "Agents that use external tools via prompts.",
                            aliases: ["External Tool Use"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["react"],
                            example: "Prompting an LLM to use a calculator API.",
                            useCase: "Complex tasks needing external resources."
                        },
                        {
                            id: "agent_based_prompting",
                            name: "Agent-based Prompting",
                            description: "Using GenAI systems that employ tools, environments, memory, or planning via prompts.",
                            aliases: ["Agent Prompting"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["tool_use_agents"],
                            example: "Prompting an LLM to plan and execute a multi-step workflow.",
                            useCase: "Autonomous or semi-autonomous task execution."
                        },
                        {
                            id: "program_aided_language_model",
                            name: "PAL (Program-Aided Language Model)",
                            description: "Generate code, execute it, and use the result in reasoning.",
                            aliases: ["PAL"],
                            sources: ["Vatsal & Dubey"],
                            relatedTechniques: ["react"],
                            example: "Generate Python code to solve a math problem, then use the output.",
                            useCase: "Tasks requiring computation or code execution."
                        },
                        {
                            id: "critiq",
                            name: "CRITIC (Self-Correcting with Tool-Interactive Critiquing)",
                            description: "Agent generates a response, criticizes it, and uses tools to verify/amend.",
                            aliases: ["Self-Correcting Agent"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["react"],
                            example: "Generate an answer, then use a search tool to check and revise.",
                            useCase: "Fact-checking and iterative improvement."
                        }
                    ]
                },
                {
                    id: "self-improvement",
                    techniques: [
                        {
                            id: "self_consistency",
                            name: "Self-Consistency",
                            description: "Sample multiple reasoning paths and use majority vote for the final answer.",
                            aliases: ["Majority Vote Reasoning"],
                            sources: ["Wang et al.", "Schulhoff et al."],
                            relatedTechniques: ["chain_of_thought"],
                            example: "Generate several solutions, then select the most common answer.",
                            useCase: "Reducing errors in complex reasoning."
                        },
                        {
                            id: "self_refine",
                            name: "Self-Refine",
                            description: "Iterative: generate, receive feedback, and improve the output.",
                            aliases: ["Iterative Refinement"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["self_consistency"],
                            example: "Write an answer, critique it, and revise.",
                            useCase: "Improving output quality through iteration."
                        },
                        {
                            id: "self_critique",
                            name: "Self-Critique",
                            description: "Model evaluates and improves its own output.",
                            aliases: ["Self-Reflection"],
                            sources: ["Schulhoff et al.", "Ridnik et al."],
                            relatedTechniques: ["self_refine"],
                            example: "After answering, the model explains what could be improved.",
                            useCase: "Self-improvement and error correction."
                        },
                        {
                            id: "self_ask_improvement",
                            name: "Self-Ask (Improvement)",
                            description: "Model asks itself clarifying questions to improve its answer.",
                            aliases: ["Self-Questioning Improvement"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["self_ask"],
                            example: "Q: What is the best way to solve this? A: Let me clarify...",
                            useCase: "Complex or ambiguous tasks."
                        },
                        {
                            id: "self_instruct",
                            name: "Self-Instruct",
                            description: "Model generates instruction-following data using bootstrapping.",
                            aliases: ["Instruction Bootstrapping"],
                            sources: ["Liu et al. - LogiCoT"],
                            relatedTechniques: ["self_refine"],
                            example: "Generate new instructions and train on them.",
                            useCase: "Expanding instruction datasets."
                        },
                        {
                            id: "recursive_self_improvement",
                            name: "Recursive Self-Improvement",
                            description: "Model iteratively improves its own outputs through multiple rounds of self-critique and refinement.",
                            aliases: ["Iterative Self-Enhancement", "Recursive Refinement"],
                            sources: ["Huang et al. (2023)", "Madaan et al. (2023)"],
                            relatedTechniques: ["self_refine", "self_critique"],
                            example: "Generate solution → Critique solution → Improve solution → Critique again → Final solution",
                            useCase: "Complex problem-solving requiring multiple refinement iterations.",
                            tips: "Start with a clear evaluation criteria. Limit the number of iterations to prevent circular reasoning. Use different prompting strategies for the critique vs. improvement phases.",
                            commonMistakes: "Allowing too many iterations leading to verbosity. Not providing clear enough critique criteria. Failing to preserve important elements from earlier iterations."
                        }
                    ]
                },
                {
                    id: "retrieval-augmentation",
                    techniques: [
                        {
                            id: "rag",
                            name: "RAG (Retrieval Augmented Generation)",
                            description: "Retrieve external information and add it to the prompt context.",
                            aliases: ["Retrieval-Augmented Generation"],
                            sources: ["Lewis et al.", "Schulhoff et al."],
                            relatedTechniques: ["retrieval_with_reference"],
                            example: "Retrieve relevant documents before answering a question.",
                            useCase: "Tasks requiring up-to-date or external knowledge.",
                            tips: "Use high-quality, diverse knowledge sources. Implement effective chunking strategies for long documents. Consider hybrid retrieval methods combining semantic and keyword search.",
                            commonMistakes: "Retrieving too much irrelevant information that dilutes the context. Not properly attributing sources in the generated output. Using outdated or unreliable knowledge sources."
                        },
                        {
                            id: "retrieval_with_reference",
                            name: "Retrieval with Reference",
                            description: "Oracle retrieval using the reference completion to guide context retrieval.",
                            aliases: ["Reference-Guided Retrieval"],
                            sources: ["Ding et al."],
                            relatedTechniques: ["rag"],
                            example: "Use the correct answer to find the most relevant context.",
                            useCase: "Improving retrieval accuracy."
                        },
                        {
                            id: "parc",
                            name: "PARC (Prompts Augmented by Retrieval Cross-lingually)",
                            description: "Retrieve high-resource exemplars for low-resource multilingual ICL.",
                            aliases: ["Cross-lingual Retrieval"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["rag"],
                            example: "Find English examples to help with a low-resource language task.",
                            useCase: "Multilingual prompt augmentation."
                        },
                        {
                            id: "flare",
                            name: "FLARE (Iterative Retrieval Augmentation)",
                            description: "Perform multiple retrievals during generation.",
                            aliases: ["Iterative Retrieval"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["rag"],
                            example: "Retrieve new context at each step of generation.",
                            useCase: "Complex, multi-step tasks."
                        },
                        {
                            id: "prompt_chaining",
                            name: "Prompt Chaining",
                            description: "Sequentially linking prompt outputs/inputs.",
                            aliases: ["Chained Prompts"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["rag"],
                            example: "Use the output of one prompt as the input to the next.",
                            useCase: "Multi-stage workflows."
                        },
                        {
                            id: "hypothetical_document_embeddings",
                            name: "Hypothetical Document Embeddings (HyDE)",
                            description: "Generate a hypothetical document that would answer a query, then use its embedding for retrieval.",
                            aliases: ["HyDE", "Synthetic Document Retrieval"],
                            sources: ["Gao et al. (2022)", "Pradeep et al. (2023)"],
                            relatedTechniques: ["rag", "retrieval_with_reference"],
                            example: "Query: 'How do vaccines work?' → Generate hypothetical answer → Embed this answer → Retrieve similar real documents",
                            useCase: "Improving retrieval for complex or abstract queries where direct keyword matching fails.",
                            tips: "Generate multiple hypothetical documents for diverse retrieval. Use a strong LLM for generating the hypothetical documents. Combine with traditional retrieval methods for best results.",
                            commonMistakes: "Generating overly specific hypothetical documents that narrow retrieval too much. Not filtering out low-quality retrieved documents. Relying solely on HyDE without traditional retrieval as backup."
                        }
                    ]
                },
                {
                    id: "prompt-optimization",
                    techniques: [
                        {
                            id: "ape",
                            name: "APE (Automatic Prompt Engineer)",
                            description: "Framework using an LLM to automatically generate and select effective instructions.",
                            aliases: ["Automatic Prompt Engineering"],
                            sources: ["Zhou et al."],
                            relatedTechniques: ["prompt_optimization"],
                            example: "Generate and score multiple prompt candidates.",
                            useCase: "Automating prompt design."
                        },
                        {
                            id: "apo",
                            name: "Automated Prompt Optimization (APO)",
                            description: "Field of using automated techniques to find optimal prompts.",
                            aliases: ["Prompt Optimization"],
                            sources: ["Ramnath et al.", "Li et al."],
                            relatedTechniques: ["ape"],
                            example: "Use algorithms to optimize prompt wording.",
                            useCase: "Improving prompt effectiveness."
                        },
                        {
                            id: "ensemble_methods",
                            name: "Ensemble Methods (APO)",
                            description: "Generate multiple prompts and combine their outputs.",
                            aliases: ["Prompt Ensembling"],
                            sources: ["Ramnath et al."],
                            relatedTechniques: ["apo"],
                            example: "Run several prompts and aggregate the results.",
                            useCase: "Boosting accuracy and robustness."
                        },
                        {
                            id: "prompt_paraphrasing",
                            name: "Prompt Paraphrasing",
                            description: "Generate prompt variations via rephrasing.",
                            aliases: ["Prompt Variation"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["apo"],
                            example: "Reword a prompt in several ways to find the best.",
                            useCase: "Exploring prompt diversity."
                        },
                        {
                            id: "prefix_tuning",
                            name: "Prefix-Tuning",
                            description: "Soft prompting by adding trainable vectors to the prefix.",
                            aliases: ["Soft Prompt Tuning"],
                            sources: ["Ye et al.", "Schulhoff et al."],
                            relatedTechniques: ["apo"],
                            example: "Optimize a continuous prompt prefix for a task.",
                            useCase: "Fine-tuning prompts for specific models."
                        },
                        {
                            id: "directional_stimulus_prompting",
                            name: "Directional Stimulus Prompting",
                            description: "Guide model outputs by providing directional cues that steer generation toward desired attributes.",
                            aliases: ["DSP", "Steering Prompts"],
                            sources: ["Li et al. (2023)", "Khattab et al. (2023)"],
                            relatedTechniques: ["apo", "prompt_paraphrasing"],
                            example: "To make text more formal: 'Write a response that is professional, uses sophisticated vocabulary, and avoids colloquialisms.'",
                            useCase: "Controlling style, tone, complexity, or other qualitative aspects of generated content.",
                            tips: "Use concrete, specific directions rather than vague instructions. Combine multiple steering cues for more precise control. Test different phrasings to find optimal directional language.",
                            commonMistakes: "Using contradictory directions that confuse the model. Being too vague in directional cues. Overloading with too many steering attributes at once."
                        }
                    ]
                },
                {
                    id: "multimodal-techniques",
                    techniques: [
                        {
                            id: "image_prompting",
                            name: "Image Prompting",
                            description: "Prompting techniques involving image input or output.",
                            aliases: ["Visual Prompting"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["multimodal_chain_of_thought"],
                            example: "Describe an image and ask the model to generate a caption.",
                            useCase: "Vision-language tasks.",
                            tips: "Be specific about what aspects of the image to focus on. Use clear, detailed language when describing visual elements. Combine with text prompts for more precise outputs.",
                            commonMistakes: "Being too vague in image descriptions or requests. Not considering the model's visual capabilities and limitations. Failing to provide context for ambiguous visual elements."
                        },
                        {
                            id: "audio_prompting",
                            name: "Audio Prompting",
                            description: "Prompting techniques for or involving audio data.",
                            aliases: ["Speech Prompting"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["multimodal_chain_of_thought"],
                            example: "Provide an audio clip and ask for a transcript.",
                            useCase: "Speech-to-text and audio analysis."
                        },
                        {
                            id: "multimodal_chain_of_thought",
                            name: "Multimodal Chain-of-Thought",
                            description: "CoT involving non-text modalities.",
                            aliases: ["Multimodal CoT"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["chain_of_thought"],
                            example: "Reason about an image and text together.",
                            useCase: "Complex multimodal reasoning."
                        },
                        {
                            id: "chain_of_images",
                            name: "Chain-of-Images (CoI)",
                            description: "Multimodal CoT generating images as intermediate steps.",
                            aliases: ["CoI"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["multimodal_chain_of_thought"],
                            example: "Generate a sequence of images to explain a process.",
                            useCase: "Stepwise visual explanations."
                        },
                        {
                            id: "video_prompting",
                            name: "Video Prompting",
                            description: "Prompting techniques for or involving video data.",
                            aliases: ["Video Generation Prompting"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["image_prompting"],
                            example: "Provide a video and ask for a summary.",
                            useCase: "Video analysis and summarization."
                        },
                        {
                            id: "visual_reasoning_prompting",
                            name: "Visual Reasoning Prompting",
                            description: "Techniques that guide multimodal models through explicit visual reasoning steps.",
                            aliases: ["Visual CoT", "Visual Step-by-Step Reasoning"],
                            sources: ["Zhang et al. (2023)", "Alayrac et al. (2022)"],
                            relatedTechniques: ["multimodal_chain_of_thought", "image_prompting"],
                            example: "For this image, first identify all objects, then analyze their spatial relationships, and finally determine which object is anomalous.",
                            useCase: "Complex visual tasks requiring multi-step reasoning or detailed analysis.",
                            tips: "Break down visual analysis into clear sequential steps. Reference specific regions or elements in the image. Combine with text-based reasoning for complex tasks.",
                            commonMistakes: "Not providing enough guidance on what visual elements to focus on. Assuming the model can identify all visual details without specific prompting. Failing to connect visual observations to reasoning steps."
                        }
                    ]
                },
                {
                    id: "specialized-application",
                    techniques: [
                        {
                            id: "code_generation_agents",
                            name: "Code Generation Agents",
                            description: "Agents specialized in code generation.",
                            aliases: ["Code-Based Agents"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["agent_tool_use"],
                            example: "Prompting an LLM to write and debug code.",
                            useCase: "Automated programming tasks."
                        },
                        {
                            id: "bias_mitigation",
                            name: "Bias Mitigation",
                            description: "Selecting few-shot exemplars with a balanced distribution of attributes/labels.",
                            aliases: ["Balanced Demonstrations"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["few_shot"],
                            example: "Choose examples to avoid gender or racial bias.",
                            useCase: "Fairness in model outputs."
                        },
                        {
                            id: "security_detectors",
                            name: "Detectors (Security)",
                            description: "Tools designed to detect malicious inputs or prompt hacking attempts.",
                            aliases: ["Prompt Hacking Detection"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["prompt_hacking"],
                            example: "Detect if a prompt tries to jailbreak the model.",
                            useCase: "Securing LLM applications."
                        },
                        {
                            id: "prompt_hacking",
                            name: "Prompt Hacking",
                            description: "Malicious manipulation of prompts.",
                            aliases: ["Jailbreaking", "Prompt Injection"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["security_detectors"],
                            example: "Trick the model into ignoring instructions.",
                            useCase: "Security research and defense.",
                            tips: "Implement input validation and sanitization. Use system prompts that are resistant to manipulation. Regularly test with adversarial inputs to identify vulnerabilities.",
                            commonMistakes: "Relying solely on model-based defenses. Not considering indirect prompt injection vectors. Assuming that model updates automatically fix security issues."
                        },
                        {
                            id: "domain_specific_prompting",
                            name: "Domain-Specific Prompting",
                            description: "Techniques optimized for specific domains or applications.",
                            aliases: ["Specialized Prompting"],
                            sources: ["Schulhoff et al."],
                            relatedTechniques: ["basic_prompting"],
                            example: "Medical, legal, or scientific prompt templates.",
                            useCase: "Expert-level or regulated tasks."
                        },
                        {
                            id: "red_teaming",
                            name: "Red Teaming",
                            description: "Systematic adversarial testing to identify and mitigate harmful, biased, or manipulative outputs.",
                            aliases: ["Adversarial Testing", "Security Probing"],
                            sources: ["Ganguli et al. (2022)", "Perez et al. (2022)"],
                            relatedTechniques: ["prompt_hacking", "security_detectors"],
                            example: "Probe a model with carefully crafted inputs designed to elicit harmful responses, then use findings to improve safety measures.",
                            useCase: "Evaluating and improving model safety, identifying vulnerabilities in prompt guardrails.",
                            tips: "Use diverse testing strategies across multiple dimensions (e.g., harmfulness, bias, manipulation). Document all successful attacks for systematic improvement. Combine automated and human-led testing approaches.",
                            commonMistakes: "Testing only obvious attack vectors. Not updating red teaming strategies as models improve. Focusing solely on jailbreaking without considering subtle biases or manipulations."
                        }
                    ]
                }
            ]
        };

        // Check if URL contains search or category parameters
        this.loadStateFromURL();
    }

    /**
     * Initialize search functionality
     */
    initSearch() {
        const searchInput = document.getElementById('technique-search');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.trim().toLowerCase();
            this.displayTechniques();
            this.updateURLFromState();
            
            // Show/hide clear button
            const clearButton = document.querySelector('.clear-search');
            if (clearButton) {
                clearButton.style.display = this.searchTerm ? 'block' : 'none';
            }
        });
        
        // Clear search button
        const clearButton = document.querySelector('.clear-search');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                this.searchTerm = '';
                this.displayTechniques();
                this.updateURLFromState();
                clearButton.style.display = 'none';
            });
        }
    }

    /**
     * Initialize category filter buttons
     */
    /**
     * Initialize category filter buttons.
     * Ensures that filter buttons' data-category attributes match the category IDs in categoriesData.
     * If a mismatch is detected, a warning is logged to the console.
     */
    initCategoryButtons() {
        const categoryButtons = document.querySelectorAll('.category-button');
        if (categoryButtons.length === 0) return;

        // Build a set of valid category IDs from the loaded data
        const validCategoryIds = new Set(
            (this.categoriesData?.categories || []).map(cat => cat.id)
        );

        // Check for mismatches between button data-category and known category IDs
        categoryButtons.forEach(btn => {
            if (!validCategoryIds.has(btn.dataset.category)) {
                console.warn(
                    `[TaxonomyDataLoader] Category button with data-category="${btn.dataset.category}" does not match any known category ID.`
                );
            }
        });

        // Helper to update active class on all buttons
        const updateActiveCategoryButtons = () => {
            categoryButtons.forEach(btn => {
                if (btn.dataset.category === this.currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        };

        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Toggle current selection
                if (button.dataset.category === this.currentCategory) {
                    this.currentCategory = null; // Deselect
                } else {
                    this.currentCategory = button.dataset.category;
                }
                updateActiveCategoryButtons();
                this.displayTechniques();
                this.updateURLFromState();
            });
        });

        // Set initial active state based on currentCategory
        updateActiveCategoryButtons();

        // Reset filters button
        const resetFiltersButton = document.getElementById('reset-filters');
        if (resetFiltersButton) {
            resetFiltersButton.addEventListener('click', () => {
                // Clear search
                const searchInput = document.getElementById('technique-search');
                if (searchInput) searchInput.value = '';
                this.searchTerm = '';

                // Clear category selection
                this.currentCategory = null;
                updateActiveCategoryButtons();

                this.displayTechniques();
                this.updateURLFromState();

                const clearButton = document.querySelector('.clear-search');
                if (clearButton) clearButton.style.display = 'none';
            });
        }
    }

    /**
     * Initialize view toggle (cards/list)
     */
    initViewToggle() {
        const cardViewButton = document.getElementById('card-view-toggle');
        const listViewButton = document.getElementById('list-view-toggle');
        
        if (!cardViewButton || !listViewButton) return;
        
        // Set initial state
        if (this.currentView === 'cards') {
            cardViewButton.classList.add('active');
        } else {
            listViewButton.classList.add('active');
        }
        
        // Card view toggle
        cardViewButton.addEventListener('click', () => {
            this.currentView = 'cards';
            cardViewButton.classList.add('active');
            listViewButton.classList.remove('active');
            this.displayTechniques();
        });
        
        // List view toggle
        listViewButton.addEventListener('click', () => {
            this.currentView = 'list';
            listViewButton.classList.add('active');
            cardViewButton.classList.remove('active');
            this.displayTechniques();
        });
    }

    /**
     * Initialize modal handlers for technique details
     */
    initModalHandlers() {
        const modal = document.getElementById('technique-modal');
        if (!modal) return;
        
        // Close button
        const closeButton = modal.querySelector('.close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        // Close when clicking outside the modal
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Close on escape key
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    /**
     * Get filtered techniques based on current search and category
     */
    getFilteredTechniques() {
        if (!this.techniquesData || !this.categoriesData) return [];
        
        let filteredTechniques = [];
        
        // Start by filtering techniques
        this.categoriesData.categories.forEach(category => {
            // If a category is selected and doesn't match, skip
            if (this.currentCategory && this.currentCategory !== category.id) {
                return;
            }
            
            // Find the corresponding techniques in the techniques data
            const categoryInTechData = this.techniquesData.categories.find(c => c.id === category.id);
            if (!categoryInTechData) return;
            
            // Add techniques from this category
            categoryInTechData.techniques.forEach(technique => {
                // Apply search filter if search term exists
                if (this.searchTerm) {
                    // Search in name, description, and aliases
                    const nameMatch = technique.name.toLowerCase().includes(this.searchTerm);
                    const descMatch = technique.description?.toLowerCase().includes(this.searchTerm);
                    const aliasMatch = technique.aliases?.some(alias => 
                        alias.toLowerCase().includes(this.searchTerm)
                    );
                    
                    if (!(nameMatch || descMatch || aliasMatch)) {
                        return;
                    }
                }
                
                // Add category information to the technique
                filteredTechniques.push({
                    ...technique,
                    categoryId: category.id,
                    categoryName: category.name
                });
            });
        });
        
        return filteredTechniques;
    }

    /**
     * Display techniques based on current filters and view
     */
    /**
     * Display techniques based on current filters and view.
     */
    displayTechniques() {
        const techniquesContainer = document.getElementById('techniques-container');
        if (!techniquesContainer) return;

        // Get filtered techniques
        const filteredTechniques = this.getFilteredTechniques();

        // Show no results message if no techniques found
        if (filteredTechniques.length === 0) {
            techniquesContainer.innerHTML = `
                <div class="no-results">
                    <p>No techniques found matching your criteria.</p>
                    <button id="reset-filters">Reset Filters</button>
                </div>
            `;

            // Attach event listener to the newly created reset button
            const resetButton = document.getElementById('reset-filters');
            if (resetButton) {
                resetButton.addEventListener('click', () => {
                    // Clear search
                    const searchInput = document.getElementById('technique-search');
                    if (searchInput) searchInput.value = '';
                    this.searchTerm = '';

                    // Clear category selection
                    document.querySelectorAll('.category-button').forEach(btn =>
                        btn.classList.remove('active')
                    );
                    this.currentCategory = null;

                    this.displayTechniques();
                    this.updateURLFromState();
                });
            }

            return;
        }

        // Clear container
        techniquesContainer.innerHTML = '';

        // Add appropriate class for view type
        techniquesContainer.className = this.currentView === 'cards' ? 'cards-view' : 'list-view';

        // Render techniques based on view type
        if (this.currentView === 'cards') {
            this.renderCardsView(techniquesContainer, filteredTechniques);
        } else {
            this.renderListView(techniquesContainer, filteredTechniques);
        }

        // Add click handlers to technique items
        this.addTechniqueClickHandlers();
    }

    /**
     * Render techniques in cards view
     */
    /**
     * Render techniques in cards view
     * @param {HTMLElement} container
     * @param {Array} techniques
     */
    renderCardsView(container, techniques) {
        // If no cards, nothing to render
        if (techniques.length === 0) return;

        // Render all cards at once (original behavior)
        techniques.forEach(technique => {
            const card = document.createElement('div');
            card.className = 'technique-card';
            card.dataset.id = technique.id;

            // Get icon based on category
            const iconClass = this.getCategoryIcon(technique.categoryId);
            
            // Prepare mini-lesson content if available
            const whenToUse = technique.useCase ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-lightbulb"></i> When to Use</h4>
                    <div class="when-to-use">${technique.useCase}</div>
                </div>
            ` : '';
            
            const example = technique.example ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-code"></i> Example</h4>
                    <div class="example-block">${technique.example}</div>
                </div>
            ` : '';
            
            // Add tips and common mistakes if they exist in the technique data
            const tips = technique.tips ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-check-circle"></i> Tips</h4>
                    <div class="tips-block">${technique.tips}</div>
                </div>
            ` : '';
            
            const mistakes = technique.commonMistakes ? `
                <div class="mini-lesson-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Common Mistakes</h4>
                    <div class="common-mistakes">${technique.commonMistakes}</div>
                </div>
            ` : '';

            card.innerHTML = `
                <div class="card-content">
                    <span class="category-tag">${technique.categoryName}</span>
                    <h3>
                        <div class="technique-icon"><i class="${iconClass}"></i></div>
                        ${technique.name}
                    </h3>
                    <p>${this.truncateText(technique.description, 120)}</p>
                    ${whenToUse}
                    ${example}
                    ${tips}
                    ${mistakes}
                    ${technique.sources ? `
                    <div class="sources">
                        Sources: ${technique.sources.join(', ')}
                    </div>` : ''}
                </div>
            `;

            container.appendChild(card);
            
            // Add click handler directly to each card
            card.addEventListener('click', () => {
                this.showTechniqueDetails(technique.id);
            });
        });

        // Remove any keyboard navigation handlers from previous renders
        if (this._cardNavKeyHandler) {
            window.removeEventListener('keydown', this._cardNavKeyHandler);
            this._cardNavKeyHandler = null;
        }
    }

    /**
     * Render techniques in list view
     */
    renderListView(container, techniques) {
        techniques.forEach(technique => {
            const listItem = document.createElement('div');
            listItem.className = 'technique-list-item';
            listItem.dataset.id = technique.id;
            
            listItem.innerHTML = `
                <div class="technique-list-info">
                    <h3>${technique.name}</h3>
                    <div class="technique-list-details">
                        <!-- Always use the mapped categoryName for the tag to ensure consistency with filter buttons -->
                        <span class="category-tag">${technique.categoryName}</span>
                        ${technique.sources ? `<span>${technique.sources.length} source${technique.sources.length > 1 ? 's' : ''}</span>` : ''}
                    </div>
                </div>
                <div class="technique-list-action">
                    <i class="fas fa-chevron-right"></i>
                </div>
            `;
            
            container.appendChild(listItem);
        });
    }

    /**
     * Add click event handlers to technique items
     */
    addTechniqueClickHandlers() {
        // Card view handlers
        document.querySelectorAll('.technique-card').forEach(card => {
            card.addEventListener('click', () => {
                this.showTechniqueDetails(card.dataset.id);
            });
        });
        
        // List view handlers
        document.querySelectorAll('.technique-list-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showTechniqueDetails(item.dataset.id);
            });
        });
    }

    /**
     * Show technique details in modal
     */
    showTechniqueDetails(techniqueId) {
        const modal = document.getElementById('technique-modal');
        if (!modal) return;

        // Get the filtered/visible techniques list
        const filteredTechniques = this.getFilteredTechniques();
        // Find the index of the current technique in the filtered list
        const currentIndex = filteredTechniques.findIndex(t => t.id === techniqueId);

        // Find the technique and category name as before
        let technique = null;
        let categoryName = '';
        let categoryId = '';
        for (const category of this.techniquesData.categories) {
            const found = category.techniques.find(t => t.id === techniqueId);
            if (found) {
                technique = found;
                categoryId = category.id;
                const categoryData = this.categoriesData.categories.find(c => c.id === category.id);
                categoryName = categoryData ? categoryData.name : category.id;
                break;
            }
        }

        if (!technique) {
            console.error('Technique not found:', techniqueId);
            return;
        }

        // Get icon based on category
        const iconClass = this.getCategoryIcon(categoryId);

        // Populate modal content
        document.getElementById('modal-technique-name').innerHTML = `
            <span class="modal-technique-icon"><i class="${iconClass}"></i></span>
            ${technique.name}
        `;
        document.getElementById('modal-technique-category').textContent = categoryName;

        // Description
        document.getElementById('modal-technique-description').textContent = technique.description;

        // Aliases (if any)
        const aliasesSection = document.getElementById('modal-aliases-section');
        const aliasesContent = document.getElementById('modal-technique-aliases');
        if (technique.aliases && technique.aliases.length > 0) {
            aliasesContent.textContent = technique.aliases.join(', ');
            aliasesSection.style.display = 'block';
        } else {
            aliasesSection.style.display = 'none';
        }

        // Sources
        const sourcesSection = document.getElementById('modal-sources-section');
        const sourcesContent = document.getElementById('modal-technique-sources');
        if (technique.sources && technique.sources.length > 0) {
            sourcesContent.innerHTML = '';
            technique.sources.forEach(source => {
                const li = document.createElement('li');
                li.textContent = source;
                sourcesContent.appendChild(li);
            });
            sourcesSection.style.display = 'block';
        } else {
            sourcesSection.style.display = 'none';
        }

        // Related techniques
        const relatedSection = document.getElementById('modal-related-section');
        const relatedContent = document.getElementById('modal-related-techniques');
        if (technique.relatedTechniques && technique.relatedTechniques.length > 0) {
            relatedContent.innerHTML = '';
            technique.relatedTechniques.forEach(relatedId => {
                const span = document.createElement('span');
                span.className = 'related-technique';
                span.dataset.id = relatedId;
                // Find the name of the related technique
                let relatedName = relatedId;
                for (const category of this.techniquesData.categories) {
                    const related = category.techniques.find(t => t.id === relatedId);
                    if (related) {
                        relatedName = related.name;
                        break;
                    }
                }
                span.textContent = relatedName;
                relatedContent.appendChild(span);
            });
            relatedSection.style.display = 'block';
            document.querySelectorAll('.related-technique').forEach(item => {
                item.addEventListener('click', () => {
                    this.showTechniqueDetails(item.dataset.id);
                });
            });
        } else {
            relatedSection.style.display = 'none';
        }

        // Example
        const exampleSection = document.getElementById('modal-example-section');
        const exampleContent = document.getElementById('modal-technique-example');
        if (technique.example) {
            exampleContent.textContent = technique.example;
            exampleSection.style.display = 'block';
            exampleSection.querySelector('h4').innerHTML = '<i class="fas fa-code"></i> Example';
        } else {
            exampleSection.style.display = 'none';
        }

        // Use case
        const useCaseSection = document.getElementById('modal-usecase-section');
        const useCaseContent = document.getElementById('modal-technique-usecase');
        if (technique.useCase) {
            useCaseContent.innerHTML = `<div class="modal-when-to-use">${technique.useCase}</div>`;
            useCaseSection.style.display = 'block';
            useCaseSection.querySelector('h4').innerHTML = '<i class="fas fa-lightbulb"></i> When to Use';
        } else {
            useCaseSection.style.display = 'none';
        }

        // Tips
        const tipsSection = document.getElementById('modal-tips-section');
        if (tipsSection) {
            const tipsContent = document.getElementById('modal-technique-tips');
            if (technique.tips) {
                tipsContent.innerHTML = `<div class="modal-tips-block">${technique.tips}</div>`;
                tipsSection.style.display = 'block';
            } else {
                tipsSection.style.display = 'none';
            }
        }

        // Common Mistakes
        const mistakesSection = document.getElementById('modal-mistakes-section');
        if (mistakesSection) {
            const mistakesContent = document.getElementById('modal-technique-mistakes');
            if (technique.commonMistakes) {
                mistakesContent.innerHTML = `<div class="modal-common-mistakes">${technique.commonMistakes}</div>`;
                mistakesSection.style.display = 'block';
            } else {
                mistakesSection.style.display = 'none';
            }
        }

        // --- Modal Navigation Arrows ---
        // Remove any existing nav container to avoid duplicates
        let navContainer = document.getElementById('modal-nav-arrows');
        if (navContainer) {
            navContainer.remove();
        }
        // Only show arrows if there is more than one visible technique
        if (filteredTechniques.length > 1 && currentIndex !== -1) {
            navContainer = document.createElement('div');
            navContainer.id = 'modal-nav-arrows';
            navContainer.style.display = 'flex';
            navContainer.style.justifyContent = 'space-between';
            navContainer.style.alignItems = 'center';
            navContainer.style.margin = '16px 0 0 0';

            // Left arrow
            const leftBtn = document.createElement('button');
            leftBtn.className = 'modal-nav modal-nav-left';
            leftBtn.innerHTML = '&larr;';
            leftBtn.setAttribute('aria-label', 'Previous technique');
            leftBtn.disabled = currentIndex === 0;
            leftBtn.style.fontSize = '1.5em';
            leftBtn.style.padding = '0.5em 1em';
            leftBtn.style.opacity = leftBtn.disabled ? '0.5' : '1.0';
            leftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex > 0) {
                    this.showTechniqueDetails(filteredTechniques[currentIndex - 1].id);
                }
            });

            // Progress indicator
            const progress = document.createElement('span');
            progress.className = 'modal-nav-progress';
            progress.textContent = `Technique ${currentIndex + 1} of ${filteredTechniques.length}`;
            progress.style.flex = '1';
            progress.style.textAlign = 'center';
            progress.style.fontWeight = 'bold';

            // Right arrow
            const rightBtn = document.createElement('button');
            rightBtn.className = 'modal-nav modal-nav-right';
            rightBtn.innerHTML = '&rarr;';
            rightBtn.setAttribute('aria-label', 'Next technique');
            rightBtn.disabled = currentIndex === filteredTechniques.length - 1;
            rightBtn.style.fontSize = '1.5em';
            rightBtn.style.padding = '0.5em 1em';
            rightBtn.style.opacity = rightBtn.disabled ? '0.5' : '1.0';
            rightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentIndex < filteredTechniques.length - 1) {
                    this.showTechniqueDetails(filteredTechniques[currentIndex + 1].id);
                }
            });

            navContainer.appendChild(leftBtn);
            navContainer.appendChild(progress);
            navContainer.appendChild(rightBtn);

            // Insert navContainer at the end of modal-content
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.appendChild(navContainer);
            }
        }

        // Show the modal
        modal.style.display = 'block';
    }

    /**
     * Truncate text to specified length with ellipsis
     */
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Update URL based on current state (for bookmarking)
     */
    updateURLFromState() {
        const searchParams = new URLSearchParams();
        
        if (this.searchTerm) {
            searchParams.set('q', this.searchTerm);
        }
        
        if (this.currentCategory) {
            searchParams.set('category', this.currentCategory);
        }
        
        if (this.currentView !== 'cards') {
            searchParams.set('view', this.currentView);
        }
        
        const newUrl = window.location.pathname + 
            (searchParams.toString() ? '?' + searchParams.toString() : '');
        
        history.pushState({ 
            searchTerm: this.searchTerm,
            category: this.currentCategory,
            view: this.currentView
        }, '', newUrl);
    }

    /**
     * Load state from URL parameters
     */
    loadStateFromURL() {
        const searchParams = new URLSearchParams(window.location.search);
        
        // Get search term
        const queryParam = searchParams.get('q');
        if (queryParam) {
            this.searchTerm = queryParam.toLowerCase();
            const searchInput = document.getElementById('technique-search');
            if (searchInput) {
                searchInput.value = queryParam;
            }
        }
        
        // Get category
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            this.currentCategory = categoryParam;
        }
        
        // Get view
        const viewParam = searchParams.get('view');
        if (viewParam && (viewParam === 'cards' || viewParam === 'list')) {
            this.currentView = viewParam;
        }
    }

    /**
     * Handle URL changes (browser history navigation)
     */
    handleURLChange(event) {
        if (event.state) {
            this.searchTerm = event.state.searchTerm || '';
            this.currentCategory = event.state.category || null;
            this.currentView = event.state.view || 'cards';
            
            // Update search input
            const searchInput = document.getElementById('technique-search');
            if (searchInput) {
                searchInput.value = this.searchTerm;
            }
            
            // Update category buttons
            document.querySelectorAll('.category-button').forEach(btn => {
                if (btn.dataset.category === this.currentCategory) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Update view toggle
            const cardViewButton = document.getElementById('card-view-toggle');
            const listViewButton = document.getElementById('list-view-toggle');
            
            if (cardViewButton && listViewButton) {
                if (this.currentView === 'cards') {
                    cardViewButton.classList.add('active');
                    listViewButton.classList.remove('active');
                } else {
                    listViewButton.classList.add('active');
                    cardViewButton.classList.remove('active');
                }
            }
            
            // Refresh the display
            this.displayTechniques();
        } else {
            // Handle case when there's no state (e.g., initial load)
            this.loadStateFromURL();
            this.displayTechniques();
        }
    }

    /**
     * Show error message to user
     */
    showError(message) {
        const container = document.getElementById('techniques-container');
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
    /**
     * Get appropriate icon class based on category ID
     * @param {string} categoryId
     * @returns {string} Font Awesome icon class
     */
    getCategoryIcon(categoryId) {
        const iconMap = {
            'basic-concepts': 'fas fa-book',
            'reasoning-frameworks': 'fas fa-brain',
            'agent-tool-use': 'fas fa-robot',
            'self-improvement': 'fas fa-chart-line',
            'retrieval-augmentation': 'fas fa-database',
            'prompt-optimization': 'fas fa-sliders-h',
            'multimodal-techniques': 'fas fa-images',
            'specialized-application': 'fas fa-cogs'
        };
        
        return iconMap[categoryId] || 'fas fa-lightbulb';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const taxonomyLoader = new TaxonomyDataLoader();
    taxonomyLoader.init();
});