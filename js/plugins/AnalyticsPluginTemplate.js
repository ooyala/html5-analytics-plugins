//This file is the shell of a plugin for the analytics framework

var AnalyticsPluginTemplate = function (framework)
{
  var _framework = framework;
  const name = "template";
  const version = "v1";
  var id;

  /**
   * [getName description]
   * @return {[type]} [description]
   */
  this.getName = function ()
  {
    return name;
  };

  /**
   * [getVersion description]
   * @return {[type]} [description]
   */
  this.getVersion = function ()
  {
    return version;
  };

  /**
   * [function description]
   * @param  {[type]} newID [description]
   * @return {[type]}       [description]
   */
  this.setPluginID = function(newID)
  {
    id = newID;
  }

  /**
   * [function description]
   * @return {[type]} [description]
   */
  this.getPluginID = function()
  {
    return id;
  }

  /**
   * [init description]
   * @param  {[type]} metadata [description]
   * @return {[type]}          [description]
   */
  this.init = function (metadata)
  {

  };

  /**
   * [makeActive description]
   * @return {[type]} [description]
   */
  this.makeActive = function ()
  {

  }

  /**
   * [makeInactive description]
   * @return {[type]} [description]
   */
  this.makeInactive = function ()
  {

  }

  /**
   * [function description]
   * @param  {[type]} msgName [description]
   * @param  {[type]} params  [description]
   * @return {[type]}         [description]
   */
  this.processEvent = function(msgName, params)
  {

  }

  /**
   * [processRecordedEvents description]
   * @param  {[type]} recordedEvents [description]
   * @return {[type]}                [description]
   */
  this.processRecordedEvents = function (recordedEvents)
  {

  }

  /**
   * [destroy description]
   * @return {[type]} [description]
   */
  this.destroy = function ()
  {

  }
};

module.exports = AnalyticsPluginTemplate;

if (OO && OO.AnalyticsPluginTemplate && typeof (OO.AnalyticsFramework.registerPlugin) === 'function' )
{
  OO.AnalyticsFramework.registerPlugin(AnalyticsPluginTemplate);
}
