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
    "sap/ui/core/format/DateFormat",
    "sap/m/BusyIndicator"
	
],
function (Controller, DateFormat, BusyIndicator) {
	"use strict";

    return Controller.extend("shiftchange.controller.View1", {

        
        onInit: function () {
                this.onReadEmpData();
                this.dateFormatter();
                //this._oBusyDialog = new BusyDialog();
        
                //var oFilter = new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "Completed");
				
        },


        dateFormatter: function(sDate) {
            if (!sDate) {
                return "";
            }

            // Create a DateFormat instance with the desired pattern
            var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
                pattern: "EEE, MMM d, yyyy" // Example format: 2024-08-19
            });

            // Format the date and return the formatted string
            return oDateFormat.format(new Date(sDate));
        },

        onRefreshTable: function() {
            // Get the table control
            var oTable = this.getView().byId("table1");
            var oButton = this.getView().byId("refresh");

              // Set the button to busy state
            oButton.setBusy(true);

            // Get the binding of the table's items aggregation
            var oBinding = oTable.getBinding("items");

            // Refresh the binding to fetch the latest data
            oBinding.refresh();

            setTimeout(function() {
                // Set the button back to not busy after refresh is complete
                oButton.setBusy(false);
            }, 2000); // Adjust the delay as needed
        },

        


        onReadEmpData: function(){

            sap.ui.core.BusyIndicator.show();
            var oModel = this.getOwnerComponent().getModel();
            oModel.read("/cust_EmployeeShiftChange", {
                urlParameters:{
                    "$filter":`cust_WorkflowStatus eq 'COMPLETED'`
                },

                
                success: function(oData) {
                    console.log(oData)
                    sap.ui.core.BusyIndicator.hide();

                    // var oTable = this.byId("table1");
                    // var oTableModel = new sap.ui.model.json.JSONModel();
                    // oTableModel.setData(oData);
                    // oTable.setModel(oTableModel);
                },
                
                error: function(error) {

                }
            })
        },


        OnDetails: function (oEvent) {
            // Get the selected item
            const oCtx = oEvent.getSource().getBindingContext("employeeModel");
            this._sEmployeeId = oCtx.getProperty("cust_EmployeeId");
            
			const oModel = () => this.getOwnerComponent().getModel();
            var oSelectedItem = oEvent.getSource();

            // Get the binding context of the selected item
            var oContext = oSelectedItem.getBindingContext();

            // Extract the key of the selected item
            //var sEmpId = oContext.getProperty("cust_EmployeeId")


            // Navigate to the detail view, passing the key
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("update", {
                empId:  this._sEmployeeId
            });

            //window.location.reload()
        },

    });
});
