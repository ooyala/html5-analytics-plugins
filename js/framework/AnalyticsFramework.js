require("../../html5-common/js/classes/message_bus.js")
require("../../html5-common/js/utils/InitModules/InitOOUnderscore.js")
require("./InitAnalyticsNamespace.js");
require("./AnalyticsConstants.js");

OO.Analytics.Framework = function()
{
  var _registeredPlugins = {};
  var _mb = new OO.MessageBus();
  var _recordedEvents = [];

  var _ = OO._;

  var _uniquePluginId = 0;
  const MAX_PLUGINS = 20; //this is an arbitrary limit but we shouldn't ever reach this (not even close).

  /**
   * Helper function to make functions private to GoogleIMA variable for consistency
   * and ease of reading.
   */
  var privateMember = _.bind(function(functionVar)
  {
    if (!_.isFunction(functionVar))
    {
      throw (createErrorString("Trying to make private function but " + functionVar + " is not a function."));
      return;
    }
    return _.bind(functionVar, this);
  }, this);


  this.RecordedEvent = function (timeStampIn, eventDataIn)
  {
    this.timeStamp = timeStampIn;
    this.eventData = eventDataIn;
  }

  var recordEvent = function(eventData)
  {
    var timeStamp = new Date().getTime();
    var eventToRecord = new RecordedEvent(timeStamp, eventData);
    recordedEvents.push(eventToRecord);
  }

  var clearRecordedEvents = function()
  {
    _recordedEvents = [];
  }

  var startRecordingEvents = function()
  {

  }

  var stopRecordingEvents = function()
  {

  }

  /**
   * [function description]
   * @param  {[type]} pluginFactory [description]
   * @return {[type]}           [description]
   */
  this.registerPlugin = function(pluginFactory)
  {
    var pluginID;
    if (!pluginFactory)
    {
      OO.log(createErrorString("Trying to register plugin that has falsy value."));
      return pluginID;
    }

    var errorOccured = false;
    var isValidPlugin = this.validatePluginFactory(pluginFactory);
    console.log( "is valid: " + isValidPlugin);
    if (isValidPlugin)
    {
      try
      {
        var plugin = new pluginFactory();
        pluginID = createPluginId(plugin);
        console.log("curr id: " + pluginID);
        if (!_registeredPlugins[pluginID])
        {
          _registeredPlugins[pluginID] = pluginFactory;
        }

      }
      catch (error)
      {
        OO.log(error);
        errorOccured = true;
      }
    }
    else
    {
      errorOccured = true;
    }

    if (errorOccured)
    {
      OO.log(createErrorString("\'" + pluginID + "\' is not valid and was not registered."));
    }

    return pluginID;
  };

  this.unregisterPlugin = function(pluginIDToRemove)
  {
    var removedSuccessfully = false;
    if (pluginToRemove && _registeredPlugins && _registeredPlugins.hasOwnProperty(pluginToRemove))
    {
      delete _registeredPlugins[pluginToRemove];
      removedSuccessfully = true;
    }

    return removedSuccessfully;
  };

  /**
   * [privateMember description]
   * @param  {[type]} function(plugin [description]
   * @return {boolean} True if plugin contains all the correct functions and
   *                        public variables.
   */
  this.validatePluginFactory = function(factory)
  {
    var isValid = false;
    if (factory && typeof factory === 'function')
    {
      isValid = true;
      //TODO do we need to register factories or plugins?
      var toValidate = new factory();
      if (!toValidate)
      {
        isValid = false;
        OO.log("Plugin factory return falsy value for plugin.");
      }

      if (isValid)
      {
        for ( var i = 0; i < OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++)
        {
          var reqFunc = OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS[i];
          if(!toValidate.hasOwnProperty(reqFunc) || typeof toValidate[reqFunc] !== 'function')
          {
            isValid = false;
            if(toValidate.getName && typeof toValidate.getName === 'function')
            {
              OO.log("Plugin \'" + toValidate.getName() + "\' missing function: " + reqFunc);
            }
            else
            {
              OO.log("Plugin missing function: " + reqFunc);
            }
            break;
          }
        }
      }

      //if it's still valid check whether the getName returns a non empty string
      if (isValid)
      {
        var name = toValidate.getName();
        if (!name || typeof name !== 'string')
        {
          OO.log("Plugin does not have \'string\' as return type of getName() or is empty string");
          isValid = false;
        }
      }

      if (isValid)
      {
        var version = toValidate.getVersion();
        if (!version || typeof version !== 'string')
        {
          OO.log("Plugin does not have \'string\' as return type of getVersion() or is empty string");
          isValid = false;
        }
      }
    }
    return isValid;
  };

  /**
   * Get a list of currently registered plugins.
   * @return {array} An array of plugin IDs.
   *
   */
  this.getPluginList = function()
  {
    var list = [];
    for ( property in _registeredPlugins )
    {
      list.push()
    }
    return list;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin is currently active and interpreting messages.
   */
  this.isPluginActive = function(pluginID)
  {
    return false;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin found and was able to be activated.
   */
  this.makePluginActive = function(pluginID)
  {
    return false;
  };

  /**
   * [function description]
   * @return {boolean} Returns true if plugin found and was able to be deactivated.
   */
  this.makePluginInactive = function(pluginID)
  {
    return false;
  };

  /**
   * [function description]
   * @param  {[type]} msgName [description]
   * @param  {[type]} params  [description]
   * @return {[type]}         [description]
   */
  this.publishMessage = function(msgName, params)
  {
    //TODO only publish messages for active plugins
    _mb.publish(msgName, params);
  }

  /**
   * In case someone needs to register multiple of the same plugin, this creates unique ids for each.
   * @param  {[type]} plugin [description]
   * @return {[type]}                 [description]
   */
  var createPluginId = privateMember(function(plugin)
  {
    var id = null;
    if (plugin)
    {
      var name = plugin.getName();
      var version = plugin.getVersion();
      if (name && version)
      {
        if (_uniquePluginId < MAX_PLUGINS)
        {
          id = _uniquePluginId + "_" + name + "_" + version;
          //we shouldn't have any naming conflicts but just in case, throw an error
          if (_registeredPlugins[id])
          {
              throw createErrorString("Failed to create a unique name for plugin " + name + "_" + version);
          }
          _uniquePluginId++;
        }
        else
        {
          throw createErrorString("you have tried to create more than " + MAX_PLUGINS + " unique plugin ids. There is probably an infinite loop or some other error.");
        }
      }
    }
    return id;
  });

 /**
  * [function description]
  * @param  {[type]} orgString [description]
  * @return {[type]}           [description]
  */
  var createErrorString = function(orgString)
  {
    return "ERROR Analytics Framework: " + orgString;
  }


  /**
   * [function description]
   * @param  {[type]}   msg      [description]
   * @param  {Function} callback [description]
   * @param  {[type]}   pluginID [description]
   * @return {boolean}           True if callback was successfully unregistered for pluginID
   */
  this.registerForMessage = function(msg, callback, pluginID)
  {
    return false;
  }

  /**
   * [function description]
   * @param  {[type]}   msg      [description]
   * @param  {Function} callback [description]
   * @param  {[type]}   pluginID [description]
   * @return {boolean}           True if callback was successfully unregistered for pluginID
   */
  this.unregisterForMessage = function(msg, callback, pluginID)
  {
    return false;
  }

  this.getRegisteredMessageListFor = function(pluginID)
  {
    var list = [];
    return list;
  }
};
