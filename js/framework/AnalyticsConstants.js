require("./InitAnalyticsNamespace.js");

/**
 * If Analytics.EVENTS or Analytics.REQUIRED_PLUGIN_FUNCTIONS do not already
 * exist, create them.
 */

/**
 * @public
 * @description These are the ad types Ooyala Player supports
 * @namespace OO.Analytics.AD_TYPE
 */
if (!OO.Analytics.AD_TYPE)
{
  var AD_TYPE =
  {
    LINEAR_OVERLAY: "linearOverlay",
    NONLINEAR_OVERLAY: "nonlinearOverlay",
    LINEAR_VIDEO: "linearVideo",
    COMPANION: "companion"
  };
  OO.Analytics.AD_TYPE = AD_TYPE;
}

/**
 * @public
 * @description These are the stream types Ooyala Player supports
 * @namespace OO.Analytics.STREAM_TYPE
 */
if (!OO.Analytics.STREAM_TYPE)
{
  var STREAM_TYPE =
  {
    VOD: "vod",
    LIVE_STREAM: "liveStream"
  };
  OO.Analytics.STREAM_TYPE = STREAM_TYPE;
}

/**
 * @public
 * @description [DEPRECATED]
 * These are the Ooyala Player error codes
 * @namespace OO.Analytics.ERROR_CODE
 */
if (!OO.Analytics.ERROR_CODE)
{
  var ERROR_CODE =
  {
    "100": "General Error"
  };
  OO.Analytics.ERROR_CODE = ERROR_CODE;
}

/**
 * @public
 * @description These are the events associated with the Analytics Framework.
 * @namespace OO.Analytics.EVENTS
 */
if (!OO.Analytics.EVENTS)
{
  var EVENTS =
  {
    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_PLAYER_CREATED
     * @description This message is sent when the player is first created.
     * @param {Array} paramArray Array of length 1, containing the original parameters
     * passed into the player
     */
    VIDEO_PLAYER_CREATED:           'video_player_created',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_ELEMENT_CREATED
     * @description This message is sent when the video element is first created.
     */
    VIDEO_ELEMENT_CREATED:           'video_element_created',

    /**
     * @public
     * @event OO.Analytics.EVENTS#INITIAL_PLAYBACK_REQUESTED
     * @description This message is sent the first time the user tries to play the video.
     * In the case of autoplay, it will be sent immediately after the player is ready to play.
     */
    INITIAL_PLAYBACK_REQUESTED:     'initial_playback_requested',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_CONTENT_COMPLETED
     * @description This message is sent when main content playback has completed.
     */
    VIDEO_CONTENT_COMPLETED:        'video_content_completed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#PLAYBACK_COMPLETED
     * @description This message is sent when video and ad playback has completed.
     */
    PLAYBACK_COMPLETED:             'playback_completed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_PLAY_REQUESTED
     * @description This message is sent every time there is a request to try and
     * initiate video playback (except the first time. See INITIAL_PLAYBACK_REQUESTED).
     * This is only the request, not when video playback has actually started.
     */
    VIDEO_PLAY_REQUESTED:           'video_play_requested',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_PAUSE_REQUESTED
     * @description This message is sent every time there is a request to try and
     * pause the video. This is only the request, not when video playback has actually
     * paused.
     */
    VIDEO_PAUSE_REQUESTED:          'video_pause_requested',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_PLAYING
     * @description This message is sent when video playback has started or resumed.
     */
    VIDEO_PLAYING:                  'video_playing',

    /**
     * @event OO.Analytics.EVENTS#VIDEO_PAUSED
     * @description This message is sent when video playback has paused.
     */
    VIDEO_PAUSED:                   'video_paused',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_REPLAY_REQUESTED
     * @description This message is sent after VIDEO_ENDED, when the player is
     * requested to start video playback from the beginning of the video. This
     * is only the request, not when the video actually start playing again.
     */
    VIDEO_REPLAY_REQUESTED:         'video_replay_requested',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_SOURCE_CHANGED
     * @description This message is sent when the player has received a new video source
     * to load.  This will happen when the first video initially starts to load,
     * when switching video sources during playback and also when switching to a
     * new video after VIDEO_ENDED.  This will not be received on VIDEO_REPLAY_REQUESTED.
     * @param {Array} paramArray Array of length 1, containing an instance of
     * OO.Analytics.EVENT_DATA.VideoSourceData
     */
    VIDEO_SOURCE_CHANGED:           'video_source_changed',

    /**
     * @event OO.Analytics.EVENTS#VIDEO_STREAM_METADATA_UPDATED
     * @description This message is sent when video stream metadata has been
     * downloaded.  In contains information about the stream and metadata
     * for any plugins that should be loaded.
     * @param {Array} paramArray Array of length 1, contains an object holding all
     * the metadata for each plugin that should be loaded
     */
    VIDEO_STREAM_METADATA_UPDATED:  'video_stream_metadata_updated',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_CONTENT_METADATA_UPDATED
     * @description This message is sent when the video content data has been
     * downloaded. This will contain information about the video content. For
     * example, title and description.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoContentMetadata
     */
    VIDEO_CONTENT_METADATA_UPDATED: 'video_content_metadata_updated',

    /**
     * @public
     * @event OO.Analytics.EVENTS#STREAM_TYPE_UPDATED
     * @description This message is sent when the content stream type has been
     * determined by the player.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.StreamTypeMetadata
     */
    STREAM_TYPE_UPDATED: 'stream_type_updated',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_SEEK_REQUESTED
     * @description This message is sent when a video seek is requested.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoSeekRequestedData
     */
    VIDEO_SEEK_REQUESTED:             'video_seek_requested',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_SEEK_COMPLETED
     * @description This message is sent when a video seek has completed.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoSeekCompletedData
     */
    VIDEO_SEEK_COMPLETED:               'video_seek_completed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_STREAM_DOWNLOADING
     * @description This message is sent when a video stream is downloading data.
     * If the stream has to stop because of a buffer underrun, that is considered
     * a buffering event.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoDownloadingMetadata
     */
    VIDEO_STREAM_DOWNLOADING:       'video_stream_downloading',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_BUFFERING_STARTED
     * @description This message is sent when a video stream has to pause playback
     * to load more data. It is also sent when the stream is buffering before
     * initial playback is started.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoBufferingStartedData
     */
    VIDEO_BUFFERING_STARTED:        'video_buffering_started',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_BUFFERING_ENDED
     * @description This message is sent when a video stream has buffered and
     * is ready to resume playback.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoBufferingEndedData
     */
    VIDEO_BUFFERING_ENDED:          'video_buffering_ended',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_STREAM_BITRATE_PROFILES
     * @description This message is sent when all of the possible bitrate profiles for a stream are available.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoBitrateProfileLookupData
     */
    VIDEO_STREAM_BITRATE_PROFILES: 'video_stream_bitrate_profiles',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_STREAM_TARGET_BITRATE_REQUESTED
     * @description Sent when the a specific bitrate profile is requested. Automatic
     * bitrate selection is "auto".
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoTargetBitrateData
     */
    VIDEO_STREAM_TARGET_BITRATE_REQUESTED: 'video_stream_target_bitrate_requested',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_STREAM_BITRATE_CHANGED
     * @description This message is sent when the video stream's bitrate changes.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoBitrateProfileData
     */
    VIDEO_STREAM_BITRATE_CHANGED: 'video_stream_bitrate_changed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_STREAM_POSITION_CHANGED
     * @description This message is sent, periodically, when the video stream position changes.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoStreamPositionChangedData
     */
    VIDEO_STREAM_POSITION_CHANGED:  'video_stream_position_changed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VIDEO_ERROR
     * @description [DEPRECATED]
     * (NOTE: replaced by OO.Analytics.EVENTS.ERROR#VIDEO_PLAYBACK)
     * This message is sent when a video error occurs.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VideoErrorData
     */
    VIDEO_ERROR:                    'video_error',

    /**
     * @public
     * @event OO.Analytics.EVENTS#WILL_PLAY_FROM_BEGINNING
     * @description This message is sent whenever player plays the video from the video start. 
     * Different from initial play as it can be a replay
     */
    WILL_PLAY_FROM_BEGINNING:         "willPlayFromBeginning", 

    /**
     * @public
     * @event OO.Analytics.EVENTS#INITIAL_PLAY_STARTING
     * @description This message is sent when the player has begun playback for the first time, first frame has been received.
     */
    INITIAL_PLAY_STARTING:                    'initialPlayStarting',

    /**
     * @public
     * @event OO.Analytics.EVENTS#PLAYBACK_READY
     * @description This message is sent when the player has indicated that it is in a playback-ready state.
     */
    PLAYBACK_READY:                    'playbackReady',

    /**
     * @public
     * @event OO.Analytics.EVENTS#API_ERROR
     * @description This message is sent if an api related error has occurred.
     */
    API_ERROR:                      'apiError',

    /**
     * @public
     * @event OO.Analytics.EVENTS#BITRATE_INITIAL
     * @description This message contains the bitrate used at the start of playback.
     */
    BITRATE_INITIAL:                      'bitrateInitial',

    /**
     * @public
     * @event OO.Analytics.EVENTS#BITRATE_FIVE_SEC
     * @description This message contains the bitrate used five seconds into playback.
     */
    BITRATE_FIVE_SEC:                      'bitrateFiveSec',

    /**
     * @public
     * @event OO.Analytics.EVENTS#BITRATE_STABLE
     * @description This message contains the bitrate used thirty seconds into playback.
     */
    BITRATE_STABLE:                      'bitrateStable',

    /**
     * @public
     * @event OO.Analytics.EVENTS#PLAYBACK_START_ERROR
     * @description This message is sent when a playback error has occurred before the video start.
     */
    PLAYBACK_START_ERROR:                      'playbackStartError',

    /**
     * @public
     * @event OO.Analytics.EVENTS#PLAYBACK_MIDSTREAM_ERROR
     * @description This message is sent when a playback error has occurred midstream.
     */
    PLAYBACK_MIDSTREAM_ERROR:                      'playbackMidstreamError',

    /**
     * @public
     * @event OO.Analytics.EVENTS#PLUGIN_LOADED
     * @description This message is sent when a plugin is loaded in core.
     */
    PLUGIN_LOADED:                      'pluginLoaded',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VC_PLUGIN_ERROR
     * @description This message is sent when the video plugin has reported an error message.
     */
    VC_PLUGIN_ERROR:                      'videoPluginError',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_SDK_LOADED
     * @description This message is sent when ad sdk has loaded successfully.
     */
    AD_SDK_LOADED:               'adSdkLoaded',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_SDK_LOAD_FAILURE
     * @description This message is sent when ad sdk has failed to load.
     */
    AD_SDK_LOAD_FAILURE:               'adSdkLoadFailed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_REQUEST
     * @description This message is sent when an ad request is sent to the ad sdk.
     */
    AD_REQUEST:               'adRequest',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_REQUEST_SUCCESS
     * @description This event is sent when an ad request successfully returns an ad or playlist of ads.
     */
    AD_REQUEST_SUCCESS:               'adRequestSuccess',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_REQUEST_ERROR
     * @description This event is sent when an ad request fails due to an error.
     */
    AD_REQUEST_ERROR:               'adRequestError',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_REQUEST_EMPTY
     * @description This event is sent when an ad request returns but contains no ads.
     */
    AD_REQUEST_EMPTY:               'adRequestEmpty',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_PLAYBACK_ERROR
     * @description This event is sent when an ad playback fails due to an error.
     */
    AD_PLAYBACK_ERROR:               'adPlaybackError',


    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_SDK_IMPRESSION
     * @description This message is sent when an impression is recorded 
     * by the ad plugin SDK.
     */
    AD_SDK_IMPRESSION:                  'adSdkImpression',


    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_BREAK_STARTED
     * @description This message is sent when the player stops the main content
     * to start playing linear ads.
     */
    AD_BREAK_STARTED:               'ad_break_started',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_BREAK_ENDED
     * @description This message is sent when the player has finished playing ads
     * and is ready to playback the main video.
     */
    AD_BREAK_ENDED:                 'ad_break_ended',

    /**
     * @event OO.Analytics.EVENTS#AD_POD_STARTED
     * @description This message is sent when an ad pod starts.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.AdPodStartedData
     */
    AD_POD_STARTED:                 'ad_pod_started',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_POD_ENDED
     * @description This message is sent when an ad pod ends.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.AdPodEndedData
     */
    AD_POD_ENDED:                   'ad_pod_ended',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_STARTED
     * @description This message is sent when the player starts an ad playback.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.AdStartedData
     */
    AD_STARTED:                     'ad_started',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_ENDED
     * @description This message is sent when the player ends an ad playback.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.AdEndedData
     */
    AD_ENDED:                       'ad_ended',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_SKIPPED
     * @description This message is sent when an ad is skipped.
     */
    AD_SKIPPED:                     'ad_skipped',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_ERROR
     * @description This message is sent when there is an error during ad playback.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.AdErrorData
     */
    AD_ERROR:                       'ad_error',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_CLICKED
     * @description This message is sent when the skin reports an ads clicked event.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.AdClickedData
     */
    AD_CLICKED:                       'ad_error',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_IMPRESSION
     * @description This message is sent when the ad video element first plays.
     */
    AD_IMPRESSION:                  'ad_impression',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_COMPLETED
     * @description This message is sent when the ad playback is completed.
     */
    AD_COMPLETED:                   'adCompleted',

    /**
     * @public
     * @event OO.Analytics.EVENTS#AD_CLICKTHROUGH_OPENED
     * @description This message is sent when an ad clickthrough event has occurred.
     */
    AD_CLICKTHROUGH_OPENED:         'ad_clickthrough_opened',

    /**
     * @private
     * @event OO.Analytics.EVENTS#SDK_AD_EVENT
     * @description This message is sent when an SDK Ad Event has occurred.
     */
    SDK_AD_EVENT:                   'sdkAdEvent',

    /**
     * @private
     * @event OO.Analytics.EVENTS#REPORT_DISCOVERY_CLICK
     * @description This message is sent when a discovery asset is clicked or autoplayed
     */
    REPORT_DISCOVERY_CLICK:            'reportDiscoveryClick',

    /**
     * @private
     * @event OO.Analytics.EVENTS#REPORT_DISCOVERY_IMPRESSION
     * @description This message is sent when an asset found by discovery is shown on the player.
     */
    REPORT_DISCOVERY_IMPRESSION:            'reportDiscoveryImpression',

    /**
     * @public
     * @event OO.Analytics.EVENTS#FULLSCREEN_CHANGED
     * @description This message is sent when the player enters and exits fullscreen.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.FullscreenChangedData
     */
    FULLSCREEN_CHANGED:             'fullscreen_changed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#VOLUME_CHANGED
     * @description This message is sent when the player volume has changed.
     * @param {Array} paramArray Array of length 1, contains an instance of
     * OO.Analytics.EVENT_DATA.VolumeChangedData
     */
    VOLUME_CHANGED:                 'volume_changed',

    /**
     * @public
     * @event OO.Analytics.EVENTS#DESTROY
     * @description This message is sent when the player and its plugins are destroying.
     */
    DESTROY:                        'destroy',

    /**
     * @public
     * @event OO.Analytics.EVENTS.ERROR
     * @description This property contains different the categories of Ooyala Player Errors.
     */
    ERROR:
    {
      /**
       * @public
       * @event OO.Analytics.EVENTS.ERROR#GENERAL
       * @description This message is sent when a general error occurs.
       * @param {Array} paramArray Array of length 1, contains an instance of
       * OO.Analytics.EVENT_DATA.GeneralErrorData
       */
      GENERAL:                      'general_error',

      /**
       * @public
       * @event OO.Analytics.EVENTS.ERROR#METADATA_LOADING
       * @description This message is sent when a metadata loading error occurs
       * (invalid metadata, invalid content, or a network error when loading metadata).
       * @param {Array} paramArray Array of length 1, contains an instance of
       * OO.Analytics.EVENT_DATA.MetadataLoadingError
       */
      METADATA_LOADING:             'metadata_loading_error',

      /**
       * @public
       * @event OO.Analytics.EVENTS.ERROR#VIDEO_PLAYBACK
       * @description This message is sent when a video playback error occurs.
       * @param {Array} paramArray Array of length 1, contains an instance of
       * OO.Analytics.EVENT_DATA.VideoPlaybackErrorData
       */
      VIDEO_PLAYBACK:               'video_playback_error',

      /**
       * @public
       * @event OO.Analytics.EVENTS.ERROR#AUTHORIZATION
       * @description This message is sent when a stream authorization server (SAS) error occurs.
       * @param {Array} paramArray Array of length 1, contains an instance of
       * OO.Analytics.EVENT_DATA.AuthorizationErrorData
       */
      AUTHORIZATION:                'authorization_error'
    }
  };
  OO.Analytics.EVENTS = EVENTS;
}

if (!OO.Analytics.EVENT_DATA)
{
  var EVENT_DATA = {};

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoElementData
   * @classdesc Contains the data passed along with VIDEO_ELEMENT_CREATED. This includes
   * the stream url of the video element.
   * @property {string} streamUrl This is the video element's stream URL
   */
  EVENT_DATA.VideoElementData = function(streamUrl)
  {
    var checkElementData = OO._.bind(checkDataType, this, "VideoElementData");
    this.streamUrl = checkElementData(streamUrl, "streamUrl", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoSourceData
   * @classdesc Contains the data passed along with VIDEO_SOURCE_CHANGED. This
   * includes the embed code (video id) and any metadata this video stream needs
   * pass along to other plugins (for example, it could contain ad tag data or analytics
   * account information).
   * @property  {string} embedCode This is the video stream's unique id
   * @property  {object} metadata   An object containing metadata about the video stream and player id to be used
   */
  EVENT_DATA.VideoSourceData = function(embedCode, metadata)
  {
    var checkSourceData = OO._.bind(checkDataType, this, "VideoSourceData");
    this.embedCode = checkSourceData(embedCode, "embedCode", ["string"]);
    this.metadata  = checkSourceData(metadata, "metadata", ["object"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoContentMetadata
   * @classdesc Contains information about the content of the video stream,
   * such as title and description.
   * @property  {string} title Title of the video
   * @property  {string} description Video description
   * @property  {number} duration Duration of the video in milliseconds
   * @property  {object} closedCaptions Object containing information about the closed captions available
   * @property  {string} contentType A string indicating the type of content in the stream (ex. "video").
   * @property  {string} hostedAtURL The url the video is being hosted from
   */
  EVENT_DATA.VideoContentMetadata = function(title, description, duration, closedCaptions, contentType, hostedAtURL)
  {
    var checkContentData = OO._.bind(checkDataType, this, "VideoContentMetadata");
    this.title          = checkContentData(title, "title", ["string"]);
    this.description    = checkContentData(description, "description", ["string"]);
    this.duration       = checkContentData(duration, "duration", ["number"]);
    this.closedCaptions = checkContentData(closedCaptions, "closedCaptions", ["object"]);
    this.contentType    = checkContentData(contentType, "contentType", ["string"]);
    this.hostedAtURL    = checkContentData(hostedAtURL, "hostedAtURL", ["string"]);
  };

  /**
   * public
   * @class Analytics.EVENT_DATA#StreamTypeMetadata
   * @classdesc Contains information about the content stream type
   * @property {string} streamType OO.Analytics.STREAM_TYPE of the stream.
   */
  EVENT_DATA.StreamTypeMetadata = function(streamType)
  {
    var checkStreamTypeData = OO._.bind(checkDataType, this, "StreamTypeMetadata");
    this.streamType         = checkStreamTypeData(streamType, "streamType", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoDownloadingMetadata
   * @classdesc Contains information about the stream that is being downloaded.
   * @property {number} currentTime The current time of the player
   * @property {number} totalStreamDuration The duration of the video stream
   * @property {number} streamBufferedUntilTime The stream is buffered until this timestamp
   * @property {number} seekableRangeStart The earliest time the user can seek to
   * @property {number} seekableRangeEnd The latest time the user can seek to
   */
  EVENT_DATA.VideoDownloadingMetadata = function(currentTime, totalStreamDuration, streamBufferedUntilTime, seekableRangeStart, seekableRangeEnd)
  {
    var checkDownloadData = OO._.bind(checkDataType, this, "VideoDownloadingMetadata");
    this.currentTime             = checkDownloadData(currentTime, "currentTime", ["number"]);
    this.totalStreamDuration     = checkDownloadData(totalStreamDuration, "totalStreamDuration", ["number"]);
    this.streamBufferedUntilTime = checkDownloadData(streamBufferedUntilTime, "streamBufferedUntilTime", ["number"]);
    this.seekableRangeStart      = checkDownloadData(seekableRangeStart, "seekableRangeStart", ["number"]);
    this.seekableRangeEnd        = checkDownloadData(seekableRangeEnd, "seekableRangeEnd", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoBufferingStartedData
   * @classdesc Contains information about the stream that has started buffering.
   * @property {string} streamUrl The url of the stream that is buffering
   * @property {string} videoId The video Id (main, etc.)
   * @property {number} position The playhead position buffering started
   */
  EVENT_DATA.VideoBufferingStartedData = function(streamUrl, videoId, position)
  {
    var checkBufferingStartedData = OO._.bind(checkDataType, this, "VideoBufferingStartedData");
    this.streamUrl = checkBufferingStartedData(streamUrl, "streamUrl", ["string"]);
    this.videoId = checkBufferingStartedData(videoId, "videoId", ["string"]);
    this.position = checkBufferingStartedData(position, "position", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoBufferingEndedData
   * @classdesc Contains information about the stream that finished buffering.
   * @property {string} streamUrl The url of the stream that finished buffering
   */
  EVENT_DATA.VideoBufferingEndedData = function(streamUrl)
  {
    var checkBufferingEndedData = OO._.bind(checkDataType, this, "VideoBufferingEndedData");
    this.streamUrl = checkBufferingEndedData(streamUrl, "streamUrl", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoBitrateProfileLookupData
   * @classdesc Contains a lookup table for all the possible bitrates available. The
   * keys are the profile ids for each profile.
   * @property {object} profiles A lookup table containing instances of VideoBitrateProfileData. The key is the 'id' of each VideoBitrateProfileData.
   *
   * @constructor
   * @param {object} bitrateProfileArray An array of objects containing profile data
   * (bitrate, width, height, and id)
   */
  EVENT_DATA.VideoBitrateProfileLookupData = function(bitrateProfileArray)
  {
    var checkBitrateProfileList = OO._.bind(checkDataType, this, "VideoBitrateProfileLookupData");
    var list = checkBitrateProfileList(bitrateProfileArray, "bitrateProfileArray", ["array"]) || [];
    this.profiles = {};
    for (var i = 0; i < list.length; i++)
    {
      var entry = list[i];
      if (entry && entry.id)
      {
        this.profiles[entry.id] = entry;
      }
    }
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoBitrateProfileData
   * @classdesc Contains information about a bitrate profile.
   * @property {string} id The id of this profile
   * @property {number} bitrate The bitrate of this profile
   * @property {number} width The width of this profile
   * @property {number} height The height of this profile
   */
  EVENT_DATA.VideoBitrateProfileData = function(bitrateProfile)
  {
    var checkBitrateProfile = OO._.bind(checkDataType, this, "VideoBitrateProfileData");
    this.bitrate = checkBitrateProfile(bitrateProfile.bitrate, "bitrate", ["number","string"]);
    this.height = checkBitrateProfile(bitrateProfile.height, "height", ["number"]);
    this.width = checkBitrateProfile(bitrateProfile.width, "width", ["number"]);
    this.id = checkBitrateProfile(bitrateProfile.id, "id", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoTargetBitrateData
   * @classdesc Contains information what bitrate profile is being requested.
   * @property {string} targetProfile The id of the bitrate profile being requested.
   */
  EVENT_DATA.VideoTargetBitrateData = function(targetProfile)
  {
    var checkTargetBitrate = OO._.bind(checkDataType, this, "VideoTargetBitrateData");
    this.targetProfile = checkTargetBitrate(targetProfile, "targetProfile", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoSeekRequestedData
   * @classdesc Contains information about seeking to a particular time in the stream.
   * @property {number} seekingToTime The time requested to be seeked to
   */
  EVENT_DATA.VideoSeekRequestedData = function(seekingToTime)
  {
    var checkSeekStartedData = OO._.bind(checkDataType, this, "VideoSeekRequestedData");
    this.seekingToTime = checkSeekStartedData(seekingToTime, "seekingToTime", ["number"]);
  };

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
    this.timeSeekedTo = checkSeekEndedData(timeSeekedTo, "timeSeekedTo", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoStreamPositionChangedData
   * @classdesc Contains information about the current stream position and the length of the stream.
   * @property {number} streamPosition The current stream position
   * @property {number} totalStreamDuration The total length/duration of the stream
   * @property {string} videoId Id used to differentiate between various streams (such as ad vs content playback).
   *                            Possible values are defined in OO.VIDEO.
   */
  EVENT_DATA.VideoStreamPositionChangedData = function(streamPosition, totalStreamDuration, videoId)
  {
    var checkVideoStreamPositionChangedData = OO._.bind(checkDataType, this, "VideoStreamPositionChangedData");
    this.streamPosition = checkVideoStreamPositionChangedData(streamPosition, "streamPosition", ["number"]);
    this.totalStreamDuration = checkVideoStreamPositionChangedData(totalStreamDuration, "totalStreamDuration", ["number"]);
    this.videoId = checkVideoStreamPositionChangedData(videoId, "videoId", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoErrorData
   * @classdesc [DEPRECATED]
   * (NOTE: replaced by Analytics.EVENT_DATA.VideoPlaybackErrorData)
   * Contains information about the error code and message of the video error.
   * @property {string} errorCode The error code
   * @property {string} errorMessage The error message
   *
   * @constructor
   * @param {string} errorCode The error code
   */
  EVENT_DATA.VideoErrorData = function(errorCode)
  {
    var checkVideoErrorData = OO._.bind(checkDataType, this, "VideoErrorData");
    this.errorCode = checkVideoErrorData(errorCode, "errorCode", ["string"]);
    this.errorMessage = translateErrorCode(errorCode);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#GeneralErrorData
   * @classdesc Contains information about the error code and message of a general error.
   * @property {string} errorCode The error code
   * @property {string} errorMessage The error message
   */
  EVENT_DATA.GeneralErrorData = function(errorCode, errorMessage)
  {
    var checkGeneralErrorData = OO._.bind(checkDataType, this, "GeneralErrorData");
    this.errorCode = checkGeneralErrorData(errorCode, "errorCode", ["string"]);
    this.errorMessage = checkGeneralErrorData(errorMessage, "errorMessage", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#MetadataLoadingErrorData
   * @classdesc Contains information about the error code and message of a metadata loading
   * error.
   * @property {string} errorCode The error code
   * @property {string} errorMessage The error message
   */
  EVENT_DATA.MetadataLoadingErrorData = function(errorCode, errorMessage)
  {
    var checkMetadataLoadingErrorData = OO._.bind(checkDataType, this, "MetadataLoadingErrorData");
    this.errorCode = checkMetadataLoadingErrorData(errorCode, "errorCode", ["string"]);
    this.errorMessage = checkMetadataLoadingErrorData(errorMessage, "errorMessage", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoPlaybackErrorData
   * @classdesc Contains information about the error code and message of the video error.
   * @property {string} errorCode The error code
   * @property {string} errorMessage The error message
   */
  EVENT_DATA.VideoPlaybackErrorData = function(errorCode, errorMessage)
  {
    var checkVideoPlaybackErrorData = OO._.bind(checkDataType, this, "VideoPlaybackErrorData");
    this.errorCode = checkVideoPlaybackErrorData(errorCode, "errorCode", ["string"]);
    this.errorMessage = checkVideoPlaybackErrorData(errorMessage, "errorMessage", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AuthorizationErrorData
   * @classdesc Contains information about the error code and message of the authorization error.
   * @property {string} errorCode The error code
   * @property {string} errorMessage The error message
   */
  EVENT_DATA.AuthorizationErrorData = function(errorCode, errorMessage)
  {
    var checkAuthorizationErrorData = OO._.bind(checkDataType, this, "AuthorizationErrorData");
    this.errorCode = checkAuthorizationErrorData(errorCode, "errorCode", ["string"]);
    this.errorMessage = checkAuthorizationErrorData(errorMessage, "errorMessage", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdPodStartedData
   * @classdesc Contain information about how many ads are in the ad pod.
   * @property {number} numberOfAds The number of ads in the pod
   */
  EVENT_DATA.AdPodStartedData = function(numberOfAds)
  {
    var checkAdPodStartedData = OO._.bind(checkDataType, this, "AdPodStartedData");
    this.numberOfAds = checkAdPodStartedData(numberOfAds, "numberOfAds", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdPodEndedData
   * @classdesc Contain information about the adId of the ad pod.
   * @property {string} adId The id of the ad pod
   */
  EVENT_DATA.AdPodEndedData = function(adId)
  {
    var checkAdPodEndedData = OO._.bind(checkDataType, this, "AdPodEndedData");
    this.adId = checkAdPodEndedData(adId, "adId", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdStartedData
   * @classdesc Contains information about the type of ad that has started and its ad data.
   * @property {string} adType The type of ad (linear video, linear overlay, nonlinear overlay)
   * @property {object} adMetadata The metadata associated with the ad(i.e. EVENT_DATA.LinearVideoData or EVENT_DATA.NonLinearOverlayData)
   */
  EVENT_DATA.AdStartedData = function(adType, adMetadataIn)
  {
    var checkAdStartedData = OO._.bind(checkDataType, this, "AdStartedData");
    this.adType = checkAdStartedData(adType, "adType", ["string"]);
    this.adMetadata = selectAdType(adType, adMetadataIn);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#LinearVideoData
   * @classdesc Contains information about the linear video ad data.
   * @property {string} adId The id of the ad
   * @property {number} adDuration The duration of the ad video stream
   * @property {number} adPodPosition The index of the current ad in its ad pod
   */
  EVENT_DATA.LinearVideoData = function(adId, adDuration, adPodPosition)
  {
    var checkLinearVideoData = OO._.bind(checkDataType, this, "LinearVideoData");
    this.adId = checkLinearVideoData(adId, "adId", ["string"]);
    this.adDuration = checkLinearVideoData(adDuration, "adDuration", ["number"]);
    this.adPodPosition = checkLinearVideoData(adPodPosition, "adPodPosition", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#NonLinearOverlayData
   * @classdesc Contains information about the non linear overlay ad data.
   * @property {string} adId The id of the ad
   */
  EVENT_DATA.NonLinearOverlayData = function(adId)
  {
    var checkNonLinearOverlayData = OO._.bind(checkDataType, this, "NonLinearOverlayData");
    this.adId = checkNonLinearOverlayData(adId, "adId", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdEndedData
   * @classdesc Contains information about the type of ad that has ended and its ad data.
   * @property {string} adType The type of ad (linear video, linear overlay, nonlinear overlay)
   * @property {string} adId The id of the ad
   */
  EVENT_DATA.AdEndedData = function(adType, adId)
  {
    var checkAdEndedData = OO._.bind(checkDataType, this, "AdEndedData");
    this.adType = checkAdEndedData(adType, "adType", ["string"]);
    this.adId = checkAdEndedData(adId, "adId", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdErrorData
   * @classdesc Contains information about the ad error.
   * @property {object|string} The error object or string
   */
  EVENT_DATA.AdErrorData = function(error)
  {
    var checkAdErrorData = OO._.bind(checkDataType, this, "AdErrorData");
    this.error = checkAdErrorData(error, "error", ["string", "object"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdClickedData
   * @classdesc Contains information about the ad clicked event.
   * @property {object} The metadata sent with the event
   */
  EVENT_DATA.AdClickedData = function(error)
  {
    var checkAdClickedData = OO._.bind(checkDataType, this, "AdClickedData");
    this.metadata = checkAdClickedData(metadata, "metadata", ["object"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VideoPlayerCreatedData
   * @classdesc Contains information about the player created event
   * @property {string} playerCoreVersion The player core version
   * @property {object} params The configuration metadata associated with the player
   * (i.e. pcode, playerBrandingId, skin configuration, player configuration parameters)
   * @property {string} embedCode The embed code of the asset attempting to play
   * @property {string} playerUrl The url of the page containing the player
   * @property {string} pcode The provider pcode
   */
  EVENT_DATA.VideoPlayerCreatedData = function(playerCoreVersion, params, embedCode, playerUrl)
  {
    var checkVideoPlayerCreatedData = OO._.bind(checkDataType, this, "VideoPlayerCreatedData");
    this.playerCoreVersion = checkVideoPlayerCreatedData(playerCoreVersion, "playerCoreVersion", ["string"]);
    this.params = checkVideoPlayerCreatedData(params, "params", ["object"]);
    this.embedCode = checkVideoPlayerCreatedData(embedCode, "embedCode", ["string"]);
    this.playerUrl = checkVideoPlayerCreatedData(playerUrl, "playerUrl", ["string"]);
    this.pcode = checkVideoPlayerCreatedData(this.params.pcode, "pcode", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#InitialPlayStartingData
   * @classdesc Contains the information about the initial play starting event.
   * @property {string} playerCoreVersion The player core version
   * @property {number} timeSinceInitialPlay The time since the initial play request was made
   * @property {boolean} autoplayed Boolean for if the video was autoplayed or not
   * @property {boolean} hadPreroll Boolean for if the video had an ad play before it started
   * @property {number} position The initial position of the playhead upon playback start. This includes 
   *   midrolls that play before content due to an initial playhead time > 0
   * @property {string} plugin The video plugin used for playback
   * @property {string} technology The browser technology used - HTML5, Flash, Mixed, or Other
   * @property {string} encoding The stream encoding type, i.e. MP4, HLS, Dash, etc.
   * @property {string} streamUrl The URL of the content being played
   * @property {string} drm The DRM being used, none if there is no DRM
   * @property {boolean} isLive Boolean that is true if a live stream is playing. If false it is VOD.
   */
  EVENT_DATA.InitialPlayStartingData = function(playerCoreVersion, timeSinceInitialPlay, 
        autoplayed, hadPreroll, position, plugin, technology, encoding, streamUrl, drm, isLive)
  {
    var checkInitialPlayStartingData = OO._.bind(checkDataType, this, "VideoPlayerCreatedData");
    this.playerCoreVersion = checkInitialPlayStartingData(playerCoreVersion, "playerCoreVersion", ["string"]);
    this.timeSinceInitialPlay = checkInitialPlayStartingData(timeSinceInitialPlay, "timeSinceInitialPlay", ["number"]);
    this.autoplayed = checkInitialPlayStartingData(autoplayed, "autoplayed", ["boolean"]);
    this.hadPreroll = checkInitialPlayStartingData(hadPreroll, "hadPreroll", ["boolean"]);
    this.position = checkInitialPlayStartingData(position, "position", ["number"]);
    this.plugin = checkInitialPlayStartingData(plugin, "plugin", ["string"]);
    this.technology = checkInitialPlayStartingData(technology, "technology", ["string"]);
    this.encoding = checkInitialPlayStartingData(encoding, "encoding", ["string"]);
    this.streamUrl = checkInitialPlayStartingData(streamUrl, "streamUrl", ["string"]);
    this.drm = checkInitialPlayStartingData(drm, "drm", ["string"]);
    this.isLive = checkInitialPlayStartingData(isLive, "isLive", ["boolean"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#PlaybackReadyData
   * @classdesc Contains the information about the playback ready event
   * @property {string} playerCoreVersion The player core version
   * @property {number} timeSincePlayerCreated The time between player creation and playback ready state
   * @property {array} pluginList List of plugins loaded
   */
  EVENT_DATA.PlaybackReadyData = function(playerCoreVersion, timeSincePlayerCreated, pluginList)
  {
    var checkPlaybackReadyData = OO._.bind(checkDataType, this, "PlaybackReadyData");
    this.playerCoreVersion = checkPlaybackReadyData(playerCoreVersion, "playerCoreVersion", ["string"]);
    this.timeSincePlayerCreated = checkPlaybackReadyData(timeSincePlayerCreated, "timeSincePlayerCreated", ["number"]);
    this.pluginList = checkPlaybackReadyData(pluginList, "pluginList", ["array"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#ApiErrorData
   * @classdesc Contains information about the api error.
   * @property {string} playerCoreVersion The player core version
   * @property {number} errorCode The error code if any
   * @property {string} errorMessage The error message
   * @property {string} url The ad tag url post macro substitution
   */
  EVENT_DATA.ApiErrorData = function(playerCoreVersion, errorCode, errorMessage, url)
  {
    var checkApiErrorData = OO._.bind(checkDataType, this, "ApiErrorData");
    this.playerCoreVersion = checkApiErrorData(playerCoreVersion, "playerCoreVersion", ["string"]);
    this.errorCode = checkApiErrorData(errorCode, "errorCode", ["number"]);
    this.errorMessage = checkApiErrorData(errorMessage, "errorMessage", ["string"]);
    this.url = checkApiErrorData(url, "url", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#BitrateInitialData
   * @classdesc Contains the information about the bitrate initial event
   * @property {number} The bitrate at the start of playback
   */
  EVENT_DATA.BitrateInitialData = function(bitrate)
  {
    var checkBitrateInitialData = OO._.bind(checkDataType, this, "BitrateInitialData");
    this.bitrate = checkBitrateInitialData(bitrate, "bitrate", ["number"]);
  };

    /**
   * @public
   * @class Analytics.EVENT_DATA#BitrateFiveSecData
   * @classdesc  Contains the information about the bitrate five sec event
   * @property {number} The bitrate at five seconds into the video
   */
  EVENT_DATA.BitrateFiveSecData = function(bitrate)
  {
    var checkBitrateFiveSecData = OO._.bind(checkDataType, this, "BitrateFiveSecData");
    this.bitrate = checkBitrateFiveSecData(bitrate, "bitrate", ["number"]);
  };

    /**
   * @public
   * @class Analytics.EVENT_DATA#BitrateStableData
   * @classdesc  Contains the information about the bitrate stable event
   * @property {number} The bitrate at thirty seconds into the video
   */
  EVENT_DATA.BitrateStableData = function(bitrate)
  {
    var checkBitrateStableData = OO._.bind(checkDataType, this, "BitrateStableData");
    this.bitrate = checkBitrateStableData(bitrate, "bitrate", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#PlaybackStartErrorData
   * @classdesc Contains information about the playback start error.
   * @property {object} errorCodes Object containing all error codes associated with the error
   * @property {object} errorMessages Object containing error messages associated with the error
   * @property {object} drm The DRM information, if relevant and available
   */
  EVENT_DATA.PlaybackStartErrorData = function(errorCodes, errorMessages, drm)
  {
    var checkPlaybackStartErrorData = OO._.bind(checkDataType, this, "PlaybackStartErrorData");
    this.errorCodes = checkPlaybackStartErrorData(errorCodes, "errorCodes", ["object"]);
    this.errorMessages = checkPlaybackStartErrorData(errorMessages, "errorMessages", ["object"]);
    this.drm = checkPlaybackStartErrorData(drm, "drm", ["object"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#PlaybackMidstreamErrorData
   * @classdesc Contains information about the playback midstream error.
   * @property {object} errorCodes Object containing all error codes associated with the error
   * @property {object} errorMessages Object containing error messages associated with the error
   * @property {number} position The playhead position the error occurred at
   */
  EVENT_DATA.PlaybackMidstreamErrorData = function(errorCodes, errorMessages, position)
  {
    var checkPlaybackMidstreamErrorData = OO._.bind(checkDataType, this, "PlaybackMidstreamErrorData");
    this.errorCodes = checkPlaybackMidstreamErrorData(errorCodes, "errorCodes", ["object"]);
    this.errorMessages = checkPlaybackMidstreamErrorData(errorMessages, "errorMessages", ["object"]);
    this.position = checkPlaybackMidstreamErrorData(position, "position", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#PluginLoadedData
   * @classdesc Contains information about the plugin loaded event.
   * @property {string} playerCoreVersion The player core version
   * @property {string} pluginType Type of the loaded plugin - ads, playback, analytics, playlist, or skin
   * @property {string} pluginName The name of the plugin loaded
   * @property {number} loadTime The time it took for the plugin to reach the ready state
   */
  EVENT_DATA.PluginLoadedData = function(playerCoreVersion, pluginType, pluginName, loadTime)
  {
    var checkPluginLoadedData = OO._.bind(checkDataType, this, "PluginLoadedData");
    this.playerCoreVersion = checkPluginLoadedData(playerCoreVersion, "playerCoreVersion", ["string"]);
    this.pluginType = checkPluginLoadedData(pluginType, "pluginType", ["string"]);
    this.pluginName = checkPluginLoadedData(pluginName, "pluginName", ["string"]);
    this.loadTime = checkPluginLoadedData(loadTime, "loadTime", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdErrorData
   * @classdesc Contains information about the ad error.
   * @property {object|string} The error object or string
   */
  EVENT_DATA.AdErrorData = function(error)
  {
    var checkAdErrorData = OO._.bind(checkDataType, this, "AdErrorData");
    this.error = checkAdErrorData(error, "error", ["string", "object"]);
  };
  
  /**
   * @public
   * @class Analytics.EVENT_DATA#AdRequestData
   * @classdesc Contains information about the ad request event. 
   * @property {string} adPluginName The name of the ad plugin used
   * @property {number} adPosition The position, in seconds, the ad is scheduled to play
   */
  EVENT_DATA.AdRequestData = function(adPluginName, adPosition)
  {
    var checkAdRequestData = OO._.bind(checkDataType, this, "AdRequestData");
    this.adPluginName = checkAdRequestData(adPluginName, "adPluginName", ["string"]);
    this.adPosition = checkAdRequestData(adPosition, "adPosition", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdRequestSuccssData
   * @classdesc Contains information about the ad request success event. 
   * @property {string} adPluginName The name of the ad plugin used
   * @property {number} adPosition The position, in seconds, the ad is scheduled to play
   * @property {number} responseTime The time in milliseconds that it took to get a response for the ad request
   * @property {number} timeSinceInitialPlay The time in milliseconds from the initial play request time to ad request success
   */
  EVENT_DATA.AdRequestSuccessData = function(adPluginName, adPosition, responseTime, timeSinceInitialPlay)
  {
    var checkAdRequestSuccessData = OO._.bind(checkDataType, this, "AdRequestSuccessData");
    this.adPluginName = checkAdRequestSuccessData(adPluginName, "adPluginName", ["string"]);
    this.adPosition = checkAdRequestSuccessData(adPosition, "adPosition", ["number"]);
    this.responseTime = checkAdRequestSuccessData(responseTime, "responseTime", ["number"]);
    this.timeSinceInitialPlay = checkAdRequestSuccessData(timeSinceInitialPlay, "timeSinceInitialPlay", ["number"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdRequestEmptyData
   * @classdesc Contains information about the ad request empty event. 
   * @property {string} adPluginName The name of the ad plugin that sent this event
   * @property {number} adPosition The position, in seconds, the ad is scheduled to play
   * @property {string} adTagUrl The ad tag url post macro substitution
   * @property {object} errorCodes Object containing all error codes received
   * @property {string} errorMessage The error message
   */
  EVENT_DATA.AdRequestEmptyData = function(adPluginName, adPosition, adTagUrl, errorCodes, errorMessage)
  {
    var checkAdRequestEmptyData = OO._.bind(checkDataType, this, "AdRequestEmptyData");
    this.adPluginName = checkAdRequestEmptyData(adPluginName, "adPluginName", ["string"]);
    this.adPosition = checkAdRequestEmptyData(adPosition, "adPosition", ["number"]);
    this.adTagUrl = checkAdRequestEmptyData(adTagUrl, "adTagUrl", ["string"]);
    this.errorCodes = checkAdRequestEmptyData(errorCodes, "errorCodes", ["object"]);
    this.errorMessage = checkAdRequestEmptyData(errorMessage, "errorMessage", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdRequestErrorData
   * @classdesc Contains information about the ad request error event. 
   * @property {string} adPluginName The name of the ad plugin that sent this event
   * @property {number} adPosition The position, in seconds, the ad is scheduled to play
   * @property {string} adTagUrl The ad tag url post macro substitution
   * @property {object} errorCodes Object containing all error codes received
   * @property {string} errorMessage The error message
   * @property {boolean} isTimeout If ad request timed out or not
   */
  EVENT_DATA.AdRequestErrorData = function(adPluginName, adPosition, adTagUrl, errorCodes, errorMessage, isTimeout)
  {
    var checkAdRequestErrorData = OO._.bind(checkDataType, this, "AdRequestErrorData");
    this.adPluginName = checkAdRequestErrorData(adPluginName, "adPluginName", ["string"]);
    this.adPosition = checkAdRequestErrorData(adPosition, "adPosition", ["number"]);
    this.adTagUrl = checkAdRequestErrorData(adTagUrl, "adTagUrl", ["string"]);
    this.errorCodes = checkAdRequestErrorData(errorCodes, "errorCodes", ["object"]);
    this.errorMessage = checkAdRequestErrorData(errorMessage, "errorMessage", ["string"]);
    this.isTimeout = checkAdRequestErrorData(isTimeout, "isTimeout", ["boolean"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdPlaybackErrorData
   * @classdesc Contains information about the ad playback error event. 
   * @property {string} adPluginName The name of the ad plugin that sent this event
   * @property {number} adPosition The position, in seconds, the ad is scheduled to play
   * @property {string} adTagUrl The ad tag url post macro substitution
   * @property {object} errorCodes Object containing all error codes received
   * @property {string} errorMessage The error message
   * @property {array} videoPluginList Array containing names of all video plugins registered
   * @property {string} mediaFileUrl The url used to retrieve the ad media file
   */
  EVENT_DATA.AdPlaybackErrorData = function(adPluginName, adPosition, adTagUrl, errorCodes, errorMessage, videoPluginList, mediaFileUrl)
  {
    var checkAdPlaybackErrorData = OO._.bind(checkDataType, this, "AdPlaybackErrorData");
    this.adPluginName = checkAdPlaybackErrorData(adPluginName, "adPluginName", ["string"]);
    this.adPosition = checkAdPlaybackErrorData(adPosition, "adPosition", ["number"]);
    this.adTagUrl = checkAdPlaybackErrorData(adTagUrl, "adTagUrl", ["string"]);
    this.errorCodes = checkAdPlaybackErrorData(errorCodes, "errorCodes", ["object"]);
    this.errorMessage = checkAdPlaybackErrorData(errorMessage, "errorMessage", ["string"]);
    this.videoPluginList = checkAdPlaybackErrorData(videoPluginList, "videoPluginList", ["array"]);
    this.mediaFileUrl = checkAdPlaybackErrorData(mediaFileUrl, "mediaFileUrl", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdSdkImpressionData
   * @classdesc Contains information about the ad sdk impression event. 
   * @property {string} adPluginName The name of the ad plugin that sent this event
   * @property {number} adPosition The position, in seconds, the ad is scheduled to play
   * @property {number} adLoadTime The time in milliseconds between the ad request success and started
   * @property {string} adProtocol The ad protocol (VAST / VPAID)
   * @property {string} adType The ad type (LinearOverlay, LinearVideo, NonLinearOverlay, NonLinearVideo)
   */
  EVENT_DATA.AdSdkImpressionData = function(adPluginName, adPosition, adLoadTime, adProtocol, adType)
  {
    var checkAdSdkImpressionData = OO._.bind(checkDataType, this, "AdSdkImpressionData");
    this.adPluginName = checkAdSdkImpressionData(adPluginName, "adPluginName", ["string"]);
    this.adPosition = checkAdSdkImpressionData(adPosition, "adPosition", ["number"]);
    this.adLoadTime = checkAdSdkImpressionData(adLoadTime, "adLoadTime", ["number"]);
    this.adProtocol = checkAdSdkImpressionData(adProtocol, "adProtocol", ["string"]);
    this.adType = checkAdSdkImpressionData(adType, "adType", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdCompletedData
   * @classdesc Contains information about the ad completed event. 
   * @property {string} adPluginName The name of the ad plugin used
   * @property {number} timeSinceImpression The time passed since the ad impression 
   *                                          was recorded in milliseconds
   * @property {boolean} skipped True if ad was skipped by user.
   * @property {string} adTagUrl The ad tag url post macro substitution
   */
  EVENT_DATA.AdCompletedData = function(adPluginName, timeSinceImpression, skipped, adTagUrl)
  {
    var checkAdCompletedData = OO._.bind(checkDataType, this, "AdCompletedData");
    this.adPluginName = checkAdCompletedData(adPluginName, "adPluginName", ["string"]);
    this.timeSinceImpression = checkAdCompletedData(timeSinceImpression, "timeSinceImpression", ["number"]);
    this.skipped = checkAdCompletedData(skipped, "skipped", ["boolean"]);
    this.adTagUrl = checkAdCompletedData(adTagUrl, "adTagUrl", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdSdkLoadedData
   * @classdesc Contains information about the ad SDK loaded event. 
   * @property {string} adPluginName The name of the ad plugin that sent this event
   * @property {string} playerCoreVersion The player core version
   */
  EVENT_DATA.LoadAdSdkData = function(adPluginName, playerCoreVersion)
  {
    var checkLoadAdSdkData = OO._.bind(checkDataType, this, "LoadAdSdkData");
    this.adPluginName = checkLoadAdSdkData(adPluginName, "adPluginName", ["string"]);
    this.playerCoreVersion = checkLoadAdSdkData(playerCoreVersion, "playerCoreVersion", ["string"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#AdSdkLoadFailureData
   * @classdesc Contains information about the ad SDK load failure event. 
   * @property {string} adPluginName The name of the ad plugin that sent this event
   * @property {string} playerCoreVersion The player core version
   * @property {string} errorMessage The error message associated with the ad sdk load failure
   */
  EVENT_DATA.LoadAdSdkFailureData = function(adPluginName, playerCoreVersion, errorMessage)
  {
    var checkLoadAdSdkFailureData = OO._.bind(checkDataType, this, "LoadAdSdkFailureData");
    this.adPluginName = checkLoadAdSdkFailureData(adPluginName, "adPluginName", ["string"]);
    this.playerCoreVersion = checkLoadAdSdkFailureData(playerCoreVersion, "playerCoreVersion", ["string"]);
    this.errorMessage = checkLoadAdSdkFailureData(errorMessage, "errorMessage", ["string"]);
  };

  /**
   * @private
   * @class Analytics.EVENT_DATA#ReportDiscoveryImpressionEventData
   * @classdesc Contains information about report discovery impression event. This has been marked private because
   * we do not want to expose this as a public event.
   * @property {object} metadata An object containing details of the ad event. This may vary
   *                               between ad plugin to ad plugin.
   */
  EVENT_DATA.ReportDiscoveryImpressionEventData = function(metadata)
  {
    var checkReportDiscoveryImpressionEventData = OO._.bind(checkDataType, this, "ReportDiscoveryImpressionEventData");
    this.metadata = checkReportDiscoveryImpressionEventData(metadata, "metadata", ["object"]);
  };

  /**
   * @private
   * @class Analytics.EVENT_DATA#ReportDiscoveryClickEventData
   * @classdesc Contains information about report discovery click event. This has been marked private because
   * we do not want to expose this as a public event.
   * @property {object} metadata An object containing details of the ad event. This may vary
   *                               between ad plugin to ad plugin.
   */
  EVENT_DATA.ReportDiscoveryClickEventData = function(metadata)
  {
    var checkReportDiscoveryClickEventData = OO._.bind(checkDataType, this, "ReportDiscoveryClickEventData");
    this.metadata = checkReportDiscoveryClickEventData(metadata, "metadata", ["object"]);
  };

  /**
   * @private
   * @class Analytics.EVENT_DATA#SdkAdEventData
   * @classdesc Contains information about SDK Ad Event. This has been marked private because
   * we do not want to expose this as a public event.
   * @property {string} adPluginName The name of the ad plugin that sent this event
   * @property {string} adEventName The name of this event from the ad plugin
   * @property {object} adEventData An object containing details of the ad event. This may vary
   *                               between ad plugin to ad plugin.
   */
  EVENT_DATA.SdkAdEventData = function(adPluginName, adEventName, adEventData)
  {
    var checkSdkAdEventData = OO._.bind(checkDataType, this, "SdkAdEventData");
    this.adPluginName = checkSdkAdEventData(adPluginName, "adPluginName", ["string"]);
    this.adEventName = checkSdkAdEventData(adEventName, "adEventName", ["string"]);
    this.adEventData = checkSdkAdEventData(adEventData, "adEventData", ["object"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#FullscreenChangedData
   * @classdesc Contains information about whether the player is entering or exiting fullscreen.
   * @property {boolean} changingToFullscreen Whether or not the player is entering fullscreen.
   * true represents that the player is entering fullscreen. false represents that the player is
   * exiting fullscreen.
   */
  EVENT_DATA.FullscreenChangedData = function(changingToFullscreen)
  {
    var checkFullscreenChangedData = OO._.bind(checkDataType, this, "FullscreenChangedData");
    this.changingToFullscreen = checkFullscreenChangedData(changingToFullscreen, "changingToFullscreen", ["boolean"]);
  };

  /**
   * @public
   * @class Analytics.EVENT_DATA#VolumeChangedData
   * @classdesc Contains information about the value of the current volume.
   * @property {number} volume  The current volume after the change; the volume is a value from 0 - 1, with 0
   * representing a muted state and 1 representing the maximum volume.
   */
  EVENT_DATA.VolumeChangedData = function(currentVolume)
  {
    var checkVolumeChangedData = OO._.bind(checkDataType, this, "VolumeChangedData");
    this.currentVolume = checkVolumeChangedData(currentVolume, "currentVolume", ["number"]);
  };

  var checkDataType = function(className, data, varName, expectedTypes)
  {
    var error = true;
    var toRet = data;
    for (var i = 0; i < expectedTypes.length; i++)
    {
      var expectedType = expectedTypes[i];
      if (expectedType === "string")
      {
        if (OO._.isString(toRet))
        {
          error = false;
          break;
        }
      }
      else if (expectedType === "object")
      {
        if (toRet && OO._.isObject(toRet))
        {
          error = false;
          break;
        }
      }
      else if (expectedType === "array")
      {
        if (toRet && OO._.isArray(toRet))
        {
          error = false;

        }
      }
      else if (expectedType === "number")
      {
        // in the case number comes in as a string, try parsing it.
        var toRetFloat = parseFloat(toRet);
        if (OO._.isNumber(toRet))
        {
          error = false;
          break;
        }
        else if (!isNaN(toRetFloat))
        {
          toRet = toRetFloat;
          error = false;
          break;
        }
      }
      else if (expectedType === "boolean")
      {
        if (OO._.isBoolean(toRet))
        {
          error = false;
        }
        else if (toRet === "true")
        {
          toRet = true;
          error = false;
          break;
        }
        else if (toRet === "false")
        {
          toRet = false;
          error = false;
          break;
        }
      }
    }

    if (error)
    {
      logErrorString
      (
        "Analytics.EVENT_DATA." + className + " being created with invalid " + varName +
        ". Should be one of these types [" + expectedTypes + "] but was [" + typeof(data) + "]."
      );
      return undefined;
    }

    return toRet;
  };

  /**
   * @private
   * @class Analytics#selectAdType
   * @classdesc Checks for a recognized Ad Type and returns the corresponding EVENT_DATA object.
   * @property {string} adType The type of ad (linear video, linear overlay, nonlinear overlay)
   * @property {object} adMetadata The metadata associated with the ad
   * @returns {object} The EVENT_DATA object that associates with the Ad Type.
   */
  var selectAdType = function(adType, adMetadataIn)
  {
    var adMetadataOut;
    switch (adType)
    {
      case OO.Analytics.AD_TYPE.LINEAR_VIDEO:
        adMetadataOut = new EVENT_DATA.LinearVideoData
        (
          adMetadataIn.name,
          adMetadataIn.duration,
          adMetadataIn.indexInPod
        );
        break;
      case OO.Analytics.AD_TYPE.NONLINEAR_OVERLAY:
        adMetadataOut = new EVENT_DATA.NonLinearOverlayData
        (
          adMetadataIn.id
        );
        break;
      default:
        logErrorString
        (
          "Ad Type not recognized. Should be one of these values [" +
          OO._.values(OO.Analytics.AD_TYPE) + "] but was [" + adType + "]."
        );
        break;
    }
    return adMetadataOut;
  };

  /**
   * @private
   * @class Analytics#translateErrorCode
   * @classdesc Translates the error code provided into the corresponding error message.
   * @property {number} code The error code
   * @returns {string} The error string associated with the error code number.
   */
  var translateErrorCode = function(code)
  {
    var errorMessage;
    if (_.has(ERROR_CODE, code))
    {
      errorMessage = ERROR_CODE[code];
    }
    else
    {
      logErrorString("Error code not recognized. Error code provided was: " + code);
    }
    return errorMessage;
  };

  /**
   * @private
   * @class Analytics#logErrorString
   * @classdesc Helper function to return an error string with the Analytics Constants prefix.
   * @property {string} origStr the error string
   * @returns {string} The new error string.
   */
  var logErrorString = function(origStr)
  {
    OO.log("Error AnalyticsConstants: " + origStr);
  };

  OO.Analytics.EVENT_DATA = EVENT_DATA;
}

if (!OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS)
{
  /**
   * @public
   * @constant
   * @type string[]
   * @description This is a list of the required functions for a plugin to
   * be considered valid by the Analytics Framework.
   * <ul>
   *    <li>getName() - Returns a non-empty string containing the name of the plugin.</li>
   *    <li>getVersion() - Returns a non-empty string containing the version of the plugin.</li>
   *    <li>setPluginID(id) - A function for setting the plugin id on an instance of the plugin.</li>
   *    <li>getPluginID() - Returns the plugin id assigned by setPluginID().</li>
   *    <li>init() - A function for initializing the plugin.</li>
   *    <li>setMetadata(metadata) - A function for passing metadata specific to this plugin.</li>
   *    <li>destroy() - Destructor function for cleanup.</li>
   *    <li>processEvent(eventName, paramArray) - A function to receive events that are published through the framework.</li>
   * </ul>
   */
  var REQUIRED_PLUGIN_FUNCTIONS =
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
