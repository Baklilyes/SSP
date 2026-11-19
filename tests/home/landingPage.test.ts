import { describe, it, expect } from 'vitest';
import { SSPLandingPage } from '../../components/home/SSPLandingPage';
import fs from 'fs';
import path from 'path';

describe('SSP Academy Landing Page Integration', () => {
  it('SSPLandingPage component is exported and defined', () => {
    expect(SSPLandingPage).toBeDefined();
    expect(typeof SSPLandingPage).toBe('function');
  });

  it('API route for ssp-logo exists and is valid', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'ssp-logo', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('ssp-academy.com');
    expect(content).toContain('GET');
  });

  it('SSPLandingPage source includes Interactive PROTOCOL card next to TCP/IP', () => {
    const componentPath = path.join(process.cwd(), 'components', 'home', 'SSPLandingPage.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('Interactive');
    expect(content).toContain('PROTOCOL');
    expect(content).toContain('onSelectInteractiveProtocol');
  });
});
