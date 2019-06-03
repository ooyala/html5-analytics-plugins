require('../framework/InitAnalyticsNamespace.js');

/**
 * @class AnalyticsPluginTemplate
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
const AnalyticsPluginTemplate = function (framework) {
  let _framework = framework;
  const name = 'template';
  const version = 'v1';
  let id;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method AnalyticsPluginTemplate#getName
   * @returns {string} The name of the plugin.
   */
  this.getName = function () {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method AnalyticsPluginTemplate#getVersion
   * @returns {string} The version of the plugin.
   */
  this.getVersion = function () {
    return version;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method AnalyticsPluginTemplate#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function (newID) {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method AnalyticsPluginTemplate#setPluginID
   * @returns  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function () {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method AnalyticsPluginTemplate#init
   */
  this.init = function () {
    // eslint-disable-next-line no-unused-vars
    let missedEvents;
    // if you need to process missed events, here is an example
    if (_framework && OO._.isFunction(_framework.getRecordedEvents)) {
      missedEvents = _framework.getRecordedEvents();
    }
    // use recorded events.
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method AnalyticsPluginTemplate#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function (metadata) {
    OO.log(`Analytics Template: PluginID '${id}' received this metadata:`, metadata);
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method AnalyticsPluginTemplate#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function (eventName, params) {
    OO.log(`Analytics Template: PluginID '${id}' received this event '${eventName}' with these params:`, params);
    switch (eventName) {
      case OO.Analytics.EVENTS.STREAM_TYPE_UPDATED:
        if (params && params[0]) {
          // Retrieve the stream type here.
          // Possible values include OO.Analytics.STREAM_TYPE.VOD and OO.Analytics.STREAM_TYPE.LIVE_STREAM
          // eslint-disable-next-line no-unused-vars
          const { streamType } = params[0];
        }
        break;
      default:
        break;
    }
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method AnalyticsPluginTemplate#destroy
   */
  this.destroy = function () {
    _framework = null;
  };
};

// Add the template to the global list of factories for all new instances of the framework
// and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(AnalyticsPluginTemplate);

module.exports = AnalyticsPluginTemplate;
