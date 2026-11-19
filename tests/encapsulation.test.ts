import { describe, it, expect } from 'vitest';
import { EncapsulationView } from '../components/encapsulation/EncapsulationView';
import fs from 'fs';
import path from 'path';

describe('Encapsulation and Decapsulation Tab Integration', () => {
  it('EncapsulationView component is exported and defined', () => {
    expect(EncapsulationView).toBeDefined();
    expect(typeof EncapsulationView).toBe('function');
  });

  it('API route for encapsulation-video exists and serves video/mp4', () => {
    const routePath = path.join(process.cwd(), 'app', 'api', 'encapsulation-video', 'route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf8');
    expect(content).toContain('video/mp4');
    expect(content).toContain('GET');
  });

  it('EncapsulationView embeds the video element with proper source', () => {
    const componentPath = path.join(process.cwd(), 'components', 'encapsulation', 'EncapsulationView.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);
    const content = fs.readFileSync(componentPath, 'utf8');
    expect(content).toContain('/api/encapsulation-video');
    expect(content).toContain('<video');
    expect(content).toContain('autoPlay');
  });

  it('Topbar component includes onSelectEncapsulation button', () => {
    const topbarPath = path.join(process.cwd(), 'components', 'layout', 'Topbar.tsx');
    expect(fs.existsSync(topbarPath)).toBe(true);
    const content = fs.readFileSync(topbarPath, 'utf8');
    expect(content).toContain('onSelectEncapsulation');
    expect(content).toContain('ENCAPSULATION ET DÉCAPSULATION');
  });
});
