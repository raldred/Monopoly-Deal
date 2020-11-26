import React, { useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';
import './styles/app.scss';
import GameScreen from './components/GameScreen';
import {
  IActionCard,
  IRentCard,
  IPropertyCard,
  IPropertyWildcard,
  IMoneyCard,
  IGameState
} from './components/GameScreen/interfaces';
import JustSayNo from './components/GameScreen/JustSayNo';
import SocketEvent from './helpers/SocketEvent';
import { handleConversationIMB } from './conversations/handleIMB';
import TargetQuestionIMBModal from './components/TargetModals/TargetQuestionIMBModal';
import ActionPendingModal from './components/TargetModals/ActionPendingModal';
import { handleConversationRent } from './conversations/handleRent';
import ActorQuestionRentModal from './components/ActorModals/ActorQuestionRentModal';
import TargetQuestionRentModal from './components/TargetModals/TargetQuestionRentModal';
import ActorQuestionDebtCollectorModal from './components/ActorModals/ActorQuestionDebtCollectorModal';
import TargetQuestionDebtCollectorModal from './components/TargetModals/TargetQuestionDebtCollectorModal';
import { handleConversationDebtCollector } from './conversations/handleDebtCollector';
import { handleConversationForcedDeal } from './conversations/handleForcedDeal';
import ActorQuestionForcedDealModalA from './components/ActorModals/ActorQuestionForcedDealModalA';
import ActorQuestionForcedDealModalB from './components/ActorModals/ActorQuestionForcedDealModalB';
import TargetQuestionForcedDealModal from './components/TargetModals/TargetQuestionForcedDealModal';
import { handleConversationSlyDeal } from './conversations/handleSlyDeal';
import ActorQuestionSlyDealModalA from './components/ActorModals/ActorQuestionSlyDealModalA';
import ActorQuestionSlyDealModalB from './components/ActorModals/ActorQuestionSlyDealModalB';
import TargetQuestionSlyDealModal from './components/TargetModals/TargetQuestionSlyDealModal';
import { handleConversationHouse } from './conversations/handleHouse';
import ActorQuestionHouseModal from './components/ActorModals/ActorQuestionHouseModal';
import { handleConversationHotel } from './conversations/handleHotel';
import ActorQuestionHotelModal from './components/ActorModals/ActorQuestionHotelModal';
import { handleConversationDealBreaker } from './conversations/handleDealBreaker';
import ActorQuestionDealBreakerModalA from './components/ActorModals/ActorQuestionDealBreakerModalA';
import ActorQuestionDealBreakerModalB from './components/ActorModals/ActorQuestionDealBreakerModalB';
import TargetQuestionDealBreakerModal from './components/TargetModals/TargetQuestionDealBreakerModal';
import { handleConversationJustSayNo } from './conversations/handleJustSayNo';
import TargetQuestionJustSayNoModal from './components/TargetModals/TargetQuestionJustSayNoModal';
import JustSayNoPendingModal from './components/TargetModals/JustSayNoPendingModal';
import { handleConversationRentSingle } from './conversations/handleRentSingle';
import ActorQuestionRentSingleModal from './components/ActorModals/ActorQuestionRentSingleModal';
import JIPModal from './components/JIPModal';
import GamePausedModal from './components/GamePausedModal';
import DisconnectedModal from './components/DisconnectedModal';

const App = () => {
  const [socket, setSocket] = useState<SocketIOClient.Socket>();
  const [roomName, setRoomName] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [hasJoinedGame, setHasJoinedGame] = useState<boolean>(false);
  const [isLobbySubmitting, setIsLobbySubmitting] = useState<boolean>(false);

  const [gameState, setGameState] = useState<IGameState>();
  const [hand, setHand] = useState<
    (IActionCard | IRentCard | IPropertyCard | IPropertyWildcard | IMoneyCard)[]
  >();
  const [money, setMoney] = useState<IMoneyCard[]>();
  const [actionsLeft, setActionsLeft] = useState<number>();
  const [justSayNo, setJustSayNo] = useState<string>();

  const [currentAction, setCurrentAction] = useState<number>();
  // Rent
  const [isActorQuestionRentModalHidden, setIsActorQuestionRentModalHidden] = useState<number>();
  const [isTargetQuestionRentModalHidden, setIsTargetQuestionRentModalHidden] = useState<number>();
  // Rent Single
  const [isActorQuestionRentSingleModalHidden, setIsActorQuestionRentSingleModalHidden] = useState<
    number
  >();
  // IMB
  const [isTargetQuestionIMBModalHidden, setIsTargetQuestionIMBModalHidden] = useState<boolean>(
    true
  );
  // Debt Collector
  const [
    isActorQuestionDebtCollectorModalHidden,
    setIsActorQuestionDebtCollectorModalHidden
  ] = useState<number | undefined>();
  const [
    isTargetQuestionDebtCollectorModalHidden,
    setIsTargetQuestionDebtCollectorModalHidden
  ] = useState<boolean>(true);
  // Forced Deal
  const [
    isActorQuestionForcedDealModalAHidden,
    setIsActorQuestionForcedDealModalAHidden
  ] = useState<number>();
  const [
    isActorQuestionForcedDealModalBHidden,
    setIsActorQuestionForcedDealModalBHidden
  ] = useState<any>();
  const [
    isTargetQuestionForcedDealModalHidden,
    setIsTargetQuestionForcedDealModalHidden
  ] = useState<any>();
  // Sly Deal
  const [isActorQuestionSlyDealModalAHidden, setIsActorQuestionSlyDealModalAHidden] = useState<
    number
  >();
  const [isActorQuestionSlyDealModalBHidden, setIsActorQuestionSlyDealModalBHidden] = useState<
    any
  >();
  const [isTargetQuestionSlyDealModalHidden, setIsTargetQuestionSlyDealModalHidden] = useState<
    any
  >();
  // House
  const [isActorQuestionHouseModalHidden, setIsActorQuestionHouseModalHidden] = useState<any>();
  // Hotel
  const [isActorQuestionHotelModalHidden, setIsActorQuestionHotelModalHidden] = useState<any>();
  // Deal Breaker
  const [
    isActorQuestionDealBreakerModalAHidden,
    setIsActorQuestionDealBreakerModalAHidden
  ] = useState<any>();
  const [
    isActorQuestionDealBreakerModalBHidden,
    setIsActorQuestionDealBreakerModalBHidden
  ] = useState<any>();
  const [
    isTargetQuestionDealBreakerModalHidden,
    setIsTargetQuestionDealBreakerModalHidden
  ] = useState<any>();
  // Just Say No
  const [isTargetQuestionJustSayNoModalHidden, setIsTargetQuestionJustSayNoModalHidden] = useState<
    any
  >();
  const [isJustSayNoPendingModalHidden, setIsJustSayNoPendingModalHidden] = useState<boolean>(
    true
  );

  const [isGamePaused, setIsGamePaused] = useState<any>();
  const [isJIPModalHidden, setIsJIPModalHidden] = useState<any>();

  const [isDisconnectedModalHidden, setIsDisconnectedModalHidden] = useState<boolean>(true);

  useEffect(() => {
    // setSocket(socketIOClient('http://ec2-18-130-255-172.eu-west-2.compute.amazonaws.com:5000/'));
    setSocket(socketIOClient(`http://${window.location.hostname}:5000/`));
  
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on(SocketEvent.FROM_SERVER_REFRESH_GAME_STATE, (data: any) => {
      setGameState(JSON.parse(data));
    });

    socket.on(SocketEvent.FROM_SERVER_REFRESH_CLIENT_DATA, (data: any) => {
      const { hand, money, actionsLeft } = JSON.parse(data);
      setHand(hand);
      setMoney(money);
      setActionsLeft(actionsLeft);
    });

    socket.on(SocketEvent.FROM_SERVER_ACTION_PENDING, (data: any) => {
      const { action } = data;

      hideAllModals();
      setCurrentAction(action);
    });

    // Rent
    handleConversationRent(
      socket,
      hideAllModals,
      setIsActorQuestionRentModalHidden,
      setIsTargetQuestionRentModalHidden
    );

    // Rent Single
    handleConversationRentSingle(socket, hideAllModals, setIsActorQuestionRentSingleModalHidden);

    // It's My Birthday!
    handleConversationIMB(socket, hideAllModals, setIsTargetQuestionIMBModalHidden);

    // Debt Collector
    handleConversationDebtCollector(
      socket,
      hideAllModals,
      setIsActorQuestionDebtCollectorModalHidden,
      setIsTargetQuestionDebtCollectorModalHidden
    );

    // Forced Deal
    handleConversationForcedDeal(
      socket,
      hideAllModals,
      setIsActorQuestionForcedDealModalAHidden,
      setIsTargetQuestionForcedDealModalHidden
    );

    // Sly Deal
    handleConversationSlyDeal(
      socket,
      hideAllModals,
      setIsActorQuestionSlyDealModalAHidden,
      setIsTargetQuestionSlyDealModalHidden
    );

    // House
    handleConversationHouse(socket, hideAllModals, setIsActorQuestionHouseModalHidden);

    // Hotel
    handleConversationHotel(socket, hideAllModals, setIsActorQuestionHotelModalHidden);

    // Deal Breaker
    handleConversationDealBreaker(
      socket,
      hideAllModals,
      setIsActorQuestionDealBreakerModalAHidden,
      setIsTargetQuestionDealBreakerModalHidden
    );

    handleConversationJustSayNo(socket, hideAllModals, setIsTargetQuestionJustSayNoModalHidden);

    socket.on(SocketEvent.FROM_SERVER_ACTION_END_ALL, () => {
      hideAllModals();
    });

    // socket.on(SocketEvent.FROM_SERVER_JUST_SAY_NO, (data: any) => {
    //   hideAllModals();
    //   setJustSayNo(data.playerName);
    //   setTimeout(() => setJustSayNo(undefined), 3000);
    // });

    socket.on(SocketEvent.FROM_SERVER_JOIN_GAME, () => {
      setHasJoinedGame(true);
    });

    socket.on(SocketEvent.FROM_SERVER_PAUSE_GAME, (data: any) => {
      const { disconnectedPlayers } = data;
      setIsGamePaused(disconnectedPlayers);
    });

    socket.on(SocketEvent.FROM_SERVER_UNPAUSE_GAME, () => {
      setIsGamePaused(undefined);
    });

    socket.on(SocketEvent.FROM_SERVER_REQUEST_JOIN_IN_PROGRESS, (data: any) => {
      const { disconnectedPlayers } = data;

      setIsJIPModalHidden(disconnectedPlayers);
    });

    socket.on('disconnect', () => {
      setIsDisconnectedModalHidden(false);
    });
  }, [socket]);

  // START LOBBY SCREEN

  const handleJoinGame = (event: any) => {
    event.preventDefault();

    const playerData = {
      roomName: roomName,
      playerName: playerName
    };

    socket?.emit(SocketEvent.FROM_CLIENT_JOIN_GAME, playerData);
  };

  // TODO: Style JIPModal. Modal for PAUSE/UNPAUSE game too.

  const handleStartGame = () => {
    socket?.emit(SocketEvent.FROM_CLIENT_START_GAME);
  };

  const handleJoinInProgress = () => {
    socket?.emit(SocketEvent.FROM_CLIENT_REQUEST_JOIN_IN_PROGRESS);
  };

  // END LOBBY SCREEN

  // Helpers

  function hideAllModals() {
    setCurrentAction(undefined);
    setIsActorQuestionRentModalHidden(undefined);
    setIsTargetQuestionRentModalHidden(undefined);
    setIsActorQuestionRentSingleModalHidden(undefined);
    setIsTargetQuestionIMBModalHidden(true);
    setIsActorQuestionDebtCollectorModalHidden(undefined);
    setIsTargetQuestionDebtCollectorModalHidden(true);
    setIsActorQuestionForcedDealModalAHidden(undefined);
    setIsActorQuestionForcedDealModalBHidden(undefined);
    setIsTargetQuestionForcedDealModalHidden(undefined);
    setIsActorQuestionSlyDealModalAHidden(undefined);
    setIsActorQuestionSlyDealModalBHidden(undefined);
    setIsTargetQuestionSlyDealModalHidden(undefined);
    setIsActorQuestionHouseModalHidden(undefined);
    setIsActorQuestionHotelModalHidden(undefined);
    setIsActorQuestionDealBreakerModalAHidden(undefined);
    setIsActorQuestionDealBreakerModalBHidden(undefined);
    setIsTargetQuestionDealBreakerModalHidden(undefined);
    setIsTargetQuestionJustSayNoModalHidden(undefined);
    setIsJustSayNoPendingModalHidden(true);
  }

  // END PLAYER ACTIONS

  if (!isDisconnectedModalHidden) {
    return <DisconnectedModal />;
  }

  if (socket && !gameState && isJIPModalHidden !== undefined) {
    return (
      <JIPModal
        setIsJIPModalHidden={setIsJIPModalHidden}
        setPlayerName={setPlayerName}
        socket={socket}
        disconnectedPlayers={isJIPModalHidden}
      />
    );
  }

  if (socket && gameState && hand && money && actionsLeft !== undefined) {
    return (
      <React.Fragment>
        {justSayNo !== undefined && <JustSayNo playerName={justSayNo} />}
        {currentAction !== undefined && <ActionPendingModal action={currentAction} />}
        {isActorQuestionRentModalHidden !== undefined && (
          <ActorQuestionRentModal
            socket={socket}
            cardId={isActorQuestionRentModalHidden}
            hand={hand}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
            actionsLeft={actionsLeft}
          />
        )}
        {isActorQuestionRentSingleModalHidden !== undefined && (
          <ActorQuestionRentSingleModal
            socket={socket}
            cardId={isActorQuestionRentSingleModalHidden}
            hand={hand}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
            actionsLeft={actionsLeft}
            players={gameState.players.filter((p) => p.name !== playerName)}
          />
        )}
        {isTargetQuestionRentModalHidden !== undefined && (
          <TargetQuestionRentModal
            setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
            socket={socket}
            hand={hand}
            money={money}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
            rentValue={isTargetQuestionRentModalHidden}
          />
        )}
        {!isTargetQuestionIMBModalHidden && (
          <TargetQuestionIMBModal
            setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
            socket={socket}
            hand={hand}
            money={money}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
          />
        )}
        {isActorQuestionDebtCollectorModalHidden !== undefined && (
          <ActorQuestionDebtCollectorModal
            socket={socket}
            cardId={isActorQuestionDebtCollectorModalHidden}
            hand={hand}
            playerName={playerName}
            players={gameState.players}
          />
        )}
        {!isTargetQuestionDebtCollectorModalHidden && (
          <TargetQuestionDebtCollectorModal
            setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
            socket={socket}
            hand={hand}
            money={money}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
          />
        )}
        {isActorQuestionForcedDealModalAHidden !== undefined && (
          <ActorQuestionForcedDealModalA
            setIsActorQuestionForcedDealModalBHidden={setIsActorQuestionForcedDealModalBHidden}
            socket={socket}
            cardId={isActorQuestionForcedDealModalAHidden}
            hand={hand}
            playerName={playerName}
            players={gameState.players}
          />
        )}
        {isActorQuestionForcedDealModalBHidden !== undefined && (
          <ActorQuestionForcedDealModalB
            setIsActorQuestionForcedDealModalBHidden={setIsActorQuestionForcedDealModalBHidden}
            socket={socket}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
            targetPlayer={isActorQuestionForcedDealModalBHidden.targetPlayer}
            players={gameState.players}
          />
        )}
        {isTargetQuestionForcedDealModalHidden !== undefined && (
          <TargetQuestionForcedDealModal
            setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
            socket={socket}
            hand={hand}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
            actorProperties={
              gameState.players.filter(
                (p) => p.name === isTargetQuestionForcedDealModalHidden.actorName
              )[0].properties
            }
            targetCardIdToSwap={isTargetQuestionForcedDealModalHidden.targetCardIdToSwap}
            actorCardIdToSwap={isTargetQuestionForcedDealModalHidden.actorCardIdToSwap}
          />
        )}
        {isActorQuestionSlyDealModalAHidden !== undefined && (
          <ActorQuestionSlyDealModalA
            setIsActorQuestionSlyDealModalBHidden={setIsActorQuestionSlyDealModalBHidden}
            socket={socket}
            cardId={isActorQuestionSlyDealModalAHidden}
            hand={hand}
            playerName={playerName}
            players={gameState.players}
          />
        )}
        {isActorQuestionSlyDealModalBHidden !== undefined && (
          <ActorQuestionSlyDealModalB
            setIsActorQuestionSlyDealModalBHidden={setIsActorQuestionSlyDealModalBHidden}
            socket={socket}
            targetPlayer={isActorQuestionSlyDealModalBHidden.targetPlayer}
            players={gameState.players}
          />
        )}
        {isTargetQuestionSlyDealModalHidden !== undefined && (
          <TargetQuestionSlyDealModal
            setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
            socket={socket}
            hand={hand}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
            targetCardIdToSwap={isTargetQuestionSlyDealModalHidden.targetCardIdToSwap}
          />
        )}
        {isActorQuestionHouseModalHidden !== undefined && (
          <ActorQuestionHouseModal
            socket={socket}
            cardId={isActorQuestionHouseModalHidden.cardId}
            hand={hand}
            fullSets={isActorQuestionHouseModalHidden.fullSets}
          />
        )}
        {isActorQuestionHotelModalHidden !== undefined && (
          <ActorQuestionHotelModal
            socket={socket}
            cardId={isActorQuestionHotelModalHidden.cardId}
            hand={hand}
            validSets={isActorQuestionHotelModalHidden.validSets}
          />
        )}
        {isActorQuestionDealBreakerModalAHidden !== undefined && (
          <ActorQuestionDealBreakerModalA
            setIsActorQuestionDealBreakerModalBHidden={setIsActorQuestionDealBreakerModalBHidden}
            cardId={isActorQuestionDealBreakerModalAHidden.cardId}
            hand={hand}
            validPlayers={isActorQuestionDealBreakerModalAHidden.validPlayers}
          />
        )}
        {isActorQuestionDealBreakerModalBHidden !== undefined && (
          <ActorQuestionDealBreakerModalB
            setIsActorQuestionDealBreakerModalBHidden={setIsActorQuestionDealBreakerModalBHidden}
            socket={socket}
            properties={
              gameState.players.filter(
                (p) => p.name === isActorQuestionDealBreakerModalBHidden.targetPlayerName
              )[0].properties
            }
            targetPlayerName={isActorQuestionDealBreakerModalBHidden.targetPlayerName}
          />
        )}
        {isTargetQuestionDealBreakerModalHidden !== undefined && (
          <TargetQuestionDealBreakerModal
            setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
            socket={socket}
            hand={hand}
            properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
            targetSet={isTargetQuestionDealBreakerModalHidden.targetSet}
          />
        )}
        {isTargetQuestionJustSayNoModalHidden !== undefined && (
          <TargetQuestionJustSayNoModal
            setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
            socket={socket}
            hand={hand}
            playerName={isTargetQuestionJustSayNoModalHidden.playerName}
          />
        )}
        {!isJustSayNoPendingModalHidden && <JustSayNoPendingModal />}
        {isGamePaused !== undefined && <GamePausedModal disconnectedPlayers={isGamePaused} />}
        <GameScreen
          socket={socket}
          gameState={gameState}
          hand={hand}
          money={money}
          actionsLeft={actionsLeft}
          playerName={playerName}
          properties={gameState.players.filter((p) => p.name === playerName)[0].properties}
        />
      </React.Fragment>
    );
  }

  return (
    <div className='main'>
      <div className='lobby'>
        <h1>Monopoly Deal</h1>
        <form
          onSubmit={(event) => {
            handleJoinGame(event);
            setIsLobbySubmitting(true);
          }}
        >
          <input
            onChange={(event) => setRoomName(event.target.value)}
            type='text'
            value={roomName}
            placeholder='ENTER ROOM NAME'
          />
          <input
            onChange={(event) => setPlayerName(event.target.value)}
            type='text'
            value={playerName}
            placeholder='ENTER PLAYER NAME'
          />
          {hasJoinedGame ? (
            <p className='after-join'>You're in! Click START GAME once others have joined.</p>
          ) : (
            <input type='submit' value='JOIN GAME' disabled={isLobbySubmitting} />
          )}
        </form>
        <button className='e-in' onClick={() => handleStartGame()} type='button'>
          START GAME
        </button>
        <p>~ OR ~</p>
        <button className='jip' onClick={() => handleJoinInProgress()} type='button'>
          JOIN GAME IN PROGRESS
        </button>
      </div>
    </div>
  );
};

export default App;
