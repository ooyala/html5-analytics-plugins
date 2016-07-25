//https://developers.google.com/analytics/devguides/collection/analyticsjs/command-queue-reference#method-details

//unit test helpers
MockGa = {
  gaCommand: null,
  gaArguments: null
};


ga = function(command)
{
  if (command)
  {
    if (typeof command === "string")
    {
      MockGa.gaCommand = command;
      MockGa.gaArguments = arguments;
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
  MockGa.gaArguments = null;
};