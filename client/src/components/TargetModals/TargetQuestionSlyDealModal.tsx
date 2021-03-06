import React, { Dispatch, SetStateAction } from 'react';
import {
  IActionCard,
  IRentCard,
  IPropertyCard,
  IPropertyWildcard,
  IMoneyCard,
  IPropertySet
} from '../GameScreen/interfaces';
import SocketEvent from '../../helpers/SocketEvent';
import JustSayNoButton from './JustSayNoButton';
import { getTypeById } from '../GameScreen/helpers';
import PropertyCard from '../Card/PropertyCard';
import PropertyWildcard from '../Card/PropertyWildcard';

interface IProps {
  setIsJustSayNoPendingModalHidden: Dispatch<SetStateAction<boolean>>;
  socket: SocketIOClient.Socket;
  hand: (IActionCard | IRentCard | IPropertyCard | IPropertyWildcard | IMoneyCard)[];
  properties: IPropertySet[];
  targetCardIdToSwap: number;
}

const TargetQuestionSlyDealModal: React.FC<IProps> = ({
  setIsJustSayNoPendingModalHidden,
  socket,
  hand,
  properties,
  targetCardIdToSwap
}) => {
  function getCard(propertySets: IPropertySet[], cardId: number) {
    let card: any;

    for (let propertySet of propertySets) {
      const cards = propertySet.cards.filter((c) => c.id === cardId);

      if (cards.length > 0) {
        card = cards[0];
      }
    }

    return card;
  }

  function renderLoseCard() {
    switch (getTypeById(targetCardIdToSwap)) {
      case 'PropertyCard':
        return <PropertyCard card={getCard(properties, targetCardIdToSwap)} />;
      case 'PropertyWildcard':
        return <PropertyWildcard card={getCard(properties, targetCardIdToSwap)} />;
      default:
        return 'Uh oh!';
    }
  }

  return (
    <div className='action-modal'>
      <h3 className='action-modal__subtitle'>You are the target of</h3>
      <h2 className='action-modal__title'>Sly Deal</h2>
      <div className='action-modal__staged-cards'>
        <div className='card-wrapper'>
          <div className='card'>{renderLoseCard()}</div>
          <p className='staged-cards__label-lose'>Lose</p>
        </div>
      </div>
      <div className='modal--card__button-container'>
        <JustSayNoButton
          setIsJustSayNoPendingModalHidden={setIsJustSayNoPendingModalHidden}
          socket={socket}
          hand={hand}
        />
        <button
          onClick={() => socket.emit(SocketEvent.FROM_CLIENT_TARGET_RESPONSE_SLY_DEAL)}
          className='modal--card__button button--play'
          type='button'
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default TargetQuestionSlyDealModal;
