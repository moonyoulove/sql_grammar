{{
    import rr from "railroad-diagrams/railroad.js";
    import { identifierToHref } from "./href-map.js";
}}

Syntax 
    = _ syntax:ChoiceOrStatement _ {
        if (syntax.constructor.name === "Choice") {
            return rr.Sequence(syntax);
        }
        return syntax;
    }

ChoiceOrStatement 
    = Choice / Statement

Statement 
    = statement:Expression|1..,_| {
        return rr.Sequence(...statement);
    }

Expression 
    = Optional / Block / Literal / Parentheses

Literal 
    = literal:(command / identifier / symbol)|1..,__| {
        return rr.Sequence(...literal);
    }

command 
    = command:$(([A-Z_]+)|1..,__| "()"?) {
        return rr.Terminal(command);
    }

identifier 
    = identifier:$([a-z_A-Z]+) {
        return rr.NonTerminal(identifier, { href: "#" + identifierToHref(identifier) });
    }

symbol 
    = symbol:$([^ \n\r\t\[\]{}\(\)]+) {
        return rr.Terminal(symbol);
    }

Parentheses
    = "("_ parentheses:ChoiceOrStatement _")" {
        return rr.Sequence(rr.Terminal("("), parentheses, rr.Terminal(")"));
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