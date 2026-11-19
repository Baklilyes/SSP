import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../../../lib/simulation/SimulationEngine';
import { tcpipBasicScenario } from '../../../lib/simulation/scenarios/tcpip/tcpipScenario';
import { TCPIPInfographicOverlay } from '../../../components/tcpip/TCPIPInfographicOverlay';
import fs from 'fs';
import path from 'path';

describe('TCP/IP Model Infographic Overlay Integration', () => {
  it('TCPIPInfographicOverlay component is exported properly', () => {
    expect(TCPIPInfographicOverlay).toBeDefined();
    expect(typeof TCPIPInfographicOverlay).toBe('function');
  });

  it('detects TCP/IP simulation completion (status === "done") when all 12 steps complete', () => {
    const engine = new SimulationEngine(tcpipBasicScenario);
    expect(engine.getSnapshot().status).toBe('idle');

    // Jump to the last step (index 11)
    engine.jump(11);
    expect(engine.getSnapshot().activeStep).toBe(11);

    // Stepping past the last step triggers 'done'
    engine.step();
    expect(engine.getSnapshot().status).toBe('done');
  });

  it('API route for TCP/IP image exists and is readable', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'tcpip-image', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('image/jpeg');
    expect(content).toContain('GET');
    expect(content).toContain('tcpip_b64.txt');
  });

  it('API route for TCP/IP video exists and serves video/mp4', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'tcpip-video', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('video/mp4');
    expect(content).toContain('GET');
    expect(content).toContain('Content-Range');
  });

  it('TCPIPInfographicOverlay references the tcpip-video endpoint and HTML5 video element', () => {
    const componentPath = path.join(process.cwd(), 'components', 'tcpip', 'TCPIPInfographicOverlay.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('/api/tcpip-video');
    expect(content).toContain('<video');
    expect(content).toContain('autoPlay');
    expect(content).toContain('controls');
  });
});
