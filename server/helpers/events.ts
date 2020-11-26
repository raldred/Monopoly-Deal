import SocketIO from 'socket.io';
import SocketEvent from './SocketEvent';
import Game from '../classes/Game';

export function handleLobby(socket: SocketIO.Socket, game: Game, refreshGameState: () => void) {
  socket.on(SocketEvent.FROM_CLIENT_JOIN_GAME, ({ roomName, playerName }) => {
    if (game.hasStarted) return;
    if (roomName !== 'Test') return;

    game.createPlayer(socket.id, playerName);

    socket.emit(SocketEvent.FROM_SERVER_JOIN_GAME);
  });

  socket.on(SocketEvent.FROM_CLIENT_START_GAME, () => {
    if (game.hasStarted) return;

    game.start();
    refreshGameState();
  });
}

export function handleNonActions(
  socket: SocketIO.Socket,
  game: Game,
  refreshGameState: () => void
) {
  socket.on(SocketEvent.FROM_CLIENT_PLAY_MONEY, ({ cardId }) => {
    try {
      game.playMoney(socket.id, cardId);
    } catch (error) {
      // playerId may not exist if a client has refreshed their browser.
    }

    refreshGameState();
  });

  socket.on(SocketEvent.FROM_CLIENT_PLAY_PROPERTY, ({ cardId }) => {
    try {
      game.playPropertyCard(socket.id, cardId);
    } catch (error) {
      // playerId may not exist if a client has refreshed their browser.
    }

    refreshGameState();
  });

  socket.on(SocketEvent.FROM_CLIENT_PLAY_PROPERTY_WILDCARD, ({ cardId, isRotated }) => {
    try {
      game.playPropertyWildcard(socket.id, cardId, isRotated);
    } catch (error) {
      // playerId may not exist if a client has refreshed their browser.
    }

    refreshGameState();
  });

  socket.on(SocketEvent.FROM_CLIENT_PLAY_PROPERTY_WILDCARD_ALL, ({ cardId, selectedSet }) => {
    try {
      game.playPropertyWildcardAll(socket.id, cardId, selectedSet);
    } catch (error) {
      // playerId may not exist if a client has refreshed their browser.
    }

    refreshGameState();
  });
}
