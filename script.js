const lexer = (input) => {
    const tokens = [];
    let cursor = 0;

    while (cursor < input.length) {
        let char = input[cursor];

        if (/\s/.test(char)) {
            cursor++; 
            continue; 
        }

        if (/[a-zA-Z]/.test(char)) {
            let word = "";
            while (/[a-zA-Z]/.test(char) && cursor < input.length) {
                word += char;
                char = input[++cursor];
            }
            if (word === "yeh" || word === "dikha") {
                tokens.push({ type: "keyword", value: word });
            } else {
                tokens.push({ type: "identifier", value: word });
            }
            continue;
        }

        if (/[0-9]/.test(char)) {
            let num = "";
            while (/[0-9]/.test(char) && cursor < input.length) {
                num += char;
                char = input[++cursor];
            }
            tokens.push({ type: "number", value: num });
            continue;
        }

        const twoCharOps = ["==", "!=", ">=", "<=", "&&", "||", "**"];
        const oneCharOps = ["+", "-", "*", "/", "%", ">", "<", "=", "!"];

        let nextTwoChars = input.substring(cursor, cursor + 2);

        if (twoCharOps.includes(nextTwoChars)) {
            tokens.push({ type: "operator", value: nextTwoChars });
            cursor += 2;
            continue;
        }

        if (oneCharOps.includes(char)) {
            tokens.push({ type: "operator", value: char });
            cursor++;
            continue;
        }

        throw new Error(`Unexpected character at position ${cursor}: '${char}'`);
    }
    return tokens;
};

const parser = (tokens) => {
    const ast = { type: "Program", body: [] };

    while (tokens.length > 0) {
        let token = tokens.shift();

        if (token.type === "keyword" && token.value === "yeh") {
            if (tokens.length < 2) throw new Error("Invalid variable declaration");

            let name = tokens.shift();
            if (name.type !== "identifier") throw new Error("Expected variable name");

            let declaration = { type: "Declaration", name: name.value, value: null };

            if (tokens.length > 0 && tokens[0].type === "operator" && tokens[0].value === "=") {
                tokens.shift();
                let expression = [];
                while (tokens.length > 0 && tokens[0].type !== "keyword") {
                    expression.push(tokens.shift().value);
                }
                declaration.value = expression.join(" ");
            }
            ast.body.push(declaration);
        } else if (token.type === "keyword" && token.value === "dikha") {
            let expression = [];
            while (tokens.length > 0 && tokens[0].type !== "keyword") {
                expression.push(tokens.shift().value);
            }
            if (expression.length === 0) throw new Error("Invalid print statement");
            ast.body.push({ type: "Print", expression: expression.join(" ") });
        } else {
            throw new Error(`Unexpected token: ${token.value}`);
        }
    }
    return ast;
};

const codeGen = (node) => {
    switch (node.type) {
        case "Program":
            return node.body.map(codeGen).join("\n");
        case "Declaration":
            return `let ${node.name} = ${node.value};`;
        case "Print":
            return `console.log(${node.expression});`;
        default:
            throw new Error(`Unknown AST node type: ${node.type}`);
    }
};

const runCode = () => {
    const code = document.getElementById("codeInput").value;
    try {
        const tokens = lexer(code);
        console.log("Tokens:", tokens);

        const ast = parser(tokens);
        console.log("AST:", JSON.stringify(ast, null, 2));

        const executable = codeGen(ast);
        console.log("Generated Code:\n", executable);

        let consoleOutput = "";
        const originalConsoleLog = console.log;

        console.log = function (...args) {
            consoleOutput += args.join(" ") + "\n";
            originalConsoleLog.apply(console, args);
        };

        eval(executable);

        console.log = originalConsoleLog;
        document.getElementById("output").innerText = consoleOutput || "No output";
    } catch (error) {
        document.getElementById("output").innerText = "Error: " + error.message;
        console.error(error);
    }
};
