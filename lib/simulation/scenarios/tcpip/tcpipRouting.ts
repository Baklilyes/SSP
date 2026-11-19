export interface RouterHopInfo {
  hopNumber: number;
  routerName: string;
  routerNameFr: string;
  routerNameEn: string;
  incomingInterface: string;
  outgoingInterface: string;
  destinationIp: string;
  lookupResult: string;
  lookupResultFr: string;
  lookupResultEn: string;
  nextHopIp: string;
  nextHopMac: string;
  oldTtl: number;
  newTtl: number;
}

export const ROUTER_HOPS: RouterHopInfo[] = [
  {
    hopNumber: 1,
    routerName: 'Routeur Passerelle (R1)',
    routerNameFr: 'Routeur Passerelle (R1)',
    routerNameEn: 'Gateway Router (R1)',
    incomingInterface: 'eth0 (192.168.1.1)',
    outgoingInterface: 'eth1 (172.16.0.1)',
    destinationIp: '10.0.0.20',
    lookupResult: 'Route correspondante : 10.0.0.0/24 via 172.16.0.2',
    lookupResultFr: 'Route correspondante : 10.0.0.0/24 via 172.16.0.2',
    lookupResultEn: 'Matching route: 10.0.0.0/24 via 172.16.0.2',
    nextHopIp: '172.16.0.2',
    nextHopMac: '00:77:88:99:AA:BB',
    oldTtl: 64,
    newTtl: 63,
  },
  {
    hopNumber: 2,
    routerName: 'Routeur Cœur / Destination (R2)',
    routerNameFr: 'Routeur Cœur / Destination (R2)',
    routerNameEn: 'Core / Edge Router (R2)',
    incomingInterface: 'eth0 (172.16.0.2)',
    outgoingInterface: 'eth1 (10.0.0.1)',
    destinationIp: '10.0.0.20',
    lookupResult: 'Réseau directement connecté : 10.0.0.0/24 sur eth1',
    lookupResultFr: 'Réseau directement connecté : 10.0.0.0/24 sur eth1',
    lookupResultEn: 'Directly connected network: 10.0.0.0/24 on eth1',
    nextHopIp: '10.0.0.20',
    nextHopMac: '00:BB:CC:DD:EE:FF',
    oldTtl: 63,
    newTtl: 62,
  },
];
