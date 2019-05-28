require('../../html5-common/js/utils/InitModules/InitOOUnderscore.js');
require('./InitAnalyticsNamespace.js');
require('./AnalyticsConstants.js');

/**
 * @public
 * @class OO.Analytics.RecordedEvent
 * @classdesc Store the information for a published event, including the time
 * was sent.
 * @param  {int}    timeStamp The time the event was published
 * @param  {string} eventName The event name
 * @param  {Array}  params The parameters passed in with the event
 */
OO.Analytics.RecordedEvent = function (timeStamp, eventName, params) {
  this.timeStamp = timeStamp;
  this.eventName = eventName;
  this.params = params;
};

/**
 * @public
 * @class OO.Analytics.Framework
 * @classdesc The Analytics Framework's goal is to abstract capturing all the events
 * in code for the purpose of analytics reporting (from any source). When a plugin
 * is registered with the framework, it will be validated, registered and automatically
 * receive all messages that are published to the framework.  The list of events that are
 * currently supported are located in AnalyticsConstants.js.  That file also contains
 * all the methods that need to be implemented by a plugin for it to be considered valid.
 */
OO.Analytics.Framework = function () {
  let { _ } = OO;
  let _registeredPlugins = {};
  let _recordedEventList = [];
  let _recording = true;
  let _pluginMetadata;
  let _eventExistenceLookup = {};
  let _uniquePluginId = 0;
  let _isPublishingEvents = true;
  const MAX_PLUGINS = 20; // this is an arbitrary limit but we shouldn't ever reach this (not even close).
  const MAX_EVENTS_RECORDED = 500;

  /**
   * Get a list of plugin ids for the currently registered plugins.
   * @public
   * @method OO.Analytics.Framework#getPluginIDList
   * @returns {Array} An array of plugin IDs.
   */
  this.getPluginIDList = function () {
    const list = [];
    if (_registeredPlugins) {
      for (const pluginID in _registeredPlugins) {
        list.push(pluginID);
      }
    }
    return list;
  };

  /**
   * Helper function to create consistent error messages.
   * @private
   * @method OO.Analytics.Framework#createErrorString
   * @param  {string} errorDetails The error details.
   * @returns {string}              The new error message.
   */
  const createErrorString = function (errorDetails) {
    return `ERROR Analytics Framework: ${errorDetails}`;
  };

  /**
   * Helper function for readability mainly. Binds private functions to 'this' instance
   * of Framework, to give access to private variables.
   * @private
   * @method OO.Analytics.Framework#privateMember
   * @param  {function} functionVar The function to be bound to this instance of Framework
   * @return {function}             Bound function.
   */
  const privateMember = _.bind(function (functionVar) {
    if (!_.isFunction(functionVar)) {
      throw (createErrorString(`Trying to make private function but ${functionVar} is not a function.`));
    }
    return _.bind(functionVar, this);
  }, this);

  /**
   * Return the instance of the plugin for a given id. This is for convinience
   * since the factory and instance are stored together in an object.
   * @private
   * @method OO.Analytics.Framework#getPluginInstance
   * @param  {string} pluginID The id of the plugin.
   * @return {object}          Returns the plugin instance.
   */
  const getPluginInstance = privateMember((pluginID) => {
    let toReturn;
    if (_registeredPlugins && _registeredPlugins[pluginID]) {
      toReturn = _registeredPlugins[pluginID].instance;
    }
    return toReturn;
  });


  /**
   * Clears the list of recorded events.
   * @private
   * @method OO.Analytics.Framework#clearRecordedEvents
   */
  const clearRecordedEvents = privateMember(() => {
    _recordedEventList = [];
  });

  /**
   * Enable recording of events.
   * @private
   * @method OO.Analytics.Framework#startRecordingEvents
   */
  const startRecordingEvents = privateMember(() => {
    _recording = true;
  });

  /**
   * Disable recording of events.
   * @private
   * @method OO.Analytics.Framework#stopRecordingEvents
   */
  const stopRecordingEvents = privateMember(() => {
    _recording = false;
  });

  /**
   * Adds event and params to list of recorded events.  Plugins can later grab
   * this info in case events are published before the plugin is ready to process
   * them.
   * @private
   * @method OO.Analytics.Framework#recordEvent
   * @param  {string} eventName Event name to record
   * @param  {Array}  params    The params sent along with the event.
   */
  const recordEvent = privateMember((eventName, params) => {
    if (_recording && _recordedEventList.length < MAX_EVENTS_RECORDED) {
      const timeStamp = new Date().getTime();
      const eventToRecord = new OO.Analytics.RecordedEvent(timeStamp, eventName, params);
      _recordedEventList.push(eventToRecord);
    } else {
      stopRecordingEvents();
    }
  });

  /**
   * Validates that a plugin instance has all the correct functions.
   * @public
   * @method OO.Analytics.Framework#validatePlugin
   * @param  {object} plugin Plugin instance to be validated
   * @returns {boolean}       Return true if plugin contains all the correct functions.
   */
  this.validatePlugin = function (plugin) {
    let isValid = true;
    if (!plugin) {
      isValid = false;
      OO.log(createErrorString('Plugin has falsy value and is not valid. Actual value: '), plugin);
    }

    // ///////////////////////////////////////////////////////////////////////////////////////////
    // /IMPORTANT: This should be the only function to break the rule of using safeFunctionCall
    // /           for calling plugin functions, since it's checking if the plugin is valid to
    // /           begin with.
    // ///////////////////////////////////////////////////////////////////////////////////////////

    if (isValid) {
      // test if all required functions are in the plugin
      for (let i = 0; i < OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS.length; i++) {
        const reqFunc = OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS[i];
        if (!plugin.hasOwnProperty(reqFunc) || typeof plugin[reqFunc] !== 'function') {
          isValid = false;
          if (plugin.getName && typeof plugin.getName === 'function') {
            try {
              OO.log(createErrorString(`Plugin '${plugin.getName()}' missing function: ${reqFunc}`));
            } catch (e) {
              OO.log(createErrorString(`Plugin missing function: ${reqFunc}`));
            }
          } else {
            OO.log(createErrorString(`Plugin missing function: ${reqFunc}`));
          }
          break;
        }
      }

      // if it's still valid check whether the getName returns a non empty string
      if (isValid) {
        try {
          const name = plugin.getName();
          if (!name || !_.isString(name)) {
            OO.log(createErrorString(`Plugin does not have 'string' as 
            return type of getName() or is empty string`));
            isValid = false;
          }
        } catch (e) {
          OO.log(createErrorString('Plugin throws error on call to getName'));
          isValid = false;
        }
      }

      // if it's still valid check whether the getVersion returns a non empty string
      if (isValid) {
        try {
          const version = plugin.getVersion();
          if (!version || !_.isString(version)) {
            OO.log(createErrorString(`Plugin does not have 'string' 
            as return type of getVersion() or is empty string`));
            isValid = false;
          }
        } catch (e) {
          OO.log(createErrorString('Plugin throws error on call to getVersion'));
          isValid = false;
        }
      }
    }
    return isValid;
  };

  /**
   * Check if function name exists in the list of require functions for plugins.
   * Outputs error message if it doesn't exist.
   * @private
   * @method OO.Analytics.Framework#safeFunctionCall
   * @param  {string} funcName Name of the function to check.
   */
  const debugCheckFunctionIsInRequiredList = privateMember((funcName) => {
    if (!_.contains(OO.Analytics.REQUIRED_PLUGIN_FUNCTIONS, funcName)) {
      OO.log(createErrorString(`Calling function '${funcName}' in framework code and it's not in 
      the REQUIRED_PLUGIN_FUNCTIONS list.`));
    }
  });

  /**
   * This function does several things:
   * -Safely call a function on an instance of a plugin.
   * -Elminates checking to see if function exists.
   * -If an error is thrown while calling the function, this will catch it and
   * output a message and the framework can continue running.
   * -If OO.DEBUG is true, safeFunctionCall will check if the function being called
   * is in the list of required functions. If it's not, then it will output a message.
   * Only functions in the required list should be called in the framework code.
   * @private
   * @method OO.Analytics.Framework#safeFunctionCall
   * @param  {object} plugin   Plugin instance to call function on.
   * @param  {string} funcName Name of function to call.
   * @param  {array}  params   The parameters to pass into the function.
   * @return {varies}          Returns the function's return value. If an error occurred, returns null.
   */
  const safeFunctionCall = privateMember((plugin, funcName, params) => {
    if (OO.DEBUG) {
      debugCheckFunctionIsInRequiredList(funcName);
    }

    try {
      if (_.isFunction(plugin[funcName])) {
        // eslint-disable-next-line prefer-spread
        return plugin[funcName].apply(plugin, params);
      }
    } catch (err) {
      try {
        if (plugin && _.isFunction(plugin.getName)) {
          OO.log(createErrorString(`Error occurred during call to function
           '${funcName}' on plugin '${plugin.getName()}'\n`));
          OO.log(err);
        }
      } catch (e) {
        OO.log(createErrorString(`Error occurred during call to function 
        '${funcName}' on plugin\n`, err));
      }
    }

    return null;
  });

  /**
   * Create a unique id for a given plugin/factory. In case someone needs to register
   * multiple of the same plugin or two plugins  have the same name, this creates
   * unique ids for each.
   * @private
   * @method OO.Analytics.Framework#createPluginId
   * @param  {object} plugin Instance of plugin to create id for.
   * @return {string}        The plugin id.
   */
  const createPluginId = privateMember((plugin) => {
    let id = null;
    let error;
    // Plugin ID's are create using sequential numbers. Nothing fancy but this
    // way the framework can keep track of how many have been registered. There is
    // a chance that someone could have an infinite loop where plugins get registered
    // unregistered all the time, so this will output some error messages to help
    // debug that.
    if (plugin) {
      const name = safeFunctionCall(plugin, 'getName');
      const version = safeFunctionCall(plugin, 'getVersion');
      if (name && version) {
        id = `${_uniquePluginId}_${name}_${version}`;
        // we shouldn't have any naming conflicts but just in case, throw an error
        if (!_registeredPlugins[id]) {
          _uniquePluginId += 1;
        } else {
          OO.log(createErrorString(`Failed to create a unique name for plugin ${name}_${version}`));
          id = null;
        }

        if (_uniquePluginId > MAX_PLUGINS) {
          OO.log(createErrorString(`You have tried to create more than 
          ${MAX_PLUGINS} unique plugin ids. There is probably an infinite loop or some other error.`));
        }
      }
    }
    return id;
  });

  /**
   * Helper function to give a plugin it's correct set of metadata.
   * @private
   * @method OO.Analytics.Framework#passMetadataToPlugin
   * @param  {object} plugin The plugin instance to give the metadata to
   */
  const passMetadataToPlugin = privateMember((plugin) => {
    if (_pluginMetadata) {
      const pluginName = safeFunctionCall(plugin, 'getName');
      if (!pluginName) {
        OO.log(createErrorString('Trying to pass in metadata to plugin that does not have valid name'));
        return;
      }

      const metadataForThisPlugin = _pluginMetadata[pluginName];
      safeFunctionCall(plugin, 'setMetadata', [metadataForThisPlugin]);
    }
  });


  /**
   * Remove plugin from the framework. All instances will stop receiving messages from
   * the framework.
   * @public
   * @method OO.Analytics.Framework#unregisterPlugin
   * @param  {string}  pluginIDToRemove Plugin id to be removed
   * @returns {boolean}                  Return true if plugin was found and removed.
   */
  this.unregisterPlugin = function (pluginIDToRemove) {
    let removedSuccessfully = false;

    if (pluginIDToRemove && _registeredPlugins && _registeredPlugins[pluginIDToRemove]) {
      const plugin = getPluginInstance(pluginIDToRemove);
      safeFunctionCall(plugin, 'destroy');
      delete _registeredPlugins[pluginIDToRemove];
      removedSuccessfully = true;
    }

    return removedSuccessfully;
  };

  /**
   * Set the metadata for all plugins. Each plugin will only receive the data
   * pluginMetadata["myPluginName"]. This can only be set once per framework instance.
   * @public
   * @method OO.Analytics.Framework#setPluginMetadata
   * @param  {object}  pluginMetadata Object containing metadata for all plugins
   * @returns {boolean}                Return true if metadata is valid and has not been set before.
   */
  this.setPluginMetadata = function (pluginMetadata) {
    let success = false;
    // just a warning if we are setting the metadata multiple times. This may be valid
    // if so, this can be removed.
    if (_pluginMetadata) {
      OO.log(createErrorString('Trying to run setPluginMetadata more than once. Ignoring new data.'));
    }

    if (_.isObject(pluginMetadata)) {
      // set the metadata and then set it on any plugin that is already registered
      _pluginMetadata = pluginMetadata;
      const pluginList = this.getPluginIDList();
      for (let i = 0; i < pluginList.length; i++) {
        const plugin = getPluginInstance(pluginList[i]);
        passMetadataToPlugin(plugin);
      }

      success = true;
    } else {
      OO.log(createErrorString(`Calling setPluginMetadata without valid metadata object.
       Defaulting to no metadata`));
    }

    return success;
  };

  /**
   * Return whether or not a plugin is active and able to receive events.
   * @public
   * @method OO.Analytics.Framework#isPluginActive
   * @param {string}  pluginID Plugin id to check
   * @returns {boolean}         Returns true if plugin is active. If plugin isn't registered, it will return false.
   */
  this.isPluginActive = function (pluginID) {
    if (pluginID
      && _registeredPlugins
      && _registeredPlugins[pluginID]
      && _.isBoolean(_registeredPlugins[pluginID].active)) {
      return _registeredPlugins[pluginID].active;
    }
    return false;
  };

  /**
   * Set a plugin to be active and receive messages.
   * @public
   * @method OO.Analytics.Framework#makePluginActive
   * @param {string}   pluginID Plugin id to set to active
   * @returns {boolean}          Returns true if plugin found and was able to be activated.
   */
  this.makePluginActive = function (pluginID) {
    let success = false;
    if (pluginID && _registeredPlugins && _registeredPlugins[pluginID]) {
      _registeredPlugins[pluginID].active = true;
      success = true;
    }
    return success;
  };

  /**
   * Set a plugin to be inactive.
   * @public
   * @method OO.Analytics.Framework#makePluginInactive
   * @param  {string}  pluginID Plugin id to set to inactive
   * @returns {boolean}          Returns true if plugin found and was able to be deactivated.
   */
  this.makePluginInactive = function (pluginID) {
    let success = false;
    if (pluginID && _registeredPlugins && _registeredPlugins[pluginID]) {
      _registeredPlugins[pluginID].active = false;
      success = true;
    }
    return success;
  };

  /**
   * Helper function to flatten an object with a nested objects into a single array of values.
   * @public
   * @method OO.Analytics.Framework#flattenEvents
   * @param {object} eventObject The event key-value pair to flatten
   * @returns {string[]} An array of strings representing the flattened values of the object.
   */
  this.flattenEvents = function (eventObject) {
    const eventArray = [];
    const eventKeys = _.keys(eventObject);
    for (let i = 0; i < eventKeys.length; i++) {
      const eventKey = eventKeys[i];
      const eventValue = eventObject[eventKey];
      if (typeof eventValue === 'object') {
        const innerEvents = this.flattenEvents(eventValue);
        for (let j = 0; j < innerEvents.length; j++) {
          const innerEvent = innerEvents[j];
          eventArray.push(innerEvent);
        }
      } else {
        eventArray.push(eventValue);
      }
    }
    return eventArray;
  };

  /**
   * Helper function to create the events lookup dictionary.
   * @public
   * @method OO.Analytics.Framework#createEventDictionary
   * @returns {object|null} The created events dictionary. Returns null if there are any errors.
   */
  this.createEventDictionary = function () {
    let eventDictionary = null;
    const eventArray = this.flattenEvents(OO.Analytics.EVENTS);
    if (eventArray && eventArray instanceof Array) {
      eventDictionary = {};
      for (let i = 0; i < eventArray.length; i++) {
        const eventName = eventArray[i];
        eventDictionary[eventName] = true;
      }
    }
    return eventDictionary;
  };

  _eventExistenceLookup = this.createEventDictionary();

  /**
   * The analytics framework will stop publishing events to registered plugins
   * when the publishEvent() method is called. The events will also not be recorded.
   * @public
   * @method OO.Analytics.Framework#stopPublishingEvents
   */
  this.stopPublishingEvents = function () {
    _isPublishingEvents = false;
  };

  /**
   * The analytics framework will resume publishing events to registered plugins
   * and recording events can resume.
   * @public
   * @method OO.Analytics.Framework#resumePublishingEvents
   */
  this.resumePublishingEvents = function () {
    _isPublishingEvents = true;
  };
  /**
   * Publish an event to all registered and active plugins.
   * @public
   * @method OO.Analytics.Framework#publishEvent
   * @param  {string} eventName Name of event to publish
   * @param  {Array}  params    Parameters to pass along with the event.
   * @returns {boolean}          Return true if message is in OO.Analytics.EVENTS and was successfully published.
   */
  this.publishEvent = function (eventName, params) {
    if (!_isPublishingEvents) {
      return false;
    }

    let eventPublished = false;
    if (_eventExistenceLookup[eventName]) {
      // if the params don't come in as an Array then create an empty array to pass in for everything.
      if (!_.isArray(params)) {
        // eslint-disable-next-line
        params = [];
      }
      // record the message
      if (_recording) {
        recordEvent(eventName, params);
      }
      // propogate the message to all active plugins.
      let pluginID;
      for (pluginID in _registeredPlugins) {
        if (this.isPluginActive(pluginID)) {
          const plugin = getPluginInstance(pluginID);
          safeFunctionCall(plugin, 'processEvent', [eventName, params]);
        }
      }
      eventPublished = true;
    } else {
      OO.log(createErrorString(`Event '${eventName}' being published and it's not 
      in the list of OO.Analytics.EVENTS`));
    }
    return eventPublished;
  };

  /**
   * Destructor/cleanup for OO.Analytics.Framework.
   * @public
   * @method OO.Analytics.Framework#destroy
   */
  this.destroy = privateMember(function () {
    OO.Analytics.UnregisterFrameworkInstance(this);
    for (const pluginID in _registeredPlugins) {
      this.unregisterPlugin(pluginID);
    }
    _ = null;
    _registeredPlugins = null;
    _recordedEventList = null;
    _pluginMetadata = null;
    _eventExistenceLookup = null;
  });

  /**
   * Returns a shallow copy array of the currently stored recordedEvents in chronological
   * order.
   * @public
   * @method OO.Analytics.Framework#getRecordedEvents
   * @returns {Array} Shallow copy of recordedEvents in chronological order.
   */
  this.getRecordedEvents = function () {
    if (_recordedEventList) {
      return _.clone(_recordedEventList);
    }

    return [];
  };

  /**
   * Register plugin as a factory. It will be validated and an instance of it will
   * be maintained internally.  The plugin will then be able to receive events
   * from the framework. Multiple of the same plugin factory can be registered.
   * Each one will have its own unique plugin id.
   * @public
   * @method OO.Analytics.Framework#registerPlugin
   * @param  {function} PluginFactory Plugin factory function
   * @returns {string}                 Returns a unique plugin id for this plugin factory.
   */
  this.registerPlugin = function (PluginFactory) {
    let pluginID;
    let plugin;
    let errorOccured = false;

    // sanity check
    if (!PluginFactory) {
      OO.log(createErrorString('Trying to register plugin class that is a falsy value.'));
      errorOccured = true;
    }

    if (!errorOccured) {
      try {
        plugin = new PluginFactory(this);
      } catch (error) {
        OO.log(error);
        OO.log(createErrorString('Error was thrown during plugin creation.'));
        errorOccured = true;
      }
    }

    if (!errorOccured) {
      if (!this.validatePlugin(plugin)) {
        errorOccured = true;
      } else {
        // initialize the plugin. If we have metadata then give it to the plugin. Otherwise it will be sent in Analytics.Framework.setPluginMetadata;
        safeFunctionCall(plugin, 'init');
        if (_pluginMetadata) {
          passMetadataToPlugin(plugin);
        }
      }
    }

    if (!errorOccured) {
      pluginID = createPluginId(plugin);
      if (!pluginID) {
        errorOccured = true;
      } else if (!_registeredPlugins[pluginID]) {
        _registeredPlugins[pluginID] = { factory: PluginFactory, instance: plugin, active: true };
        safeFunctionCall(plugin, 'setPluginID', [pluginID]);
      }
    }

    if (errorOccured) {
      if (pluginID) {
        OO.log(createErrorString(`'${pluginID}' is not valid and was not registered.`));
      } else {
        const pluginName = safeFunctionCall(plugin, 'getName');
        if (pluginName) {
          OO.log(createErrorString(`'${pluginName}' is not valid and was not registered.`));
        } else {
          OO.log(createErrorString('Plugin validation failed and was not registered.'));
        }
      }
    }

    return pluginID;
  };

  // Register this instance so it will register all the plugin factories currently loaded.
  OO.Analytics.RegisterFrameworkInstance(this);
};
