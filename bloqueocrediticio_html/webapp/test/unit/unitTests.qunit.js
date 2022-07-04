/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"SCO/BTP/bloqueocrediticio_html/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
