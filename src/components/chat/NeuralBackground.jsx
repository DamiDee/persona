// NeuralBackground — Canvas 2D neural network with cursor-reactive nodes
// Positioned fixed behind all content, pointer-events: none.
// Respects prefers-reduced-motion (renders static version).

import { useEffect, useRef, useCallback } from "react";
import { useCursorPosition } from "../../hooks/useCursorPosition";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useThemeStore } from "../../store/useThemeStore";

const NODE_COUNT = 60;
const CONNECTION_DISTANCE = 140;
const CURSOR_REPEL_RADIUS = 120;
const CURSOR_REPEL_STRENGTH = 0.012;
const DRIFT_SPEED = 0.0004;

function createNodes(width, height) {
  return Array.from({ length: NODE_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    baseX: Math.random() * width,
    baseY: Math.random() * height,
    phase: Math.random() * Math.PI * 2,
    radius: Math.random() * 2 + 1.5,
    phaseSpeed: Math.random() * 0.5 + 0.5,
  }));
}

export function NeuralBackground({ opacity = 0.07 }) {
  const canvasRef = useRef(null);
  const nodesRef = useRef([]);
  const animFrameRef = useRef(null);
  const timeRef = useRef(0);
  const cursor = useCursorPosition(20);
  const prefersReduced = useReducedMotion();
  const theme = useThemeStore((s) => s.getEffectiveTheme());
  const isDark = theme === "dark";

  // Colors adapt to theme
  const nodeColor = isDark
    ? `rgba(34, 211, 238, ${opacity * 1.5})`
    : `rgba(0, 194, 209, ${opacity * 1.2})`;
  const lineColor = isDark
    ? `rgba(34, 211, 238, ${opacity * 0.6})`
    : `rgba(0, 194, 209, ${opacity * 0.5})`;
  const activeNodeColor = isDark
    ? `rgba(103, 232, 249, ${opacity * 4})`
    : `rgba(0, 229, 255, ${opacity * 3.5})`;
  const activeLineColor = isDark
    ? `rgba(34, 211, 238, ${opacity * 2.5})`
    : `rgba(0, 194, 209, ${opacity * 2})`;

  const draw = useCallback(
    (ctx, width, height, nodes, time, cursorX, cursorY) => {
      ctx.clearRect(0, 0, width, height);

      if (prefersReduced) {
        // Static version: just draw nodes and connections without animation
        nodes.forEach((node) => {
          ctx.beginPath();
          ctx.arc(node.baseX, node.baseY, node.radius, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor;
          ctx.fill();
        });
        return;
      }

      // Update node positions with sinusoidal drift
      nodes.forEach((node) => {
        node.x =
          node.baseX +
          Math.sin(time * DRIFT_SPEED * node.phaseSpeed + node.phase) * 40;
        node.y =
          node.baseY +
          Math.cos(time * DRIFT_SPEED * node.phaseSpeed * 0.7 + node.phase) * 30;

        // Cursor repulsion
        const dx = node.x - cursorX;
        const dy = node.y - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_REPEL_RADIUS && dist > 0) {
          const force = (CURSOR_REPEL_RADIUS - dist) / CURSOR_REPEL_RADIUS;
          node.x += (dx / dist) * force * CURSOR_REPEL_RADIUS * CURSOR_REPEL_STRENGTH * 10;
          node.y += (dy / dist) * force * CURSOR_REPEL_RADIUS * CURSOR_REPEL_STRENGTH * 10;
        }
      });

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DISTANCE) {
            const alpha = 1 - dist / CONNECTION_DISTANCE;

            // Check if either node is near cursor
            const aCursorDist = Math.sqrt(
              (a.x - cursorX) ** 2 + (a.y - cursorY) ** 2
            );
            const bCursorDist = Math.sqrt(
              (b.x - cursorX) ** 2 + (b.y - cursorY) ** 2
            );
            const nearCursor =
              aCursorDist < CURSOR_REPEL_RADIUS ||
              bCursorDist < CURSOR_REPEL_RADIUS;

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = nearCursor ? activeLineColor : lineColor;
            ctx.lineWidth = nearCursor ? 1.5 : 0.8;
            ctx.globalAlpha = alpha * (nearCursor ? 1.6 : 1);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        const cursorDist = Math.sqrt(
          (node.x - cursorX) ** 2 + (node.y - cursorY) ** 2
        );
        const nearCursor = cursorDist < CURSOR_REPEL_RADIUS;

        ctx.beginPath();
        ctx.arc(
          node.x,
          node.y,
          nearCursor ? node.radius * 1.8 : node.radius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = nearCursor ? activeNodeColor : nodeColor;
        ctx.fill();

        // Glow for near-cursor nodes
        if (nearCursor) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = activeNodeColor.replace(/[\d.]+\)$/, "0.03)");
          ctx.fill();
        }
      });
    },
    [prefersReduced, nodeColor, lineColor, activeNodeColor, activeLineColor]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    nodesRef.current = createNodes(width, height);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      nodesRef.current = createNodes(width, height);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        cancelAnimationFrame(animFrameRef.current);
      } else {
        animate();
      }
    };

    const animate = () => {
      timeRef.current += 16;
      draw(ctx, width, height, nodesRef.current, timeRef.current, cursor.x, cursor.y);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    if (prefersReduced) {
      // Just draw once
      draw(ctx, width, height, nodesRef.current, 0, -1000, -1000);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [draw, prefersReduced]);

  // Update animation when cursor moves (via re-render, canvas reads latest cursor from closure)
  // The animate loop already captures cursor.x/y from the outer scope via the draw callback.

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity }}
      aria-hidden="true"
    />
  );
}

export default NeuralBackground;
