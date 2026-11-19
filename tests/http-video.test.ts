import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../lib/simulation/SimulationEngine';
import { httpProtocol } from '../lib/protocols/application/http';
import { HTTPVideoOverlay } from '../components/http/HTTPVideoOverlay';
import fs from 'fs';
import path from 'path';

describe('HTTP Protocol Video Integration', () => {
  it('HTTPVideoOverlay component is defined and exported', () => {
    expect(HTTPVideoOverlay).toBeDefined();
    expect(typeof HTTPVideoOverlay).toBe('function');
  });

  it('detects HTTP simulation completion (status === "done") when all steps complete', () => {
    const engine = new SimulationEngine(httpProtocol);
    expect(engine.getSnapshot().status).toBe('idle');

    // Jump to the last step of HTTP
    const lastStep = httpProtocol.steps.length - 1;
    engine.jump(lastStep);
    expect(engine.getSnapshot().activeStep).toBe(lastStep);

    // Stepping past the last step triggers 'done'
    engine.step();
    expect(engine.getSnapshot().status).toBe('done');
  });

  it('API route for HTTP video exists and serves video/mp4', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'http-video', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('video/mp4');
    expect(content).toContain('GET');
    expect(content).toContain('Content-Range');
  });

  it('HTTPVideoOverlay references the http-video endpoint and HTML5 video element', () => {
    const componentPath = path.join(process.cwd(), 'components', 'http', 'HTTPVideoOverlay.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('/api/http-video');
    expect(content).toContain('<video');
    expect(content).toContain('autoPlay');
    expect(content).toContain('controls');
  });
});
