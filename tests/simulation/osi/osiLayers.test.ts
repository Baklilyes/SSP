import { describe, it, expect } from 'vitest';
import {
  OSI_LAYERS,
  OSI_LAYERS_TOP_DOWN,
  OSI_LAYERS_BOTTOM_UP,
  getLayerByNumber,
  getLayerById,
} from '../../../lib/simulation/scenarios/osi/osiLayers';

describe('OSI Layers Domain Model', () => {
  it('defines exactly seven layers', () => {
    expect(OSI_LAYERS).toHaveLength(7);
  });

  it('maintains strict top-down order from Layer 7 to Layer 1', () => {
    const numbers = OSI_LAYERS_TOP_DOWN.map((l) => l.number);
    expect(numbers).toEqual([7, 6, 5, 4, 3, 2, 1]);
  });

  it('maintains bottom-up order from Layer 1 to Layer 7', () => {
    const numbers = OSI_LAYERS_BOTTOM_UP.map((l) => l.number);
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('contains valid PDU units for each layer', () => {
    const units = OSI_LAYERS_TOP_DOWN.map((l) => l.unit);
    expect(units).toEqual(['data', 'data', 'data', 'segment', 'packet', 'frame', 'bits']);
  });

  it('correctly retrieves layers by number', () => {
    expect(getLayerByNumber(7).nameEn).toBe('Application');
    expect(getLayerByNumber(4).nameEn).toBe('Transport');
    expect(getLayerByNumber(3).nameEn).toBe('Network');
    expect(getLayerByNumber(2).nameEn).toBe('Data Link');
    expect(getLayerByNumber(1).nameEn).toBe('Physical');
  });

  it('correctly retrieves layers by id', () => {
    expect(getLayerById('application')?.number).toBe(7);
    expect(getLayerById('transport')?.number).toBe(4);
    expect(getLayerById('network')?.number).toBe(3);
    expect(getLayerById('data-link')?.number).toBe(2);
    expect(getLayerById('physical')?.number).toBe(1);
  });
});
