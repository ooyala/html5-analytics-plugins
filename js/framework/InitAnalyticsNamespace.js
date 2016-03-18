require("../../html5-common/js/utils/InitModules/InitOO.js");
require("../../html5-common/js/utils/InitModules/InitOOUnderscore.js");

if (!OO.Analytics)
{
  OO.Analytics = {};
}

if (!OO.Analytics.FrameworkInstanceList)
{
  OO.Analytics.FrameworkInstanceList = [];
}

if (!OO.Analytics.PluginFactoryList)
{
  OO.Analytics.PluginFactoryList = [];
}

if (!OO.Analytics.RegisterPluginFactory)
{
  /**
   * Registers a plugin factory in a global list of factories and then
   * registers the factory with any existing framework instances.
   * @public
   * @method OO.Analytics.Framework#RegisterPluginFactory
   * @param  {object} factory The factory creation function
   */
  OO.Analytics.RegisterPluginFactory = function(factory)
  {
    //Add plugin to the factory list.
    OO.Analytics.PluginFactoryList.push(factory);

    //Register this plugin with any existing frameworks.
    if (OO.Analytics.FrameworkInstanceList && OO.Analytics.FrameworkInstanceList.length)
    {
      for(var i = 0; i < OO.Analytics.FrameworkInstanceList.length; i++)
      {
        OO.Analytics.FrameworkInstanceList[i].registerPluginFactory(factory);
      }
    }
  }
}


if (!OO.Analytics.FrameworkRegistrationObject)
{
  /**
   * @class FrameworkRegistrationObject
   * @classdesc This class wraps a framework object to only expose
   * registerPluginFactory.  It will be used to let plugins register to frameworks
   * at the global scope.
   * @public
   * @param  {object} framework Analytics framework instance
   */
  OO.Analytics.FrameworkRegistrationObject = function(framework)
  {
    this.registerPluginFactory = function(pluginFactory)
    {
      framework.registerPlugin(pluginFactory);
    }
  }
}


if (!OO.Analytics.RegisterFrameworkInstance)
{
  /**
   * Registers a framework instance in a global list of frameworks and then
   * register any plugin factory that are in the global plugin factory list.
   * @public
   * @method OO.Analytics.Framework#RegisterFrameworkInstance
   * @param  {object} framework Instance of the framework to register
   */
  OO.Analytics.RegisterFrameworkInstance = function(framework)
  {
    var frameworkRegistrationObject = new OO.Analytics.FrameworkRegistrationObject(framework);
    framework.frameworkRegistrationObject = frameworkRegistrationObject;
    OO.Analytics.FrameworkInstanceList.push(frameworkRegistrationObject);

    //check to see if any plugin factories already existed and register them to this plugin.
    if (OO._.isArray(OO.Analytics.PluginFactoryList) && OO.Analytics.PluginFactoryList.length > 0)
    {
      for (var i = 0; i < OO.Analytics.PluginFactoryList.length; i++)
      {
        framework.registerPlugin(OO.Analytics.PluginFactoryList[i]);
      }
    }
  }
}

if (!OO.Analytics.UnregisterFrameworkInstance)
{
  /**
   * Remove a framework instance from the global list of instance. You must have
   * a reference to the FrameworkRegistrationObject from that framework to remove it.
   * This is meant for framework instances to remove themselves from the list only.
   * @public
   * @method OO.Analytics.Framework#UnregisterFrameworkInstance
   * @param  {object} framework Instance of the FrameworkRegistrationObject created when framework instance was registered
   */
  OO.Analytics.UnregisterFrameworkInstance = function(framework)
  {
    if (framework)
    {
      var regObj = framework.frameworkRegistrationObject;
      if (regObj)
      {
        OO.Analytics.FrameworkInstanceList = OO._.without(OO.Analytics.FrameworkInstanceList, regObj);
      }
    }
  }
}
