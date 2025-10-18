export enum GameSocketClientEvent {
  CREATE_ROOM = 'CREATE_ROOM',
}

export interface GameSocketClientEvents {
  [GameSocketClientEvent.CREATE_ROOM]: {
    name: string;
  };
}
