require("../framework/InitAnalyticsNamespace.js");
require("../../html5-common/js/utils/utils.js");

/**
 * @class IqPlugin
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var IqPlugin= function (framework)
{
  var _framework = framework;
  var name = "iq";
  var version = "v1";
  var id;

  var SDK_LOAD_TIMEOUT = 3000;

  var autoPlay = null;
  var pcode = null;
  var playerId = null;
  var currentEmbedCode = null;
  var contentType = "ooyala";
  var currentPlayheadPosition = null;
  
  this.ooyalaReporter = null;
  this.testMode = false;

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method IqPlugin#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method IqPlugin#getVersion
   * @return {string} The version of the plugin.
   */
  this.getVersion = function ()
  {
    return version;
  };

  /**
   * Return the autoPlay value.
   * @public
   * @method IqPlugin@getAutoPlay
   * @return {boolean} The value of autoPlay.
   */
  this.getAutoPlay = function()
  {
    return autoPlay;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method IqPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method IqPlugin#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method IqPlugin#init
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

    if (this.testMode)
    {
      trySetupAnalytics();
    }
    else
    {
      OO.loadScriptOnce("https://analytics.ooyala.com/static/v3/analytics.js", trySetupAnalytics, sdkLoadError, SDK_LOAD_TIMEOUT);
    }
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method IqPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
      OO.log( "Analytics Template: PluginID \'" + id + "\' received this metadata:", metadata);
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method IqPlugin#processEvent
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
          duration = params[0].duration;
          if (this.ooyalaReporter)
          {
            this.ooyalaReporter.initializeMedia(currentEmbedCode, contentType);
            OO.log("IQ: Reported: initializeMedia() with args: " + currentEmbedCode + ", " + contentType);
            this.ooyalaReporter.setMediaDuration(duration);
            OO.log("IQ: Reported: setMediaDuration() with args: " + duration);
          }
          else
          {
            OO.log("Tried reporting event: " + OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED +
                   " but ooyalaReporter is: " + this.ooyalaReporter);
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
          pcode = params[0].pcode;
          playerId = params[0].playerBrandingId;
          if (this.ooyalaReporter)
          {
            this.ooyalaReporter._base.pcode = pcode;
            this.ooyalaReporter.reportPlayerLoad();
            OO.log("IQ: Reported: reportPlayerLoad()");
          }
          else
          {
            OO.log("IQ: Tried reporting event: " + OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED +
                   " but ooyalaReporter is: " + this.ooyalaReporter);
          }
        }
        break;

      case OO.Analytics.EVENTS.INITIAL_PLAYBACK_REQUESTED:
        OO.log("IQ: Reported: reportPlayRequested() with args: " + autoPlay);
        this.ooyalaReporter.reportPlayRequested(autoPlay);
        break;

      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        if (params && params[0])
        {
          currentPlayheadPosition = params[0].streamPosition;
          if (currentPlayheadPosition > 0)
          {
            if (this.ooyalaReporter)
            {
              var currentPlayheadPositionMilli = currentPlayheadPosition * 1000;
              this.ooyalaReporter.reportPlayHeadUpdate(currentPlayheadPositionMilli);
              OO.log("IQ: Reported: reportPlayHeadUpdate() with args: " + Math.floor(currentPlayheadPosition * 1000));
            }
            else
            {
              OO.log("IQ: Tried reporting event: " + OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED +
                     " but ooyalaReporter is: " + this.ooyalaReporter);
            }
          }
        }
        break;

      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        this.ooyalaReporter.reportPause();
        OO.log("IQ: Reported: reportPause()");
        break;

      // TODO: use for resume?
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        this.ooyalaReporter.reportResume();
        OO.log("IQ: Reported: reportResume()");
        break;

      case OO.Analytics.EVENTS.VIDEO_SEEK_COMPLETED:
        if (params && params[0])
        {
          var seekedPlayheadPosition = params[0].timeSeekedTo;
          var seekedPlayheadPositionMilli = seekedPlayheadPosition * 1000;
          var currentPlayheadPositionMilli = currentPlayheadPosition * 1000;
          this.ooyalaReporter.reportSeek(currentPlayheadPositionMilli, seekedPlayheadPositionMilli);
          OO.log("IQ: Reported: reportSeek() with args: " + currentPlayheadPositionMilli + ", " + seekedPlayheadPositionMilli);
        }
        break;

      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        this.ooyalaReporter.reportComplete();
        OO.log("IQ: Reported: reportComplete()");
        break;

      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        this.ooyalaReporter.reportReplay();
        OO.log("IQ: Reported: reportReplay()");
        break;

      case OO.Analytics.EVENTS.AD_REQUEST:
      case OO.Analytics.EVENTS.AD_REQUEST_SUCCESS:
      case OO.Analytics.EVENTS.AD_SDK_LOADED:
      case OO.Analytics.EVENTS.AD_SDK_LOAD_FAILURE:
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
      case OO.Analytics.EVENTS.AD_POD_STARTED:
      case OO.Analytics.EVENTS.AD_POD_ENDED:
      case OO.Analytics.EVENTS.AD_STARTED:
      case OO.Analytics.EVENTS.AD_ENDED:
      case OO.Analytics.EVENTS.AD_SKIPPED:
      case OO.Analytics.EVENTS.AD_ERROR:
      case OO.Analytics.EVENTS.AD_REQUEST_EMPTY:
      case OO.Analytics.EVENTS.AD_REQUEST_ERROR:
      case OO.Analytics.EVENTS.AD_PLAYBACK_ERROR:
      case OO.Analytics.EVENTS.AD_IMPRESSION:
      case OO.Analytics.EVENTS.AD_CLICKTHROUGH_OPENED:
        var eventMetadata = params[0];
        if(eventMetadata == null)
        {
          eventMetadata = {};
        }
        eventMetadata.adEventName = eventName;
        //this.ooyalaReporter.reportCustomEvent(eventName, eventMetadata);
        OO.log("IQ: Reported: reportCustomEvent() for event: " + eventName + " with args:" + JSON.stringify(eventMetadata));
        break;
      case OO.Analytics.EVENTS.SDK_AD_EVENT:
        var eventMetadata = params[0];
        if(eventMetadata == null)
        {
          eventMetadata = {};
        }
        eventMetadata.adEventName = "" + eventName + " : " + eventMetadata.adEventName;
        //this.ooyalaReporter.reportCustomEvent(eventName, eventMetadata);
        OO.log("IQ: Reported: reportCustomEvent() for event: " + eventName + " with args:" + JSON.stringify(eventMetadata));
        break;
      default:
        break;
    }
  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method IqPlugin#destroy
   */
  this.destroy = function ()
  {
    _framework = null;
  };

  /**
   * Called when the SDK fails to load.
   * @private
   * @method NielsenAnalyticsPlugin#sdkLoadError
   */
  var sdkLoadError = function()
  {
    //Destroy and unregister
    if (_.isString(id))
    {
      framework.unregisterPlugin(id);
    }
    this.destroy();
  };

  var trySetupAnalytics = OO._.bind(function()
  {
    if (window.Ooyala)
    {
      this.ooyalaReporter = new Ooyala.Analytics.Reporter();

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
      this.ooyalaReporter.setDeviceInfo();
      this.ooyalaReporter.setPlayerInfo(playerId, playerName, playerVersion);
    }
    else
    {
      OO.log("IQ Plugin: Analytics SDK not loaded");
    }
  }, this);
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(IqPlugin);

module.exports = IqPlugin;
