/**
 * [AnalyticsPluginTemplate description]
 * @class AnalyticsPluginTemplate
 * @classdesc Example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance.
 */
var AnalyticsPluginTemplate = function (framework)
{
  var _framework = framework;
  const name = "template";
  const version = "v1";
  var id;
  var _active = true;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method AnalyticsPluginTemplate#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method AnalyticsPluginTemplate#getVersion
   * @return {string} The version of the plugin.
   */
  this.getVersion = function ()
  {
    return version;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method AnalyticsPluginTemplate#setPluginID
   * @param  {string} newID The plugin id.
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  }

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method AnalyticsPluginTemplate#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  }

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method AnalyticsPluginTemplate#init
   * @param  {object} metadata The metadata for this plugin.
   */
  this.init = function()
  {

  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method AnalyticsPluginTemplate#setMetadata
   * @param  {object} metadata The metadata for this plugin.
   */
  this.setMetadata = function(metadata)
  {
      OO.log( "PluginID \'" + pluginID + "\' recieved this metadata:", metadata);
  };

  /**
  * [Required Function] Return if plugin is currently active or not.
  * @public
  * @method AnalyticsPluginTemplate#isActive
  * @return {boolean} Return true if plugin is active and can receive events.
  */
  this.isActive = function()
  {
    return _active;
  }

  /**
  * [Required Function] Make this plugin active and able to receive events.
  * @public
  * @method AnalyticsPluginTemplate#makeActive
  */
  this.makeActive = function ()
  {
    _active = true;
  }

  /**
  * [Required Function] Make this plugin inactive to stop receiving events.
  * @public
  * @method AnalyticsPluginTemplate#makeInactive
  */
  this.makeInactive = function ()
  {
    _active = false;
  }

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method AnalyticsPluginTemplate#processEvent
   * @param  {string} eventName Name of the event.
   * @param  {Array} params     Array of parameters sent with the sent.
   */
  this.processEvent = function(eventName, params)
  {
    OO.log( "PluginID \'" + pluginID + "\' recieved this event:", eventName);
  }

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method AnalyticsPluginTemplate#destroy
   */
  this.destroy = function ()
  {

    _framework = null;
  }
};

module.exports = AnalyticsPluginTemplate;

////////////////////////////////////////////////////////////////////////////////
///*****If you would like the plugin to auto register (most common case)
///     then the following code will do that for you.  The plugin needs to
///     add itself to the list of factories, in case more framework instances
///     are created later (ex. creating players on the fly within a webpage).
///     And the plugin must register itself with any existing frameworks.
///
///     If you only want this plugin to add itself to certain framework instances,
///     this code will not cover that.
////////////////////////////////////////////////////////////////////////////////

//Add plugin to the factory list.
if (!OO.Analytics.PluginFactoryList)
{
  OO.Analytics.PluginFactoryList = [];
}

OO.Analytics.PluginFactoryList.push(AnalyticsPluginTemplate);

//Register this plugin with any existing frameworks.
if (!OO.Analytics.FrameworkInstanceList)
{
  OO.Analytics.FrameworkInstanceList = [];
}
else
{
  for(var i = 0; i < OO.Analytics.FrameworkInstanceList.length; i++)
  {
    OO.Analytics.FrameworkInstanceList[i].registerPluginFactory(AnalyticsPluginTemplate);
  }
}
