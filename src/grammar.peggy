{{
    import rr from "railroad-diagrams/railroad.js";
}}

Syntax 
    = _ @ChoiceOrStatement _

ChoiceOrStatement 
    = Choice / Statement

Statement 
    = statement:Expression|1..,__| {
        return rr.Sequence(...statement);
    }

Expression 
    = Optional / Block / Literal

Literal 
    = literal:(command / identifier / symbol)|1..,__| {
        return rr.Sequence(...literal);
    }

command 
    = command:$(([A-Z]+)|1..,__|) {
        return rr.Terminal(command);
    }

identifier 
    = identifier:$([a-zA-Z]+) {
        const href = "#" + identifier.replace(/[A-Z]/g, (match) => "_" + match.toLowerCase())
        return rr.NonTerminal(identifier, { href });
    }

symbol 
    = symbol:$([^ \n\r\t\[\]{}|]+) {
        return rr.Terminal(symbol);
    }

Optional 
    = "["_ optional:ChoiceOrStatement _"]" {
        return rr.Optional(optional, "skip");
    }

Choice 
    = choice:Statement|2.., or| {
        return rr.Choice(0, ...choice);
    }

or 
    = _"|"_

Block 
    = "{"_ @ChoiceOrStatement _"}"

_ 
    = [ \n\r\t]*

__ 
    = [ \n\r\t]+ 