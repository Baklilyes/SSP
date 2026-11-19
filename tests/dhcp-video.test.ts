import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../lib/simulation/SimulationEngine';
import { dhcpProtocol } from '../lib/protocols/application/dhcp';
import { DHCPVideoOverlay } from '../components/dhcp/DHCPVideoOverlay';
import fs from 'fs';
import path from 'path';

describe('DHCP Protocol Video Integration', () => {
  it('DHCPVideoOverlay component is defined and exported', () => {
    expect(DHCPVideoOverlay).toBeDefined();
    expect(typeof DHCPVideoOverlay).toBe('function');
  });

  it('detects DHCP simulation completion (status === "done") when all steps complete', () => {
    const engine = new SimulationEngine(dhcpProtocol);
    expect(engine.getSnapshot().status).toBe('idle');

    // Jump to the last step of DHCP (index 3: ACK)
    const lastStep = dhcpProtocol.steps.length - 1;
    engine.jump(lastStep);
    expect(engine.getSnapshot().activeStep).toBe(lastStep);

    // Stepping past the last step triggers 'done'
    engine.step();
    expect(engine.getSnapshot().status).toBe('done');
  });

  it('API route for DHCP video exists and serves video/mp4', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'dhcp-video', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('video/mp4');
    expect(content).toContain('GET');
    expect(content).toContain('Content-Range');
  });

  it('DHCPVideoOverlay references the dhcp-video endpoint and HTML5 video element', () => {
    const componentPath = path.join(process.cwd(), 'components', 'dhcp', 'DHCPVideoOverlay.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('/api/dhcp-video');
    expect(content).toContain('<video');
    expect(content).toContain('autoPlay');
    expect(content).toContain('controls');
  });
});
