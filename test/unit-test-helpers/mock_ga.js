//https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#method-details

//unit test helpers
global.MockGa = {
  gaCommand: null,
  gaHitType: null,
  gaEventFields: {
    eventCategory: null,
    eventAction: null,
    eventLabel: null,
    eventValue: null
  }
};


global.ga = function(command)
{
  var eventHitTypeOrder = ['eventCategory', 'eventAction', 'eventLabel', 'eventValue'];
  if (command)
  {
    if (typeof command === "string")
    {
      MockGa.gaCommand = command;
      MockGa.gaHitType = arguments[1];
      var length = arguments.length;
      //0 and 1 are command and hit type
      for (var i = 2; i < length; i++)
      {
        if (arguments[i])
        {
          if (typeof arguments[i] === 'object' && i === length - 1)
          {
            var fieldsObject = arguments[i];
            for (var key in fieldsObject)
            {
              MockGa.gaEventFields[key] = fieldsObject[key];
            }
          }
          else
          {
            var hitTypeField = eventHitTypeOrder[i - 2];
            MockGa.gaEventFields[hitTypeField] = arguments[i];
          }
        }
      }
    }
    else if (typeof command === "function")
    {
      //ready callback
      //immediately execute callback
      command();

      //TODO: handle async callback to mock delayed library load
    }
  }
};

global.resetMockGa = function()
{
  MockGa.gaCommand = null;
  MockGa.gaHitType = null;
  MockGa.gaEventFields = {};
};