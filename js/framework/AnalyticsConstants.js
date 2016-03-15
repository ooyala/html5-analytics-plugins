require("./InitAnalyticsNamespace.js");

/**
 * If Analytics.EVENTS or Analytics.REQUIRED_PLUGIN_FUNCTIONS do not already
 * exist, create them.
 */

if (!OO.Analytics.EVENTS)
{
  const EVENTS =
  {
    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_PLAYER_CREATED
     * @description This message is sent when the player is first created.
     * @param {Array} paramArray Array of length 1, containing the original parameters
     * passed into the player.
     */
    VIDEO_PLAYER_CREATED:           'video_player_created',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_FIRST_PLAY_REQUESTED
     * @description This message is sent the first time the user tries to play the video.
     * In the case of autoplay, it will be sent immediately after the player is ready to play.
     */
    VIDEO_FIRST_PLAY_REQUESTED:     'video_first_play_requested',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_PLAY_REQUESTED
     * @description This message is sent every time there is a request to try and
     * initiate video playback (except the first time. See VIDEO_FIRST_PLAY_REQUESTED).
     * This only the request, not when video playback has actually started.
     */
    VIDEO_PLAY_REQUESTED:           'video_play_requested',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_PAUSE_REQUESTED
     * @description This message is sent every time there is a request to try and
     * pause the video. This only the request, not when video playback has actually
     * paused.
     */
    VIDEO_PAUSE_REQUESTED:          'video_pause_requested',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_PLAYING
     * @description This message is sent when video playback has started or resumed.
     */
    VIDEO_PLAYING:                  'video_playing',

    /**
     * @event Analytics.EVENTS#VIDEO_PAUSED
     * @description This message is sent when video playback has paused.
     */
    VIDEO_PAUSED:                   'video_paused',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_ENDED
     * @description This message is sent when video playback has completed. This
     * includes finishing playback of all ads.
     */
    VIDEO_ENDED:                    'video_ended',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_REPLAY_REQUESTED
     * @description This message is sent after VIDEO_ENDED, when the player is
     * requested to start video playback from the beginning of the video. This
     * is only the request, not when the video actually start playing again.
     */
    VIDEO_REPLAY_REQUESTED:         'video_replay_requested',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_SOURCE_CHANGED
     * @description This message when the player has received a new video source
     * to load.  This will happen when the first video initially starts to load,
     * when switching video sources during playback and also when switching to a
     * new video after VIDEO_ENDED.  This will not be received on VIDEO_REPLAY_REQUESTED.
     * @param {Array} paramArray Array of length 1, containing an instance of
     * OO.Analytics.EVENT_DATA.VideoSourceData
     */
    VIDEO_SOURCE_CHANGED:           'video_source_changed',

    /**
     * @event Analytics.EVENTS#VIDEO_STREAM_METADATA_UPDATED
     * @description This message is sent when video stream metadata has been
     * downloaded.  In contains information about the stream and metadata
     * for any plugins that should be loaded.
     * @param {Array} paramArray Array of length 1, contains an object holding all
     * the metadata for each plugin that should be loaded.
     */
    VIDEO_STREAM_METADATA_UPDATED:  'video_stream_metadata_updated',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_CONTENT_METADATA_UPDATED
     * @description This message is sent when the video content data has been
     * downloaded. This will contain information about the video content. For
     * example, title and description.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoContentMetadata.
     */
    VIDEO_CONTENT_METADATA_UPDATED: 'video_content_metadata_updated',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_SEEK_REQUESTED
     * @description This message is sent when a video seek is requested.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoSeekRequestedData.
     */
    VIDEO_SEEK_REQUESTED:             'video_seek_requested',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_SEEK_COMPLETED
     * @description This message is sent when a video seek has completed.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoSeekCompletedData.
     */
    VIDEO_SEEK_COMPLETED:               'video_seek_completed',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_STREAM_DOWNLOADING
     * @description This message is sent when a video stream is downloading data.
     * If the stream has to stop because of a buffer underrun, that is considered
     * a buffering event.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoDownloadingMetadata.
     */
    VIDEO_STREAM_DOWNLOADING:       'video_stream_downloading',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_BUFFERING_STARTED
     * @description This message is sent when a video stream has to pause playback
     * to load more data. It is also send when the stream is buffering before
     * initial playback is started.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoBufferingStartedData.
     */
    VIDEO_BUFFERING_STARTED:        'video_buffering_started',

    /**
     * @public
     * @event Analytics.EVENTS#VIDEO_BUFFERING_ENDED
     * @description This message is sent when a video stream has buffered and
     * is ready to resume playback.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoBufferingEndedData.
     */
    VIDEO_BUFFERING_ENDED:          'video_buffering_ended',

    /**
     * @public
     * @event Analytics.EVENTS#AD_BREAK_STARTED
     * @description This message is sent when the player stops the main content
     * to start playing linear ads.
     */
    AD_BREAK_STARTED:               'ad_break_started',

    /**
     * @public
     * @event Analytics.EVENTS#AD_BREAK_ENDED
     * @description This message is sent when the player has finished playing ads
     * and is ready to playback the main video.
     */
    AD_BREAK_ENDED:                 'ad_break_ended',

    /**
     * @public
     * @event Analytics.EVENTS#DESTROY
     * @description This message is sent when the player and its plugins are destroying.
     */
    DESTROY:                        'destroy'
  };
  OO.Analytics.EVENTS = EVENTS;
}

if (!OO.Analytics.EVENT_DATA)
{
  const EVENT_DATA = {};

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoSourceData
   * @classdesc Contains the data passed along with VIDEO_SOURCE_CHANGED. This
   * includes the embed code (video id) and any metadata this video stream needs
   * pass along to other plugins (Ex. It could contain ad tag data or analytics
   * account information).
   * @property  {string} embedCode This is the video stream's unique id
   * @property  {object} metadata   An object containing metadata about the video stream and player id to be used.
   */
  EVENT_DATA.VideoSourceData = function(embedCode, metadata)
  {
    var checkSourceData = OO._.bind(checkDataType, this, "VideoSourceData");
    this.embedCode = checkSourceData(embedCode, "embedCode", "string");
    this.metadata  = checkSourceData(metadata, "metadata", "object");
  }

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoContentMetadata
   * @classdesc Contains information about the content of the video stream,
   * such as title and description.
   * @property  {string} title Title of the video
   * @property  {string} description Video description
   * @property  {number} duration Duration of the video in milliseconds
   * @property  {object} closedCaptions Object containing information about the closed captions available
   * @property  {string} contentType A string indicating the type of content in the stream. (ex. "video")
   * @property  {string} hostedAtURL The url the video is being hosted from
   */
  EVENT_DATA.VideoContentMetadata = function(title, description, duration, closedCaptions, contentType, hostedAtURL)
  {
    var checkContentData = OO._.bind(checkDataType, this, "VideoContentMetadata");
    this.title          = checkContentData(title, "title", "string");
    this.description    = checkContentData(description, "description", "string");
    this.duration       = checkContentData(duration, "duration", "number");
    this.closedCaptions = checkContentData(closedCaptions, "closedCaptions", "object");
    this.contentType    = checkContentData(contentType, "contentType", "string");
    this.hostedAtURL    = checkContentData(hostedAtURL, "hostedAtURL", "string")
  }

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoDownloadingMetadata
   * @classdesc Contains information about the stream that is being downloaded.
   * @property {number} currentTime The current time of the player
   * @property {number} totalStreamDuration The duration of the video stream
   * @property {number} streamBufferedUntilTime The stream is buffered until this timestamp.
   * @property {number} seekableRangeStart The earliest time the user can seek to.
   * @property {number} seekableRangeEnd The latest time the user can seek to.
   */
  EVENT_DATA.VideoDownloadingMetadata = function(currentTime, totalStreamDuration, streamBufferedUntilTime, seekableRangeStart, seekableRangeEnd)
  {
    var checkDownloadData = OO._.bind(checkDataType, this, "VideoDownloadingMetadata");
    this.currentTime             = checkDownloadData(currentTime, "currentTime", "number");
    this.totalStreamDuration     = checkDownloadData(totalStreamDuration, "totalStreamDuration", "number");
    this.streamBufferedUntilTime = checkDownloadData(streamBufferedUntilTime, "streamBufferedUntilTime", "number");
    this.seekableRangeStart      = checkDownloadData(seekableRangeStart, "seekableRangeStart", "number");
    this.seekableRangeEnd        = checkDownloadData(seekableRangeEnd, "seekableRangeEnd", "number");
  }

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoBufferingStartedData
   * @classdesc Contains information about the stream that has started buffering.
   * @property {string} streamUrl The url of the stream that is buffering.
   */
  EVENT_DATA.VideoBufferingStartedData = function(streamUrl)
  {
    var checkBufferingStartedData = OO._.bind(checkDataType, this, "VideoBufferingStartedData");
    this.streamUrl = checkBufferingStartedData(streamUrl, "streamUrl", "string");
  }

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoBufferingEndedData
   * @classdesc Contains information about the stream that finished buffering.
   * @property {string} streamUrl The url of the stream that finished buffering
   */
  EVENT_DATA.VideoBufferingEndedData = function(streamUrl)
  {
    var checkBufferingEndedData = OO._.bind(checkDataType, this, "VideoBufferingEndedData");
    this.streamUrl = checkBufferingEndedData(streamUrl, "streamUrl", "string");
  }

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoSeekRequestedData
   * @classdesc Contains information about seeking to a particular time in the stream.
   * @property {number} seekingToTime The time requested to be seeked to
   */
  EVENT_DATA.VideoSeekRequestedData = function(seekingToTime)
  {
    var checkSeekStartedData = OO._.bind(checkDataType, this, "VideoSeekRequestedData");
    this.seekingToTime = checkSeekStartedData(seekingToTime, "seekingToTime", "number");
  }

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoSeekCompletedData
   * @classdesc Contains information about the result of seeking to a particular
   * time in the stream.
   * @property {number} timeSeekedTo The time that was actually seeked to
   */
  EVENT_DATA.VideoSeekCompletedData = function(timeSeekedTo)
  {
    var checkSeekEndedData = OO._.bind(checkDataType, this, "VideoSeekCompletedData");
    this.timeSeekedTo = checkSeekEndedData(timeSeekedTo, "timeSeekedTo", "number");
  }

  var checkDataType = function(className, data, varName, expectedType)
  {
    var error = false;
    var toRet = data;
    switch(expectedType)
    {
      case "string":
        if (!toRet ||!OO._.isString(toRet))
        {
            error = true;
        }
        break;
      case "object":
        if (!toRet || !OO._.isObject(toRet))
        {
            error = true;
        }
      break;
      case "number":
        // in the case number comes in as a string, try parsing it.
        if (!OO._.isNumber(toRet))
        {
          toRet = parseFloat(toRet);
          if (isNaN(toRet))
          {
            error = true;
          }
        }
      break;
    }

    if (error)
    {
      OO.log("ERROR Analytics.EVENT_DATA." + className + " being created with invalid " + varName + ". Should be type \'" + expectedType + "\' but was \'" + typeof(data) + "\'.");
      return undefined;
    }

    return toRet;
  }

  OO.Analytics.EVENT_DATA = EVENT_DATA;
}


if (!OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS)
{
  /**
   * @public
   * @constant OO#Analytics#REQUIRED_PLUGIN_FUNCTIONS
   * @type string[]
   * @description This is a list of the required function name for a plugin to
   * be considered valid by the Analytics Framework.
   * <ul>
   *    <li>getName() - returns a non empty string containing the name of the plugin</li>
   *    <li>getVersion() - returns a non empty string contain the version of the plugin</li>
   *    <li>setPluginID(id) - a function for setting the plugin id on an instance of the plugin</li>
   *    <li>getPluginID() - returns the plugin id assigned by setPluginID()</li>
   *    <li>init() - a function for initializing the plugin</li>
   *    <li>setMetadata(metadata) - a function for passing metadata specific to this plugin.</li>
   *    <li>destroy() - destructor function for cleanup</li>
   *    <li>processEvent(eventName, paramArray) - a function to receive events that are publish through the framework.</li>
   * </ul>
   */
  const REQUIRED_PLUGIN_FUNCTIONS =
  [
    "getName",
    "getVersion",
    "setPluginID",
    "getPluginID",
    "init",
    "setMetadata",
    "destroy",
    "processEvent"
  ];
  OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS = REQUIRED_PLUGIN_FUNCTIONS;
}
