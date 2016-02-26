require("./InitAnalyticsNamespace.js");

/**
 * If Analytics.EVENTS or Analytics.REQUIRED_PLUGIN_FUNCTIONS do not already
 * exist, create them.
 */

if (!OO.Analytics.EVENTS)
{
  const EVENTS =
  {
    //messages for main video
    //TODO see if we need to distinguish between video and ad messages
    VIDEO_PLAYER_CREATED :          'video_player_created',
    VIDEO_FIRST_PLAY_REQUESTED :    'video_first_play_requested',
    VIDEO_PLAY_REQUESTED :          'video_play_requested',
    VIDEO_PAUSE_REQUESTED :         'video_pause_requested',
    VIDEO_PLAYING :                 'video_playing',
    VIDEO_PAUSED :                  'video_paused',
    VIDEO_ENDED :                   'video_ended',
    VIDEO_REPLAY_REQUESTED :        'video_replay_requested',
    VIDEO_SOURCE_CHANGED:           'video_source_changed',
    VIDEO_STREAM_METADATA_UPDATED:  'video_stream_metadata_updated',
    VIDEO_CONTENT_METADATA_UPDATED: 'video_content_metadata_updated'
  };
  OO.Analytics.EVENTS = EVENTS;
}


if (!OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS)
{
  //list of required functions for plugins
  const REQUIRED_PLUGIN_FUNCTIONS =
  [
    "getName",
    "getVersion",
    "setPluginID",
    "getPluginID",
    "init",
    "setMetadata",
    "destroy",
    "makeActive",
    "makeInactive",
    "isActive",
    "processEvent"
  ];
  OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS = REQUIRED_PLUGIN_FUNCTIONS;
}
