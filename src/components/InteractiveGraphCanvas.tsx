"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { WalletNode, TransferEdge, WalletCategory } from "@/lib/types";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  X,
  Layers,
  RefreshCw,
  Sparkles,
  Workflow,
  Shield,
  AlertTriangle,
  Flame,
  Building,
  Globe,
  Split,
  ChevronRight,
} from "lucide-react";

interface InteractiveGraphCanvasProps {
  nodes: WalletNode[];
  edges: TransferEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: WalletNode | null) => void;
  maxHops: number;
  onMaxHopsChange?: (hops: number) => void;
}

interface D3Node extends d3.SimulationNodeDatum, WalletNode {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  targetX?: number;
  targetY?: number;
  hopLevel?: number;
}

interface D3Edge extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: D3Node | string;
  target: D3Node | string;
  amount: number;
  asset: string;
  amountUsd: number;
  txHash: string;
  hopNumber?: number;
  isPeelSplit: boolean;
  isRapidForwarding?: boolean;
}

export const InteractiveGraphCanvas: React.FC<InteractiveGraphCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  maxHops,
  onMaxHopsChange,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const simulationRef = useRef<d3.Simulation<D3Node, D3Edge> | null>(null);

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [minAmountFilter, setMinAmountFilter] = useState<number>(0);
  const [activeHops, setActiveHops] = useState<number>(maxHops || 4);
  const [layoutStyle, setLayoutStyle] = useState<"organic" | "staged">("organic");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Category Color Palette & Theming (Original Vibrant Holographic Palette)
  const getCategoryTheme = (category: WalletCategory) => {
    switch (category) {
      case "scam_source":
        return {
          color: "#E11D48", // Vivid Crimson Rose
          glow: "rgba(225, 29, 72, 0.25)",
          bg: "#FFF1F2",
          border: "#FDA4AF",
          label: "Scam Aggregator",
          typeCode: "CRIT",
        };
      case "victim":
        return {
          color: "#0284C7", // Bright Cerulean Blue
          glow: "rgba(2, 132, 199, 0.25)",
          bg: "#F0F9FF",
          border: "#BAE6FD",
          label: "Victim Escrow",
          typeCode: "LOW",
        };
      case "mule":
        return {
          color: "#D97706", // Electric Amber
          glow: "rgba(217, 119, 6, 0.25)",
          bg: "#FFFBEB",
          border: "#FDE68A",
          label: "Layer-1 Mule",
          typeCode: "HIGH",
        };
      case "peel_chain":
        return {
          color: "#9333EA", // Cyber Purple
          glow: "rgba(147, 51, 234, 0.25)",
          bg: "#FAF5FF",
          border: "#DDD6FE",
          label: "Peel Splitter",
          typeCode: "CRIT",
        };
      case "intermediary":
        return {
          color: "#475569", // Slate Burner Cache
          glow: "rgba(71, 85, 105, 0.25)",
          bg: "#F8FAFC",
          border: "#CBD5E1",
          label: "Burner Siphon Cache",
          typeCode: "HIGH",
        };
      case "exchange":
        return {
          color: "#BE123C", // Deep Rose
          glow: "rgba(190, 18, 60, 0.25)",
          bg: "#FFF1F2",
          border: "#FDA4AF",
          label: "High-Risk Mekong OTC",
          typeCode: "CRIT",
        };
      case "destination":
        return {
          color: "#059669", // Mint Emerald
          glow: "rgba(5, 150, 105, 0.25)",
          bg: "#ECFDF5",
          border: "#A7F3D0",
          label: "Regulated CEX Subpoena",
          typeCode: "CEX",
        };
      default:
        return {
          color: "#64748B",
          glow: "rgba(100, 116, 139, 0.2)",
          bg: "#F8FAFC",
          border: "#E2E8F0",
          label: "Intermediary Node",
          typeCode: "NODE",
        };
    }
  };

  // Filter edges based on active hops and min amount
  const filteredEdges = edges.filter((e) => {
    const hopMatch = (e.hopNumber || 1) <= activeHops;
    const amountMatch = e.amountUsd >= minAmountFilter;
    return hopMatch && amountMatch;
  });

  const activeNodeIds = new Set<string>();
  filteredEdges.forEach((e) => {
    activeNodeIds.add(typeof e.source === "string" ? e.source : (e.source as WalletNode).id);
    activeNodeIds.add(typeof e.target === "string" ? e.target : (e.target as WalletNode).id);
  });

  const filteredNodes = nodes.filter(
    (n) => activeNodeIds.has(n.id) || n.category === "scam_source"
  );

  // Zoom Controllers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, 0.8);
  };

  const handleFitView = (isInspectorOpen?: boolean) => {
    if (!svgRef.current || !zoomRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || 960;
    const height = containerRef.current.clientHeight || 580;
    const isOpen = typeof isInspectorOpen === "boolean" ? isInspectorOpen : !!selectedNodeId;
    const availableWidth = isOpen ? Math.max(width - 390, width * 0.58) : width;
    const scale = Math.min((availableWidth - 80) / 1020, (height - 120) / 480, 0.78);
    d3.select(svgRef.current)
      .transition()
      .duration(380)
      .call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(availableWidth / 2 - 520 * scale, height / 2 - 300 * scale).scale(scale)
      );
  };

  // Automatically pan canvas when inspector drawer opens or closes so nodes are never hidden
  useEffect(() => {
    handleFitView(!!selectedNodeId);
  }, [selectedNodeId]);

  const handleResetSimulation = () => {
    if (!simulationRef.current) return;
    simulationRef.current.nodes().forEach((d) => {
      d.fx = null;
      d.fy = null;
      if (d.targetX !== undefined) d.x = d.targetX;
      if (d.targetY !== undefined) d.y = d.targetY;
      d.vx = 0;
      d.vy = 0;
    });
    simulationRef.current.alpha(0.8).restart();
    handleFitView();
  };

  // =========================================================================
  // D3 FORCE-DIRECTED SIMULATION WITH CIRCULAR GLOWING NODES
  // =========================================================================
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 960;
    const height = containerRef.current.clientHeight || 580;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Defs: Glow filters and arrowheads
    const defs = svg.append("defs");

    // Circular Node Drop Shadow
    const filter = defs
      .append("filter")
      .attr("id", "node-shadow")
      .attr("x", "-40%")
      .attr("y", "-40%")
      .attr("width", "180%")
      .attr("height", "180%");
    filter
      .append("feDropShadow")
      .attr("dx", "0")
      .attr("dy", "3")
      .attr("stdDeviation", "4")
      .attr("flood-opacity", "0.12");

    // Transfer Arrow Markers
    const createMarker = (id: string, color: string) => {
      defs
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 32) // Distance from node center to tip of arrow
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L8,0L0,4")
        .attr("fill", color);
    };

    createMarker("arrow-default", "#64748B");
    createMarker("arrow-peel", "#9333EA");
    createMarker("arrow-active", "#0284C7");

    // Root Group
    const g = svg.append("g").attr("class", "graph-root");

    // Zoom Behavior with mouse wheel guard
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 2.5])
      .filter((event) => {
        if (event.type === "wheel") return event.ctrlKey || event.metaKey;
        return !event.button;
      })
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    // Initial View Transform
    const availableWidth = selectedNodeId ? Math.max(width - 390, width * 0.58) : width;
    const scale = Math.min((availableWidth - 60) / 980, (height - 80) / 580, 0.86);
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(availableWidth / 2 - 520 * scale, height / 2 - 300 * scale).scale(scale)
    );

    // Canvas background click catcher to deselect active node when clicking empty canvas
    g.append("rect")
      .attr("class", "canvas-bg-catcher")
      .attr("width", 8000)
      .attr("height", 8000)
      .attr("x", -4000)
      .attr("y", -4000)
      .attr("fill", "transparent")
      .attr("cursor", "default")
      .on("click", () => {
        onSelectNode(null);
      });

    svg.on("click", (event) => {
      if (event.target === svg.node()) {
        onSelectNode(null);
      }
    });

    // Precise Stage & Organic Lane Positioning Coordinates (Guarantees zero overlap & planar flow)
    const stagedPositions: Record<string, { x: number; y: number; hop: number }> = {
      // Hop 0: Victim Escrow
      "0x4a1f9e2b10283c7482910a93b482910c82739102": { x: 90, y: 300, hop: 0 },
      // Hop 1: Scam Aggregator
      "0x71c828d132924c5e39b7038e219b25e7144e5973": { x: 280, y: 300, hop: 1 },
      // Hop 2: Layer-1 Mules (Alpha, Beta, Gamma in distinct vertical lanes)
      "0x98b2c418293746182901c82736182901a8273619": { x: 490, y: 120, hop: 2 },
      "0x82a1c90182736182901c82736182901a82736182": { x: 490, y: 300, hop: 2 },
      "0x11b9c82736182901a82736182901c82736182901": { x: 490, y: 480, hop: 2 },
      // Hop 3: Peel Splitters & Burner Consolidation Siphon (Separated with ample breathing room)
      "0x33c1a82736182901c82736182901a82736182902": { x: 720, y: 120, hop: 3 },
      "0x77e3c82736182901a82736182901a82736182904": { x: 680, y: 220, hop: 3 },
      "0x55d2b82736182901a82736182901c82736182903": { x: 720, y: 370, hop: 3 },
      // Hop 4: Terminal High-Risk OTC Off-Ramp & Regulated CEX Subpoena
      "0xaa91b82736182901a82736182901c82736182905": { x: 950, y: 230, hop: 4 },
      "0xbb82c82736182901c82736182901a82736182906": { x: 950, y: 480, hop: 4 },
    };

    // Prepare Node data for D3
    const simNodes: D3Node[] = filteredNodes.map((n) => {
      const pos = stagedPositions[n.id] || { x: width / 2, y: height / 2, hop: 2 };
      return {
        ...n,
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
        hopLevel: pos.hop,
      };
    });

    const simEdges: D3Edge[] = filteredEdges.map((e) => ({
      ...e,
      source: typeof e.source === "string" ? e.source : (e.source as WalletNode).id,
      target: typeof e.target === "string" ? e.target : (e.target as WalletNode).id,
    }));

    // Setup Organic D3 Force Physics with Non-Collapsing Lane Guidance
    const simulation = d3
      .forceSimulation<D3Node>(simNodes)
      .force(
        "link",
        d3
          .forceLink<D3Node, D3Edge>(simEdges)
          .id((d) => d.id)
          .distance((d) => {
            const sId = typeof d.source === "string" ? d.source : (d.source as D3Node).id;
            const tId = typeof d.target === "string" ? d.target : (d.target as D3Node).id;
            if (sId.includes("11b9") && tId.includes("bb82")) return 450;
            return 210;
          })
          .strength(layoutStyle === "organic" ? 0.35 : 0.15)
      )
      .force(
        "charge",
        d3.forceManyBody().strength(layoutStyle === "organic" ? -400 : -150)
      )
      .force(
        "x",
        d3
          .forceX<D3Node>((d) => d.targetX ?? (100 + (d.hopLevel ?? 2) * 210))
          .strength(layoutStyle === "staged" ? 0.95 : 0.4)
      )
      .force(
        "y",
        d3
          .forceY<D3Node>((d) => d.targetY ?? 300)
          .strength(layoutStyle === "staged" ? 0.95 : 0.4)
      )
      .force(
        "collision",
        d3.forceCollide<D3Node>().radius(74).strength(0.9).iterations(2)
      );

    simulationRef.current = simulation;

    // =========================================================================
    // RENDER LINKS & ANIMATED FLOW STREAMS
    // =========================================================================
    const linkGroup = g.append("g").attr("class", "links-layer");

    // Base Transfer Links
    const linkPaths = linkGroup
      .selectAll<SVGLineElement, D3Edge>("line.base-link")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("class", "base-link")
      .attr("stroke", (d) => {
        if (d.isPeelSplit) return "#9333EA";
        if (d.amountUsd >= 100000) return "#334155";
        return "#64748B";
      })
      .attr("stroke-width", (d) =>
        d.isPeelSplit ? 2.2 : Math.max(2, Math.min(4.2, (d.amountUsd / 50000) * 2))
      )
      .attr("stroke-dasharray", (d) => (d.isPeelSplit ? "5,3" : "none"))
      .attr("stroke-opacity", 0.75)
      .attr("marker-end", (d) => (d.isPeelSplit ? "url(#arrow-peel)" : "url(#arrow-default)"));

    // Animated Particle Stream Overlay
    const streamPaths = linkGroup
      .selectAll<SVGLineElement, D3Edge>("line.stream-flow")
      .data(simEdges)
      .enter()
      .append("line")
      .attr("class", "stream-flow")
      .attr("stroke", (d) => (d.isPeelSplit ? "#C084FC" : "#38BDF8"))
      .attr("stroke-width", 1.8)
      .attr("stroke-dasharray", "4, 12")
      .attr("stroke-opacity", 0.85);

    streamPaths
      .append("animate")
      .attr("attributeName", "stroke-dashoffset")
      .attr("from", "32")
      .attr("to", "0")
      .attr("dur", "1.1s")
      .attr("repeatCount", "indefinite");

    // =========================================================================
    // RENDER MIDPOINT TRANSFER LABELS (Floating Amount Pills)
    // =========================================================================
    const edgeLabelGroup = g
      .append("g")
      .attr("class", "edge-labels-layer")
      .selectAll("g")
      .data(simEdges)
      .enter()
      .append("g")
      .attr("cursor", "pointer");

    // Label Background Rect with generous padding and crisp border
    edgeLabelGroup
      .append("rect")
      .attr("rx", 6)
      .attr("ry", 6)
      .attr("fill", "#FFFFFF")
      .attr("stroke", (d) => (d.isPeelSplit ? "#C084FC" : "#CBD5E1"))
      .attr("stroke-width", (d) => (d.isPeelSplit ? 1.5 : 1))
      .attr("height", 20)
      .attr("width", (d) => {
        const text = d.isPeelSplit
          ? `✂ $${(d.amountUsd / 1000).toFixed(1)}k Peel`
          : `$${(d.amountUsd / 1000).toFixed(0)}k ${d.asset}`;
        return text.length * 6.8 + 16;
      })
      .attr("y", -10)
      .attr("x", (d) => {
        const text = d.isPeelSplit
          ? `✂ $${(d.amountUsd / 1000).toFixed(1)}k Peel`
          : `$${(d.amountUsd / 1000).toFixed(0)}k ${d.asset}`;
        return -(text.length * 6.8 + 16) / 2;
      })
      .attr("filter", "url(#node-shadow)");

    // Label Text
    edgeLabelGroup
      .append("text")
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", "9.5px")
      .attr("font-weight", "700")
      .attr("fill", (d) => (d.isPeelSplit ? "#7E22CE" : "#0F172A"))
      .attr("text-anchor", "middle")
      .attr("dy", 3.5)
      .text((d) =>
        d.isPeelSplit
          ? `✂ $${(d.amountUsd / 1000).toFixed(1)}k Peel`
          : `$${(d.amountUsd / 1000).toFixed(0)}k ${d.asset}`
      );

    // =========================================================================
    // RENDER CONCENTRIC GLOWING CIRCULAR NODES (Authentic First Graph Design)
    // =========================================================================
    const nodeGroup = g
      .append("g")
      .attr("class", "nodes-layer")
      .selectAll("g")
      .data(simNodes)
      .enter()
      .append("g")
      .attr("cursor", "grab")
      .on("click", (event, d) => {
        if (event.defaultPrevented) return; // Prevent click from firing after dragging
        event.stopPropagation();
        onSelectNode(d);
      })
      .on("dblclick", (event, d) => {
        // Double-click unpins the node and lets it float naturally
        event.stopPropagation();
        d.fx = null;
        d.fy = null;
        simulation.alpha(0.3).restart();
      })
      .on("mouseenter", (event, d) => {
        setHoveredNodeId(d.id);
        // Highlight active connections
        linkPaths
          .attr("stroke", (l) => {
            const sId = typeof l.source === "string" ? l.source : l.source.id;
            const tId = typeof l.target === "string" ? l.target : l.target.id;
            if (sId === d.id || tId === d.id) return "#0284C7";
            return l.isPeelSplit ? "#DDD6FE" : "#E2E8F0";
          })
          .attr("stroke-width", (l) => {
            const sId = typeof l.source === "string" ? l.source : l.source.id;
            const tId = typeof l.target === "string" ? l.target : l.target.id;
            return sId === d.id || tId === d.id ? 3.5 : 1.2;
          });
      })
      .on("mouseleave", () => {
        setHoveredNodeId(null);
        linkPaths
          .attr("stroke", (l) =>
            l.isPeelSplit ? "#9333EA" : l.amountUsd >= 100000 ? "#334155" : "#64748B"
          )
          .attr("stroke-width", (l) =>
            l.isPeelSplit ? 2.2 : Math.max(2, Math.min(4.2, (l.amountUsd / 50000) * 2))
          );
      })
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.25).restart();
            d.fx = d.x;
            d.fy = d.y;
            d3.select(event.sourceEvent.target).style("cursor", "grabbing");
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            // Crucial fix: keep d.fx and d.fy so the dragged node remains pinned where placed!
            d.fx = event.x;
            d.fy = event.y;
            d3.select(event.sourceEvent.target).style("cursor", "grab");
          })
      );

    // Layer 1: Outer Pulsating Aura Glow Ring
    nodeGroup
      .append("circle")
      .attr("r", 28)
      .attr("fill", (d) => getCategoryTheme(d.category).glow)
      .attr("stroke", (d) => getCategoryTheme(d.category).color)
      .attr("stroke-width", (d) => (d.id === selectedNodeId ? 2.5 : 1))
      .attr("stroke-dasharray", (d) => (d.category === "scam_source" ? "3,2" : "none"))
      .attr("opacity", (d) => (d.id === selectedNodeId ? 1 : 0.6));

    // Layer 2: Middle Concentric Ring
    nodeGroup
      .append("circle")
      .attr("r", 21)
      .attr("fill", (d) => getCategoryTheme(d.category).bg)
      .attr("stroke", (d) => getCategoryTheme(d.category).border)
      .attr("stroke-width", 1.5);

    // Layer 3: Solid Inner Node Core (Crisp White Disc)
    nodeGroup
      .append("circle")
      .attr("r", 15)
      .attr("fill", "#FFFFFF")
      .attr("stroke", (d) => getCategoryTheme(d.category).color)
      .attr("stroke-width", 2.5)
      .attr("filter", "url(#node-shadow)");

    // Layer 4: Centered Vector Glyph Icons Inside the Node Circle
    nodeGroup.each(function (d) {
      const gNode = d3.select(this);
      const iconGroup = gNode
        .append("g")
        .attr("transform", "translate(-7, -7) scale(0.6)")
        .attr("stroke", getCategoryTheme(d.category).color)
        .attr("stroke-width", "2.2")
        .attr("fill", "none")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round");

      switch (d.category) {
        case "victim":
          // Shield
          iconGroup.append("path").attr("d", "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z");
          break;
        case "scam_source":
          // Alert Triangle
          iconGroup
            .append("path")
            .attr(
              "d",
              "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            );
          iconGroup.append("line").attr("x1", "12").attr("y1", "9").attr("x2", "12").attr("y2", "13");
          iconGroup
            .append("circle")
            .attr("cx", "12")
            .attr("cy", "17")
            .attr("r", "0.5")
            .attr("fill", getCategoryTheme(d.category).color);
          break;
        case "mule":
          // Branch / Split
          iconGroup.append("line").attr("x1", "6").attr("y1", "3").attr("x2", "6").attr("y2", "15");
          iconGroup.append("circle").attr("cx", "18").attr("cy", "6").attr("r", "3");
          iconGroup.append("circle").attr("cx", "6").attr("cy", "18").attr("r", "3");
          iconGroup.append("path").attr("d", "M18 9a9 9 0 0 1-9 9");
          break;
        case "peel_chain":
          // Layers
          iconGroup.append("path").attr("d", "M12 2L2 7l10 5 10-5-10-5z");
          iconGroup.append("path").attr("d", "M2 17l10 5 10-5");
          iconGroup.append("path").attr("d", "M2 12l10 5 10-5");
          break;
        case "intermediary":
          // Flame
          iconGroup
            .append("path")
            .attr(
              "d",
              "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
            );
          break;
        case "destination":
          // Bank
          iconGroup.append("line").attr("x1", "3").attr("y1", "21").attr("x2", "21").attr("y2", "21");
          iconGroup.append("line").attr("x1", "6").attr("y1", "18").attr("x2", "6").attr("y2", "11");
          iconGroup.append("line").attr("x1", "10").attr("y1", "18").attr("x2", "10").attr("y2", "11");
          iconGroup.append("line").attr("x1", "14").attr("y1", "18").attr("x2", "14").attr("y2", "11");
          iconGroup.append("line").attr("x1", "18").attr("y1", "18").attr("x2", "18").attr("y2", "11");
          iconGroup.append("polygon").attr("points", "12 2 20 7 4 7");
          break;
        case "exchange":
        default:
          // Globe
          iconGroup.append("circle").attr("cx", "12").attr("cy", "12").attr("r", "10");
          iconGroup.append("line").attr("x1", "2").attr("y1", "12").attr("x2", "22").attr("y2", "12");
          iconGroup
            .append("path")
            .attr(
              "d",
              "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            );
          break;
      }
    });

    // Layer 5: Mini Floating Risk Chip (Top Right of Circle)
    nodeGroup
      .append("rect")
      .attr("x", 12)
      .attr("y", -26)
      .attr("width", 26)
      .attr("height", 15)
      .attr("rx", 4)
      .attr("fill", (d) => getCategoryTheme(d.category).bg)
      .attr("stroke", (d) => getCategoryTheme(d.category).border)
      .attr("stroke-width", 1);

    nodeGroup
      .append("text")
      .attr("x", 25)
      .attr("y", -15.5)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", "8px")
      .attr("font-weight", "800")
      .attr("fill", (d) => getCategoryTheme(d.category).color)
      .text((d) => `${d.riskScore}`);

    // Layer 6: Primary Entity Label (Below Node) with crisp white text halo
    nodeGroup
      .append("text")
      .attr("dy", 43)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-sans)")
      .attr("font-size", "11px")
      .attr("font-weight", "800")
      .attr("fill", "#0F172A")
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", "4px")
      .attr("paint-order", "stroke fill")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .text((d) => {
        const title = d.entityLabel.replace(/\(.*\)/, "").trim();
        return title.length > 17 ? title.slice(0, 16) + "…" : title;
      });

    // Layer 7: Secondary Short Address Tag (Below Label) with white halo
    nodeGroup
      .append("text")
      .attr("dy", 57)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", "9.5px")
      .attr("font-weight", "700")
      .attr("fill", "#64748B")
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", "3px")
      .attr("paint-order", "stroke fill")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .text((d) => `${d.id.slice(0, 6)}…${d.id.slice(-4)}`);

    // =========================================================================
    // D3 TICK HANDLER (Dynamic Physics Calculation)
    // =========================================================================
    simulation.on("tick", () => {
      // Update link straight coordinates
      linkPaths
        .attr("x1", (d) => (d.source as D3Node).x || 0)
        .attr("y1", (d) => (d.source as D3Node).y || 0)
        .attr("x2", (d) => (d.target as D3Node).x || 0)
        .attr("y2", (d) => (d.target as D3Node).y || 0);

      streamPaths
        .attr("x1", (d) => (d.source as D3Node).x || 0)
        .attr("y1", (d) => (d.source as D3Node).y || 0)
        .attr("x2", (d) => (d.target as D3Node).x || 0)
        .attr("y2", (d) => (d.target as D3Node).y || 0);

      // Position edge transfer labels at link midpoint with smart offset for long edges
      edgeLabelGroup.attr("transform", (d) => {
        const sx = (d.source as D3Node).x || 0;
        const sy = (d.source as D3Node).y || 0;
        const tx = (d.target as D3Node).x || 0;
        const ty = (d.target as D3Node).y || 0;
        
        let midX = (sx + tx) / 2;
        let midY = (sy + ty) / 2;

        // For tx_09 (Mule Gamma to Binance CEX), shift badge to 38% along path so it sits in clear space
        if (d.id === "tx_09") {
          midX = sx * 0.62 + tx * 0.38;
          midY = sy * 0.62 + ty * 0.38;
        }

        return `translate(${midX}, ${midY})`;
      });

      // Update circular node positions
      nodeGroup.attr("transform", (d) => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [filteredNodes, filteredEdges, selectedNodeId, layoutStyle]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden select-none"
    >
      {/* ========================================================================= */}
      {/* FLOATING TOP GRAPH TOOLBAR                                                */}
      {/* ========================================================================= */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
        {/* Left: Hop & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Hop Depth Selector */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-700 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-500 text-[11px] mr-1">Hop Depth:</span>
            {[1, 2, 3, 4].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setActiveHops(h);
                  if (onMaxHopsChange) onMaxHopsChange(h);
                }}
                className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeHops === h
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                {h}H
              </button>
            ))}
          </div>

          {/* Min Transfer Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/90 border border-slate-200 text-xs text-slate-700 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-semibold text-slate-500 text-[11px]">Min Transfer:</span>
            <select
              value={minAmountFilter}
              onChange={(e) => setMinAmountFilter(Number(e.target.value))}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value={0}>All Amounts ($0+)</option>
              <option value={10000}>≥ $10k USD</option>
              <option value={40000}>≥ $40k USD</option>
            </select>
          </div>

          {/* Physics Layout Style Toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/90 border border-slate-200 text-xs shadow-2xs">
            <button
              type="button"
              onClick={() => setLayoutStyle("organic")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutStyle === "organic"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Force-Directed Physics Simulation with Dynamic Organic Clustering"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Organic Force</span>
            </button>
            <button
              type="button"
              onClick={() => setLayoutStyle("staged")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                layoutStyle === "staged"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Sequential Multi-Hop Staged Topology"
            >
              <Workflow className="w-3 h-3 text-blue-400" />
              <span>Staged Flow</span>
            </button>
          </div>
        </div>

        {/* Right: Telemetry & Zoom Camera HUD */}
        <div className="flex items-center gap-2">
          {/* Live Node Count Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-mono text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{filteredNodes.length} Circular Nodes</span>
            <span>•</span>
            <span>{filteredEdges.length} Verified Transfers</span>
            <span>•</span>
            <span className="font-bold">$346.8k Traced</span>
          </div>

          {/* Camera Zoom Control Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFitView()}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Center & Fit View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetSimulation}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
              title="Reset D3 Physics Simulation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM FLOATING CATEGORY LEGEND BAR                                       */}
      {/* ========================================================================= */}
      <div className="absolute bottom-3 left-4 z-20 hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/90 backdrop-blur-xs border border-slate-200/90 shadow-2xs text-[11px] font-sans">
        <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
          Legend:
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100" />
          <span className="text-slate-700 font-semibold">Victim Escrow</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-100" />
          <span className="text-slate-700 font-semibold">Scam Aggregator</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-100" />
          <span className="text-slate-700 font-semibold">Layer-1 Mule</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-100" />
          <span className="text-slate-700 font-semibold">Peel Splitter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600 ring-2 ring-slate-200" />
          <span className="text-slate-700 font-semibold">Burner Siphon</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
          <span className="text-slate-700 font-semibold">CEX Exit</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200 text-slate-500 font-medium text-[10.5px]">
          <span>💡 Drag nodes to pin • Double-click node to float • Click canvas to deselect</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SVG CANVAS FOR D3 FORCE NETWORK GRAPH                                     */}
      {/* ========================================================================= */}
      <svg ref={svgRef} className="w-full h-full select-none" />

      {/* ========================================================================= */}
      {/* SLIDE-OUT NODE INSPECTOR DRAWER                                           */}
      {/* ========================================================================= */}
      {selectedNode && (
        <div className="absolute right-4 top-16 bottom-4 w-80 sm:w-96 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xl p-5 z-30 flex flex-col justify-between backdrop-blur-md animate-in slide-in-from-right duration-200 overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span
                  className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                  style={{
                    backgroundColor: getCategoryTheme(selectedNode.category).bg,
                    color: getCategoryTheme(selectedNode.category).color,
                    border: `1px solid ${getCategoryTheme(selectedNode.category).border}`,
                  }}
                >
                  {getCategoryTheme(selectedNode.category).label}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1 font-sans">
                  {selectedNode.entityLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectNode(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Address Bar */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-800 truncate">
                {selectedNode.id}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(selectedNode.id)}
                className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
                title="Copy address"
              >
                {copiedAddress === selectedNode.id ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Metrics 2x2 Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Risk Score:
                </span>
                <span
                  className="text-lg font-black mt-0.5 block font-mono"
                  style={{ color: getCategoryTheme(selectedNode.category).color }}
                >
                  {selectedNode.riskScore} / 100
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Balance:
                </span>
                <span className="text-lg font-black text-slate-900 mt-0.5 block font-mono">
                  ${selectedNode.balanceUsd.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Total Inflow:
                </span>
                <span className="text-xs font-bold text-emerald-700 mt-0.5 block font-mono">
                  +${selectedNode.totalInflowUsd.toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">
                  Total Outflow:
                </span>
                <span className="text-xs font-bold text-rose-700 mt-0.5 block font-mono">
                  -${selectedNode.totalOutflowUsd.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Risk Flags */}
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-1.5 uppercase tracking-wider text-[10px]">
                Forensic Risk Flags
              </span>
              <div className="space-y-1.5">
                {selectedNode.flaggedReasons.map((reason, idx) => (
                  <div
                    key={idx}
                    className="text-xs p-2 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 flex items-start gap-2"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-[11px] leading-tight">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Explorer Link */}
          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-semibold">{selectedNode.chain} EVM</span>
            <a
              href={`https://etherscan.io/address/${selectedNode.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <span>On-Chain Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
