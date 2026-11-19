import { PacketField } from './types';

export class PacketBuilder {
  public id: string;
  public name: string;
  public summary?: string;
  public bytes: (number | null)[] = [];
  public fields: PacketField[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  get length(): number {
    return this.bytes.length;
  }

  u8(val: number): this {
    this.bytes.push(val & 0xff);
    return this;
  }

  u16(val: number): this {
    this.bytes.push((val >>> 8) & 0xff, val & 0xff);
    return this;
  }

  u24(val: number): this {
    this.bytes.push((val >>> 16) & 0xff, (val >>> 8) & 0xff, val & 0xff);
    return this;
  }

  u32(val: number): this {
    this.bytes.push(
      (val >>> 24) & 0xff,
      (val >>> 16) & 0xff,
      (val >>> 8) & 0xff,
      val & 0xff
    );
    return this;
  }

  u16le(val: number): this {
    this.bytes.push(val & 0xff, (val >>> 8) & 0xff);
    return this;
  }

  u32le(val: number): this {
    this.bytes.push(
      val & 0xff,
      (val >>> 8) & 0xff,
      (val >>> 16) & 0xff,
      (val >>> 24) & 0xff
    );
    return this;
  }

  u64le(val: number): this {
    return this.u32le(val % 2 ** 32).u32le(Math.floor(val / 2 ** 32));
  }

  u64(val: number): this {
    return this.u32(Math.floor(val / 2 ** 32)).u32(val % 2 ** 32);
  }

  raw(bytes: number[]): this {
    for (const b of bytes) {
      this.bytes.push(b & 0xff);
    }
    return this;
  }

  ascii(str: string): this {
    const encoder = new TextEncoder();
    for (const b of encoder.encode(str)) {
      this.bytes.push(b);
    }
    return this;
  }

  unknown(count: number): this {
    for (let i = 0; i < count; i++) {
      this.bytes.push(null);
    }
    return this;
  }

  field(
    name: string,
    value: string | number,
    writeFn: () => void = () => {},
    opts: Partial<PacketField> = {}
  ): this {
    const from = this.length;
    writeFn();
    const to = this.length;
    this.fields.push({
      name,
      value: String(value),
      from,
      to,
      ...opts,
    });
    return this;
  }

  append(child: PacketBuilder): this {
    const offset = this.length;
    for (const b of child.bytes) {
      this.bytes.push(b);
    }
    for (const f of child.fields) {
      this.fields.push({
        ...f,
        from: f.from + offset,
        to: f.to + offset,
      });
    }
    return this;
  }
}

/**
 * Assemble plusieurs couches en un cadre complet décodé (Ethernet -> IP -> Transport -> App)
 */
export function assembleLayers(layersList: PacketBuilder[]): {
  bytes: (number | null)[];
  fields: (PacketField & { layer: string })[];
  layers: { id: string; name: string; from: number; to: number; summary?: string }[];
} {
  const allBytes: (number | null)[] = [];
  const allFields: (PacketField & { layer: string })[] = [];
  const layerMeta: { id: string; name: string; from: number; to: number; summary?: string }[] = [];

  for (const layer of layersList) {
    const from = allBytes.length;
    const to = from + layer.length;
    layerMeta.push({
      id: layer.id,
      name: layer.name,
      from,
      to,
      summary: layer.summary,
    });

    for (const f of layer.fields) {
      allFields.push({
        ...f,
        layer: layer.id,
        from: f.from + from,
        to: f.to + from,
      });
    }

    allBytes.push(...layer.bytes);
  }

  return {
    bytes: allBytes,
    fields: allFields,
    layers: layerMeta,
  };
}
