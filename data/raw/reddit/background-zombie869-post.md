# I Distilled 17 Research Papers into a Taxonomy of 100+ Prompt Engineering Techniques – Here's the List

Posted by u/Background-Zombie869 (Top 1% Poster)

My goal was to capture every distinct technique, strategy, framework, concept, method, stage, component, or variation related to prompting mentioned.

Here is the consolidated and reviewed list incorporating findings from all papers:

## 10-Shot + 1 AutoDiCoT
Specific prompt combining full context, 10 regular exemplars, and 1 AutoDiCoT exemplar. (Schulhoff et al. - Case Study)

## 10-Shot + Context
Few-shot prompt with 10 exemplars plus the context/definition. (Schulhoff et al. - Case Study)

## 10-Shot AutoDiCoT
Prompt using full context and 10 AutoDiCoT exemplars. (Schulhoff et al. - Case Study)

## 10-Shot AutoDiCoT + Default to Reject
Using the 10-Shot AutoDiCoT prompt but defaulting to a negative label if the answer isn't parsable. (Schulhoff et al. - Case Study)

## 10-Shot AutoDiCoT + Extraction Prompt
Using the 10-Shot AutoDiCoT prompt followed by a separate extraction prompt to get the final label. (Schulhoff et al. - Case Study)

## 10-Shot AutoDiCoT without Email
The 10-Shot AutoDiCoT prompt with the email context removed. (Schulhoff et al. - Case Study)

## 20-Shot AutoDiCoT
Prompt using full context and 20 AutoDiCoT exemplars. (Schulhoff et al. - Case Study)

## 20-Shot AutoDiCoT + Full Words
Same as 20-Shot AutoDiCoT but using full words "Question", "Reasoning", "Answer". (Schulhoff et al. - Case Study)

## 20-Shot AutoDiCoT + Full Words + Extraction Prompt
Combining the above with an extraction prompt. (Schulhoff et al. - Case Study)

## 3D Prompting
Techniques involving 3D modalities (object synthesis, texturing, scene generation). (Schulhoff et al.)

## Act
Prompting method removing reasoning steps, contrasted with ReAct. (Vatsal & Dubey)

## Active Example Selection
Technique for Few-Shot Prompting using iterative filtering, embedding, and retrieval. (Schulhoff et al.)

## Active Prompting (Active-Prompt)
Identifying uncertain queries via LLM disagreement and using human annotation to select/improve few-shot CoT exemplars. (Vatsal & Dubey, Schulhoff et al.)

## Adaptive Prompting
General concept involving adjusting prompts based on context or feedback. (Li et al. - Optimization Survey)

## Agent / Agent-based Prompting
Using GenAI systems that employ external tools, environments, memory, or planning via prompts. (Schulhoff et al.)

## AlphaCodium
A test-based, multi-stage, code-oriented iterative flow for code generation involving pre-processing (reflection, test reasoning, AI test generation) and code iterations (generate, run, fix against tests). (Ridnik et al.)

## Ambiguous Demonstrations
Including exemplars with ambiguous labels in ICL prompts. (Schulhoff et al.)

## Analogical Prompting
Generating and solving analogous problems as intermediate steps before the main problem. (Vatsal & Dubey, Schulhoff et al.)

## Answer Aggregation (in Self-Consistency)
Methods (majority vote, weighted average, weighted sum) to combine final answers from multiple reasoning paths. (Wang et al. - Self-Consistency)

## Answer Engineering
Developing algorithms/rules (extractors, verbalizers) to get precise answers from LLM outputs, involving choices of answer space, shape, and extractor. (Schulhoff et al.)

## APE (Automatic Prompt Engineer)
Framework using an LLM to automatically generate and select effective instructions based on demonstrations and scoring. (Zhou et al. - APE)

## API-based Model Prompting
Prompting models accessible only via APIs. (Ning et al.)

## AttrPrompt
Prompting to avoid attribute bias in synthetic data generation. (Schulhoff et al.)

## Audio Prompting
Prompting techniques for or involving audio data. (Schulhoff et al.)

## AutoCoT (Automatic Chain-of-Thought)
Using Zero-Shot-CoT to automatically generate CoT exemplars for Few-Shot CoT. (Vatsal & Dubey, Schulhoff et al.)

## AutoDiCoT (Automatic Directed CoT)
Generating CoT explanations for why an item was/wasn't labeled a certain way, used as exemplars. (Schulhoff et al. - Case Study)

## Automated Prompt Optimization (APO)
Field of using automated techniques to find optimal prompts. (Ramnath et al., Li et al. - Optimization Survey)

## Automatic Meta-Prompt Generation
Using an FM to generate or revise meta-prompts. (Ramnath et al.)

## Auxiliary Trained NN Editing
Using a separate trained network to edit/refine prompts. (Ramnath et al.)

## Balanced Demonstrations (Bias Mitigation)
Selecting few-shot exemplars with a balanced distribution of attributes/labels. (Schulhoff et al.)

## Basic + Annotation Guideline-Based Prompting + Error Analysis-Based Prompting
Multi-component NER prompting strategy. (Vatsal & Dubey)

## Basic Prompting / Standard Prompting / Vanilla Prompting
The simplest form, usually instruction + input, without exemplars or complex reasoning steps. (Vatsal & Dubey, Schulhoff et al., Wei et al.)

## Basic with Term Definitions
Basic prompt augmented with definitions of key terms. (Vatsal & Dubey)

## Batch Prompting (for evaluation)
Evaluating multiple instances or criteria in a single prompt. (Schulhoff et al.)

## Batched Decoding
Processing multiple sequences in parallel during the decoding phase (used in SoT). (Ning et al.)

## Binder
Training-free neural-symbolic technique mapping input to a program (Python/SQL) using LLM API binding. (Vatsal & Dubey)

## Binary Score (Output Format)
Forcing Yes/No or True/False output. (Schulhoff et al.)

## Black-Box Automatic Prompt Optimization (APO)
APO without needing model gradients or internal access. (Ramnath et al.)

## Boosted Prompting
Ensemble method invoking multiple prompts during inference. (Ramnath et al.)

## Bullet Point Analysis
Prompting technique requiring output structured as bullet points to encourage semantic reasoning. (Ridnik et al.)

## Chain-of-Code (CoC)
Generating interleaved code and reasoning, potentially simulating execution. (Vatsal & Dubey)

## Chain-of-Dictionary (CoD)
Prepending dictionary definitions of source words for machine translation. (Schulhoff et al.)

## Chain-of-Event (CoE)
Sequential prompt for summarization (event extraction, generalization, filtering, integration). (Vatsal & Dubey)

## Chain-of-Images (CoI)
Multimodal CoT generating images as intermediate steps. (Schulhoff et al.)

## Chain-of-Knowledge (CoK)
Three-stage prompting: reasoning preparation, dynamic knowledge adaptation, answer consolidation. (Vatsal & Dubey)

## Chain-of-Symbol (CoS)
Using symbols instead of natural language for intermediate reasoning steps. (Vatsal & Dubey)

## Chain-of-Table
Multi-step tabular prompting involving planning/executing table operations. (Vatsal & Dubey)

## Chain-of-Thought (CoT) Prompting
Eliciting step-by-step reasoning before the final answer, usually via few-shot exemplars. (Wei et al., Schulhoff et al., Vatsal & Dubey, Wang et al. - Self-Consistency)

## Chain-of-Verification (CoVe)
Generate response -> generate verification questions -> answer questions -> revise response. (Vatsal & Dubey, Schulhoff et al.)

## ChatEval
Evaluation framework using multi-agent debate. (Schulhoff et al.)

## Cloze Prompts
Prompts with masked slots for prediction, often in the middle. (Wang et al. - Healthcare Survey, Schulhoff et al.)

## CLSP (Cross-Lingual Self Consistent Prompting)
Ensemble technique constructing reasoning paths in different languages. (Schulhoff et al.)

## Code-Based Agents
Agents primarily using code generation/execution. (Schulhoff et al.)

## Code-Generation Agents
Agents specialized in code generation. (Schulhoff et al.)

## Complexity-Based Prompting
Selecting complex CoT exemplars and using majority vote over longer generated chains. (Schulhoff et al., Vatsal & Dubey)

## Constrained Optimization (in APO)
APO with additional constraints (e.g., length, editing budget). (Li et al. - Optimization Survey)

## Continuous Prompt / Soft Prompt
Prompts with trainable continuous embedding vectors. (Schulhoff et al., Ramnath et al., Ye et al.)

## Continuous Prompt Optimization (CPO)
APO focused on optimizing soft prompts. (Ramnath et al.)

## Contrastive CoT Prompting
Using both correct and incorrect CoT exemplars. (Vatsal & Dubey, Schulhoff et al.)

## Conversational Prompt Engineering
Iterative prompt refinement within a conversation. (Schulhoff et al.)

## COSP (Consistency-based Self-adaptive Prompting)
Constructing Few-Shot CoT prompts from high-agreement Zero-Shot CoT outputs. (Schulhoff et al.)

## Coverage-based Prompt Generation
Generating prompts aiming to cover the problem space. (Ramnath et al.)

## CRITIC (Self-Correcting with Tool-Interactive Critiquing)
Agent generates response -> criticizes -> uses tools to verify/amend. (Schulhoff et al.)

## Cross-File Code Completion Prompting
Including context from other repository files in the prompt. (Ding et al.)

## Cross-Lingual Transfer (In-CLT) Prompting
Using both source/target languages for ICL examples. (Schulhoff et al.)

## Cultural Awareness Prompting
Injecting cultural context into prompts. (Schulhoff et al.)

## Cumulative Reasoning
Iteratively generating and evaluating potential reasoning steps. (Schulhoff et al.)

## Dater
Few-shot table reasoning: table decomposition -> SQL query decomposition -> final answer generation. (Vatsal & Dubey)

## DDCoT (Duty Distinct Chain-of-Thought)
Multimodal Least-to-Most prompting. (Schulhoff et al.)

## DecoMT (Decomposed Prompting for MT)
Chunking source text, translating chunks, then combining. (Schulhoff et al.)

## DECOMP (Decomposed Prompting)
Few-shot prompting demonstrating function/tool use via problem decomposition. (Vatsal & Dubey, Schulhoff et al.)

## Demonstration Ensembling (DENSE)
Ensembling outputs from multiple prompts with different exemplar subsets. (Schulhoff et al.)

## Demonstration Selection (for Bias Mitigation)
Choosing balanced demonstrations. (Schulhoff et al.)

## Detectors (Security)
Tools designed to detect malicious inputs/prompt hacking attempts. (Schulhoff et al.)

## DiPMT (Dictionary-based Prompting for Machine Translation)
Prepending dictionary definitions for MT. (Schulhoff et al.)

## Direct Prompt
Simple, single prompt baseline. (Ridnik et al.)

## DiVeRSe
Generating multiple prompts -> Self-Consistency for each -> score/select paths. (Schulhoff et al.)

## Discrete Prompt / Hard Prompt
Prompts composed only of standard vocabulary tokens. (Schulhoff et al., Ramnath et al.)

## Discrete Prompt Optimization (DPO)
APO focusing on optimizing hard prompts. (Ramnath et al.)

## Discrete Token Gradient Methods
Approximating gradients for discrete token optimization. (Ramnath et al.)

## DSP (Demonstrate-Search-Predict)
RAG framework: generate demonstrations -> search -> predict using combined info. (Schulhoff et al.)

## Emotion Prompting
Including emotive phrases in prompts. (Schulhoff et al.)

## Ensemble Methods (APO)
Generating multiple prompts and combining their outputs. (Ramnath et al.)

## Ensemble Refinement (ER)
Generate multiple CoT paths -> refine based on concatenation -> majority vote. (Vatsal & Dubey)

## Ensembling (General)
Combining outputs from multiple prompts or models. (Schulhoff et al.)

## English Prompt Template (Multilingual)
Using English templates for non-English tasks. (Schulhoff et al.)

## Entropy-based De-biasing
Using prediction entropy as a regularizer in meta-learning. (Ye et al.)

## Equation only (CoT Ablation)
Prompting to output only the mathematical equation, not the natural language steps. (Wei et al.)

## Evaluation (as Prompting Extension)
Using LLMs as evaluators. (Schulhoff et al.)

## Evolutionary Computing (for APO)
Using GA or similar methods to evolve prompts. (Ramnath et al.)

## Exemplar Generation (ICL)
Automatically generating few-shot examples. (Schulhoff et al.)

## Exemplar Ordering (ICL)
Strategy considering the order of examples in few-shot prompts. (Schulhoff et al.)

## Exemplar Selection (ICL)
Strategy for choosing which examples to include in few-shot prompts. (Schulhoff et al.)

## Faithful Chain-of-Thought
CoT combining natural language and symbolic reasoning (e.g., code). (Schulhoff et al.)

## Fast Decoding (RAG)
Approximation for RAG-Sequence decoding assuming P(y|x, zi) ≈ 0 if y wasn't in beam search for zi. (Lewis et al.)

## Fed-SP/DP-SC/CoT (Federated Prompting)
Using paraphrased queries and aggregating via Self-Consistency or CoT. (Vatsal & Dubey)

## Few-Shot (FS) Learning / Prompting
Providing K > 1 demonstrations in the prompt. (Brown et al., Wei et al., Schulhoff et al.)

## Few-Shot CoT
CoT prompting using multiple CoT exemplars. (Schulhoff et al., Vatsal & Dubey)

## Fill-in-the-blank format
Prompting format used for LAMBADA where the model completes the final word. (Brown et al.)

## Flow Engineering
Concept of designing multi-stage, iterative LLM workflows, contrasted with single prompt engineering. (Ridnik et al.)

## FM-based Optimization (APO)
Using FMs to propose/score prompts. (Ramnath et al.)

## G-EVAL
Evaluation framework using LLM judge + AutoCoT. (Schulhoff et al.)

## Genetic Algorithm (for APO)
Specific evolutionary approach for prompt optimization. (Ramnath et al.)

## GITM (Ghost in the Minecraft)
Agent using recursive goal decomposition and structured text actions. (Schulhoff et al.)

## Gradient-Based Optimization (APO)
Optimizing prompts using gradients. (Ramnath et al.)

## Graph-of-Thoughts
Organizing reasoning steps as a graph (related work for SoT). (Ning et al.)

## Greedy Decoding
Standard decoding selecting the most probable token at each step. (Wei et al., Wang et al. - Self-Consistency)

## GrIPS (Gradientfree Instructional Prompt Search)
APO using phrase-level edits (add, delete, paraphrase, swap). (Schulhoff et al., Ramnath et al.)

## Guardrails
Rules/frameworks guiding GenAI output and preventing misuse. (Schulhoff et al.)

## Heuristic-based Edits (APO)
Using predefined rules for prompt editing. (Ramnath et al.)

## Heuristic Meta-Prompt (APO)
Human-designed meta-prompt for prompt revision. (Ramnath et al.)

## Hybrid Prompt Optimization (HPO)
APO optimizing both discrete and continuous prompt elements. (Ramnath et al.)

## Human-in-the-Loop (Multilingual)
Incorporating human interaction in multilingual prompting. (Schulhoff et al.)

## Image-as-Text Prompting
Generating a textual description of an image for use in a text-based prompt. (Schulhoff et al.)

## Image Prompting
Prompting techniques involving image input or output. (Schulhoff et al.)

## Implicit RAG
Asking the LLM to identify and use relevant parts of provided context. (Vatsal & Dubey)

## In-Context Learning (ICL)
LLM ability to learn from demonstrations/instructions within the prompt at inference time. (Brown et al., Schulhoff et al.)

## Inference Chains Instruction
Prompting to determine if an inference is provable and provide the reasoning chain. (Liu et al. - LogiCoT)

## Instructed Prompting
Explicitly instructing the LLM. (Vatsal & Dubey)

## Instruction Induction
Automatically inferring a prompt's instruction from examples. (Honovich et al., Schulhoff et al., Ramnath et al.)

## Instruction Selection (ICL)
Choosing the best instruction for an ICL prompt. (Schulhoff et al.)

## Instruction Tuning
Fine-tuning LLMs on instruction-following datasets. (Liu et al. - LogiCoT)

## Interactive Chain Prompting (ICP)
Asking clarifying sub-questions for human input during translation. (Schulhoff et al.)

## Interleaved Retrieval guided by CoT (IRCoT)
RAG technique interleaving CoT and retrieval. (Schulhoff et al.)

## Iterative Prompting (Multilingual)
Iteratively refining translations with human feedback. (Schulhoff et al.)

## Iterative Retrieval Augmentation (FLARE, IRP)
RAG performing multiple retrievals during generation. (Schulhoff et al.)

## Jailbreaking
Prompt hacking to bypass safety restrictions. (Schulhoff et al.)

## KNN (for ICL Exemplar Selection)
Selecting exemplars via K-Nearest Neighbors. (Schulhoff et al.)

## Knowledgeable Prompt-tuning (KPT)
Using knowledge graphs for verbalizer construction. (Ye et al.)

## Language to Logic Instruction
Prompting to translate natural language to logic. (Liu et al. - LogiCoT)

## Least-to-Most Prompting
Decompose problem -> sequentially solve subproblems. (Zhou et al., Schulhoff et al., Vatsal & Dubey)

## Likert Scale (Output Format)
Prompting for output on a Likert scale. (Schulhoff et al.)

## Linear Scale (Output Format)
Prompting for output on a linear scale. (Schulhoff et al.)

## LLM Feedback (APO)
Using LLM textual feedback for prompt refinement. (Ramnath et al.)

## LLM-based Mutation (Evolutionary APO)
Using an LLM for prompt mutation. (Ramnath et al.)

## LLM-EVAL
Simple single-prompt evaluation framework. (Schulhoff et al.)

## Logical Thoughts (LoT)
Zero-shot CoT with logic rule verification. (Vatsal & Dubey)

## LogiCoT
Instruction tuning method/dataset for logical CoT. (Liu et al. - LogiCoT)

## Maieutic Prompting
Eliciting consistent reasoning via recursive explanations and contradiction elimination. (Vatsal & Dubey)

## Manual Instructions (APO Seed)
Starting APO with human-written prompts. (Ramnath et al.)

## Manual Prompting
Human-designed prompts. (Wang et al. - Healthcare Survey)

## MAPS (Multi-Aspect Prompting and Selection)
Knowledge mining -> multi-candidate generation -> selection for MT. (Schulhoff et al.)

## MathPrompter
Generate algebraic expression -> solve analytically -> verify numerically. (Vatsal & Dubey)

## Max Mutual Information Method (Ensembling)
Selecting template maximizing MI(prompt, output). (Schulhoff et al.)

## Memory-of-Thought Prompting
Retrieving similar unlabeled CoT examples at test time. (Schulhoff et al.)

## Meta-CoT
Ensembling by prompting with multiple CoT chains for the same problem. (Schulhoff et al.)

## Metacognitive Prompting (MP)
5-stage prompt mimicking human metacognition. (Vatsal & Dubey)

## Meta-learning (Prompting Context)
Inner/outer loop framing of ICL. (Brown et al.)

## Meta Prompting (for APO)
Prompting LLMs to generate/improve prompts. (Schulhoff et al.)

## Mixture of Reasoning Experts (MoRE)
Ensembling diverse reasoning prompts, selecting best based on agreement. (Schulhoff et al.)

## Modular Code Generation
Prompting LLMs to generate code in small, named sub-functions. (Ridnik et al.)

## Modular Reasoning, Knowledge, and Language (MRKL) System
Agent routing requests to external tools. (Schulhoff et al.)

## Multimodal Chain-of-Thought
CoT involving non-text modalities. (Schulhoff et al.)

## Multimodal Graph-of-Thought
GoT involving non-text modalities. (Schulhoff et al.)

## Multimodal In-Context Learning
ICL involving non-text modalities. (Schulhoff et al.)

## Multi-Objective / Inverse RL Strategies (APO)
RL-based APO for multiple objectives or using offline/preference data. (Ramnath et al.)

## Multi-Task Learning (MTL) (Upstream Learning)
Training on multiple tasks before few-shot adaptation. (Ye et al.)

## Negative Prompting (Image)
Negatively weighting terms to discourage features in image generation. (Schulhoff et al.)

## Numeric Score Feedback (APO)
Using metrics like accuracy, reward scores, entropy, NLL for feedback. (Ramnath et al.)

## Observation-Based Agents
Agents learning from observations in an environment. (Schulhoff et al.)

## One-Shot (1S) Learning / Prompting
Providing exactly one demonstration. (Brown et al., Schulhoff et al.)

## One-Shot AutoDiCoT + Full Context
Specific prompt from case study. (Schulhoff et al. - Case Study)

## One-Step Inference Instruction
Prompting for all single-step inferences. (Liu et al. - LogiCoT)

## Only In-File Context
Baseline code completion prompt using only the current file. (Ding et al.)

## Output Formatting (Prompt Component)
Instructions specifying output format. (Schulhoff et al.)

## Package Hallucination (Security Risk)
LLM importing non-existent code packages. (Schulhoff et al.)

## Paired-Image Prompting
ICL using before/after image pairs. (Schulhoff et al.)

## PAL (Program-Aided Language Model)
Generate code -> execute -> get answer. (Vatsal & Dubey, Schulhoff et al.)

## PARC (Prompts Augmented by Retrieval Cross-lingually)
Retrieving high-resource exemplars for low-resource multilingual ICL. (Schulhoff et al.)

## Parallel Point Expanding (SoT)
Executing the point-expanding stage of SoT in parallel. (Ning et al.)

## Pattern Exploiting Training (PET)
Reformulating tasks as cloze questions. (Ye et al.)

## Plan-and-Solve (PS / PS+) Prompting
Zero-shot CoT: Plan -> Execute Plan. PS+ adds detail. (Vatsal & Dubey, Schulhoff et al.)

## Point-Expanding Stage (SoT)
Second stage of SoT: elaborating on skeleton points. (Ning et al.)

## Positive/Negative Prompt (for SPA feature extraction)
Prompts used with/without the target objective to isolate relevant SAE features. (Lee et al.)

## Postpone Decisions / Exploration (AlphaCodium)
Design principle of avoiding irreversible decisions early and exploring multiple options. (Ridnik et al.)

## Predictive Prompt Analysis
Concept of predicting prompt effects efficiently. (Lee et al.)

## Prefix Prompts
Standard prompt format where prediction follows the input. (Wang et al. - Healthcare Survey, Schulhoff et al.)

## Prefix-Tuning
Soft prompting adding trainable vectors to the prefix. (Ye et al., Schulhoff et al.)

## Program Prompting
Generating code within reasoning/output. (Vatsal & Dubey)

## Program Synthesis (APO)
Generating prompts via program synthesis techniques. (Ramnath et al.)

## Program-of-Thoughts (PoT)
Using code generation/execution as reasoning steps. (Vatsal & Dubey, Schulhoff et al.)

## Prompt Chaining
Sequentially linking prompt outputs/inputs. (Schulhoff et al.)

## Prompt Drift
Performance change for a fixed prompt due to model updates. (Schulhoff et al.)

## Prompt Engineering (General)
Iterative process of developing prompts. (Schulhoff et al., Vatsal & Dubey)

## Prompt Engineering Technique (for APO)
Strategy for iterating on prompts. (Schulhoff et al.)

## Prompt Hacking
Malicious manipulation of prompts. (Schulhoff et al.)

## Prompt Injection
Overriding developer instructions via user input. (Schulhoff et al.)

## Prompt Leaking
Extracting the prompt template from an application. (Schulhoff et al.)

## Prompt Mining (ICL)
Discovering effective templates from corpora. (Schulhoff et al.)

## Prompt Modifiers (Image)
Appending words to image prompts to change output. (Schulhoff et al.)

## Prompt Paraphrasing
Generating prompt variations via rephrasing. (Schulhoff et al.)

## Prompt Template Language Selection (Multilingual)
Choosing the language for the template. (Schulhoff et al.)

## Prompt Tuning
See Soft Prompt Tuning. (Schulhoff et al.)

## Prompting Router (SoT-R)
Using an LLM to decide if SoT is suitable. (Ning et al.)

## ProTeGi
APO using textual gradients and beam search. (Ramnath et al.)

## Prototype-based De-biasing
Meta-learning de-biasing using instance prototypicality. (Ye et al.)

## Question Clarification
Agent asking questions to resolve ambiguity. (Schulhoff et al.)

## RAG (Retrieval Augmented Generation)
Retrieving external info and adding to prompt context. (Lewis et al., Schulhoff et al.)

## Random CoT
Baseline CoT with randomly sampled exemplars. (Vatsal & Dubey)

## RaR (Rephrase and Respond)
Zero-shot: rephrase/expand question -> answer. (Schulhoff et al.)

## ReAct (Reason + Act)
Agent interleaving reasoning, action, and observation. (Vatsal & Dubey, Schulhoff et al.)

## Recursion-of-Thought
Recursively calling LLM for sub-problems in CoT. (Schulhoff et al.)

## Reflexion
Agent using self-reflection on past trajectories to improve. (Schulhoff et al.)

## Region-based Joint Search (APO Filtering)
Search strategy used in Mixture-of-Expert-Prompts. (Ramnath et al.)

## Reinforcement Learning (for APO)
Framing APO as an RL problem. (Ramnath et al.)

## Re-reading (RE2)
Zero-shot: add "Read the question again:" + repeat question. (Schulhoff et al.)

## Retrieved Cross-file Context
Prompting for code completion including retrieved context from other files. (Ding et al.)

## Retrieval with Reference
Oracle retrieval using the reference completion to guide context retrieval for code completion. (Ding et al.)

## Reverse Chain-of-Thought (RCoT)
Self-criticism: reconstruct problem from answer -> compare. (Schulhoff et al.)

## RLPrompt
APO using RL for discrete prompt editing. (Schulhoff et al.)

## Role Prompting / Persona Prompting
Assigning a persona to the LLM. (Schulhoff et al.)

## Role-based Evaluation
Using different LLM personas for evaluation. (Schulhoff et al.)

## Router (SoT-R)
Module deciding between SoT and normal decoding. (Ning et al.)

## S2A (System 2 Attention)
Zero-shot: regenerate context removing noise -> answer. (Vatsal & Dubey)

## Sample-and-marginalize decoding (Self-Consistency)
Core idea: sample diverse paths -> majority vote. (Wang et al. - Self-Consistency)

## Sample-and-Rank (Baseline)
Sample multiple outputs -> rank by likelihood. (Wang et al. - Self-Consistency)

## Sampling (Decoding Strategy)
Using non-greedy decoding (temperature, top-k, nucleus). (Wang et al. - Self-Consistency)

## SCoT (Structured Chain-of-Thought)
Using program structures for intermediate reasoning in code generation. (Li et al. - SCoT)

## SCoT Prompting
Two-prompt technique: generate SCoT -> generate code from SCoT. (Li et al. - SCoT)

## SCULPT
APO using hierarchical tree structure and feedback loops for prompt tuning. (Ramnath et al.)

## Seed Prompts (APO Start)
Initial prompts for optimization. (Ramnath et al.)

## Segmentation Prompting
Using prompts for image/video segmentation. (Schulhoff et al.)

## Self-Ask
Zero-shot: decide if follow-up questions needed -> ask/answer -> final answer. (Schulhoff et al.)

## Self-Calibration
Prompting LLM to judge correctness of its own previous answer. (Schulhoff et al.)

## Self-Consistency
Sample multiple reasoning paths -> majority vote on final answers. (Wang et al., Vatsal & Dubey, Schulhoff et al.)

## Self-Correction / Self-Critique / Self-Reflection (General)
LLM evaluating/improving its own output. (Schulhoff et al., Ridnik et al.)

## Self-Generated In-Context Learning (SG-ICL)
LLM automatically generating few-shot examples. (Schulhoff et al.)

## Self-Instruct
Generating instruction-following data using LLM bootstrapping. (Liu et al. - LogiCoT)

## Self-Refine
Iterative: generate -> feedback -> improve. (Schulhoff et al.)

## Self-Referential Evolution (APO)
Evolutionary APO where prompts/mutation operators evolve. (Ramnath et al.)

## Self-Verification
Ensembling: generate multiple CoT solutions -> score by masking parts of question. (Schulhoff et al.)

## Semantic reasoning via bullet points (AlphaCodium)
Requiring bulleted output to structure reasoning. (Ridnik et al.)

## SimToM (Simulation Theory of Mind)
Establishing facts known by actors before answering multi-perspective questions. (Schulhoff et al.)

## Single Prompt Expansion (APO)
Coverage-based generation focusing on improving a single prompt. (Ramnath et al.)

## Skeleton Stage (SoT)
First stage of SoT: generating the answer outline. (Ning et al.)

## Skeleton-of-Thought (SoT)
Generate skeleton -> expand points in parallel. (Ning et al., Schulhoff et al.)

## Soft Decisions with Double Validation (AlphaCodium)
Re-generating/correcting potentially noisy outputs (like AI tests) as validation. (Ridnik et al.)

## Soft Prompt Tuning
Optimizing continuous prompt vectors. (Ramnath et al.)

## SPA (Syntactic Prevalence Analyzer)
Predicting syntactic prevalence using SAE features. (Lee et al.)

## Step-Back Prompting
Zero-shot CoT: ask high-level concept question -> then reason. (Schulhoff et al.)

## Strategic Search and Replanning (APO)
FM-based optimization with explicit search. (Ramnath et al.)

## StraGo
APO summarizing strategic guidance from correct/incorrect predictions as feedback. (Ramnath et al.)

## STREAM
Prompt-based LM generating logical rules for NER. (Wang et al. - Healthcare Survey)

## Style Prompting
Specifying desired output style/tone/genre. (Schulhoff et al.)

## Synthetic Prompting
Generating synthetic query-rationale pairs to augment CoT examples. (Vatsal & Dubey)

## Sycophancy
LLM tendency to agree with user opinions, even if contradicting itself. (Schulhoff et al.)

## Tab-CoT (Tabular Chain-of-Thought)
Zero-Shot CoT outputting reasoning in a markdown table. (Schulhoff et al.)

## Task Format (Prompt Sensitivity)
Variations in how the same task is framed in the prompt. (Schulhoff et al.)

## Task Language Prompt Template (Multilingual)
Using the target language for templates. (Schulhoff et al.)

## TaskWeaver
Agent transforming requests into code, supporting plugins. (Schulhoff et al.)

## Templating (Prompting)
Using functions with variable slots to construct prompts. (Schulhoff et al.)

## Test Anchors (AlphaCodium)
Ensuring code fixes don't break previously passed tests during iteration. (Ridnik et al.)

## Test-based Iterative Flow (AlphaCodium)
Core loop: generate code -> run tests -> fix code. (Ridnik et al.)

## Text-Based Techniques
Main category of prompting using text. (Schulhoff et al.)

## TextGrad
APO using textual "gradients" for prompt guidance. (Ramnath et al.)

## ThoT (Thread-of-Thought)
Zero-shot CoT variant for complex/chaotic contexts. (Vatsal & Dubey, Schulhoff et al.)

## THOR (Three-Hop Reasoning)
Identify aspect -> identify opinion -> infer polarity for sentiment analysis. (Vatsal & Dubey)

## Thorough Decoding (RAG)
RAG-Sequence decoding involving running forward passes for all hypotheses across all documents. (Lewis et al.)

## Token Mutations (Evolutionary APO)
GA operating at token level. (Ramnath et al.)

## Tool Use Agents
Agents using external tools. (Schulhoff et al.)

## TopK Greedy Search (APO Filtering)
Selecting top-K candidates each iteration. (Ramnath et al.)

## ToRA (Tool-Integrated Reasoning Agent)
Agent interleaving code and reasoning. (Schulhoff et al.)

## ToT (Tree-of-Thoughts)
Exploring multiple reasoning paths in a tree structure using generate, evaluate, search. (Yao et al., Vatsal & Dubey, Schulhoff et al.)

## Training Data Reconstruction (Security Risk)
Extracting training data via prompts. (Schulhoff et al.)

## Trained Router (SoT-R)
Using a fine-tuned model as the SoT router. (Ning et al.)

## Translate First Prompting
Translating non-English input to English first. (Schulhoff et al.)

## UCB (Upper Confidence Bound) / Bandit Search (APO Filtering)
Using UCB for prompt candidate selection. (Ramnath et al.)

## Uncertainty-Routed CoT Prompting
Using answer consistency/uncertainty to decide between majority vote and greedy decoding in CoT. (Schulhoff et al.)

## UniPrompt
Manual prompt engineering ensuring semantic facet coverage. (Ramnath et al.)

## Universal Self-Adaptive Prompting (USP)
Extension of COSP using unlabeled data. (Schulhoff et al.)

## Universal Self-Consistency
Ensembling using a prompt to select the majority answer. (Schulhoff et al.)

## Vanilla Prompting
See Basic Prompting.

## Vanilla Prompting (Bias Mitigation)
Instruction to be unbiased. (Schulhoff et al.)

## Variable Compute Only (CoT Ablation)
Prompting using dots (...) matching equation length. (Wei et al.)

## Verbalized Score (Calibration)
Prompting for a numerical confidence score. (Schulhoff et al.)

## Verify-and-Edit (VE / RAG)
RAG technique: generate CoT -> retrieve facts -> edit rationale. (Vatsal & Dubey, Schulhoff et al.)

## Video Generation Prompting
Using prompts for video generation/editing. (Schulhoff et al.)

## Video Prompting
Prompting techniques for or involving video data. (Schulhoff et al.)

## Visual Prompting
Prompting involving images. (Wang et al. - Healthcare Survey)

## Vocabulary Pruning (APO)
Reducing the decoding vocabulary based on heuristics. (Ramnath et al.)

## Vote-K (ICL Exemplar Selection)
Propose candidates -> label -> use pool, ensuring diversity. (Schulhoff et al.)

## Voyager
Lifelong learning agent using self-proposed tasks, code execution, and long-term memory. (Schulhoff et al.)

## Word/Phrase Level Edits (APO)
Generating candidates via word/phrase edits. (Ramnath et al.)

## X-InSTA Prompting
Aligning ICL examples semantically or by task label for multilingual tasks. (Schulhoff et al.)

## XLT (Cross-Lingual Thought) Prompting
Multilingual CoT using a structured template. (Schulhoff et al.)

## YAML Structured Output (AlphaCodium)
Requiring LLM output to conform to a YAML schema. (Ridnik et al.)

## Zero-Shot (0S) Learning / Prompting
Prompting with instruction only, no demonstrations. (Brown et al., Vatsal & Dubey, Schulhoff et al.)

## Zero-Shot CoT
Appending a thought-inducing phrase without CoT exemplars. (Schulhoff et al., Vatsal & Dubey)

---

## Comment from Background-Zombie869 (4 days ago):

Thanks everyone for the incredible engagement on this post since yesterday. So glad you found the taxonomy useful.

The most common suggestion was a GitHub repo and I totally agree and l've already started building one. I want to make it more than just the list.

What are your top suggestions for turning this into a awesomeee community resource on GitHub?

- What features/structure would you love to see?
- How can we best organize/extend this information?
- How can the repo effectively cater to both newcomers needing foundational explanations and experienced practitioners seeking advanced comparisons or implementation details? (Think layered information, different views, clear prerequisites?)
- What's the most impactful way to link these techniques to specific use cases or problem domains where they excel? (e.g., Tags for 'summarization', 'code gen', 'bias reduction'? Case study links?)
- What specific decision could this repo help someone make when building with LLMs?
- How can we best incorporate or link to empirical results or known limitations for each technique, moving beyond just the definition? (Links to papers? Summarized findings? A standardized 'evidence' section?)
- What's one missing piece in current prompt engineering resources that this project could uniquely fill?

I could go on and on….let me know your best ideas below.
Looking forward to hearing what everyone wants and I'll let people interested in contributing know later on today or tomorrow when the repo goes public. Really looking forward to hearing everyone's ideas