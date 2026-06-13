"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface OrbPosition {
  x: number;
  y: number;
}

interface OrbBody extends OrbPosition {
  vx: number;
  vy: number;
  radius: number;
  /** When true, physics briefly pushes the orb outward before it drifts home */
  escaping: boolean;
}

const FRICTION = 0.985;
const WANDER_FORCE = 0.012;
const RETURN_FORCE = 0.0025;
const REPULSION = 0.35;

/**
 * Simulates a small cluster of "thought orbs" gently floating inside the
 * Memory Jar. Orbs wander, softly collide, and - when released after a drag -
 * drift back toward the center of the jar rather than snapping back.
 */
export function useTaskPhysics(
  orbIds: string[],
  jarRadius: number,
  orbRadius = 36,
) {
  const bodiesRef = useRef<Map<string, OrbBody>>(new Map());
  const [positions, setPositions] = useState<Record<string, OrbPosition>>({});
  const frameRef = useRef<number | undefined>(undefined);

  // Initialize / sync bodies when orb list changes
  useEffect(() => {
    const bodies = bodiesRef.current;

    // Remove stale orbs
    for (const id of Array.from(bodies.keys())) {
      if (!orbIds.includes(id)) bodies.delete(id);
    }

    // Add new orbs at a random point inside the jar
    orbIds.forEach((id) => {
      if (!bodies.has(id)) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * (jarRadius - orbRadius) * 0.7;
        bodies.set(id, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: orbRadius,
          escaping: false,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orbIds.join(","), jarRadius, orbRadius]);

  useEffect(() => {
    const tick = () => {
      const bodies = bodiesRef.current;
      const list = Array.from(bodies.entries());

      // Pairwise gentle repulsion so orbs don't overlap
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const [, a] = list[i];
          const [, b] = list[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDist = a.radius + b.radius;
          if (dist < minDist) {
            const overlap = (minDist - dist) / dist;
            const pushX = dx * overlap * REPULSION * 0.5;
            const pushY = dy * overlap * REPULSION * 0.5;
            a.vx -= pushX * 0.05;
            a.vy -= pushY * 0.05;
            b.vx += pushX * 0.05;
            b.vy += pushY * 0.05;
          }
        }
      }

      for (const [, body] of list) {
        // Gentle random wander
        body.vx += (Math.random() - 0.5) * WANDER_FORCE;
        body.vy += (Math.random() - 0.5) * WANDER_FORCE;

        // Pull softly back toward the jar's center (more if escaping)
        const pull = body.escaping ? RETURN_FORCE * 6 : RETURN_FORCE;
        body.vx += -body.x * pull;
        body.vy += -body.y * pull;

        // Friction / damping
        body.vx *= FRICTION;
        body.vy *= FRICTION;

        body.x += body.vx;
        body.y += body.vy;

        // Contain within jar - soft bounce off the circular wall
        const distFromCenter = Math.sqrt(body.x * body.x + body.y * body.y);
        const maxDist = jarRadius - body.radius;
        if (distFromCenter > maxDist) {
          if (body.escaping && distFromCenter > maxDist * 1.18) {
            // allow a brief peek outside the jar before pulling back
          } else {
            const angle = Math.atan2(body.y, body.x);
            body.x = Math.cos(angle) * maxDist;
            body.y = Math.sin(angle) * maxDist;
            body.vx *= -0.3;
            body.vy *= -0.3;
            body.escaping = false;
          }
        }
      }

      const next: Record<string, OrbPosition> = {};
      for (const [id, body] of list) {
        next[id] = { x: body.x, y: body.y };
      }
      setPositions(next);

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [jarRadius]);

  /** Called while a user drags an orb - syncs physics body to pointer position */
  const setOrbPosition = useCallback((id: string, pos: OrbPosition) => {
    const body = bodiesRef.current.get(id);
    if (!body) return;
    body.vx = pos.x - body.x;
    body.vy = pos.y - body.y;
    body.x = pos.x;
    body.y = pos.y;
  }, []);

  /** Called on drag release - the orb tries to escape, then drifts home */
  const releaseOrb = useCallback((id: string, velocity: OrbPosition) => {
    const body = bodiesRef.current.get(id);
    if (!body) return;
    body.vx = velocity.x * 0.06;
    body.vy = velocity.y * 0.06;
    body.escaping = true;
    setTimeout(() => {
      const b = bodiesRef.current.get(id);
      if (b) b.escaping = false;
    }, 900);
  }, []);

  return { positions, setOrbPosition, releaseOrb };
}
