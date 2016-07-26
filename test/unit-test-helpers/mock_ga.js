//https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#method-details

//unit test helpers
MockGa = {
  gaCommand: null,
  gaHitType: null,
  gaEventFields: {
    eventCategory: null,
    eventAction: null,
    eventLabel: null,
    eventValue: null
  }
};


ga = function(command)
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
        var hitTypeField = eventHitTypeOrder[i - 2];
        if (typeof arguments[i] === 'object' && i === length)
        {
          MockGa.gaEventFields[hitTypeField] = arguments[i][hitTypeField];
        }
        else
        {
          MockGa.gaEventFields[hitTypeField] = arguments[i];
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

resetMockGa = function()
{
  MockGa.gaCommand = null;
  MockGa.gaHitType = null;
  MockGa.gaEventFields = {};
};