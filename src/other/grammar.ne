@{%
	// Moo lexer documention is here:
	// https://github.com/no-context/moo

	const moo = require("moo")
	const lexer = moo.compile({
  		lopt: /\[/,
  		ropt: /\]/,
  		iden: /\S+/,
		ws: { match: /\s/, lineBreaks: true }
	});

   function text(data) { return data.flat(Infinity).join(""); }
%}

# Pass your lexer with @lexer:
@lexer lexer

main -> [a-z]:+ _ [a-z]:+
_ ->  %ws:* {% () => null %}
__ -> %ws:+ {% text %}