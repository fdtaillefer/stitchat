(function(){dust.register("chatPage",body_0);function body_0(chk,ctx){return chk.write("<html><head><title>").reference(ctx.get("title"),ctx,"h").write("</title><script type=\"text/javascript\" src=\"./socket.io/socket.io.js\"></script><script src=\"//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js\" ></script><script type=\"text/javascript\" src=\"./js/constants.js\"></script><script type=\"text/javascript\" src=\"./js/chat.js\"></script></head><body><div style=\"width: 500px; height: 300px; margin: 0 0 20px 0; border: solid 1px #999; overflow-y: scroll;\" id=\"chatDisplay\"></div><form><input type=\"text\" name=\"chatLine\" id=\"chatField\" /><input type=\"submit\" value=\"Send\" id=\"sendButton\" /></form></body></html>");}return body_0;})();