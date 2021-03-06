import EventEmitter from 'events';

import MessengerClient from './messenger-client';

import MessengerText from './elements/messenger-text';
import MessengerImage from './elements/messenger-image';
import MessengerButton from './elements/messenger-button';
import MessengerBubble from './elements/messenger-bubble';
import MessengerAddress from './elements/messenger-address';
import MessengerSummary from './elements/messenger-summary';
import MessengerAdjustment from './elements/messenger-adjustment';

import MessengerButtonTemplate from './templates/messenger-button-template';
import MessengerGenericTemplate from './templates/messenger-generic-template';
import MessengerReceiptTemplate from './templates/messenger-receipt-template';

class MessengerWrapper extends EventEmitter {
  constructor(opts) {
    super();

    opts = opts || {};

    if (!opts.verifyToken || !opts.pageAccessToken) {
      throw new Error('VERIFY_TOKEN or PAGE_ACCESS_TOKEN are missing.');
    }

    this.verifyToken = opts.verifyToken;
    this.pageAccessToken = opts.pageAccessToken;
    this.messengerClient = new MessengerClient(this);
    this.lastEntry = {};
  }

  verify(req, res) {
    if (req.query['hub.verify_token'] === this.verifyToken) {
      return res.send(req.query['hub.challenge']);
    } else {
      return res.send('VERIFY_TOKEN does not match.');
    }
  }

  handle(req) {
    let entries = req.body.entry;

    entries.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message) {
          this.handleEvent('message', event);
        }
        else if (event.delivery) {
          this.handleEvent('delivery', event);
        }
        else if (event.postback) {
          this.handleEvent('postback', event);
        }
        else if (event.optin) {
          this.handleEvent('optin', event);
        }
      });
    });
  }

  handleEvent(action, event) {
    this.lastEntry = event;
    this.emit(action, event);
  }

  getUser() {
    return this.messengerClient.getUserData(this.lastEntry);
  }

  send(payload) {
    return this.messengerClient.sendData(payload, this.lastEntry);
  }

  getUserId() {
    return this.lastEntry.sender.id;
  }

  subscribe() {
    return this.messengerClient.subscribeAppToPage();
  }
}

export {
  MessengerWrapper,
  MessengerText,
  MessengerImage,
  MessengerButton,
  MessengerBubble,
  MessengerAddress,
  MessengerSummary,
  MessengerAdjustment,
  MessengerButtonTemplate,
  MessengerGenericTemplate,
  MessengerReceiptTemplate
}
