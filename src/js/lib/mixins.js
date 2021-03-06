/**
* @Author: Colin Osterhout <ctosterhout>
* @Date:   2016-06-21T08:49:08-08:00
* @Email:  ctosterhout@alaska.edu
* @Project: BERT
* @Last modified by:   ctosterhout
* @Last modified time: 2017-06-09T11:36:02-08:00
* @License: Released under MIT License. Copyright 2016 University of Alaska Southeast.  For more details, see https://opensource.org/licenses/MIT
*/

define([
    'underscore'
], function (_) {
    'use strict';

    // Internal error function used for debug only within these mixed in functions
    var assertDefined = function (val, key) {
            if (_.isUndefined(val)) {
                throw new Error("arguments[" + key + "] is undefined");
            }
        },

        // Create the opening tag for an element
        //
        // Arguments:
        //     name (string) - Type of element to create
        //     selfClose (boolean) - If true, then add closing slash (e.g. <img />)
        //     attributes (object) - Set of element attributes to write out
        //
        // Returns a string with the opening (and possibly self-closing) tag
        openTag = function (name, selfClose, attributes) {
            var aAttr = _.map(attributes, function (value, key) {
                if (value) {
                    return key + '=' + "'" + _.escape(value) + "'";
                }
            });

            return '<' + name + ' ' + aAttr.join(' ') + (selfClose ? ' /' : '') + '>';
        },

        // Create the closing tag for an element
        //
        // Arguments:
        //     name (string) - Type of element to create closing tag for
        //
        // Returns a string with the closing tag for an element
        closeTag = function (name) {
            return '</' + name + '>';
        },

        // Get a random start integer for use with named callbacks
        nonce = (function (min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }(0, 1000000));

    _.mixin({
        // Create a named callback function for use in external script loading which require a global callback
        //
        // Arguments:
        //     func (function) - Function to put in the global space
        //
        // Returns:
        //     string - name of global function
        //
        // Throws error object if func is not a function.  Removes itself from the global namespace once invoked
        createNamedCallback: function (func) {
            // Create the random function name
            var nameFn = "BERT_" + nonce;

            if (!_.isFunction(func)) {
                throw new Error('Passed in argument is not a function');
            }

            // Increment the global counter
            nonce += 1;

            // Assign wrapped function to the global namespace
            // The wrapped function removes itself from the global namespace once invoked
            window[nameFn] = _.wrap(func, function (funcWrap) {
                funcWrap.apply(arguments);
                delete window[nameFn];
            });

            // return the name of the function
            return nameFn;
        },
        // Check to see if an options array has all the necessary keys
        //
        // Arguments:
        //     options (object) - Object to check
        //     argMandatory (array) - Set of keys to verify exist within options
        //
        // Returns:
        //     options (unchanged)
        //
        // Throws Error object if required keys do not exist within options object
        checkArgMandatory: function (options, argMandatory) {
            _.map(arguments, assertDefined);

            var argMissing =  _.difference(argMandatory, _.keys(options));

            if (!(_.isEmpty(argMissing))) {
                throw new Error('Arguments missing: ' + argMissing.toString());
            }

            return options;
        },

        // Returns set of options whose keys are within the set of allowed keys
        //
        // Arguments:
        //     options (object) - Object to check
        //     argAllowed (array) - Set of keys which can be passed through
        //     fnAlert <two patterns>:
        //         (function) - Optional function to call with notification of extra argument
        //         (boolean) - if true, logs notification of extra argument to console
        //
        // Returns copy of the original object with selected keys only
        filterArg: function (options, argAllowed, fnAlert) {
            _.map(Array.prototype.slice.call(arguments, 0, 2), assertDefined);

            if (fnAlert === true) {
                fnAlert = _.bind(console.log, console);
            } else if (!(_.isFunction(fnAlert))) {
                fnAlert = _.noop;
            }

            fnAlert('Extra arguments: ' +
                _.difference(_.keys(options), argAllowed).toString()
                );

            return _.pick(
                options,
                argAllowed
            );
        },

        // Tokenize a selected value within an object based on it's key and string separator
        //
        // Arguments:
        //     options (object) - Object to operate upon
        //     key (string) - Key which should be split up into separate array items
        //
        // Returns [potentially] modified original object
        splitArg: function (options, key, separator) {
            // Only split if there's really an option there by this key
            if (_.has(options, key)) {
                options[key] = _.isString(options[key])
                    ? options[key].split(_.isUndefined(separator) ? ',' : separator)
                    : options[key];
            }

            return options;
        },

        // Move the value for the specified keys to different keys. Any value existing at the new location is overwritten. The value accessed by the old key is deleted.
        //
        // Arguments:
        //     options (object) - Object to check
        //     objKeyMap (object) - object containing key: newkey combination in the form of
        //      {
        //          oldkey1: newkey1,
        //          oldkey2: newkey2
        //      }
        //
        // Returns [potentially] modified original object
        swapKeys: function (options, objKeyMap) {
            _.map(arguments, assertDefined);

            _.map(objKeyMap, function (val, key) {
                options[val] = options[key];
                delete options[key];
            });

            return options;
        },

        // Replace the value for the specified key to different value based on a map. Exact matches only.
        //
        // Arguments:
        //     options (object) - Object to check
        //     objValueMap (object) - object containing oldvalue: newvalue combination
        //      {
        //          oldvalue1: newvalue1,
        //          oldvalue2: newvalue2,
        //      }
        //
        // Returns [potentially] modified original object
        swapValues: function (options, key, objValueMap) {
            // Find out if the options object has the specified key and if any of the values provided match
            if (_.has(options, key) && _.indexOf(_.keys(objValueMap), options[key]) !== -1) {
                options[key] = objValueMap[options[key]];
            }

            return options;
        },
        // Operate on an object, converting values to numbers as specified by an array of keys
        //
        // Arguments:
        //     options (object) - Object to operate on
        //     a_key (array) - Array of keys whose value to convert
        //
        // Returns [potentially] modified original object
        toNumber: function (options, a_key) {
            return _.mapObject(options, function (val, key) {
                return _.contains(a_key, key) ? Number(val) : val;
            });
        },

        // Operate on an object, converting values to strings as specified by an array of keys
        //
        // Arguments:
        //     options (object) - Object to operate on
        //     a_key (array) - Array of keys whose value to convert
        //
        // Returns [potentially] modified original object
        toString: function (options, a_key) {
            return _.mapObject(options, function (val, key) {
                return _.contains(a_key, key) ? String(val) : val;
            });
        },

        /* Markup helpers - modified from handlebars.form-helpers.js
        * https://github.com/badsyntax/handlebars-form-helpers
        * Copyright (c) 2013 Richard Willis; Licensed MIT
        *****************************************/
        // Higher level function to create an element with the passed in content, complete with opening and closing tag (if required)
        //
        // Arguments:
        //     content (string) - content to encapsulate with HTML opening / closing tags
        //     name (string) - name of tag to encapsulate content with
        //     selfClose (boolean) - whether or not this tag is of the self-closing type (e.g. <br/>, <img/> <input/>)
        //     attributes (object) - Set of element attributes to write out
        //
        // Returns an HTML string
        createElement: function (content, name, selfClose, attributes) {
            return openTag(name, selfClose, attributes) + (selfClose ? '' : (content || '') + closeTag(name));
        },

        // Higher level function to create an element with the passed in content, complete with opening and closing tag (if required), and then return a new string with this content appended onto existing content.
        //
        // Arguments:
        //     contentExisting (string) - content to append new content to
        //     contentNew (string) - content to encapsulate with HTML opening / closing tags
        //     name (string) - name of tag to encapsulate content with
        //     selfClose (boolean) - whether or not this tag is of the self-closing type (e.g. <br/>, <img/> <input/>)
        //     attributes (object) - Set of element attributes to write out
        //
        // Returns an HTML string
        appendElement: function (contentExisting, contentNew, name, selfClose, attributes) {
            return contentExisting + _.createElement(contentNew, name, selfClose, attributes);
        },

        // Higher level function to wrap an existing element inside of a new element, complete with opening and closing tag (if required)
        //
        // Arguments:
        //     content (string) - content to encapsulate with HTML opening / closing tags
        //     name (string) - name of tag to encapsulate content with
        //     selfClose (boolean) - whether or not this tag is of the self-closing type (e.g. <br/>, <img/> <input/>)
        //     attributes (object) - Set of element attributes to write out
        //
        // Returns an HTML string
        wrapElement: function (content, name, attributes) {
            return openTag(name, false, attributes) + (content || '') + closeTag(name);
        },

        // Simple string manipulation to return a new string as a concatenation of new + existing string
        prependString: function (content, string) {
            return string + content;
        },

        // Simple string manipulation to return a new string as a concatenation of existing + new string
        appendString: function (content, string) {
            return content + string;
        },

        // Return an object with key/value pairs with all the URL query parameters
        getQueryString: function () {
            var result = {}, queryString = location.search.slice(1),
                re = /([^&=]+)=([^&]*)/g, m;

            m = re.exec(queryString);

            while (m) {
                result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
                m = re.exec(queryString);
            }

            return result;
        }
    });
});
