/**
* @Author: Colin Osterhout <ctosterhout>
* @Date:   2016-05-17T09:09:22-08:00
* @Email:  ctosterhout@alaska.edu
* @Project: BERT
* @Last modified by:   ctosterhout
* @Last modified time: 2016-07-06T19:27:11-08:00
* @License: Released under MIT License. Copyright 2016 University of Alaska Southeast.  For more details, see https://opensource.org/licenses/MIT
*/


define([
    // Standard items that export a variable
    'module',
    'require',
    'jquery',
    'underscore',

    // Transition modules to support existing functionality
    'transitional/forms',
    'transitional/tabs',
    'transitional/modals',
    'transitional/placeholder',

    // Handlebars helpers to be explicitly added
    'hbs/handlebars',
    'vendor/handlebars.form-helpers',
    'templates/debug',

    // Add polyfill items
    'lib/polyfill',

    // Helper mixins
    'lib/mixins',

    // Add-ons to any of the above
    'jquery.xml2json'
], function (
    // Standard stuff
    module,
    require,
    $,
    _,

    // Stuff to handle transitional things - e.g. may very well change as browsers get updated and the XSLT generation tools change
    // Make sure to add these to the list of modulesTransitional.
    TransitionalForms,
    TransitionalTabs,
    TransitionalModals,
    TransitionalPlaceholder,

    // Load up the Handlebars object
    Handlebars,

    // Make sure to add these to the list of modulesHandlebars.
    HandlebarsFormHelpers,
    HandlebarsDebug
) {
    'use strict';

    var timeoutModuleLoad = 2000,
        // We use this array as a list of transitional modules to walk through and initialize later
        modulesTransitional = [
            TransitionalForms,
            TransitionalTabs,
            TransitionalModals,
            TransitionalPlaceholder
        ],
        // We use this array as a list of Handlebars modules to walk through and initialize later
        modulesHandlebars = [
            HandlebarsFormHelpers,
            HandlebarsDebug
        ],

        initModules = function (options) {
            var dfdLoading = [],
                modules = [];

            $('div[data-module]').each(function () {
                // Save away the element for later use
                var el = this,
                    // Save away the jQuery object representing the DOM element containing default state for this module
                    $defaults = $($(el).data('defaults')).first(),
                    // Type keeps track of what type of representation is used to store the default module state
                    type = _.last(/^(?:text|application)\/(json|xml)$/.exec($defaults.attr('type'))) || 'noop',
                    // We use a deferred object to keep track of module load state
                    deferred = $.Deferred();

                // Push the deferred object onto the array. We'll pass methods from this object to the invoked module
                dfdLoading.push(deferred);
                setTimeout(function () {
                    deferred.reject('Module load timeout: ' + $(el).data('module'));
                }, timeoutModuleLoad);

                require(
                    ['modules/' + $(el).data('module')],
                    // If require succeeds, then push a new instance of that module onto our internal modules array
                    function (Mod) {
                        // Push the newly created module on the stack
                        // We could do some sort of event here to alert subscribers in the future
                        modules.push(
                            new Mod(
                                // Build the options object by combining data- attributes,
                                // module config options, and defaults specified in the DOM (if available)
                                _.defaults(
                                    // Start with the data- attributes, omitting the module name and the defaults setting
                                    _.omit($(el).data(), ['module', 'defaults']),
                                    // Add in some default options
                                    {
                                        el: el,
                                        baseTemplateUrl: module.config().baseTemplateUrl,
                                        baseTemplateUrlInternal: module.config().baseTemplateUrlInternal,
                                        templateScheme: options.templateScheme,
                                        success: deferred.resolve,
                                        fail: deferred.reject
                                    },
                                    // Merge with defaults specified in the DOM (if available)
                                    {
                                        defaults: {
                                            'json': $.parseJSON,
                                            'xml': $.xml2json,
                                            'noop': _.noop
                                        }[type]($defaults.html()) || {}
                                    }
                                )
                            )
                        );
                    },
                    // If require fails, then reject the deferred object
                    // The require call may not fail properly under IE. See http://requirejs.org/docs/api.html#errors for more details.
                    function () {
                        deferred.reject();
                    }
                )
            });

            // Return a promise, composed of all the promises for the deferred loading modules
            return $.when.apply($, dfdLoading).promise();
        },

        // Initialize "transitional" modules, e.g. those that do not operate on a
        // using the normal data-module technique but instead provide some functionality.
        //
        // Arguments:
        //     none
        //
        // Returns:
        //     Promise which is resolved by the various modules or timed out.
        initModulesTransitional = function () {
            var dfdLoading = [];

            // For each module we're going to create a deferred object and push it onto a stack.
            // Each module gets initialized with an object containing callbacks to resolve its deferred object
            // A timeout is also specified to reject the deferred object
            _.each(modulesTransitional, function (module) {
                var deferred = $.Deferred();
                setTimeout(function () {
                    deferred.reject('Module load timeout');
                }, timeoutModuleLoad);
                dfdLoading.push(deferred);
                module.initialize(
                    {
                        success: deferred.resolve,
                        fail: deferred.reject
                    }
                );
            });

            // Return a promise, letting others wait on that
            return $.when.apply($, dfdLoading).promise();
        },

        main = {
            initialize: function (options) {
                try {
                    // Set up the Handlebars helpers
                    _.each(modulesHandlebars, function (module) {
                        module.register(Handlebars);
                    });

                    // Key in on the main modules being loaded. Once that's done, then
                    // start the transitional modules
                    $.when(initModules(options))
                        .then(initModulesTransitional)
                        .then(function () {
                            // Check to see if there's anyone listening, and if so, alert them to our success
                            if (_.isFunction(options.success)) {
                                options.success();
                            }
                        })
                        .fail(function (err) {
                            // Check to see if there's anyone listening, and if so, alert them to our failure
                            // Passing along the error argument that we received
                            if (_.isFunction(options.fail)) {
                                options.fail(err);
                            }
                        });
                }
                catch (e) {
                    if (_.isFunction(options.fail)) {
                        options.fail(e.message);
                    }
                }
            }
        };

    return main;
});
