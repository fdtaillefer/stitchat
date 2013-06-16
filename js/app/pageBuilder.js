/**
 * Offers page building utilities.
 * This is designed to be unaware of which rendering engine is being used.
 */
define(["app/pageRenderer"], function(pageRenderer){

    return {
        /**
         * This function renders a template with the provided name, using the provided data;
         * and sets the result as the html of the provided element.
         * @param templateName Name of the template to render.
         * @param data Data to use when rendering.
         * @param element Element which will receive the output as its html.
         */
        renderToElement: function(templateName, data, element){
            pageRenderer.render(templateName, data, function(result){
                element.html(result);
            });
        }
    }
});

