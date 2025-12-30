/**
 * D3.js Force-Directed Graph Visualization
 * 
 * Renders technique relationships as an interactive network graph
 * with drag, zoom, tooltips, and category filtering.
 */

import * as d3 from 'd3';
import type { GraphData, GraphNode, GraphLink } from '@/types/graph';

// Extended types for D3 simulation
interface SimulationNode extends GraphNode {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface SimulationLink extends Omit<GraphLink, 'source' | 'target'> {
  source: SimulationNode;
  target: SimulationNode;
}

// Color map for categories
let categoryColors: Record<string, string> = {};

/**
 * Initialize category colors from external configuration
 */
export function setCategoryColors(colors: Record<string, string>): void {
  categoryColors = colors;
}

/**
 * Get category color with fallback
 */
function getCategoryColor(categoryId: string): string {
  return categoryColors[categoryId] || '#78716c';
}

/**
 * Graph Controller class for managing the D3 visualization
 */
export class GraphController {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private container: HTMLElement;
  private graphContent: d3.Selection<SVGGElement, unknown, null, undefined>;
  private simulation: d3.Simulation<SimulationNode, SimulationLink> | null = null;
  private nodes: SimulationNode[] = [];
  private links: SimulationLink[] = [];
  private width: number;
  private height: number;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private selectedNodeId: string | null = null;
  private onNodeSelect: ((nodeId: string | null) => void) | null = null;
  private onNodeHover: ((node: SimulationNode | null) => void) | null = null;

  constructor(container: HTMLElement, data: GraphData) {
    this.container = container;
    this.width = container.clientWidth || 800;
    this.height = container.clientHeight || 600;

    // Select or create SVG
    const existingSvg = container.querySelector('svg[data-testid="graph-svg"]');
    if (existingSvg) {
      this.svg = d3.select(existingSvg as SVGSVGElement);
    } else {
      this.svg = d3.select(container)
        .append('svg')
        .attr('data-testid', 'graph-svg')
        .attr('width', '100%')
        .attr('height', '100%');
    }

    // Set viewBox for responsiveness
    this.svg
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create or select graph content group
    let graphContentEl = this.svg.select<SVGGElement>('.graph-content');
    if (graphContentEl.empty()) {
      graphContentEl = this.svg.append('g').attr('class', 'graph-content');
    }
    this.graphContent = graphContentEl;

    // Create or select sub-groups
    if (this.graphContent.select('.links').empty()) {
      this.graphContent.append('g').attr('class', 'links');
    }
    if (this.graphContent.select('.nodes').empty()) {
      this.graphContent.append('g').attr('class', 'nodes');
    }

    // Setup zoom
    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        // zoom transform managed by D3
        this.graphContent.attr('transform', event.transform.toString());
      });

    this.svg.call(this.zoom);

    // Convert data to simulation format
    this.setData(data);
  }

  /**
   * Set or update the graph data
   */
  setData(data: GraphData): void {
    // Deep copy nodes with initial positions
    this.nodes = data.nodes.map(node => ({
      ...node,
      x: node.x ?? this.width / 2 + (Math.random() - 0.5) * 200,
      y: node.y ?? this.height / 2 + (Math.random() - 0.5) * 200,
    }));

    // Create a map for quick lookup
    const nodeMap = new Map<string, SimulationNode>();
    this.nodes.forEach(n => nodeMap.set(n.id, n));

    // Convert links to use node references
    this.links = data.links
      .filter(link => nodeMap.has(link.source) && nodeMap.has(link.target))
      .map(link => ({
        source: nodeMap.get(link.source)!,
        target: nodeMap.get(link.target)!,
        value: link.value,
      }));

    this.initSimulation();
    this.render();
  }

  /**
   * Initialize or restart the force simulation
   */
  private initSimulation(): void {
    if (this.simulation) {
      this.simulation.stop();
    }

    this.simulation = d3.forceSimulation<SimulationNode, SimulationLink>(this.nodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(this.links)
        .id(d => d.id)
        .distance(100)
        .strength(0.5))
      .force('charge', d3.forceManyBody<SimulationNode>()
        .strength(-300)
        .distanceMin(20)
        .distanceMax(500))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collision', d3.forceCollide<SimulationNode>()
        .radius(d => d.size + 5)
        .strength(0.7));

    this.simulation.on('tick', () => this.tick());
  }

  /**
   * Render the graph elements
   */
  private render(): void {
    // Render links
    const linkSelection = this.graphContent.select('.links')
      .selectAll<SVGLineElement, SimulationLink>('line')
      .data(this.links, (d: SimulationLink) => `${d.source.id}-${d.target.id}`);

    linkSelection.exit().remove();

    const linkEnter = linkSelection.enter()
      .append('line')
      .attr('data-testid', 'graph-link')
      .attr('class', 'link')
      .attr('stroke', '#666')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    linkEnter.merge(linkSelection);

    // Render nodes
    const nodeSelection = this.graphContent.select('.nodes')
      .selectAll<SVGCircleElement, SimulationNode>('circle')
      .data(this.nodes, (d: SimulationNode) => d.id);

    nodeSelection.exit().remove();

    const nodeEnter = nodeSelection.enter()
      .append('circle')
      .attr('data-testid', 'graph-node')
      .attr('data-technique-id', d => d.id)
      .attr('class', 'node')
      .attr('r', d => d.size)
      .attr('fill', d => getCategoryColor(d.categoryId))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(this.drag());

    nodeEnter.merge(nodeSelection)
      .attr('fill', d => getCategoryColor(d.categoryId))
      .attr('r', d => d.size);

    // Add event listeners
    this.graphContent.select('.nodes')
      .selectAll<SVGCircleElement, SimulationNode>('circle')
      .on('mouseover', (_event: MouseEvent, d: SimulationNode) => {
        this.highlightNode(d.id);
        if (this.onNodeHover) {
          this.onNodeHover(d);
        }
      })
      .on('mouseout', () => {
        if (!this.selectedNodeId) {
          this.clearHighlight();
        }
        if (this.onNodeHover) {
          this.onNodeHover(null);
        }
      })
      .on('click', (event: MouseEvent, d: SimulationNode) => {
        event.stopPropagation();
        this.selectNode(d.id);
      });

    // Click on SVG background clears selection
    this.svg.on('click', () => {
      this.selectNode(null);
    });
  }

  /**
   * Update positions on simulation tick
   */
  private tick(): void {
    this.graphContent.select('.links')
      .selectAll<SVGLineElement, SimulationLink>('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    this.graphContent.select('.nodes')
      .selectAll<SVGCircleElement, SimulationNode>('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  /**
   * Create drag behavior for nodes
   */
  private drag(): d3.DragBehavior<SVGCircleElement, SimulationNode, SimulationNode | d3.SubjectPosition> {
    const simulation = this.simulation!;

    return d3.drag<SVGCircleElement, SimulationNode>()
      .on('start', (event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event: d3.D3DragEvent<SVGCircleElement, SimulationNode, SimulationNode>, d: SimulationNode) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });
  }

  /**
   * Highlight a node and its connections
   */
  highlightNode(nodeId: string): void {
    const connectedIds = new Set<string>();
    this.links.forEach(link => {
      if (link.source.id === nodeId) connectedIds.add(link.target.id);
      if (link.target.id === nodeId) connectedIds.add(link.source.id);
    });

    // Dim non-connected nodes
    this.graphContent.select('.nodes')
      .selectAll<SVGCircleElement, SimulationNode>('circle')
      .attr('opacity', d => d.id === nodeId || connectedIds.has(d.id) ? 1 : 0.3)
      .attr('stroke', d => d.id === nodeId ? '#B87333' : '#fff')
      .attr('stroke-width', d => d.id === nodeId ? 3 : 2);

    // Highlight connected links
    this.graphContent.select('.links')
      .selectAll<SVGLineElement, SimulationLink>('line')
      .attr('stroke-opacity', d => d.source.id === nodeId || d.target.id === nodeId ? 0.8 : 0.1)
      .attr('stroke', d => d.source.id === nodeId || d.target.id === nodeId ? '#B87333' : '#666');
  }

  /**
   * Clear all highlighting
   */
  clearHighlight(): void {
    this.graphContent.select('.nodes')
      .selectAll<SVGCircleElement, SimulationNode>('circle')
      .attr('opacity', 1)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    this.graphContent.select('.links')
      .selectAll<SVGLineElement, SimulationLink>('line')
      .attr('stroke-opacity', 0.4)
      .attr('stroke', '#666');
  }

  /**
   * Select a node (persistent highlight)
   */
  selectNode(nodeId: string | null): void {
    this.selectedNodeId = nodeId;
    
    if (nodeId) {
      this.highlightNode(nodeId);
    } else {
      this.clearHighlight();
    }

    if (this.onNodeSelect) {
      this.onNodeSelect(nodeId);
    }
  }

  /**
   * Get currently selected node
   */
  getSelectedNode(): SimulationNode | null {
    if (!this.selectedNodeId) return null;
    return this.nodes.find(n => n.id === this.selectedNodeId) || null;
  }

  /**
   * Set callback for node selection
   */
  setOnNodeSelect(callback: (nodeId: string | null) => void): void {
    this.onNodeSelect = callback;
  }

  /**
   * Set callback for node hover
   */
  setOnNodeHover(callback: (node: SimulationNode | null) => void): void {
    this.onNodeHover = callback;
  }

  /**
   * Zoom controls
   */
  zoomIn(): void {
    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, 1.3);
  }

  zoomOut(): void {
    this.svg.transition()
      .duration(300)
      .call(this.zoom.scaleBy, 0.7);
  }

  zoomReset(): void {
    this.svg.transition()
      .duration(500)
      .call(this.zoom.transform, d3.zoomIdentity);
  }

  /**
   * Center the view on a specific node
   */
  centerOnNode(nodeId: string): void {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const transform = d3.zoomIdentity
      .translate(this.width / 2 - node.x, this.height / 2 - node.y);

    this.svg.transition()
      .duration(500)
      .call(this.zoom.transform, transform);
  }

  /**
   * Filter graph by category
   */
  filterByCategory(categoryId: string | null): void {
    if (!categoryId) {
      // Show all
      this.graphContent.select('.nodes')
        .selectAll<SVGCircleElement, SimulationNode>('circle')
        .style('display', null)
        .attr('opacity', 1);

      this.graphContent.select('.links')
        .selectAll<SVGLineElement, SimulationLink>('line')
        .style('display', null);
    } else {
      // Filter to category
      this.graphContent.select('.nodes')
        .selectAll<SVGCircleElement, SimulationNode>('circle')
        .style('display', d => d.categoryId === categoryId ? null : 'none');

      this.graphContent.select('.links')
        .selectAll<SVGLineElement, SimulationLink>('line')
        .style('display', d => 
          d.source.categoryId === categoryId && d.target.categoryId === categoryId 
            ? null 
            : 'none'
        );
    }

    // Reheat simulation for better layout
    this.simulation?.alpha(0.3).restart();
  }

  /**
   * Resize handler
   */
  resize(): void {
    this.width = this.container.clientWidth || 800;
    this.height = this.container.clientHeight || 600;

    this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);

    if (this.simulation) {
      this.simulation
        .force('center', d3.forceCenter(this.width / 2, this.height / 2));
      this.simulation.alpha(0.3).restart();
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.simulation) {
      this.simulation.stop();
    }
    this.svg.selectAll('*').remove();
  }
}

/**
 * Initialize graph from external call
 * @param container - Container element
 * @param data - Graph data
 * @param colors - Category color map
 * @returns GraphController instance
 */
export function initializeGraph(
  container: HTMLElement,
  data: GraphData,
  colors?: Record<string, string>
): GraphController {
  if (colors) {
    setCategoryColors(colors);
  }
  return new GraphController(container, data);
}
