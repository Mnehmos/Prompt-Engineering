# Prompt Engineering Taxonomy

A comprehensive, interactive taxonomy of 100+ prompt engineering techniques derived from 17 research papers. This project transforms the original list compiled by Reddit user u/Background-Zombie869 into a structured, searchable, and visually appealing resource for prompt engineering practitioners and researchers.

## Overview

This project takes the alphabetical list of prompt engineering techniques from the [original Reddit post](https://www.reddit.com/r/ChatGPTPro/comments/1k4iykr/i_distilled_17_research_papers_into_a_taxonomy_of/) and enhances it with:

- **Categorization**: Organizes techniques into logical categories based on function and purpose
- **Enhanced Descriptions**: Adds detailed descriptions, examples, and use cases
- **Visualizations**: Shows relationships between different techniques
- **Interactivity**: Provides filtering, searching, and exploration tools
- **Structured Data**: Makes the taxonomy available in JSON format for further research

## Project Structure

```
.
├── index.html                  # Main landing page
├── assets/                     # Static assets
│   ├── css/                    # Stylesheets
│   │   └── styles.css          # Main CSS file
│   └── js/                     # JavaScript files
│       ├── main.js             # General site functionality
│       ├── data-loader.js      # Handles loading and displaying technique data
│       └── network-visualization.js  # Force-directed graph visualization
├── reports/                    # Interactive reports
│   ├── taxonomy-overview.html  # Main taxonomy view with filtering
│   └── technique-relationships.html  # Network visualization of relationships
├── data/                       # Data files
│   ├── processed/              # Structured data
│   │   ├── technique_categories.json  # Category definitions
│   │   └── techniques.json     # Detailed technique data
│   └── raw/                    # Raw source data
│       └── reddit/             # Original Reddit content
│           └── background-zombie869-post.md  # Archived post content
└── sources.html                # Attribution and sources page
```

## Features

- **Interactive Technique Browser**: Filter by category, search, and toggle between card and list views
- **Relationship Visualization**: Explore how different prompt engineering techniques relate to each other
- **Detailed Technique Information**: View descriptions, examples, use cases, sources, and related techniques
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Clean, Modern Interface**: Intuitive navigation and aesthetically pleasing design

## Running the Website

This is a static website that can be served by any web server. To run it locally:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/prompt-engineering-taxonomy.git
   cd prompt-engineering-taxonomy
   ```

2. Serve the files using any static web server, for example:

   Using Python:
   ```
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```

   Using Node.js (with `http-server` package):
   ```
   npx http-server
   ```

3. Open your browser and navigate to `http://localhost:8000` (or whatever port your server is using)

## Data Structure

The taxonomy data is stored in two main JSON files:

1. `data/processed/technique_categories.json`: Defines the categories and their relationships
2. `data/processed/techniques.json`: Contains detailed information about each technique

This structured format makes it easy to:
- Update or add new techniques
- Generate alternative visualizations
- Import into other projects or tools

## Attribution

This project is based on research compiled by Reddit user u/Background-Zombie869, who distilled information from 17 research papers on prompt engineering techniques. The original post can be found [here](https://www.reddit.com/r/ChatGPTPro/comments/1k4iykr/i_distilled_17_research_papers_into_a_taxonomy_of/).

We've enhanced the original compilation with additional organization, descriptions, visualizations, and interactivity to make it more accessible and useful to the community.

## Research Papers Referenced

The original taxonomy references 17 research papers, including:

- Schulhoff et al. - "A Survey of Prompt Engineering"
- Vatsal & Dubey - "Comprehensive Review of Prompt Engineering"
- Wei et al. - "Chain-of-Thought Prompting"
- Wang et al. - "Self-Consistency"
- Zhou et al. - "APE (Automatic Prompt Engineer)"
- And many more (see the Sources page for a complete list)

## Contributing

Contributions to expand and improve this taxonomy are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Add your changes
4. Submit a pull request

## License

This project is available under the MIT License - see the LICENSE file for details.

## Acknowledgments

- u/Background-Zombie869 for the original research compilation
- All the researchers who published the papers referenced in this taxonomy
- The prompt engineering community for continuing to advance this field