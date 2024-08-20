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

          this.getRouter().getRoute("update").attachPatternMatched(this._onRouteMatched1, this);

          //this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
           
        },
        

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
                   
                    "department": `${DepartCode}`
                   
                };

                
       
                oModel.create("/upsert", payload, {
                    success: function()
                    {
                        
                        sap.m.MessageBox.show("The Department has been updated sucessfully!", {
                            icon: sap.m.MessageBox.Icon.SUCCESS,
                            title: "Info!"
                        });


                        that.jobInfo();
                        this._oBusyDialog.open();

                setTimeout(() => {
                    this._oBusyDialog.close();
                    sap.m.MessageToast.show("All updates reflected");
                    
                    
                }, 3000);
                        
        
                    },
                })

                
            })
        },

        // processJobInfo: function (jobInfo) {
        //     // Perform operations with jobInfo
        //     console.log("Processing Job Info:", jobInfo);
        //     // Update some properties or make further API calls
        // },


        jobInfo: function() {

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
            
                oModel.read("/EmpJob", {
                    success: (oData) => {
                        console.log(oData.results);
                    }}),
    
                    oModel.metadataLoaded().then(function(){
                        var payload = {
                            "__metadata": {
                                "uri": `EmpJob(startDate=datetime'${ejFormattedStartDate}',userId='${emp}')`,
                                "type": "SFOData.EmpJob"
                            },

                            "department": posDepartCode,
                            "position": posCode,
                            "eventReason": "TRANDEPT"
                           
                        };



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
                                
                                sap.m.MessageBox.show("Final Update Complete", {
                                    icon: sap.m.MessageBox.Icon.SUCCESS,
                                    title: "Info!"
                                });
                            },
                        })

                            
                        })

                        
    
                        oModel.create("/upsert", payload, {
                            success: function()
                            {
                                
                                sap.m.MessageBox.show("Changes has been reflected on the employee profile", {
                                    icon: sap.m.MessageBox.Icon.SUCCESS,
                                    title: "Info!"
                                });
                            },
                        })
                    
                })
            },



        // onSubmit: function () {
        //     var oModel = this.getOwnerComponent().getModel();
        //     var sPosition = this.getView().byId("txtPositionId").getText();
        //     var sDepartment = this.getView().byId("inDepartmentId").getValue();
        //     var sPositionCode = sPosition.match(/\((\d+)\)/)[1];

        //     oModel.read("/Position", {
        //         urlParameters: {
        //             "$filter": `code eq '${sPositionCode}'`
        //         },
        //         success: (oPositionData) => {
        //             var sPositionUri = oPositionData.results[0].__metadata.uri;

        //             var oPositionPayload = {
        //                 "__metadata": {
        //                     "uri": `${sPositionUri}`,
        //                     "type": "SFOData.Position"
        //                 },
                        
        //                 "department": `${sDepartment}`
        //             };

        //             oModel.create("/upsert", oPositionPayload, {
        //                 success: () => {
        //                     sap.m.MessageBox.show("Updated successfully!", {
        //                         icon: sap.m.MessageBox.Icon.SUCCESS,
        //                         title: "Info!"
        //                     });
        //                 },
        //                 error: (oError) => { console.log(oError); }
        //             })

        //         },
        //         error: (oError) => { console.log(oError); }
        //     });
        // },




        onEdit: function() {
            var oModel = this.getOwnerComponent().getModel();
            var dep = this.getView().byId("txtDepartmentId").getValue();
            //let p = this.getView().getBindingContext()

            var pos = this.getView().byId("txtPositionId").getValue()
            var date = this.getView().byId("txtStartDate").getValue()

            // const numb = pos.match(/\((\d+)\)/);

            // if (numb) {
            //     const result = numb[1];
            //     console.log(result)
            // }

            oModel.read("/Position", {
                success: (oData) => {
                    console.log(oData.results);
                }
            }),

            oModel.metadataLoaded().then(function(){
                var payload = {
                    "__metadata": {
                        "uri": "Position(code='"+ result +"',effectiveStartDate='"+ date +"')",
                        "type": "SFOData.Position"
                    },
                    
                    "department": dep
                    
                };
        
                oModel.create("/upsert", payload, {
                    success: function()
                    {
                        sap.m.MessageBox.show("Updated successfully!", {
                            icon: sap.m.MessageBox.Icon.SUCCESS,
                            title: "Info!"
                        });
                    },
                })
            })
        },


onPress: function(){


    var oModel = this.getOwnerComponent().getModel();
  // var oEmpId = this.getView().getBindingContext().getProperty("cust_EmployeeId")

    var sUrl = window.location.href;
    var index = sUrl.indexOf("update/");
    var sEmpId = sUrl.substring(index + "update/".length)

//    How do i get these line to read from the position Entity?
      //var dep = this.byId("txtDepartmentId").getValue();
//    var title = this.getView().getBindingContext().getProperty("Position/positionTitle")
var dep = this.byId("depart").getText();


oModel.read("/Position", {
    success: (oData) => {
            var oCode = this.getView.getBindingContext.getProperty("code")
        console.log(oData.results);
    },

    
});




   

// oModel.metadataLoaded().then(function(){
//         var payload = {

//             "__metadata": {
//                 "uri": "https://apisalesdemo2.successfactors.com/odata/v2/cust_EmployeeShiftChange('"+sEmpId+"')",
//                 "type": "SFOData.cust_EmployeeShiftChange"
//             },

            

//         };

//         oModel.create("/upsert", payload, {
//             success:function(oData, oResponse) {
//                 console.log(oResponse)
//                 sap.m.MessageBox.show("Updated Successfully!", {
//                     icon: sap.m.MessageBox.Icon.SUCCESS,
//                     title: "Info!"
                    
//                 });
//             },
//             error: function() {
//                 sap.m.MessageBox.show("Sorry. Cannot Update. Please try again later", {
//                     icon: sap.m.MessageBox.Icon.ERROR,
//                     title:"Oops!"
//                 });
//             }
//         });
//     });

},
 
// Option 2
_onRouteMatched1: function (oEvent) {
    // Retrieve the route parameters
    var sUrl = window.location.href;
    var index = sUrl.indexOf("update/");
    var sEmpId = sUrl.substring(index + "update/".length);
    // var oSelectedItem = oEvent.getSource();
    // var oContext = oSelectedItem.getBindingContext();
    // console.log(oEvent)
   

    const oDataModel = this.getOwnerComponent().getModel();
 
    oDataModel.read(`/cust_EmployeeShiftChange('${sEmpId}')`, {
        success: (oData) => {
            this.byId("txtEmpId").setText(oData.cust_EmployeeId)
            this.byId("txtPositionId").setText(oData.cust_PositionId)
            this.byId("txtDepartmentId").setText(oData.cust_DepartmentId)
            this.byId("txtStartDate").setText(oData.cust_StartDate)
        },
        error: (oError) => console.error("Error", oError)
    });

    // oDataModel.read(`/Position('${oCode}')`, {
    //     success: (oData) => {
    //         this.byId("txtPosCode").setText(oData.code);
    //         console.log(oData)
    //     },
    //     error: (oError) => console.error("Error", oError)
    // });
},


        _onObjectMatched: function (oEvent) {
            // Get the order ID from the route parameters
            var sEmpId = oEvent.getParameter("arguments").empId;

                var sPath = "/cust_EmployeeShiftChange("+ {sEmpId} +")";
                this.getView().bindElement({
                    path: sPath
                });
            },


            // getUserId: function () {
            //     var sQuery = window.location.search;
            //     var oParams = {};
            //     sQuery.replace(/^\?/, '').split('&').forEach(function(param) {
            //         var aParam = param.split('=');
            //         oParams[aParam[0]] = decodeURIComponent(aParam[1]);
            //     });
                
            //     return oParams["EmpId"] || null;
            // },

            // anything: function () {

            //     var sUserId = this.getUserId();
            //     this.byId("empId").setText(`${sUserId}`);
            //     console.log(sUserId)
            // }
            
    

            // ShowFunction: function () {
            //     var oDataModel = this.getOwnerComponent().getModel();
        
            
            //     oDataModel.read("/User()", {
            //         success: function (oData) {
            //             // Populate the oHeadingMap with data from the response
            //             oData.results.forEach(function (item) {
            //                 oHeadingMap[item.businessProcessid] = item.cust_processHeading;
            //             });
            
            //             // Retrieve the process heading or set it to "Unknown Process" if not found
            //             var sProcessHeading = oHeadingMap[sProcessId] || oResourceBundle.getText("warningUnknownProcess");
            
            //             // Create a Text control to display the process heading
            //             var oText = new Text({ text: sProcessHeading });
            //             oText.addStyleClass("main-header-text");
            
            //             // Get the HBox control to display the process heading
            //             var oHBox = this.byId("hbxProcessHeading");
            //             oHBox.removeAllItems();
            //             oHBox.addItem(oText);

            //             // Get the HBox control to display the ruler
            //             var oRulerContainer = this.byId("hbxRulerContainer");
            //             oRulerContainer.removeAllItems();

            //             var oRuler = new HBox();
            //             oRuler.addStyleClass("ruler");
            //             oRulerContainer.addItem(oRuler);

            //             // Get the HBox control to display the close button
            //             var oButtonContainer = this.byId("hbxButtonClose");
            //             var oCloseButton = new Button({
            //                 text: this.getView().getModel("i18n").getResourceBundle().getText("btnClose"),
            //                 press: this.onNavBack.bind(this)
            //             });
            //             oRuler.addStyleClass("sapUiLargeMarginEnd");
            //             oButtonContainer.addItem(oCloseButton);

            //             // Get the HBox control to display the username
            //             var oUsernameContainer = this.byId("hbxUsername");
            //             var oUsername = new Text();
            //             oUsername.addStyleClass("username-text");
            //             oUsernameContainer.addItem(oUsername);
            
            //             // Read username for current user
            //             oDataModel.read(`/User('${sUserId}')`, {
            //                 success: function (oData) {
            //                     var sFullname = oData.defaultFullName;
            //                     oUsername.setText(sFullname);
            //                 },
            //                 error: function (oError) {
            //                     console.error(oResourceBundle.getText("errorFetchingData"), oError);
            //                 }
            //             });

            //             // Initialize the Process Flow with the provided model
            //             this._initializeProcessFlow(oModel, sUserId);

            //             this._hideBusyIndicator();
            //         }.bind(this),
            //         error: function (oError) {
            //             console.error(oResourceBundle.getText("errorReadingModel"), oError);
            //             this._hideBusyIndicator();
            //         }
            //     });
           
           // }



        
    });
})
