export class Player {
  constructor(options?: Partial<Player>) {
    if (options) {
      Object.assign(this, options);
    }
  }

  id: string;
  name: string;
  tpuId: number | null = null;
  version: number = 1;
}
