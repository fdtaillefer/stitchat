(function(){dust.register("chatPage",body_0);function body_0(chk,ctx){return chk.write("<div class=\"title\">").reference(ctx.get("title"),ctx,"h").write("</div><div style=\"width: 500px; height: 300px; margin: 0 0 20px 0; border: solid 1px #999; overflow-y: scroll;\" id=\"chatDisplay\"></div><form><input type=\"text\" name=\"chatLine\" id=\"chatField\" /><input type=\"submit\" value=\"Send\" id=\"sendButton\" /></form>");}return body_0;})();