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
  this.init = function (metadata)
  {

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

  }

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method AnalyticsPluginTemplate#destroy
   */
  this.destroy = function ()
  {

  }
};

module.exports = AnalyticsPluginTemplate;
