import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SimulationEngine } from '../lib/simulation/SimulationEngine';
import { ProtocolDefinition } from '../lib/simulation/types';

const mockProtocol: ProtocolDefinition = {
  id: 'test-proto',
  name: 'TEST',
  title: 'Test Protocol',
  layer: 7,
  group: 'core',
  nodes: ['client', 'router', 'web'],
  overview: {
    full: 'Test Protocol Full',
    description: 'Test Description',
    facts: [['Port', '80']],
  },
  steps: [
    {
      title: 'Step 1',
      desc: 'First step',
      detail: 'Details of step 1',
      events: [
        { type: 'show', nodes: ['client', 'router'], frame: 'local' },
        { type: 'type-url', text: 'http://test.local' },
      ],
    },
    {
      title: 'Step 2',
      desc: 'Second step',
      detail: 'Details of step 2',
      events: [
        {
          type: 'packet',
          from: 'client',
          to: 'web',
          color: 'green',
          label: 'SYN',
          row: { time: '0.000', src: '192.168.1.5', dst: '1.2.3.4', proto: 'TCP', info: 'SYN', len: '64 B' },
          wire: { bytes: [1, 2, 3], fields: [], layers: [] },
        },
      ],
    },
    {
      title: 'Step 3',
      desc: 'Third step',
      detail: 'Render content',
      events: [{ type: 'render', content: 'Success' }],
    },
  ],
};

describe('SimulationEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with first step data and visible nodes', () => {
    const engine = new SimulationEngine(mockProtocol);
    const snap = engine.getSnapshot();

    expect(snap.status).toBe('idle');
    expect(snap.activeStep).toBe(0);
    expect(snap.totalSteps).toBe(3);
    expect(snap.urlBarText).toBe('http://test.local');
    expect(snap.visibleNodes).toContain('client');
    expect(snap.visibleNodes).toContain('router');
  });

  it('steps forward manually', () => {
    const engine = new SimulationEngine(mockProtocol);
    engine.step();

    let snap = engine.getSnapshot();
    expect(snap.activeStep).toBe(1);
    expect(snap.shownPackets.length).toBe(1);
    expect(snap.activePacket?.label).toBe('SYN');

    engine.step();
    snap = engine.getSnapshot();
    expect(snap.activeStep).toBe(2);
    expect(snap.isRendered).toBe(true);

    engine.step();
    snap = engine.getSnapshot();
    expect(snap.status).toBe('done');
  });

  it('jumps directly to a step accumulating previous events', () => {
    const engine = new SimulationEngine(mockProtocol);
    engine.jump(2);

    const snap = engine.getSnapshot();
    expect(snap.activeStep).toBe(2);
    expect(snap.urlBarText).toBe('http://test.local');
    expect(snap.shownPackets.length).toBe(1);
    expect(snap.isRendered).toBe(true);
  });

  it('plays automatically and advances steps on timer', () => {
    const engine = new SimulationEngine(mockProtocol, 1);
    engine.play();
    expect(engine.getSnapshot().status).toBe('running');

    vi.advanceTimersByTime(2000);
    expect(engine.getSnapshot().activeStep).toBe(1);

    vi.advanceTimersByTime(2000);
    expect(engine.getSnapshot().activeStep).toBe(2);

    vi.advanceTimersByTime(2000);
    expect(engine.getSnapshot().status).toBe('done');
  });

  it('resets correctly back to step 0', () => {
    const engine = new SimulationEngine(mockProtocol);
    engine.jump(2);
    engine.reset();

    const snap = engine.getSnapshot();
    expect(snap.activeStep).toBe(0);
    expect(snap.shownPackets.length).toBe(0);
    expect(snap.isRendered).toBe(false);
  });

  it('starts at step 1 immediately with initial events applied', () => {
    const protoWithPacketAtStep0: ProtocolDefinition = {
      ...mockProtocol,
      steps: [
        {
          title: 'Step 1 packet',
          desc: 'Immediate packet',
          detail: 'Packet at step 0',
          events: [
            {
              type: 'packet',
              from: 'client',
              to: 'router',
              color: 'blue',
              label: 'INIT',
              row: { time: '0.000', src: '192.168.1.5', dst: '192.168.1.1', proto: 'ARP', info: 'Who has', len: '42 B' },
              wire: { bytes: [1, 2], fields: [], layers: [] },
            },
          ],
        },
        ...mockProtocol.steps.slice(1),
      ],
    };

    const engine = new SimulationEngine(protoWithPacketAtStep0);
    const snap = engine.getSnapshot();
    expect(snap.activeStep).toBe(0);
    expect(snap.shownPackets.length).toBe(1);
    expect(snap.activePacket?.label).toBe('INIT');
  });

  it('plays multi-packet steps sequentially (request from client then reply from server)', () => {
    const multiPacketProto: ProtocolDefinition = {
      ...mockProtocol,
      steps: [
        {
          title: 'DNS Resolution',
          desc: 'Query and reply',
          detail: 'Resolve IP',
          events: [
            {
              type: 'packet',
              from: 'client',
              to: 'dns',
              color: 'blue',
              label: 'DNS QUERY',
              row: { time: '0.000', src: '192.168.1.10', dst: '8.8.8.8', proto: 'DNS', info: 'Standard query', len: '60 B' },
              wire: { bytes: [1], fields: [], layers: [] },
            },
            {
              type: 'packet',
              from: 'dns',
              to: 'client',
              color: 'blue',
              label: 'DNS REPLY',
              row: { time: '0.012', src: '8.8.8.8', dst: '192.168.1.10', proto: 'DNS', info: 'Standard response', len: '76 B' },
              wire: { bytes: [2], fields: [], layers: [] },
            },
          ],
        },
      ],
    };

    const engine = new SimulationEngine(multiPacketProto);
    // Au départ, le premier paquet (la requête du client) est actif
    expect(engine.getSnapshot().activePacket?.label).toBe('DNS QUERY');
    expect(engine.getSnapshot().activePacket?.from).toBe('client');

    // Avancer d'un cran : la réponse du serveur devient active
    engine.step();
    expect(engine.getSnapshot().activePacket?.label).toBe('DNS REPLY');
    expect(engine.getSnapshot().activePacket?.from).toBe('dns');

    // Avancer d'un cran : terminé
    engine.step();
    expect(engine.getSnapshot().status).toBe('done');
  });
});
