(function(){dust.register("chatPage",body_0);function body_0(chk,ctx){return chk.write("<div class=\"title\">").reference(ctx.get("title"),ctx,"h").write("</div><div id=\"chatDisplay\"></div><form><input type=\"text\" name=\"chatTarget\" id=\"chatTarget\" /><input type=\"text\" name=\"chatLine\" id=\"chatField\" /><input type=\"submit\" value=\"Send\" id=\"sendButton\" /></form><div id=\"currentUsernameDisplay\"><span id=\"currentUsernameField\" class=\"currentUsername\"></span><input type=\"button\" value=\"Change\" id=\"beginNameChangeButton\" /></div><form id=\"nameChangeForm\" class=\"hidden\"><input type=\"text\" name=\"nameChangeField\" id=\"nameChangeField\" /><input type=\"submit\" value=\"Confirm\" id=\"confirmNameChangeButton\" /><input type=\"button\" value=\"Cancel\" id=\"cancelNameChangeButton\" /></form>");}return body_0;})();