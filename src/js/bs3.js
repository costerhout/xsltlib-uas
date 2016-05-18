// Created by Colin Osterhout
// University of Alaska Southeast
// ctosterhout@alaska.edu
//
require([
    // Standard items that export a variable
    'jquery',
    'main'
], function($, main) {
    'use strict';
    
    var modules = [];

    // Wait for the DOM to load
    $(function () {
        modules = main.initialize(
            {
                templateScheme: 'bs3',
                baseTemplateUrl: 'templates'
            }
        );
    });
});
