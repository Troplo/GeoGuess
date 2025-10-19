export class Session {
  playerId: string;
  createdAt: string;

  constructor(options?: Partial<Session>) {
    if (options) {
      Object.assign(this, options);
    }
  }
}
