require("../framework/InitAnalyticsNamespace.js");
require("../../html5-common/js/utils/utils.js");

/**
 * @class ConvivaAnalyticsPlugin
 * @classdesc Conviva SDK plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var ConvivaAnalyticsPlugin = function (framework)
{
  var _framework = framework;
  var name = "conviva";
  var version = "v1";
  var id;
  var _active = true;

  var storedEvents = [];

  var convivaMetadata = null;

  var OOYALA_TOUCHSTONE_SERVICE_URL = "https://ooyala-test.testonly.conviva.com";
  var CURRENT_CONVIVA_LIVEPASS_URL = "http://livepassdl.conviva.com/ver/2.90.0.24127/LivePass.js";
  var SDK_LOAD_TIMEOUT = 3000;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#getVersion
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
   * @method ConvivaAnalyticsPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method ConvivaAnalyticsPlugin#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method ConvivaAnalyticsPlugin#init
   */
  this.init = function()
  {
    //if SDK is not loaded by now, load SDK
    if (!sdkLoaded())
    {
      OO.loadScriptOnce(CURRENT_CONVIVA_LIVEPASS_URL, trySetupConviva, sdkLoadError, SDK_LOAD_TIMEOUT);
    }
  };

  /**
   *
   */
  var trySetupConviva = function()
  {
    if (convivaMetadata && sdkLoaded()){
      //TODO: set to false in production
      Conviva.LivePass.toggleTraces(true);

      // Initialize Conviva's LivePass when DOM is ready
      Conviva.LivePass.init(convivaMetadata.serviceUrl, convivaMetadata.customerKey, livePassNotifier);
    }
  };

  /**
   *
   * @returns {boolean}
   */
  var sdkLoaded = function()
  {
    return window.Conviva && window.Conviva.LivePass;
  };

  /**
   *
   */
  var livePassNotifier = function(convivaNotification)
  {
    if (convivaNotification.code == 0)
    {
      console.log("Conviva LivePass initialized successfully.");
    }
    else
    {
      if (Conviva.LivePass.ready)
      { // check if LivePass is already initialized
        console.log("Conviva LivePass post-initialization feedback.\n " +
          "\tCode: " + convivaNotification.code + ";\n " +
          "\tMessage: " + convivaNotification.message);
      }
      else
      {
        console.log("Conviva LivePass failed to initialize!\n " +
          "t\Conviva metrics will not be captured! " +
          "\tCode: " + convivaNotification.code + "; " +
          "\tMessage: " + convivaNotification.message);
      }
    }
  };

  var validateConvivaMetadata = function(metadata)
  {
    var valid = true;
    var requiredKeys = ["serviceUrl", "customerKey"];

    var missingKeys = [];

    if (metadata)
    {
      _.each(requiredKeys, function(key)
      {
        if (!_.has(metadata, key))
        {
          missingKeys.push(key);
          valid = false;
        }
      });
    }
    else
    {
      OO.log("Error: Missing Conviva Metadata!");
      missingKeys = requiredKeys;
      valid = false;
    }


    if(!_.isEmpty(missingKeys))
    {
      _.each(missingKeys, function(key)
      {
        OO.log("Error: Missing Conviva Metadata Key: " + key);
      });
    }

    return valid;
  };

  /**
   * Handles any events that were stored due to a delayed SDK initialization.
   * @private
   * @method ConvivaAnalyticsPlugin#handleStoredEvents
   */
  var handleStoredEvents = function()
  {
  };

  /**
   * Called when the SDK fails to load.
   * @private
   * @method ConvivaAnalyticsPlugin#sdkLoadError
   */
  var sdkLoadError = function()
  {
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method ConvivaAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
    if (validateConvivaMetadata(metadata)) {
      convivaMetadata = metadata;
      trySetupConviva();
    }
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method ConvivaAnalyticsPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function(eventName, params)
  {
    OO.log( "Conviva: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);
    switch(eventName)
    {
      case OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED:
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        break;
      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        break;
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        break;
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        break;
      case OO.Analytics.EVENTS.AD_STARTED:
        break;
      case OO.Analytics.EVENTS.AD_ENDED:
        break;
      case OO.Analytics.EVENTS.STREAM_TYPE_UPDATED:
        var streamType = params[0].streamType;
        break;
      default:
        break;
    }
  };

  /**
   * Resets any state variables back to their initial values.
   * @private
   * @method ConvivaAnalyticsPlugin#resetPlaybackState
   */
  var resetPlaybackState = function ()
  {

  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method ConvivaAnalyticsPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
    resetPlaybackState();
  };

  /**
   * To be called when the main content has started playback. This will be called when the content initially starts
   * or when transitioning back to main content from an ad. Will notify the Conviva SDK of a load metadata event
   * (event 15).
   * @private
   * @method ConvivaAnalyticsPlugin#trackPlay
   */
  var trackPlay = function()
  {

  };

  /**
   * To be called when the main content has finished playback. This must be called before any postrolls start. Will
   * notify the Conviva SDK of a end event (event 57).
   * @private
   * @method ConvivaAnalyticsPlugin#trackComplete
   */
  var trackComplete = function()
  {

  };

  /**
   * To be called when there is a content playhead update. Will notify the Conviva SDK of a "set playhead position" event
   * (event 49).
   * @private
   * @method ConvivaAnalyticsPlugin#trackPlayhead
   */
  var trackPlayhead = function()
  {

  };

  /**
   * To be called when an ad break has started. Will notify the Conviva SDK of a stop event (event 7).
   * @private
   * @method ConvivaAnalyticsPlugin#trackAdBreakStart
   */
  var trackAdBreakStart = function()
  {

  };

  /**
   * To be called when an ad playback has started. Will notify the Conviva SDK of a load metadata event (event 15).
   * The event type will be one of preroll, midroll, or postroll, depending on the current playhead and if the
   * content has finished.
   * @private
   * @method ConvivaAnalyticsPlugin#trackAdStart
   * @param {object} metadata The metadata for the ad.
   *                        It must contain the following fields:<br/>
   *   adDuration {number} The length of the ad<br />
   *   adId {string} The id of the ad<br />
   */
  var trackAdStart = function(metadata)
  {

  };

  /**
   * To be called when an ad playback has finished. Will notify the Conviva SDK of a stop event (event 3).
   * @private
   * @method ConvivaAnalyticsPlugin#trackAdEnd
   */
  var trackAdEnd = function()
  {

  };
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(ConvivaAnalyticsPlugin);

module.exports = ConvivaAnalyticsPlugin;
