/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"shit_change/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
