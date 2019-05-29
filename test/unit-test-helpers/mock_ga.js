// https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#method-details

// unit test helpers
global.MockGa = {
  gaCommand: null,
  gaHitType: null,
  gaEventFields: {
    eventCategory: null,
    eventAction: null,
    eventLabel: null,
    eventValue: null,
  },
};


global.ga = function (...args) {
  const eventHitTypeOrder = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];
  const [command] = args;
  if (command) {
    if (typeof command === 'string') {
      MockGa.gaCommand = command;
      [, MockGa.gaHitType] = args;
      const { length } = args;
      // 0 and 1 are command and hit type
      for (let i = 2; i < length; i++) {
        if (args[i]) {
          if (typeof args[i] === 'object' && i === length - 1) {
            const fieldsObject = args[i];
            Object
              .entries(fieldsObject)
              .forEach(([, key]) => {
                MockGa.gaEventFields[key] = fieldsObject[key];
              });
          } else {
            const hitTypeField = eventHitTypeOrder[i - 2];
            MockGa.gaEventFields[hitTypeField] = args[i];
          }
        }
      }
    } else if (typeof command === 'function') {
      // ready callback
      // immediately execute callback
      command();

      // TODO: handle async callback to mock delayed library load
    }
  }
};

global.resetMockGa = function () {
  MockGa.gaCommand = null;
  MockGa.gaHitType = null;
  MockGa.gaEventFields = {};
};
