sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/library",
    "sap/ui/core/Fragment",
    "./BaseController",
    "sap/m/BusyDialog"
], function(Controller, JSONModel, mobileLibrary, Fragment, BaseController, BusyDialog) {
    "use strict";

    return BaseController.extend("shiftchange.controller.UpdateView", {
        onInit: function() {
            
            // var oModel = new JSONModel("Position")
            // this.getView().setModel(oModel)
          //var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          //oRouter.getRoute("update").attachPatternMatched(this._onObjectMatched, this);

           // Initialize BusyDialog
           this._oBusyDialog = new BusyDialog();
           this.dateFormatter()

          this.getRouter().getRoute("update").attachPatternMatched(this._onRouteMatched1, this);
          //this.onNavBack();

          //this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));

          this.empClass();
           
        },

        getModel: function(sName) {
            return this.getView().getModel(sName)
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


        // onNavBack: function () {
        //     var uRouter = sap.ui.core.UIComponent.getRouterFor(this);
        //     uRouter.navTo("home");
        //     console.log(uRouter)
        // },
        

        _onMetadataLoaded: function () {
            // Store original busy indicator delay for the detail view
           // var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
             var oViewModel = this.getModel("update");
                //iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

            // Make sure busy indicator is displayed immediately when
            // detail view is displayed for the first time
            oViewModel.setProperty("/delay", 0);
            oViewModel.setProperty("/lineItemTableDelay", 0);

           // oLineItemTable.attachEventOnce("updateFinished", function() {
                // Restore original busy indicator delay for line item table
             //   oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
            //});

            // Binding the view will set it to not busy - so the view is always busy if it is not bound
            oViewModel.setProperty("/busy", true);
            // Restore original busy indicator delay for the detail view
            oViewModel.setProperty("/delay");
        
        },

        
        


        onAfterRendering: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("update").attachPatternMatched(this._onRouteMatched1, this);
        },
        



        onSubmit: function () {
            
            var that = this;
            var oModel = this.getOwnerComponent().getModel();
            var sPosition = this.getView().byId("txtPositionId").getText();
            // var sDepartment = this.getView().byId("inDepartmentId").getSelectedKey();
            var depart = this.getView().byId("txtDepartmentId").getText();
            var sStartDate = this.getView().byId("txtStartDate").getText();
            var sPositionCode = sPosition.match(/\((\d+)\)/)[1];
            var DepartCode = depart.match(/\((\d+)\)/)[1];

            console.log(DepartCode)
 
            var oDate = new Date(sStartDate);
 
            var year = oDate.getFullYear();
            var month = String(oDate.getMonth() + 1).padStart(2, '0');
            var day = String(oDate.getDate()).padStart(2, '0');
            var hours = String(oDate.getHours()).padStart(2, '0');
            var minutes = String(oDate.getMinutes()).padStart(2, '0');
            var seconds = String(oDate.getSeconds()).padStart(2, '0');
            var sFormattedStartDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

            console.log(oDate)
 
            console.log(sFormattedStartDate);
 
            oModel.metadataLoaded().then(function(){
                var payload = {
                    "__metadata": {
                        "uri": `Position(code='${sPositionCode}',effectiveStartDate=datetime'${sFormattedStartDate}')`,
                        "type": "SFOData.Position"
                    },
                   
                    //"code":`${sPositionCode}`,
                   "department": `${DepartCode}`
                   
                };

                

                
       
                oModel.create("/upsert", payload, {
                    success: () =>
            
                    {
                        that.jobInfo();
                        console.log("Department Updated")      

                        
                    },

                    error(){
                        sap.m.MessageBox.show("Department could not be updated", {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Warning!"
                        });
                    },


                    error(){
                        sap.m.MessageBox.show("Something went wrong, please try again later", {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Warning!"
                        });
                    }
                })

                
            })
        },

        empClass: function() {
            const oDataModel = this.getOwnerComponent().getModel();
            const that = this;
            
            // Read the picklist options for 'EMPLOYEECLASS' from the OData model
            oDataModel.read("/Picklist('EMPLOYEECLASS')/picklistOptions", {
                urlParameters: {
                    "$select": "id,picklistLabels" // Select relevant fields
                },
                success: (oData) => {
                    // Map over the results and create an array of promises
                    const aPromises = oData.results.map(async (record) => {
                        try {
                            // Extract the URI for picklistLabels from the deferred object
                            const iStartIndex = record.picklistLabels.__deferred.uri.indexOf("/odata/v2");
                            const sShortenedUri = record.picklistLabels.__deferred.uri.substring(iStartIndex + "/odata/v2".length);
                     
                            // Fetch the employee class data for the current record
                            const employeeClassData = await new Promise((resolve, reject) => {
                                oDataModel.read(sShortenedUri, {
                                    urlParameters: {
                                        "$select": "label,locale" // Select relevant fields for employee class
                                    },
                                    success: function (oEmployeeClass) {
                                        // Filter and map the results to only include labels with 'en_US' locale
                                        const employeeData = oEmployeeClass.results
                                            .filter(element => element.locale === 'en_US')
                                            .map(element => element.label); // Extract the label
        
                                        // Resolve the promise with the updated record
                                        resolve({
                                            ...record, // Spread the original record
                                            employeeData: employeeData // Add filtered employee data
                                        });
                                    },
                                    error: function (oError) {
                                        // Log and reject the promise if there's an error
                                        console.error("Error fetching employee class data:", oError);
                                        reject(oError);
                                    }
                                });
                            });
                     
                            // Wait for the employee class data and return the result with label and id
                            const [employeeClassResult] = await Promise.all([employeeClassData]);
                            return {
                                id: record.id, // Retain the record's id
                                label: employeeClassResult.employeeData[0] // Get the label from employeeData
                            };
                        } catch (error) {
                            // Log and propagate any errors encountered during promise mapping
                            console.error("Error in promise mapping:", error);
                            throw error;
                        }
                    });
                     
                    // Wait for all promises to resolve and set the data model for employee classes
                    Promise.all(aPromises)
                        .then((aCombinedResults) => {
                            // Set the combined results to a new JSON model and bind it to the view
                            that.getView().setModel(new sap.ui.model.json.JSONModel(aCombinedResults), "empClasses");
                        })
                        .catch((oError) => {
                            // Log any errors encountered when resolving promises
                            console.error("Error resolving promises:", oError);
                        });
                },
                error: (oError) => console.error("Error", oError), // Log errors from the initial OData read
            });
        },   

       


        



        jobInfo: function() {

            this._oBusyDialog.open()
            setTimeout(function(){
                
           
            var that = this;
            var oModel = this.getOwnerComponent().getModel();
            var posdepart = this.getView().byId("txtDepartmentId").getText();
            var posDepartCode = posdepart.match(/\((\d+)\)/)[1];
            var pos = this.getView().byId("txtPositionId").getText();
            var posCode = pos.match(/\((\d+)\)/)[1];
            var emp = this.getView().byId("txtEmpId").getText();

            var ejStartDate = this.getView().byId("txtStartDate").getText();
            var ejDate = new Date(ejStartDate);
            var Eyear = ejDate.getFullYear();
            var Emonth = String(ejDate.getMonth() + 1).padStart(2, '0');
            var Eday = String(ejDate.getDate()).padStart(2, '0');
            var Ehours = String(ejDate.getHours()).padStart(2, '0');
            var Eminutes = String(ejDate.getMinutes()).padStart(2, '0');
            var Eseconds = String(ejDate.getSeconds()).padStart(2, '0');
            var ejFormattedStartDate = `${Eyear}-${Emonth}-${Eday}T${Ehours}:${Eminutes}:${Eseconds}`;

            var workSchedule = this.getView().byId("txtWorkSchedule").getText();
            var workSchedulecode = workSchedule.match(/\(([^)]+)\)/)[1];;
            //var emptype = this.getView().byId("empType").getselectedItemId()

            
            
                oModel.read("/EmpJob", {
                    success: (oData) => {
                        console.log(oData.results);
                        console.log(workSchedulecode)
                        console.log(ejStartDate)
                    }}),
    
                    oModel.metadataLoaded().then(function(){
                        var payload = {
                            "__metadata": {
                                "uri": `EmpJob(startDate=datetime'${ejFormattedStartDate}',userId='${emp}')`,
                                "type": "SFOData.EmpJob"
                            },
                            
                            //"employmentType": emptype,
                            "workscheduleCode":workSchedulecode,
                            "department": posDepartCode,
                            "position": posCode,
                            "eventReason": "TRANDEPT"
                           
                        };

                        
                        oModel.create("/upsert", payload, {
                            success: function()
                            {
                                sap.m.MessageBox.show("All updates complete! Record has been removed.", {
                                    icon: sap.m.MessageBox.Icon.SUCCESS,
                                   title: "Success!"
                               });
                                console.log("Job Info Updated")

                                oModel.metadataLoaded().then(function(){
                                    var sUrl = window.location.href;
                                    var index = sUrl.indexOf("update/");
                                    var sEmpId = sUrl.substring(index + "update/".length)
                                    
                                    
                                    var payload2 = {
                                        "__metadata": {
                                            "uri": "https://apisalesdemo2.successfactors.com/odata/v2/cust_EmployeeShiftChange('"+sEmpId+"')",
                                            "type": "SFOData.cust_EmployeeShiftChange"
                                        },
        
                                        "cust_WorkflowStatus":"Updated!"
                                    }
                                    
                                    
                                    
                                oModel.create("/upsert", payload2, {
                                    success: function()
                                    {
                                        
                                        console.log("Status Updated")
                                        that.setEmployeeModel()
                                        that.onNavBack()
                                        
                                    },
        
                                    error(){
                                        sap.m.MessageBox.show("Status could not be updated!", {
                                            icon: sap.m.MessageBox.Icon.ERROR,
                                            title: "Warning!"
                                        });
                                    }
                                })
        
                                    
                                })

                                
                            },

                            onNavBack: function () {
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                oRouter.navTo("home");
                            },


                            error(){
                                sap.m.MessageBox.show("Employment Information could not be updated!", {
                                    icon: sap.m.MessageBox.Icon.ERROR,
                                    title: "Warning!"
                                    
                                });
                            }
                        })
    
                    
                })

                this._oBusyDialog.close();
                console.log("Process Complete")
            }.bind(this), 10000)

            },

            ManualStatusChange: function() {
                var that = this;
                var oModel = this.getOwnerComponent().getModel();
                oModel.metadataLoaded().then(function(){
                    var sUrl = window.location.href;
                    var index = sUrl.indexOf("update/");
                    var sEmpId = sUrl.substring(index + "update/".length)
                    
                    
                    var payload2 = {
                        "__metadata": {
                            "uri": "https://apisalesdemo2.successfactors.com/odata/v2/cust_EmployeeShiftChange('"+sEmpId+"')",
                            "type": "SFOData.cust_EmployeeShiftChange"
                        },

                        "cust_WorkflowStatus":"Manual Change Completed!"
                    }
                    
                    
                    
                oModel.create("/upsert", payload2, {
                    success: function()
                    {

                        sap.m.MessageBox.show("Record has been updated manually!", {
                            icon: sap.m.MessageBox.Icon.SUCCESS,
                           title: "Success!"
                       });
                        
                        console.log("Status Updated")
                        
                        that.setEmployeeModel()
                        that.onNavBack()
                        
                    },


                    error(){
                        sap.m.MessageBox.show("Status could not be updated!", {
                            icon: sap.m.MessageBox.Icon.ERROR,
                            title: "Warning!"
                        });
                    }
                })

                    
                })

            },


            ManualChange: function(){
                var emp = this.getView().byId("txtEmpId").getText();
                window.open("https://salesdemo.successfactors.eu/sf/employmentinfo?blockId=block1592&selected_user="+emp+"", "_blank").focus();
            },



            
 
// Option 2
_onRouteMatched1: function (oEvent) {

    let sModel = this.getView().getModel()
    console.log(sModel)

    
    const oDataModel = this.getOwnerComponent().getModel();
    // Retrieve the route parameters
    var sUrl = window.location.href;
    var index = sUrl.indexOf("update/");
    var sEmpId = sUrl.substring(index + "update/".length);
 
    oDataModel.read(`/cust_EmployeeShiftChange('${sEmpId}')`, {
        success: (oData) => {

            var sFormattedDate = this.dateFormatter(oData.cust_StartDate);

            this.byId("txtEmpId").setText(oData.cust_EmployeeId)
            this.byId("txtPositionId").setText(oData.cust_CurrentPosition)
            this.byId("txtDepartmentId").setText(oData.cust_NewDepartment)
            this.byId("txtStartDate").setText(sFormattedDate)
            this.byId("txtWorkSchedule").setText(oData.cust_NewWorkSchedule)
            
        },
        error: (oError) => console.error("Error", oError),


        // oDataModel.read(`/EmpJob)



       
    })

    // oDataModel.read("https://apisalesdemo2.successfactors.eu/odata/v2/FODivision(externalCode='INSIDE_SALES',startDate=datetime'1990-01-01T00:00:00')", {
    //     success: (oData) => {
    //         console.log(oData.results);

    //     }})


    // urlParameters: {
    //     "$expand": "cust_toDivision,cust_toLegalEntity",
    //     "$filter": `(cust_toDivision/externalCode eq '${sDivisionId}') and (cust_toLegalEntity/externalCode eq '${sCompanyId}')`,
    //     "$select": "externalCode,name_en_US,cust_toDivision/externalCode,cust_toLegalEntity/externalCode"
    // },

},


        _onObjectMatched: function (oEvent) {
            // Get the order ID from the route parameters
            var sEmpId = oEvent.getParameter("arguments").empId;

                var sPath = "/cust_EmployeeShiftChange("+ {sEmpId} +")";
                this.getView().bindElement({
                    path: sPath
                });
            },
        
    });
})
