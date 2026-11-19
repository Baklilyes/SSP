'use client';

import { useState, useCallback } from 'react';
import { PacketEvent } from '../lib/simulation/types';

export function useInspector() {
  const [isOpen, setIsOpen] = useState(false);
  const [inspectedIndex, setInspectedIndex] = useState<number | null>(null);
  const [activePacket, setActivePacket] = useState<PacketEvent | null>(null);

  const open = useCallback((packet: PacketEvent, index: number) => {
    setActivePacket(packet);
    setInspectedIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setInspectedIndex(null);
    setActivePacket(null);
  }, []);

  const step = useCallback(
    (direction: number, packets: PacketEvent[]) => {
      if (inspectedIndex === null || packets.length === 0) return;
      const nextIndex = inspectedIndex + direction;
      if (nextIndex >= 0 && nextIndex < packets.length) {
        setInspectedIndex(nextIndex);
        setActivePacket(packets[nextIndex]);
      }
    },
    [inspectedIndex]
  );

  return {
    isOpen,
    inspectedIndex,
    activePacket,
    open,
    close,
    step,
  };
}
