import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../../../lib/simulation/SimulationEngine';
import { osiBasicScenario, getOsiScenario } from '../../../lib/simulation/scenarios/osi/osiScenario';
import { OSI_SIMULATION_STEPS, getOsiSteps } from '../../../lib/simulation/scenarios/osi/osiEvents';
import { getProtocol } from '../../../lib/protocols/registry';

describe('OSI SimulationEngine Integration', () => {
  it('executes the OSI scenario directly using the canonical SimulationEngine', () => {
    const engine = new SimulationEngine(osiBasicScenario);
    const snap = engine.getSnapshot();

    expect(snap).toBeDefined();
    expect(snap.totalSteps).toBe(12);
    expect(snap.activeStep).toBe(0);
    expect(snap.status).toBe('idle');
  });

  it('steps forward deterministically one step at a time', () => {
    const engine = new SimulationEngine(osiBasicScenario);

    engine.step();
    expect(engine.getSnapshot().activeStep).toBe(1);

    engine.step();
    expect(engine.getSnapshot().activeStep).toBe(2);

    engine.step();
    expect(engine.getSnapshot().activeStep).toBe(3);
  });

  it('steps backward restoring the previous step', () => {
    const engine = new SimulationEngine(osiBasicScenario);

    engine.jump(5);
    expect(engine.getSnapshot().activeStep).toBe(5);

    engine.prev();
    expect(engine.getSnapshot().activeStep).toBe(4);

    engine.prev();
    expect(engine.getSnapshot().activeStep).toBe(3);
  });

  it('jumps directly to a targeted step', () => {
    const engine = new SimulationEngine(osiBasicScenario);

    engine.jump(8);
    expect(engine.getSnapshot().activeStep).toBe(8);

    engine.jump(0);
    expect(engine.getSnapshot().activeStep).toBe(0);
  });

  it('resets back to initial state properly', () => {
    const engine = new SimulationEngine(osiBasicScenario);

    engine.jump(10);
    expect(engine.getSnapshot().activeStep).toBe(10);

    engine.reset();
    const snap = engine.getSnapshot();
    expect(snap.activeStep).toBe(0);
    expect(snap.status).toBe('idle');
  });

  it('adjusts simulation speed', () => {
    const engine = new SimulationEngine(osiBasicScenario);

    engine.setSpeed(2);
    expect(engine.getSnapshot().speed).toBe(2);

    engine.setSpeed(0.5);
    expect(engine.getSnapshot().speed).toBe(0.5);
  });

  it('contains complete 12-step scenario with correct layer progression', () => {
    const steps = OSI_SIMULATION_STEPS;
    expect(steps).toHaveLength(12);

    // Step 0: Application
    expect(steps[0].osiMeta.layer).toBe(7);
    expect(steps[0].osiMeta.action).toBe('data-created');

    // Step 3: Transport (+ TCP)
    expect(steps[3].osiMeta.layer).toBe(4);
    expect(steps[3].osiMeta.action).toBe('add-tcp');

    // Step 4: Network (+ IP)
    expect(steps[4].osiMeta.layer).toBe(3);
    expect(steps[4].osiMeta.action).toBe('add-ip');

    // Step 5: Data Link (+ Ethernet)
    expect(steps[5].osiMeta.layer).toBe(2);
    expect(steps[5].osiMeta.action).toBe('add-ethernet');

    // Step 6 & 7: Physical transmission
    expect(steps[6].osiMeta.layer).toBe(1);
    expect(steps[7].osiMeta.layer).toBe(1);

    // Step 8: Decapsulation (- Ethernet)
    expect(steps[8].osiMeta.layer).toBe(2);
    expect(steps[8].osiMeta.action).toBe('strip-ethernet');

    // Step 9: Decapsulation (- IP)
    expect(steps[9].osiMeta.layer).toBe(3);
    expect(steps[9].osiMeta.action).toBe('strip-ip');

    // Step 10: Decapsulation (- TCP)
    expect(steps[10].osiMeta.layer).toBe(4);
    expect(steps[10].osiMeta.action).toBe('strip-tcp');

    // Step 11: Data delivered
    expect(steps[11].osiMeta.layer).toBe(7);
    expect(steps[11].osiMeta.action).toBe('data-delivered');
  });

  it('supports English and French bilingual localization dynamically', () => {
    const frScenario = getOsiScenario('fr');
    const enScenario = getOsiScenario('en');

    expect(frScenario.title).toContain('Modèle OSI');
    expect(enScenario.title).toContain('OSI 7-Layer Model');
    expect(enScenario.overview?.facts?.[0][0]).toBe('Standardization');
    expect(frScenario.overview?.facts?.[0][0]).toBe('Standardisation');

    const frSteps = getOsiSteps('fr');
    const enSteps = getOsiSteps('en');

    expect(frSteps[0].title).toBe('Création du message applicatif');
    expect(enSteps[0].title).toBe('Application Message Creation');
    expect(enSteps[3].title).toBe('Transport Encapsulation: TCP Header');
    expect(frSteps[3].title).toBe('Encapsulation Transport : En-tête TCP');

    // Registry integration
    const regFr = getProtocol('osi', 'fr');
    const regEn = getProtocol('osi', 'en');
    expect(regFr.title).toContain('Modèle OSI');
    expect(regEn.title).toContain('OSI 7-Layer Model');
  });
});
