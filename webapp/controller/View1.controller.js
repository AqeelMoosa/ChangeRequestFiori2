sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/core/IconPool",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/library",
    "sap/ui/Device",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent",
	
],
function (Controller, JSONModel, IconPool, Dialog, Button, mobileLibrary, List, StandardListItem, Text, Fragment, Device, History, UIComponent) {
	"use strict";

    return Controller.extend("shiftchange.controller.View1", {
        onInit: function () {
                this.onReadEmpData();
				
        },

        onReadEmpData: function(){
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/cust_EmployeeShiftChange", {
                success: function(response) {
                    console.log(oModel)
                },
                error: function(error) {

                }
            })
        },


        OnDetails: function (oEvent) {
            // Get the selected item
			const oModel = () => this.getOwnerComponent().getModel();
            var oSelectedItem = oEvent.getSource();

            // Get the binding context of the selected item
            var oContext = oSelectedItem.getBindingContext();

            // Extract the key of the selected item
            var sEmpId = oContext.getProperty("cust_EmployeeId")


            // Navigate to the detail view, passing the key
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("update", {
                empId: sEmpId
            });
        },

    });
});
