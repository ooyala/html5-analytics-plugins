require('../framework/InitAnalyticsNamespace.js');

/**
 * @class GAAnalyticsPlugin
 * @classdesc This is an example class of a plugin that works with the Ooyala Analytics Framework.
 * @param {object} framework The Analytics Framework instance
 */
const GAAnalyticsPlugin = function (framework) {
  let _framework = framework;
  const name = 'googleAnalytics';
  const version = 'v1';
  let id;
  const _active = true;
  const _cachedEvents = [];
  let _cacheEvents = true;

  const gaFunction = window.GoogleAnalyticsObject || 'ga';

  let trackerName = null;

  this.gtm = false;
  this.gaPageviewFormat = 'ooyala-event/:event/:title';
  this.gaEventCategory = 'Ooyala';
  this.verboseLogging = false;
  this.playbackMilestones = [
    [0, 'playProgressStarted'],
    [0.25, 'playProgressQuarter'],
    [0.5, 'playProgressHalf'],
    [0.75, 'playProgressThreeQuarters'],
    [1.00, 'playProgressEnd'],
  ];

  this.playing = false;
  this.duration = null;
  this.gaTrackingEnabled = false;
  this.content = null;
  this.currentPlaybackType = 'content';
  this.lastEventReported = null;
  this.lastReportedPlaybackMilestone = -1;

  /**
   * Log plugin events if verboseLogging is set to 'true'.
   * @public
   * @method GAAnalyticsPlugin#log
   */
  this.log = function (what) {
    if (!this.verboseLogging || typeof console === 'undefined') return;
    console.log(what);
  };

  /**
   * [Required Function] Return the name of the plugin.
   * @public
   * @method GAAnalyticsPlugin#getName
   * @returns {string} The name of the plugin.
   */
  this.getName = function () {
    return name;
  };

  /**
   * [Required Function] Return the version string of the plugin.
   * @public
   * @method GAAnalyticsPlugin#getVersion
   * @returns {string} The version of the plugin.
   */
  this.getVersion = function () {
    return version;
  };

  /**
   * [Required Function] Set the plugin id given by the Analytics Framework when
   * this plugin is registered.
   * @public
   * @method GAAnalyticsPlugin#setPluginID
   * @param  {string} newID The plugin id
   */
  this.setPluginID = function (newID) {
    id = newID;
  };

  /**
   * [Required Function] Returns the stored plugin id, given by the Analytics Framework.
   * @public
   * @method GAAnalyticsPlugin#setPluginID
   * @returns  {string} The pluginID assigned to this instance from the Analytics Framework.
   */
  this.getPluginID = function () {
    return id;
  };

  /**
   * Output error message to console if there's no Google Analytics Tracking module installed.
   * @private
   * @method GAAnalyticsPlugin#displayError
   */
  this.displayError = function () {
    this.gaTrackingEnabled = false;
    console.error(`The Ooyala Google Analytics Tracking module is installed,
     but no valid Google Analytics code block is detected.`);
  };

  /**
   * Import user settings if available.
   * @private
   * @method GAAnalyticsPlugin#importUserSettings
   */
  this.importUserSettings = function () {
    // TODO: What does this do?
    // if (typeof window.ooyalaGASettings != 'undefined')
    // {
    //   var GA = this;
    //   _.each(window.ooyalaGASettings, function(value, index)
    //   {
    //     eval('GA.' + index + '=window.ooyalaGaSettings["' + index + '"]');
    //   });
    // }
  };

  /**
   * Init Google Analytics module.
   * @private
   * @method GAAnalyticsPlugin#initGA
   */
  this.initGA = function () {
    // If dataLayer is present, GTM is being used; force events
    if (typeof window.dataLayer !== 'undefined') {
      this.gtm = true;
    }

    // Check if any of the Google Analytics SDKs are loaded
    if (typeof _gaq !== 'undefined' || typeof window[gaFunction] !== 'undefined' || this.gtm) {
      this.gaTrackingEnabled = true;
    } else {
      this.displayError();
    }
  };

  /**
   * [Required Function] Initialize the plugin with the given metadata.
   * @public
   * @method GAAnalyticsPlugin#init
   */
  this.init = function () {
    let missedEvents;
    if (_framework && _.isFunction(_framework.getRecordedEvents)) {
      missedEvents = _framework.getRecordedEvents();
      _.each(missedEvents, _.bind(function (recordedEvent) {
        this.processEvent(recordedEvent.eventName, recordedEvent.params);
      }, this));
    }
  };

  /**
   * Resets any properties and variables associated with the playback state.
   * @private
   * @method GAAnalyticsPlugin#resetPlaybackState
   */
  const resetPlaybackState = _.bind(function () {
    this.playing = false;
    this.lastEventReported = null;
    this.lastReportedPlaybackMilestone = -1;
    this.currentPlaybackType = 'content';
  }, this);

  /**
   * Resets any properties and variables associated with the content.
   * @private
   * @method GAAnalyticsPlugin#resetContent
   */
  const resetContent = _.bind(function () {
    this.duration = null;
    this.content = null;
  }, this);

  /**
   * [Required Function] Clean up this plugin so the garbage collector can clear it out.
   * @public
   * @method GAAnalyticsPlugin#destroy
   */
  this.destroy = function () {
    _framework = null;
  };

  /**
   * onPlayerCreated event is triggered after player creation.
   * @public
   * @method GAAnalyticsPlugin#onPlayerCreated
   */
  this.onPlayerCreated = function () {
    this.log('onPlayerCreated');
    this.importUserSettings();
    this.initGA();
  };

  /**
   * onWillPlayAds event is triggered when the player stops the main content to start playing linear ads.
   * @public
   * @method GAAnalyticsPlugin#onWillPlayAds
   */
  this.onWillPlayAds = function () {
    this.currentPlaybackType = 'ad';

    this.reportToGA('adPlaybackStarted');
    this.log('onWillPlayAds');
  };

  /**
   * onAdsPlayed event is triggered when the player has finished playing ads and is ready to playback the main video.
   * @public
   * @method GAAnalyticsPlugin#onAdsPlayed
   */
  this.onAdsPlayed = function () {
    this.currentPlaybackType = 'content';

    this.reportToGA('adPlaybackFinished');
    this.log('onAdsPlayed');
  };

  /**
   * onContentReady event is triggered when the video content data has been downloaded.
   * This will contain information about the video content. For example, title and description.
   * @public
   * @method GAAnalyticsPlugin#onContentReady
   */
  this.onContentReady = function (content) {
    this.content = content;
    if (content.length) [this.content] = content;
    this.reportToGA('contentReady');
    this.log('onContentReady');
  };

  /**
   * onPositionChanged event is triggered, periodically, when the video stream position changes.
   * @public
   * @method GAAnalyticsPlugin#onPositionChanged
   * @param {object} data The stream duration and current stream position
   */
  this.onPositionChanged = function (params) {
    if (this.currentPlaybackType !== 'content' || !params || !params.length) {
      return false;
    }

    [params] = params;

    if (params.totalStreamDuration > 0) {
      this.duration = params.totalStreamDuration;
    }

    this.currentPlayheadPosition = params.streamPosition;

    _.each(this.playbackMilestones, function (milestone) {
      if ((this.currentPlayheadPosition / this.duration) >= milestone[0]
        && this.lastReportedPlaybackMilestone !== milestone[0] && milestone[0]
        > this.lastReportedPlaybackMilestone) {
        this.reportToGA(milestone[1]);
        [this.lastReportedPlaybackMilestone] = milestone;
        this.log(`onPositionChanged (${this.currentPlayheadPosition}, ${milestone[1]})`);
      }
    }, this);

    return undefined;
  };

  /**
   * onPlay event is sent when video playback has started or resumed.
   * @public
   * @method GAAnalyticsPlugin#onPlay
   */
  this.onPlay = function () {
    this.playing = true;

    if (this.currentPlaybackType === 'content') {
      this.reportToGA('playbackStarted');
    } else {
      this.reportToGA('adPlaybackStarted');
    }
    this.log('onPlay');
  };

  /**
   * onEnd event is sent when video and ad playback has completed.
   * @public
   * @method GAAnalyticsPlugin#onEnd
   */
  this.onEnd = function () {
    this.reportToGA('playbackFinished');
    this.log('onEnd');
  };

  /**
   * onPaused event is sent when video playback has paused.
   * @public
   * @method GAAnalyticsPlugin#onPaused
   */
  this.onPaused = function () {
    if (this.currentPlaybackType !== 'content') {
      return false;
    }

    this.playing = false;

    // The Ooyala event subscription triggers an "onpause" on playback; we'll filter it here
    // It also triggers an "onpause" when playback finishes; we'll filter that, too
    if (typeof this.currentPlayheadPosition === 'undefined'
      || this.currentPlayheadPosition > (this.duration - 2)) {
      return false;
    }

    this.reportToGA('playbackPaused');
    this.log('onPaused');

    return undefined;
  };

  /**
   * Report event to Google Analytics
   * @public
   * @method GAAnalyticsPlugin#reportToGA
   */
  this.reportToGA = function (event) {
    if (this.lastEventReported !== event) {
      // Ooyala event subscriptions result in duplicate triggers; we'll filter them out here
      this.lastEventReported = event;

      if (_cacheEvents) {
        _cachedEvents.push(event);
      } else {
        this.sendToGA(event);
      }
    }
  };

  /**
   * Generates the command string to use with the ga() method. If a tracker name
   * was provided in the metadata, we will prepend the tracker name to the command
   * per GA docs at:
   * https://developers.google.com/analytics/devguides/collection/analyticsjs/creating-trackers
   * @private
   * @method GAAnalyticsPlugin#getGACommand
   * @param {string} commandName the name of the ga() command
   * @returns {string} the final command to provide to the ga() method
   */
  const getGACommand = function (commandName) {
    if (commandName) {
      return trackerName ? `${trackerName}.${commandName}` : commandName;
    }

    return null;
  };

  /**
   * Checks to see if the tracker name is valid. The tracker name is expected to be
   * a non-empty string.
   * @private
   * @method GAAnalyticsPlugin#validateTrackerName
   * @param {string} name the tracker name to validate
   * @returns {boolean} true if the tracker name is valid, false otherwise
   */
  const validateTrackerName = function (name) {
    return _.isString(name) && !_.isEmpty(name);
  };

  /**
   * [Required Function] Process an event from the Analytics Framework, with the given parameters.
   * @public
   * @method GAAnalyticsPlugin#processEvent
   * @param  {string} eventName Name of the event
   * @param  {Array} params     Array of parameters sent with the event
   */
  this.processEvent = function (eventName, params) {
    switch (eventName) {
      case OO.Analytics.EVENTS.VIDEO_PLAYER_CREATED:
        this.onPlayerCreated();
        break;
      case OO.Analytics.EVENTS.VIDEO_REPLAY_REQUESTED:
        resetPlaybackState();
        break;
      case OO.Analytics.EVENTS.VIDEO_STREAM_POSITION_CHANGED:
        this.onPositionChanged(params);
        break;
      case OO.Analytics.EVENTS.VIDEO_CONTENT_METADATA_UPDATED:
        resetPlaybackState();
        resetContent();
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
      case OO.Analytics.EVENTS.VIDEO_PAUSED:
        this.onPaused();
        break;

      default:
        break;
    }
  };

  /**
   * onStreamMetadataUpdated event is triggered when the stream metadata has been updated.
   * This will contain custom metadata
   * @public
   * @method GAAnalyticsPlugin#onStreamMetadataUpdated
   */
  this.onStreamMetadataUpdated = function (metadata) {
    if (metadata.length) [metadata] = metadata;
    this.log('onStreamMetadataUpdated');

    if (metadata) {
      _cacheEvents = false;
      if (metadata.base) {
        const data = metadata.base;
        this.createdAt = data.created_at || data.CreationDate;
        // TODO: How do we test createAd and customDimension?
        if (!!this.createdAt && !!ga && !!ooyalaGaTrackSettings.customDimension) {
          const command = getGACommand('set');
          ga(command, ooyalaGaTrackSettings.customDimension, this.createdAt);
        }
      }
    }

    while (_cachedEvents.length > 0) {
      this.sendToGA(_cachedEvents.shift());
    }
  };

  /**
   * Send event to Google Analytics
   * @public
   * @method GAAnalyticsPlugin#sendToGA
   */
  this.sendToGA = function (event) {
    if (this.gaTrackingEnabled) {
      const title = this.content ? this.content.title : '';
      let param = null;

      // Google Tag Manager support
      if (this.gtm) {
        param = {
          event: 'OoyalaVideoEvent',
          category: this.gaEventCategory,
          action: event,
          label: title,
        };
        if (this.createdAt) {
          param.value = this.createdAt;
        }
        window.dataLayer.push(param);
      } else if (typeof _gaq !== 'undefined') {
        // Legacy GA code block support
        param = ['_trackEvent', this.gaEventCategory, event, title];
        if (this.createdAt) {
          param.push(this.createdAt);
        }
        _gaq.push(param);
      } else if (typeof window[gaFunction] !== 'undefined') {
        // Current GA code block support
        param = {
          eventCategory: this.gaEventCategory,
          eventAction: event,
          eventLabel: title,
        };
        if (this.createdAt) {
          param.eventValue = this.createdAt;
        }
        const command = getGACommand('send');
        window[gaFunction](command, 'event', param);
      }
    }
  };

  /**
   * [Required Function] Set the metadata for this plugin.
   * @public
   * @method GAAnalyticsPlugin#setMetadata
   * @param  {object} metadata The metadata for this plugin
   */
  this.setMetadata = function (metadata) {
    if (metadata) {
      this.log(`GA: PluginID '${id}' received this metadata:`, metadata);
      // Grab the tracker name if available and valid
      if (validateTrackerName(metadata.trackerName)) {
        // eslint-disable-next-line prefer-destructuring
        trackerName = metadata.trackerName;
        this.log('GA: Using tracker name:', trackerName);
      } else {
        trackerName = null;
      }
    }
  };
};

// Add the template to the global list of factories for all new instances of the framework
// and register the template with all current instance of the framework.
OO.Analytics.RegisterPluginFactory(GAAnalyticsPlugin);

module.exports = GAAnalyticsPlugin;
