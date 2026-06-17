"use client";

// Hold-and-drag horizontal scrolling for a scroll container (e.g. the tournament
// timeline rail). Mouse only — touch/pen fall through to native momentum
// scrolling, so this never breaks mobile. After an actual drag (> threshold px),
// the next click is suppressed so a drag does not also navigate a card link.

import { useCallback, useRef, useState } from "react";

const DRAG_THRESHOLD_PX = 5;

type DragScrollHandlers = {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  onClickCapture: (event: React.MouseEvent<HTMLDivElement>) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
};

export type UseDragScroll = {
  ref: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  dragProps: DragScrollHandlers;
};

export function useDragScroll(): UseDragScroll {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const state = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
    pointerId: -1,
  });

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Let touch/pen use native scrolling; only hijack mouse drags.
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      const el = ref.current;
      if (el === null) return;
      state.current.active = true;
      state.current.startX = event.clientX;
      state.current.scrollLeft = el.scrollLeft;
      state.current.hasDragged = false;
      state.current.pointerId = event.pointerId;
      // Do NOT capture the pointer here. Capturing on pointerdown retargets the
      // trailing `click` to this container (the common ancestor of down/up), so
      // a plain click never reaches the card's <a> and navigation silently
      // fails. We capture lazily in onPointerMove once a real drag begins.
      setIsDragging(true);
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (el === null || !state.current.active) return;
      const delta = event.clientX - state.current.startX;
      if (!state.current.hasDragged && Math.abs(delta) > DRAG_THRESHOLD_PX) {
        state.current.hasDragged = true;
        // Now that it's a real drag, capture so we keep receiving moves even if
        // the cursor leaves the rail. A plain click never reaches this branch,
        // so its trailing click still lands on the card's <a>.
        el.setPointerCapture?.(event.pointerId);
      }
      el.scrollLeft = state.current.scrollLeft - delta;
    },
    [],
  );

  const endDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!state.current.active) return;
    const el = ref.current;
    if (el?.hasPointerCapture?.(event.pointerId)) {
      el.releasePointerCapture?.(event.pointerId);
    }
    state.current.active = false;
    setIsDragging(false);
  }, []);

  // A drag that ends over a card would otherwise fire a click and navigate.
  const onClickCapture = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (state.current.hasDragged) {
        event.preventDefault();
        event.stopPropagation();
        state.current.hasDragged = false;
      }
    },
    [],
  );

  // Stop the browser's native link/image drag from fighting our pointer drag.
  const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  return {
    ref,
    isDragging,
    dragProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onClickCapture,
      onDragStart,
    },
  };
}
