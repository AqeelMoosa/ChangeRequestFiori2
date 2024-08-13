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

    return Controller.extend("shitchange.controller.View1", {
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


        openQuickView: function (oEvent, oModel) {
        	var oEmpID = oEvent.getSource(),
                oView = this.getView(),
                oContext = oView.getBindingContext();
            
               //Load fragment and add as dependent of this(Detail) view
		if (!this._pQuickView) {
			this._pQuickView = Fragment.load({
				id: oView.getId(),
				name:"shit_change.fragments.EmployeeDetail",
				controller: this
			}).then(function (oQuickView) {
				oView.addDependent(oQuickView);
				return oQuickView;
			});
		}
		this._pQuickView.then(function (oQuickView){     
                //Set path to Customer         
                var sPath = `${oContext.getPath()}`;
                //Bind path and model to Quickview
                oQuickView.bindElement({ path: sPath, model: oModel.name });
                //Set CustID field as the source so that popup launches it 
		oQuickView.openBy(oEmpID);
			});
        },



        onDefaultDialogPress: function () {
			if (!this.oDefaultDialog) {
				this.oDefaultDialog = new Dialog({
					title: "Edit Position Number",
					content: new List({
						items: {
							path: "/cust_EmployeeShiftChange",
							template: new StandardListItem({
								title: "{cust_PositionId}",
							})
						}
					}),
					beginButton: new Button({
						text: "OK",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: "Close",
						press: function () {
							this.oDefaultDialog.close();
						}.bind(this)
					})
				});

				// to get access to the controller's model
				this.getView().addDependent(this.oDefaultDialog);
			}

			this.oDefaultDialog.open();
		},


    });
});
