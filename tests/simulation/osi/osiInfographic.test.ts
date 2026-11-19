import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../../../lib/simulation/SimulationEngine';
import { osiBasicScenario } from '../../../lib/simulation/scenarios/osi/osiScenario';
import { OSIInfographicOverlay } from '../../../components/osi/OSIInfographicOverlay';
import fs from 'fs';
import path from 'path';

describe('OSI Model Infographic Integration', () => {
  it('OSIInfographicOverlay component is exported properly', () => {
    expect(OSIInfographicOverlay).toBeDefined();
    expect(typeof OSIInfographicOverlay).toBe('function');
  });

  it('detects simulation completion (status === "done") when all 12 steps complete', () => {
    const engine = new SimulationEngine(osiBasicScenario);
    expect(engine.getSnapshot().status).toBe('idle');

    // Jump to the last step (index 11)
    engine.jump(11);
    expect(engine.getSnapshot().activeStep).toBe(11);

    // Stepping past the last step triggers 'done'
    engine.step();
    expect(engine.getSnapshot().status).toBe('done');
  });

  it('API route for OSI image exists and is readable', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'osi-image', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('image/jpeg');
    expect(content).toContain('GET');
  });

  it('API route for OSI video exists and serves video/mp4', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'osi-video', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('video/mp4');
    expect(content).toContain('GET');
  });

  it('OSIInfographicOverlay references the osi-video endpoint', () => {
    const componentPath = path.join(process.cwd(), 'components', 'osi', 'OSIInfographicOverlay.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('/api/osi-video');
    expect(content).toContain('<video');
  });
});
