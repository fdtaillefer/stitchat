/**
 * This contains utilities that work with the scroll state of jQuery objects.
 */


/**
 * Returns whether element's vertical scroll is all the way at the bottom.
 * @param element Element to check
 * @return
 */
var isScrollAtBottom = function(element){
    return element.prop('scrollHeight') - element.scrollTop() <= element.height();
}

/**
 * Sets element's vertical scroll all the way to the bottom.
 * @param element Element to scroll down
 */
var scrollToBottom = function(element){
    element.scrollTop(element.prop('scrollHeight'));
}

/**
 * Appends newNode to element, scrolling element back to bottom if it was previously that way.
 * @param element Element at the end of which newNode is appended
 * @param newNode Element to append
 */
var appendMaintainingScroll = function(element, newNode){

    //Remember if the element's scroll is at bottom
    var scrollAtBottom = isScrollAtBottom(element);

    //Append the new node inside element
    element.append(newNode);

    //If scroll was at bottom, put it back to bottom
    if(scrollAtBottom){
        scrollToBottom(element);
    }
}


define({
    "isScrollAtBottom": isScrollAtBottom,
    "scrollToBottom": scrollToBottom,
    "appendMaintainingScroll": appendMaintainingScroll
});
