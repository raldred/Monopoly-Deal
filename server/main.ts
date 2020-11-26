import _ from 'lodash';
import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import index from './routes/index';
import Game from './classes/Game';
import Player from './classes/Player';
import { handleLobby, handleNonActions } from './helpers/events';
import SocketEvent from './helpers/SocketEvent';
import { handleConversationIMB, fromClientTargetResponseIMB } from './conversations/handleIMB';
import {
  handleConversationRent,
  fromClientActorResponseRent,
  fromClientTargetResponseRent
} from './conversations/handleRent';
import {
  handleConversationDebtCollector,
  fromClientTargetResponseDebtCollector,
  fromClientActorResponseDebtCollector
} from './conversations/handleDebtCollector';
import {
  handleConversationForcedDeal,
  fromClientActorResponseForcedDeal,
  fromClientTargetResponseForcedDeal
} from './conversations/handleForcedDeal';
import {
  handleConversationSlyDeal,
  fromClientActorResponseSlyDeal,
  fromClientTargetResponseSlyDeal
} from './conversations/handleSlyDeal';
import {
  handleConversationHouse,
  fromClientActorResponseHouse
} from './conversations/handleHouse';
import {
  fromClientActorResponseHotel,
  handleConversationHotel
} from './conversations/handleHotel';
import {
  handleConversationDealBreaker,
  fromClientActorResponseDealBreaker,
  fromClientTargetResponseDealBreaker
} from './conversations/handleDealBreaker';
import {
  fromClientTargetResponseJustSayNo,
  endJustSayNoConversation
} from './conversations/handleJustSayNo';
import {
  handleConversationRentSingle,
  fromClientActorResponseRentSingle
} from './conversations/handleRentSingle';
import PropertyWildcard from './classes/Card/PropertyWildcard';
import PropertyCard from './classes/Card/PropertyCard';

const game = new Game();

const app = express();
app.use(index);
const server = http.createServer(app);
const io = SocketIO(server);

let disconnectedPlayers: string[] = [];

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  handleLobby(socket, game, refreshGameState);

  handleNonActions(socket, game, refreshGameState);

  socket.on(SocketEvent.FROM_CLIENT_PLAY_ACTION, ({ cardId }) => {
    const player = game.players.filter((p) => p.id === socket.id)[0];

    if (player.hand.filter((c) => c.id === cardId).length === 0) return;

    if (cardId >= 60 && cardId <= 69) {
      handleConversationRent(socket, game, cardId);
    }

    if (cardId >= 70 && cardId <= 72) {
      handleConversationRentSingle(socket, game, cardId);
    }

    if (cardId >= 73 && cardId <= 82) {
      game.playPassGo(socket.id, cardId);
      refreshGameState();
    }

    if (cardId >= 85 && cardId <= 87) {
      handleConversationIMB(socket, game, cardId);
    }

    if (cardId >= 88 && cardId <= 90) {
      handleConversationDebtCollector(socket, game, cardId);
    }

    if (cardId >= 91 && cardId <= 93) {
      handleConversationForcedDeal(socket, game, cardId);
    }

    if (cardId >= 94 && cardId <= 96) {
      handleConversationSlyDeal(socket, game, cardId);
    }

    if (cardId >= 97 && cardId <= 99) {
      handleConversationHouse(socket, game, cardId);
    }

    if (cardId >= 100 && cardId <= 101) {
      handleConversationHotel(socket, game, cardId);
    }

    if (cardId >= 105 && cardId <= 106) {
      handleConversationDealBreaker(socket, game, cardId);
    }
  });

  // START RENT
  socket.on(
    SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_RENT,
    ({ selectedSet, doubleIdOne, doubleIdTwo }) => {
      fromClientActorResponseRent(socket, game, selectedSet, doubleIdOne, doubleIdTwo);
    }
  );

  socket.on(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_RENT, ({ cardIds }) => {
    fromClientTargetResponseRent(io, socket, game, refreshGameState, cardIds);
  });
  // END RENT

  // START RENT SINGLE
  socket.on(
    SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_RENT_SINGLE,
    ({ selectedSet, targetPlayer, doubleIdOne, doubleIdTwo }) => {
      fromClientActorResponseRentSingle(
        socket,
        game,
        selectedSet,
        targetPlayer,
        doubleIdOne,
        doubleIdTwo
      );
    }
  );
  // END RENT SINGLE

  // START IMB
  socket.on(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_IMB, ({ cardIds }) => {
    fromClientTargetResponseIMB(io, socket, game, refreshGameState, cardIds);
  });
  // END IMB

  // START DEBT COLLECTOR
  socket.on(SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_DEBT_COLLECTOR, ({ selectedPlayer }) => {
    fromClientActorResponseDebtCollector(socket, game, selectedPlayer);
  });

  socket.on(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_DEBT_COLLECTOR, ({ cardIds }) => {
    fromClientTargetResponseDebtCollector(io, socket, game, refreshGameState, cardIds);
  });
  // END DEBT COLLECTOR

  // START FORCED DEAL
  socket.on(
    SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_FORCED_DEAL,
    ({ targetPlayerName, actorCardIdToSwap, targetCardIdToSwap }) => {
      fromClientActorResponseForcedDeal(
        socket,
        game,
        targetPlayerName,
        actorCardIdToSwap,
        targetCardIdToSwap
      );
    }
  );

  socket.on(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_FORCED_DEAL, () => {
    fromClientTargetResponseForcedDeal(io, game, refreshGameState);
  });
  // END FORCED DEAL

  // START SLY DEAL
  socket.on(
    SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_SLY_DEAL,
    ({ targetPlayerName, targetCardIdToSwap }) => {
      fromClientActorResponseSlyDeal(socket, game, targetPlayerName, targetCardIdToSwap);
    }
  );

  socket.on(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_SLY_DEAL, () => {
    fromClientTargetResponseSlyDeal(io, game, refreshGameState);
  });
  // END SLY DEAL

  // START HOUSE
  socket.on(SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_HOUSE, ({ selectedSet }) => {
    fromClientActorResponseHouse(io, game, selectedSet, refreshGameState);
  });
  // END HOUSE

  // START HOTEL
  socket.on(SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_HOTEL, ({ selectedSet }) => {
    fromClientActorResponseHotel(io, game, selectedSet, refreshGameState);
  });

  // START DEAL BREAKER
  socket.on(
    SocketEvent.FROM_CLIENT_ACTOR_RESPONSE_DEAL_BREAKER,
    ({ targetPlayerName, targetSet }) => {
      fromClientActorResponseDealBreaker(socket, game, targetPlayerName, targetSet);
    }
  );

  socket.on(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_DEAL_BREAKER, () => {
    fromClientTargetResponseDealBreaker(io, game, refreshGameState);
  });
  // END DEAL BREAKER

  // START JUST SAY NO
  socket.on(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_JUST_SAY_NO, ({ cardId }) => {
    fromClientTargetResponseJustSayNo(socket, game, cardId, refreshGameState);
  });

  socket.on(SocketEvent.FROM_CLIENT_END_JUST_SAY_NO, () => {
    endJustSayNoConversation(io, game, refreshGameState);
  });
  // END JUST SAY NO

  socket.on(SocketEvent.SWAP_WILDCARDS, (wildcards) => {
    const cardIds = (() => {
      let cardIds = [];

      for (let wildcard of wildcards) {
        cardIds.push(wildcard.card.id);
      }

      return cardIds;
    })();

    const player = game.players[game.currentPlayer];

    // First, remove valid cards.
    let allRemovedCards: (PropertyCard | PropertyWildcard)[] = [];

    for (let propertySet of player.properties) {
      let removedCards = _.remove(propertySet.cards, (c) => {
        // If the card we're currently inspecting is not a wildcard, don't proceed further.
        if (!cardIds.includes(c.id)) return false;

        // Okay so it IS a wildcard. Is it to be removed from this set?
        const newSetting = wildcards.filter((o: any) => o.card.id === c.id)[0]; // Grab appropriate settings object.

        if (newSetting.isAllSets && newSetting.set !== undefined) {
          // It's set to change! Remove it.
          return true;
        }

        if (newSetting.isRotated && (c as PropertyWildcard).setOne === propertySet.set) {
          return true;
        }

        if (!newSetting.isRotated && (c as PropertyWildcard).setTwo === propertySet.set) {
          return true;
        }

        return false;
      });

      Array.prototype.push.apply(allRemovedCards, removedCards);
    }

    // Then, add removed cards to their new sets.
    for (let card of allRemovedCards) {
      const newSetting = wildcards.filter((o: any) => o.card.id === card.id)[0];

      if (newSetting.isAllSets && newSetting.set !== undefined) {
        // Add to specified set.
        player.properties[newSetting.set].cards.push(card);
        continue;
      }

      if (newSetting.isRotated) {
        // Add to setTwo.
        player.properties[(card as PropertyWildcard).setTwo].cards.push(card);
      }

      if (!newSetting.isRotated) {
        // Add to setOne.
        player.properties[(card as PropertyWildcard).setOne].cards.push(card);
      }
    }

    refreshGameState();
  });

  socket.on(SocketEvent.FROM_CLIENT_END_TURN, () => {
    try {
      game.endTurn(socket.id);
    } catch (error) {
      // playerId may not exist if a client has refreshed their browser.
    }

    refreshGameState();
  });

  // JOIN IN PROGRESS
  socket.on(SocketEvent.FROM_CLIENT_REQUEST_JOIN_IN_PROGRESS, () => {
    socket.emit(SocketEvent.FROM_SERVER_REQUEST_JOIN_IN_PROGRESS, {
      disconnectedPlayers: disconnectedPlayers
    });
  });

  socket.on(SocketEvent.FROM_CLIENT_CONFIRM_JOIN_IN_PROGRESS, ({ selectedPlayerName }) => {
    if (!disconnectedPlayers.includes(selectedPlayerName)) return;

    for (let player of game.players) {
      if (player.name === selectedPlayerName) {
        player.id = socket.id;
        _.remove(disconnectedPlayers, (p) => p === selectedPlayerName);

        console.log(`Client re-connected: ${socket.id}, ${player.name}`);

        break;
      }
    }

    refreshGameState();

    io.of('/').emit(SocketEvent.FROM_SERVER_UNPAUSE_GAME);
  });
  // END JOIN IN PROGRESS

  // ON DISCONNECT
  socket.on('disconnect', () => {
    if (!game.hasStarted) {
      console.log(`Client disconnected: ${socket.id}`);
      return;
    }

    const thisPlayerArray = game.players.filter((player) => player.id === socket.id);

    if (thisPlayerArray.length === 0) {
      // This is a NEW client that does not belong to the game session.
      return;
    }

    for (let player of game.players) {
      if (socket.id === player.id) {
        disconnectedPlayers.push(player.name);
        console.log(`Client disconnected: ${socket.id}, ${player.name}`);
        break;
      }
    }

    io.of('/').emit(SocketEvent.FROM_SERVER_PAUSE_GAME, {
      disconnectedPlayers: disconnectedPlayers
    });
  });
});

// Start the server.
const port = 5000;
server.listen(port, () => console.log(`Listening on port ${port}`));

// Helpers

const refreshGameState = async () => {
  // Emit client-specific information to each appropriate client.
  for (const [socketId, socket] of Object.entries(io.sockets.sockets)) {
    const thisPlayerArray = game.players.filter((player) => player.id === socketId);

    if (thisPlayerArray.length === 0) {
      // This is a NEW client that does not belong to the game session.
      continue;
    }

    const thisPlayer = thisPlayerArray[0];

    const clientData = {
      hand: thisPlayer.hand,
      money: thisPlayer.money,
      actionsLeft: thisPlayer.actionsLeft
    };
    console.log(clientData);

    socket.emit(SocketEvent.FROM_SERVER_REFRESH_CLIENT_DATA, JSON.stringify(clientData));
  }

  // Get broadcast data.
  let players: any = [];
  for (let player of game.players) {
    players.push({
      name: player.name,
      handCount: player.hand.length,
      moneyCount: player.money.length,
      properties: player.properties
    });
  }
  const currentPlayer = game.players[game.currentPlayer].name;
  const deckCount = game.deck.length;
  const turn = game.turn;

  // Broadcast to all clients, including sender.
  const broadcastData = {
    players: players,
    currentPlayer: currentPlayer,
    deckCount: deckCount,
    turn: turn
  };
  console.log(broadcastData);
  io.of('/').emit(SocketEvent.FROM_SERVER_REFRESH_GAME_STATE, JSON.stringify(broadcastData));
};
