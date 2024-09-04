sap.ui.define(
    [
        "./BaseController",
        "sap/ui/core/mvc/Controller",
        "sap/ui/core/UIComponent"
    ],
    function(BaseController, UIComponent) {
      "use strict";
  
      return BaseController.extend("shiftchange.controller.App", {

        onInit: function () {
         
          this.setEmployeeModel();
        
        },
    
      });
    }
  );
  