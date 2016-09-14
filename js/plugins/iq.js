require("../framework/InitAnalyticsNamespace.js");
require("../../html5-common/js/utils/utils.js");

/**
 * @class AnalyticsPluginTemplate
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var AnalyticsPluginTemplate = function (framework)
{
  var _framework = framework;
  var name = "iq";
  var version = "v1";
  var id;

  var SDK_LOAD_TIMEOUT = 3000;

  var ooyalaReporter;
  var pCode;
  var playerId;
  var currentEmbedCode;
  var mediaId;
  var contentType;
  var currentPlayheadPosition;

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
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method AnalyticsPluginTemplate#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method AnalyticsPluginTemplate#init
   */
  this.init = function()
  {
    var missedEvents;
    //if you need to process missed events, here is an example
    if (_framework && OO._.isFunction(_framework.getRecordedEvents))
    {
      missedEvents = _framework.getRecordedEvents();
    }
    //use recorded events.

    if (!window.Ooyala)
    {
      OO.loadScriptOnce("https://analytics.ooyala.com/static/v3/analytics.js", trySetupAnalytics, sdkLoadError, SDK_LOAD_TIMEOUT);
    }
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method AnalyticsPluginTemplate#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
      OO.log( "Analytics Template: PluginID \'" + id + "\' received this metadata:", metadata);
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method AnalyticsPluginTemplate#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function(eventName, params)
  {
    OO.log( "Analytics Template: PluginID \'" + id + "\' received this event \'" + eventName + "\' with these params:", params);
    switch(eventName)
    {
      case OO.Analytics.EVENTS.STREAM_TYPE_UPDATED:
        if (params && params[0])
        {
          //Retrieve the stream type here.
          //Possible values include OO.Analytics.STREAM_TYPE.VOD and OO.Analytics.STREAM_TYPE.LIVE_STREAM
          var streamType = params[0].streamType;
        }
        break;

      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        if (params && params[0])
        {
          mediaId = params[0].title;
          contentType = params[0].contentType;
          duration = params[0].duration;
          if (ooyalaReporter)
          {
            ooyalaReporter.initializeMedia(mediaId, contentType);
            OO.log("IQ: Reported: initializeMedia() with args: " + mediaId + ", " + contentType);
            ooyalaReporter.setMediaDuration(duration);
            OO.log("IQ: Reported: setMediaDuration() with args: " + duration);
          }
          else
          {
            OO.log("Tried reporting event: " + OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED +
                   " but ooyalaReporter is: " + ooyalaReporter);
          }
        }
        break;

      case OO.Analytics.EVENTS.VIDEO_SOURCE_CHANGED:
        if (params && params[0])
        {
          autoPlay = params[0].metadata.autoPlay;
          currentEmbedCode = params[0].embedCode;
        }
        break;

      case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
        if (params && params[0])
        {
          pCode = params[0].pcode;
          OO.log(pCode);
          playerId = params[0].playerBrandingId;
          if (ooyalaReporter)
          {
            //ooyalaReporter._base.pcode = pCode;
            ooyalaReporter._base.pcode = "NpdGUyOiGhe-7laHC2JnUG3Mg-No";
            ooyalaReporter.reportPlayerLoad();
            OO.log("IQ: Reported: reportPlayerLoad()");
          }
          else
          {
            OO.log("IQ: Tried reporting event: " + OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED +
                   " but ooyalaReporter is: " + ooyalaReporter);
          }
        }
        break;

      case OO.Analytics.EVENTS.VIDEO_PLAY_REQUESTED:
        OO.log("IQ: Reported: reportPlayRequested() with args: " + autoPlay);
        ooyalaReporter.reportPlayRequested(autoPlay);
        break;

      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0])
        {
          console.log(params[0]);
          currentPlayheadPosition = params[0].streamPosition;
          if (currentPlayheadPosition > 0)
          {
            if (ooyalaReporter)
            {
              ooyalaReporter.reportPlayHeadUpdate(Math.floor(currentPlayheadPosition * 1000));
              OO.log("IQ: Reported: reportPlayHeadUpdate() with args: " + Math.floor(currentPlayheadPosition * 1000));
            }
            else
            {
              OO.log("IQ: Tried reporting event: " + OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED +
                     " but ooyalaReporter is: " + ooyalaReporter);
            }
          }
        }
        break;

      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        ooyalaReporter.reportPause();
        OO.log("IQ: Reported: reportPause()");
        break;

      // TODO: use for resume?
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        ooyalaReporter.reportResume();
        OO.log("IQ: Reported: reportResume()");
        break;

      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
        if (params && params[0])
        {
          var seekedPlayheadPosition = params[0].timeSeekedTo;
          ooyalaReporter.reportSeek(currentPlayheadPosition, seekedPlayheadPosition);
          OO.log("IQ: Reported: reportSeek() with args: " + currentPlayheadPosition + ", " + seekedPlayheadPosition);
        }
        break;

      case OO.Analytics.EVENTS.VIDEO_CONTENT_COMPLETED:
        ooyalaReporter.reportComplete();
        OO.log("IQ: Reported: reportComplete()");
        break;

      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        ooyalaReporter.reportReplay();
        OO.log("IQ: Reported: reportReplay()");
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
  this.destroy = function ()
  {
    _framework = null;
  }

  /**
   * Called when the SDK fails to load.
   * @private
   * @method NielsenAnalyticsPlugin#sdkLoadError
   */
  var sdkLoadError = function()
  {
    console.log("bad banana");
    //Destroy and unregister
    if (_.isString(id))
    {
      framework.unregisterPlugin(id);
    }
    this.destroy();
  };

  var trySetupAnalytics = OO._.bind(function()
  {
    console.log("banana");
    ooyalaReporter = new Ooyala.Analytics.Reporter();

    var missedEvents;
    //if you need to process missed events, here is an example
    if (_framework && OO._.isFunction(_framework.getRecordedEvents))
    {
      missedEvents = _framework.getRecordedEvents();
      for (var i = 0; i < missedEvents.length; i++)
      {
        recordedEvent = missedEvents[i];
        this.processEvent(recordedEvent.eventName, recordedEvent.params);
      }
    }

    // TODO: setup
    var deviceInfo = {};
    var playerName = "Ooyala Player";
    var playerVersion = "v4"; // TODO: need a mechanism in core to get this
    ooyalaReporter.setDeviceInfo();
    ooyalaReporter.setPlayerInfo(playerId, playerName, playerVersion);
  }, this);
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(AnalyticsPluginTemplate);

module.exports = AnalyticsPluginTemplate;
