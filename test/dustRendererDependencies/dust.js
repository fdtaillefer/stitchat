/**
 * This is a substitute for dust-core, needed because requireJS shim config doesn't work in node.
 */
define({
    "render": function(templateName, data, callback){
        if(templateName === "error"){
            callback("error", null);
        } else {
            callback(null, "success");
        }
    }
});
