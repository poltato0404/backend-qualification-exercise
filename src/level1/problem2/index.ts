export class ObjectId {
  private data: Buffer;
  // private static objectIdRandom = crypto.getRandomValues(new Uint8Array(4));
  // private static objectIdCounter = Math.floor(Math.random() * 0xffffff);

  constructor(type: number, timestamp: number) {

    /**
     * since im not sure if i can put the code at the top, im gonna use a global
     * to "persist" my counter and random number. also using online calculators,
     * we alloc 14bytes to buffer since the size is 1 + 6 + 4 + 3 bytes for
     * the respective components of the uid.
     *
     * first we getrandomvalues for 4bytes, if it dont exists yet. if the counter
     * is not yet initialized, we then also get a random number, and sinced its
     * for an id, the number would be naturally unsigned and the limit for 24bits
     * is 16777215 so we generate in that range
     */
    this.data = Buffer.alloc(14);
    if (!(global as any)._objectIdRandom) {
      (global as any)._objectIdRandom = crypto.getRandomValues(new Uint8Array(4));
    }
    if ((global as any)._objectIdCounter === undefined) {
      (global as any)._objectIdCounter = Math.floor(Math.random() * 0x1000000); //range of 0 - 16777215 converted to hex
    }
    //ensure it wont overflow and become 25 bits
    (global as any)._objectIdCounter = ((global as any)._objectIdCounter + 1) % 0x1000000;

    /**
     * im just gonna put them in order of type->timestamp->random->counter.
     * start it at index 0 of buffer. then for the timestamp, at the next index
     * with 6 bytes and random at index 7 and lastly at index 11
     */

    this.data.writeUint8(type, 0);
    this.data.writeUIntBE(timestamp, 1, 6);
    this.data.set((global as any)._objectIdRandom, 7);
    this.data.writeUIntBE((global as any)._objectIdCounter, 11, 3);

  }

  static generate(type?: number): ObjectId {
    return new ObjectId(type ?? 0, Date.now());
  }

  toString(encoding?: 'hex' | 'base64'): string {
    return this.data.toString(encoding ?? 'hex');
  }
}
