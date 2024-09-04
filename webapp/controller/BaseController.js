sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/ui/core/format/DateFormat"
    ], function (Controller, History, DateFormat) {
    "use strict";
    
    return Controller.extend("shiftchange.controller.BaseController", {
    /**
     * Convenience method for accessing the router in every controller of the application.
     * @public
     * @returns {sap.ui.core.routing.Router} the router for this component
     */
    getRouter : function () {
    return this.getOwnerComponent().getRouter();
    },

    setEmployeeModel: function () {
        const oDataModel = this.getOwnerComponent().getModel();
     
        oDataModel.read("/cust_EmployeeShiftChange", {
            urlParameters: {
                "$filter": `cust_WorkflowStatus eq 'Approval Completed'`
            },
            success: (oEmployeeData) => {
                const oEmployeeModel = new sap.ui.model.json.JSONModel(oEmployeeData.results);
                oEmployeeModel.setSizeLimit(100000);
     
                this.getOwnerComponent().setModel(oEmployeeModel, "employeeModel");
                console.log("Employee Model:", oEmployeeModel.getData());
            },
            error: (oError) => console.error(oError)
        });
    },
    
    /**
     * Convenience method for getting the view model by name in every controller of the application.
     * @public
     * @param {string} sName the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    getModel : function (sName) {
    return this.getView().getModel(sName);
    },
    
    /**
     * Convenience method for setting the view model in every controller of the application.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     * @returns {sap.ui.mvc.View} the view instance
     */
    setModel : function (oModel, sName) {
    return this.getView().setModel(oModel, sName);
    },
    
    /**
     * Convenience method for getting the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    getResourceBundle : function () {
    return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },
    
    /**
     * Event handler for navigating back.
     * It there is a history entry we go one step back in the browser history
     * If not, it will replace the current entry of the browser history with the master route.
     * @public
     */
    onNavBack : function() {
    var sPreviousHash = History.getInstance().getPreviousHash();
    
    if (sPreviousHash !== undefined) {
    // eslint-disable-next-line sap-no-history-manipulation
    window.history.go(-1);
    
    //history.go(-1);
    } else {
    
    this.getRouter().navTo("master", {}, true);
    }
    }
    
    });
    
    });