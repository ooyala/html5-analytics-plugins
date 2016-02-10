require("./InitAnalyticsNamespace.js");

if (!OO.Analytics.EVENTS)
{
  const EVENTS =
  {
    //messages for main video
    //TODO see if we need to distinguish between video and ad messages
    VIDEO_FIRST_PLAY_REQUESTED : 'video_first_play_requested',
    VIDEO_PLAY_REQUESTED : 'video_play_requested',
    VIDEO_PAUSE_REQUESTED : 'video_pause_requested',
    VIDEO_RESUME_REQUESTED : 'video_resume_requested',
    VIDEO_PLAYING : 'video_playing',
    VIDEO_PAUSED : 'video_paused'
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
    "init",
    "destroy",
    "makeActive",
    "makeInactive",
    "processRecordedEvents"
  ];
  OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS = REQUIRED_PLUGIN_FUNCTIONS;
}
