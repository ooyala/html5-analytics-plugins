require("../framework/InitAnalyticsNamespace.js");

/**
 * @class GAAnalyticsPlugin
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
var GAAnalyticsPlugin = function(framework)
{
  var _framework = framework;
  var name = "GA";
  var version = "v1";
  var id;
  var _active = true;
  var _cachedEvents = [];
  var _cacheEvents = true;


  this.gtm = false;
  this.gaMechanism = 'events';
  this.gaPageviewFormat = 'ooyala-event/:event/:title';
  this.gaEventCategory = 'Ooyala';
  this.verboseLogging = false;
  this.playbackMilestones = [
    [0.01, 'playProgressStarted'],
    [0.25, 'playProgressQuarter'],
    [0.5, 'playProgressHalf'],
    [0.75, 'playProgressThreeQuarters'],
    [0.97, 'playProgressEnd']
  ];

  this.playing = false;
  this.duration = null;
  this.playerRoot = null;
  this.gaMethod = null;
  this.content = null;
  this.currentPlaybackType = 'content';
  this.lastEventReported = null;
  this.lastReportedPlaybackMilestone = 0;

  /**
   * Log plugin events if verboseLogging is set to 'true'.
   * @public
   * @method GAAnalyticsPlugin#log
   */
  this.log = function(what)
  {
    if (!this.verboseLogging || typeof console == 'undefined') return;
    console.log(what);
  };

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method GAAnalyticsPlugin#getName
   * @return {string} The name of the plugin.
   */
  this.getName = function()
  {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method GAAnalyticsPlugin#getVersion
   * @return {string} The version of the plugin.
   */
  this.getVersion = function()
  {
    return version;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method GAAnalyticsPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method GAAnalyticsPlugin#setPluginID
   * @return  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function()
  {
    return id;
  };

  /**
   * Output error message to console if there's no Google Analytics Tracking module installed.
   * @private
   * @method GAAnalyticsPlugin#displayError
   */
  this.displayError = function()
  {
    this.gaMethod = false;
    console.error("The Ooyala Google Analytics Tracking module is installed, but no valid Google Analytics code block is detected.");
  };

  /**
   * Import user settings if available.
   * @private
   * @method GAAnalyticsPlugin#importUserSettings
   */
  this.importUserSettings = function()
  {
    if (typeof window.ooyalaGASettings != 'undefined')
    {
      var GA = this;
      _.each(window.ooyalaGASettings, function(value, index)
      {
        eval('GA.' + index + '=window.ooyalaGaSettings["' + index + '"]');
      });
    }
  };

  /**
   * Init Google Analytics module.
   * @private
   * @method GAAnalyticsPlugin#initGA
   */
  this.initGA = function()
  {
    // If dataLayer is present, GTM is being used; force events
    if (typeof window["dataLayer"] != 'undefined')
    {
      this.gaMechanism = 'events';
      this.gtm = true;
    }

    // Track as pageviews?
    if (this.gaMechanism == 'pageviews')
    {
      // Legacy GA code block support
      if (typeof _gaq != 'undefined')
      {
        this.gaMethod = "_gaq.push(['_trackPageview', '" + this.gaPageviewFormat + "'])";
        // Current GA code block support
      }
      else if (typeof ga != 'undefined')
      {
        this.gaMethod = "ga('send', 'pageview', '" + this.gaPageviewFormat + "')";
      }
      else
      {
        this.displayError();
      }
      // Track as events?
    }
    else
    {
      // Legacy GA code block support
      if (typeof _gaq != 'undefined')
      {
        this.gaMethod = "_gaq.push(['_trackEvent', '" + this.gaEventCategory + "', ':event', ':title', ':createdAt']);";
        // Current GA code block support
      }
      else if (typeof ga != 'undefined')
      {
        this.gaMethod = "ga('send', 'event', '" + this.gaEventCategory + "', ':event', ':title', ':createdAt');";
      }
      else if (this.gtm)
      {
        this.gaMethod = "window.dataLayer.push({ 'event': 'OoyalaVideoEvent', 'category': '" + this.gaEventCategory + "', 'action': ':event', 'label': ':title', 'createdAt': ':createdAt'});";
      }
      else
      {
        this.displayError();
      }
    }
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method GAAnalyticsPlugin#init
   */
  this.init = function()
  {
    var missedEvents;
    if (_framework && _.isFunction(_framework.getRecordedEvents))
    {
      missedEvents = _framework.getRecordedEvents();
      _.each(missedEvents, _.bind(function(recordedEvent)
      {
        this.processEvent(recordedEvent.eventName, recordedEvent.params);
      }, this));
    }
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method GAAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function(metadata)
  {
    this.log("GA: PluginID \'" + id + "\' received this metadata:", metadata);
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method GAAnalyticsPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function(eventName, params)
  {

    switch (eventName)
    {
      case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
        this.onPlayerCreated();
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        this.onPositionChanged(params);
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        this.onContentReady(params);
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_METADATA_UPDATED:
        this.onStreamMetadataUpdated(params);
        break;
      case OO.Analytics.EVENTS.VIDEO_PLAYING:
        this.onPlay();
        break;
      case OO.Analytics.EVENTS.PLAYBACK_COMPLETED:
        this.onEnd();
        break;
      case OO.Analytics.EVENTS.AD_BREAK_STARTED:
        this.onWillPlayAds();
        break;
      case OO.Analytics.EVENTS.AD_BREAK_ENDED:
        this.onAdsPlayed();
        break;
      case OO.Analytics.EVENTS.VIDEO_PAUSE_REQUESTED:
        this.onPaused();
        break;

      default:
        break;
    }

  };

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method GAAnalyticsPlugin#destroy
   */
  this.destroy = function()
  {
    _framework = null;
  };

  /**
   * onPlayerCreated event is triggered after player creation.
   * @public
   * @method GAAnalyticsPlugin#onPlayerCreated
   */
  this.onPlayerCreated = function()
  {
    this.log('onPlayerCreated');
    this.importUserSettings();
    this.initGA();
  };

  /**
   * onWillPlayAds event is triggered when the player stops the main content to start playing linear ads.
   * @public
   * @method GAAnalyticsPlugin#onWillPlayAds
   */
  this.onWillPlayAds = function()
  {
    this.currentPlaybackType = 'ad';

    this.reportToGA('adPlaybackStarted');
    this.log("onWillPlayAds");
  };

  /**
   * onAdsPlayed event is triggered when the player has finished playing ads and is ready to playback the main video.
   * @public
   * @method GAAnalyticsPlugin#onAdsPlayed
   */
  this.onAdsPlayed = function()
  {
    this.currentPlaybackType = 'content';

    this.reportToGA('adPlaybackFinished');
    this.reportToGA('playbackStarted');
    this.log("onAdsPlayed");
  };

  /**
   * onStreamMetadataUpdated event is triggered when the stream metadata has been updated.
   * This will contain custom metadata
   * @public
   * @method GAAnalyticsPlugin#onStreamMetadataUpdated
   */
  this.onStreamMetadataUpdated = function(metadata)
  {
    if (metadata.length) metadata = metadata[0];
    this.log("onStreamMetadataUpdated");

    if (!!metadata)
    {
      _cacheEvents = false;
      if (!!metadata.base)
      {
        var data = metadata.base;
        this.createdAt = data.created_at || data.CreationDate;
        if (!!this.createdAt && !!ga && !!ooyalaGaTrackSettings.customDimension)
        {
          ga('set', ooyalaGaTrackSettings.customDimension, this.createdAt);
        }
      }
    }

    while (_cachedEvents.length > 0)
    {
      this.sendToGA(_cachedEvents.shift());
    }
  };

  /**
   * onContentReady event is triggered when the video content data has been downloaded.
   * This will contain information about the video content. For example, title and description.
   * @public
   * @method GAAnalyticsPlugin#onContentReady
   */
  this.onContentReady = function(content)
  {
    this.content = content;
    if (content.length) this.content = content[0];
    this.reportToGA('contentReady');
    this.log("onContentReady");
  };

  /**
   * onPositionChanged event is triggered, periodically, when the video stream position changes.
   * @public
   * @method GAAnalyticsPlugin#onPositionChanged
   * @param  {object} data The stream duration and current stream position
   */
  this.onPositionChanged = function(params)
  {
    if (this.currentPlaybackType != 'content' || !params || !params.length)
    {
      return false;
    }

    params = params[0];

    if (params.totalStreamDuration > 0)
    {
      this.duration = params.totalStreamDuration;
    }

    this.currentPlayheadPosition = params.streamPosition;

    _.each(this.playbackMilestones, function(milestone)
    {
      if ((this.currentPlayheadPosition / this.duration) > milestone[0] && this.lastReportedPlaybackMilestone != milestone[0] && milestone[0] > this.lastReportedPlaybackMilestone)
      {
        this.reportToGA(milestone[1]);
        this.lastReportedPlaybackMilestone = milestone[0];
        this.log("onPositionChanged (" + time + ", " + milestone[1] + ")");
      }
    }, this);
  };

  /**
   * onPlay event is sent when video playback has started or resumed.
   * @public
   * @method GAAnalyticsPlugin#onPlay
   */
  this.onPlay = function()
  {
    this.playing = true;

    if (this.currentPlaybackType == 'content')
    {
      this.reportToGA('playbackStarted');
    }
    else
    {
      this.reportToGA('adPlaybackStarted');
    }
    this.log("onPlay");
  };

  /**
   * onEnd event is sent when video and ad playback has completed.
   * @public
   * @method GAAnalyticsPlugin#onEnd
   */
  this.onEnd = function()
  {
    this.reportToGA('playbackFinished');
    this.log("onEnd");
  };

  /**
   * onPaused event is sent when video playback has paused.
   * @public
   * @method GAAnalyticsPlugin#onPaused
   */
  this.onPaused = function()
  {
    if (this.currentPlaybackType != 'content')
    {
      return false;
    }

    this.playing = false;

    // The Ooyala event subscription triggers an "onpause" on playback; we'll filter it here
    // It also triggers an "onpause" when playback finishes; we'll filter that, too
    if (typeof this.currentPlayheadPosition == 'undefined' || this.currentPlayheadPosition > (this.duration - 2))
    {
      return false;
    }

    this.reportToGA('playbackPaused');
    this.log("onPaused");
  };

  /**
   * Send event to Google Analytics
   * @public
   * @method GAAnalyticsPlugin#sendToGA
   */
  this.sendToGA = function(event)
  {
    var method = this.gaMethod.replace(/:hostname/g, document.location.host).replace(/:event/g, event).replace(/:title/g, this.content.title).replace(/:createdAt/g, this.createdAt);
    eval(method);
    this.log('REPORTED TO GA:' + method);
  };

  /**
   * Report event to Google Analytics
   * @public
   * @method GAAnalyticsPlugin#reportToGA
   */
  this.reportToGA = function(event)
  {
    if (this.gaMethod && this.lastEventReported != event)
    {
      // Ooyala event subscriptions result in duplicate triggers; we'll filter them out here
      this.lastEventReported = event;

      if (_cacheEvents)
      {
        _cachedEvents.push(event);
      }
      else
      {
        this.sendToGA(event);
      }
    }
  }
};

//Add the template to the global list of factories for all new instances of the framework
//and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(GAAnalyticsPlugin);

module.exports = GAAnalyticsPlugin;
