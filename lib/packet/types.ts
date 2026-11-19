export interface PacketField {
  name: string;
  value: string;
  from: number;   // Offset début en octets
  to: number;     // Offset fin en octets
  depth?: number; // Niveau d'indentation dans l'arbre (0 = racine du protocole)
  note?: string;  // Note explicative pédagogique
  example?: boolean; // Indicateur d'exemple
  heading?: boolean; // Séparateur / sous-en-tête
  hidden?: boolean;  // Champ masqué par défaut
  mono?: boolean;    // Formatage police monospace
  inside?: boolean;
}

export interface PacketLayerInfo {
  id: string;
  name: string;
  from: number;
  to: number;
  summary?: string;
}

export interface DissectedFrame {
  bytes: (number | null)[];
  fields: (PacketField & { layer?: string })[];
  layers: PacketLayerInfo[];
  at?: string;
  segments?: number;
  messageLength?: number;
}
