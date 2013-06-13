define(["jquery", "dust", "app/templates"], function(jQuery, dust, templates){

    return {
        /**
         * This function renders a precompiled template with the provided name, using the provided data;
         * and sets the result as the html of the provided element.
         * @param templateName Name of the template to render.
         * @param data Data to use when rendering.
         * @param Element which will receive the output as its html.
         */
        renderToElement: function(templateName, data, element){
            dust.render(templateName, data, function(err, out){
                element.html(out);
            });
        }
    }
});

