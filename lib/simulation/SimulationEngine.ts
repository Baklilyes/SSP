import {
  ProtocolDefinition,
  SimulationStep,
  SimulationEvent,
  PacketEvent,
  NodeId,
  SimulationMode,
} from './types';

export interface SimulationSnapshot {
  protocolId: string;
  status: 'idle' | 'running' | 'paused' | 'stepping' | 'done';
  started: boolean;
  activeStep: number;
  totalSteps: number;
  speed: number;
  mode: SimulationMode;
  visibleNodes: NodeId[];
  shownPackets: PacketEvent[];
  activePacket: PacketEvent | null;
  activePacketIndex: number;
  urlBarText: string;
  isRendered: boolean;
  stepProgress: number; // 0 à 1
}

export type SimulationListener = (snapshot: SimulationSnapshot) => void;

export class SimulationEngine {
  private protocol: ProtocolDefinition;
  private status: 'idle' | 'running' | 'paused' | 'stepping' | 'done' = 'idle';
  private started = false;
  private activeStep = 0;
  private packetIndexInStep = 0;
  private speed = 1;
  private mode: SimulationMode = 'topology';
  private visibleNodes: Set<NodeId> = new Set();
  private shownPackets: PacketEvent[] = [];
  private activePacket: PacketEvent | null = null;
  private activePacketIndex = -1;
  private urlBarText = '';
  private isRendered = false;
  private stepProgress = 0;

  private timerId: ReturnType<typeof setTimeout> | null = null;
  private listeners: Set<SimulationListener> = new Set();

  constructor(protocol: ProtocolDefinition, initialSpeed = 1) {
    this.protocol = protocol;
    this.speed = initialSpeed;
    this.initProtocol();
  }

  public getStepPackets(stepIndex: number): PacketEvent[] {
    const step = this.protocol.steps[stepIndex];
    if (!step) return [];
    const pkts: PacketEvent[] = [];
    for (const evt of step.events) {
      if (evt.type === 'packet') {
        pkts.push(evt);
      } else if ((evt as any).type === 'stream') {
        const stream = evt as any;
        if (Array.isArray(stream.packets)) {
          pkts.push(...stream.packets);
        }
      }
    }
    return pkts;
  }

  private applyStepTriggers(stepIndex: number) {
    const step = this.protocol.steps[stepIndex];
    if (!step) return;
    for (const evt of step.events) {
      if (evt.type === 'show') {
        for (const n of evt.nodes) {
          this.visibleNodes.add(n);
        }
      } else if (evt.type === 'type-url') {
        this.urlBarText = evt.text;
      } else if (evt.type === 'render') {
        this.isRendered = true;
      }
    }
  }

  private setStepPacket(stepIndex: number, packetIdx: number) {
    const pkts = this.getStepPackets(stepIndex);
    if (pkts.length === 0) {
      this.activePacket = null;
      this.packetIndexInStep = 0;
      return;
    }
    const idx = Math.max(0, Math.min(pkts.length - 1, packetIdx));
    this.packetIndexInStep = idx;
    const pkt = pkts[idx];
    this.visibleNodes.add(pkt.from);
    this.visibleNodes.add(pkt.to);
    if (!this.shownPackets.includes(pkt)) {
      this.shownPackets.push(pkt);
    }
    this.activePacket = pkt;
    this.activePacketIndex = this.shownPackets.indexOf(pkt);
  }

  private initProtocol() {
    this.status = 'idle';
    this.started = false;
    this.activeStep = 0;
    this.packetIndexInStep = 0;
    this.activePacket = null;
    this.activePacketIndex = -1;
    this.shownPackets = [];
    this.urlBarText = '';
    this.isRendered = false;
    this.stepProgress = 0;

    const initialNodes: NodeId[] = this.protocol.start?.nodes || ['client'];
    this.visibleNodes = new Set(initialNodes);
    this.applyStepTriggers(0);
    const step0Packets = this.getStepPackets(0);
    if (step0Packets.length > 0) {
      this.setStepPacket(0, 0);
    }
    this.notify();
  }

  public setProtocol(protocol: ProtocolDefinition) {
    this.stopTimer();
    this.protocol = protocol;
    this.initProtocol();
  }

  public subscribe(listener: SimulationListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const snap = this.getSnapshot();
    for (const l of this.listeners) {
      l(snap);
    }
  }

  public getSnapshot(): SimulationSnapshot {
    return {
      protocolId: this.protocol.id,
      status: this.status,
      started: this.started,
      activeStep: this.activeStep,
      totalSteps: this.protocol.steps.length,
      speed: this.speed,
      mode: this.mode,
      visibleNodes: Array.from(this.visibleNodes),
      shownPackets: [...this.shownPackets],
      activePacket: this.activePacket,
      activePacketIndex: this.activePacketIndex,
      urlBarText: this.urlBarText,
      isRendered: this.isRendered,
      stepProgress: this.stepProgress,
    };
  }

  private stopTimer() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public play() {
    if (this.status === 'running') return;
    if (this.status === 'done') {
      this.reset();
    }
    this.status = 'running';
    this.started = true;
    this.notify();
    this.scheduleNext();
  }

  public pause() {
    this.stopTimer();
    this.status = 'paused';
    this.notify();
  }

  public toggle() {
    if (this.status === 'running') {
      this.pause();
    } else {
      this.play();
    }
  }

  public reset() {
    this.stopTimer();
    this.initProtocol();
  }

  public jump(stepIndex: number) {
    this.stopTimer();
    const target = Math.max(0, Math.min(this.protocol.steps.length - 1, stepIndex));
    this.status = 'paused';
    this.started = true;
    this.activeStep = target;
    this.packetIndexInStep = 0;

    // Recalculer l'état cumulé jusqu'à l'étape cible
    this.shownPackets = [];
    const defaultStartNodes: NodeId[] = this.protocol.start?.nodes || ['client'];
    this.visibleNodes = new Set(defaultStartNodes);
    this.urlBarText = '';
    this.isRendered = false;

    // Appliquer tous les déclencheurs et accumuler les paquets des étapes précédentes
    for (let s = 0; s < target; s++) {
      this.applyStepTriggers(s);
      const pkts = this.getStepPackets(s);
      for (const p of pkts) {
        this.visibleNodes.add(p.from);
        this.visibleNodes.add(p.to);
        if (!this.shownPackets.includes(p)) {
          this.shownPackets.push(p);
        }
      }
    }

    // Appliquer les déclencheurs de l'étape cible
    this.applyStepTriggers(target);
    const targetPackets = this.getStepPackets(target);
    if (targetPackets.length > 0) {
      this.setStepPacket(target, 0);
    } else {
      this.activePacket = null;
      this.activePacketIndex = this.shownPackets.length > 0 ? this.shownPackets.length - 1 : -1;
    }

    this.notify();
  }

  public step() {
    this.stopTimer();
    this.status = 'paused';
    this.started = true;

    const currentPackets = this.getStepPackets(this.activeStep);
    // S'il reste des paquets suivants à émettre dans la même étape (ex: réponse serveur après requête client)
    if (currentPackets.length > 0 && this.packetIndexInStep < currentPackets.length - 1) {
      this.setStepPacket(this.activeStep, this.packetIndexInStep + 1);
      this.notify();
      return;
    }

    // Passer à l'étape suivante si disponible
    if (this.activeStep < this.protocol.steps.length - 1) {
      this.activeStep++;
      this.packetIndexInStep = 0;
      this.applyStepTriggers(this.activeStep);
      const nextPackets = this.getStepPackets(this.activeStep);
      if (nextPackets.length > 0) {
        this.setStepPacket(this.activeStep, 0);
      } else {
        this.activePacket = null;
      }
    } else {
      this.status = 'done';
    }
    this.notify();
  }

  public prev() {
    this.stopTimer();
    this.status = 'paused';
    const currentPackets = this.getStepPackets(this.activeStep);
    if (currentPackets.length > 0 && this.packetIndexInStep > 0) {
      this.setStepPacket(this.activeStep, this.packetIndexInStep - 1);
      this.notify();
      return;
    }
    if (this.activeStep > 0) {
      this.jump(this.activeStep - 1);
    } else {
      this.reset();
    }
  }

  public setSpeed(speed: number) {
    this.speed = speed;
    this.notify();
  }

  public setMode(mode: SimulationMode) {
    this.mode = mode;
    this.notify();
  }

  public setActivePacket(packet: PacketEvent, index?: number) {
    this.activePacket = packet;
    if (index !== undefined) {
      this.activePacketIndex = index;
    } else {
      this.activePacketIndex = this.shownPackets.indexOf(packet);
    }
    this.notify();
  }

  public applyStepEvents(stepIndex: number) {
    this.applyStepTriggers(stepIndex);
    const pkts = this.getStepPackets(stepIndex);
    if (pkts.length > 0) {
      this.setStepPacket(stepIndex, 0);
    }
  }

  private getPacketFlightDurationSec(): number {
    if (!this.activePacket) return 1.55;
    const key = `${this.activePacket.from}>${this.activePacket.to}`;
    const directHopPairs = [
      'client>router', 'router>client', 'router>internet', 'internet>router',
      'internet>dns', 'dns>internet', 'internet>web', 'web>internet',
      'client>ap', 'ap>client', 'router>stb', 'stb>router',
      'switch>lan', 'lan>switch', 'router>cam', 'cam>router',
    ];
    if (directHopPairs.includes(key)) {
      return 1.1;
    }
    const twoHopPairs = [
      'client>internet', 'internet>client', 'router>web', 'web>router',
      'router>dns', 'dns>router', 'dns>root', 'root>dns', 'dns>tld', 'tld>dns',
      'dns>auth', 'auth>dns', 'router>lan', 'lan>router', 'ap>router', 'router>ap',
    ];
    if (twoHopPairs.includes(key)) {
      return 1.35;
    }
    // 3 sauts ou plus (ex: client>dns, dns>client, client>web, web>client, client>mx, client>remote, client>peer)
    return 1.55;
  }

  private scheduleNext() {
    this.stopTimer();
    if (this.status !== 'running') return;

    const flightSec = this.getPacketFlightDurationSec();
    // Le délai d'avancement attend la fin du trajet de bout en bout + le clignotement de l'équipement (450ms)
    const baseDelay = Math.round(((flightSec + 0.45) / this.speed) * 1000);
    this.timerId = setTimeout(() => {
      if (this.status !== 'running') return;

      const currentPackets = this.getStepPackets(this.activeStep);
      // S'il reste un paquet suivant dans la même étape
      if (currentPackets.length > 0 && this.packetIndexInStep < currentPackets.length - 1) {
        this.setStepPacket(this.activeStep, this.packetIndexInStep + 1);
        this.notify();
        this.scheduleNext();
        return;
      }

      // Passer à l'étape suivante
      if (this.activeStep < this.protocol.steps.length - 1) {
        this.activeStep++;
        this.packetIndexInStep = 0;
        this.applyStepTriggers(this.activeStep);
        const nextPackets = this.getStepPackets(this.activeStep);
        if (nextPackets.length > 0) {
          this.setStepPacket(this.activeStep, 0);
        } else {
          this.activePacket = null;
        }
        this.notify();
        this.scheduleNext();
      } else {
        this.status = 'done';
        this.notify();
      }
    }, baseDelay);
  }
}
