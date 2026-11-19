import { DissectedFrame } from '../packet/types';

export type SimulationMode = 'topology' | 'sequence';

export type NodeId =
  | 'client'
  | 'router'
  | 'ap'
  | 'lan'
  | 'switch'
  | 'isp'
  | 'bng'
  | 'transit'
  | 'hosting'
  | 'dns'
  | 'root'
  | 'tld'
  | 'auth'
  | 'web'
  | 'app'
  | 'mx'
  | 'relay'
  | 'cam'
  | 'stb'
  | 'peer'
  | 'remote'
  | 'internet';

export interface PacketTableRow {
  time: string;
  src: string;
  dst: string;
  proto: string;
  info: string;
  len: string;
  wire?: DissectedFrame;
}

export type PacketEvent = {
  type: 'packet';
  from: NodeId;
  to: NodeId;
  color: 'blue' | 'green' | 'amber' | 'violet' | 'red';
  label: string;
  payload?: string | string[];
  row: PacketTableRow;
  wire: DissectedFrame;
  lost?: boolean;
  locked?: boolean;
};

export type SimulationEvent =
  | { type: 'show'; nodes: NodeId[]; frame: 'client' | 'local' | 'lookup' | 'full' }
  | { type: 'type-url'; text: string }
  | { type: 'render'; content?: string }
  | { type: 'camera'; frame: string }
  | { type: 'note'; text: string; tone?: 'navy' | 'amber' | 'green' }
  | PacketEvent;

export interface SimulationStep {
  title: string;
  desc: string;
  detail: string;
  facts?: [string, string][];
  events: SimulationEvent[];
}

export interface ProtocolOverview {
  full: string;
  description: string;
  facts: [string, string][];
}

export interface ProtocolOutro {
  title: string;
  desc: string;
  text: string;
  facts: [string, string][];
}

export interface ProtocolDefinition {
  id: string;
  name: string;
  title: string;
  layer: number;
  group: 'core' | 'application' | 'security';
  nodes: NodeId[];
  labels?: Record<string, [string, string]>;
  latency?: Record<string, number>;
  legend?: [string | null, string][];
  overview: ProtocolOverview;
  outro?: ProtocolOutro;
  start?: {
    nodes: NodeId[];
    frame: string;
  };
  steps: SimulationStep[];
}
