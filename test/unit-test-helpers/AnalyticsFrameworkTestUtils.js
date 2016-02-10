require(SRC_ROOT + "framework/InitAnalyticsNamespace.js");
require(SRC_ROOT + "framework/AnalyticsConstants.js");


if (!OO.Analytics.Utils)
{
  OO.Analytics.Utils = {};

  var Utils = OO.Analytics.Utils;

  Utils.createValidPluginFactory = function()
  {
    return function ()
    {
      var myPlugin = {};
      for (i = 0; i < OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++)
      {
        myPlugin[OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS[i]] = function() {};
      }

      //get name and version need to return a truthy string
      myPlugin.getName = function()
      {
        return "testName";
      };

      myPlugin.getVersion = function()
      {
        return "testVersion";
      };

      return myPlugin;
    }
  };

  Utils.createMissingFunctionFactory = function(functionToRemove)
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var badPlugin = new validFactory();
      delete badPlugin[functionToRemove];
      return badPlugin;
    },this);
  };

  Utils.createExtraFunctionFactory = function(functionToAdd)
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var extraFuncFactory = new validFactory();
      extraFuncFactory[functionToAdd] = function() {};
      return extraFuncFactory;
    },this);
  };

  Utils.createWrongNameReturnTypeFactory = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var wrongReturnFactory = new validFactory();
      wrongReturnFactory['getName'] = function() {return 5};
      return wrongReturnFactory;
    },this);
  };

  Utils.createWrongVersionReturnTypeFactory = function()
  {
    return OO._.bind(function()
    {
      var validFactory = Utils.createValidPluginFactory();
      var wrongReturnFactory = new validFactory();
      wrongReturnFactory['getVersion'] = function() {return 5};
      return wrongReturnFactory;
    },this);
  };
}
