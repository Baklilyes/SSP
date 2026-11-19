import { describe, it, expect } from 'vitest';
import {
  tcpipBasicScenario,
  getTcpipScenario,
} from '../../../lib/simulation/scenarios/tcpip/tcpipScenario';
import { SimulationEngine } from '../../../lib/simulation/SimulationEngine';

describe('TCP/IP Scenario & SimulationEngine Integration', () => {
  it('registers tcpip scenario with 12 deterministic steps', () => {
    expect(tcpipBasicScenario.id).toBe('tcpip');
    expect(tcpipBasicScenario.layer).toBe(4);
    expect(tcpipBasicScenario.steps).toHaveLength(12);
  });

  it('supports bilingual locales (French & English)', () => {
    const frScenario = getTcpipScenario('fr');
    expect(frScenario.title).toContain('TCP/IP');
    expect(frScenario.steps[0].title).toBe('Création du message applicatif (L4)');

    const enScenario = getTcpipScenario('en');
    expect(enScenario.steps[0].title).toBe('Application Message Creation (L4)');
    expect(enScenario.steps[11].title).toBe('Server: Application Reception & Delivery (L4)');
  });

  it('supports UDP transport mode', () => {
    const udpScenario = getTcpipScenario('fr', 'UDP');
    expect(udpScenario.steps[1].title).toContain('UDP');
    expect(udpScenario.steps[10].title).toContain('UDP');
  });

  it('runs smoothly with the standard SimulationEngine', () => {
    const scenario = getTcpipScenario('fr');
    const engine = new SimulationEngine(scenario);

    let snapshot = engine.getSnapshot();
    expect(snapshot.activeStep).toBe(0);
    expect(snapshot.status).toBe('idle');
    expect(snapshot.totalSteps).toBe(12);

    // Step forward through all 12 steps
    for (let i = 1; i < 12; i++) {
      engine.step();
      snapshot = engine.getSnapshot();
      expect(snapshot.activeStep).toBe(i);
    }

    // Step on last step marks done
    engine.step();
    snapshot = engine.getSnapshot();
    expect(snapshot.status).toBe('done');

    // Step backward
    engine.prev();
    snapshot = engine.getSnapshot();
    expect(snapshot.activeStep).toBe(10);

    // Jump to router step (step 6 = index 6)
    engine.jump(6);
    snapshot = engine.getSnapshot();
    expect(snapshot.activeStep).toBe(6);

    // Reset back to start
    engine.reset();
    snapshot = engine.getSnapshot();
    expect(snapshot.activeStep).toBe(0);
    expect(snapshot.status).toBe('idle');
  });
});
