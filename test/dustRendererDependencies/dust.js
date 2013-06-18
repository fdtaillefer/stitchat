/**
 * This is a substitute for dust-core, needed because requireJS shim config doesn't work in node.
 * It's empty because we stub it in the test file, like we would if we managed to use the regular dust.
 */
define({
    "render": function(templateName, data, callback){}
});
