/**
 * A page renderer that uses dustjs to render precompiled pages.
 * Templates is listed as a dependency because the templates are registered to dust by running that code,
 * and that's how they become available to dust.render() by a simple template name.
 */
define(["dust", "app/templates"], function(dust, templates){

    return {
        /**
         * This function uses dust-core to render a precompiled template with the provided name, using the provided data.
         * @param templateName Name of the template to render.
         * @param data Data to use when rendering.
         * @param callback Function to call  after rendering. This will receive one param, the result of the rendering.
         */
        render: function(templateName, data, callback){
            dust.render(templateName, data, function(err, out){
                if(err){
                    throw err;
                }
                callback(out);
            });
        }
    }
});