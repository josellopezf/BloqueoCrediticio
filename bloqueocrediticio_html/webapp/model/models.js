sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},
        
        createLocalModel : function () {
            var oLocalModel = new sap.ui.model.json.JSONModel();
            oLocalModel.setDefaultBindingMode("TwoWay");
            oLocalModel.setSizeLimit(500);
            return oLocalModel;
        }        

	};
});