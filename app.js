const esprima = require("esprima");

function deepScan(code) {
    const ast = esprima.parseScript(code, { loc: true });
    const declaredVars = new Map();
    const usedVars = new Set();
    const declaredFuncs = new Map();
    const usedFuncs = new Set();

    function analyze(node) {
        if (!node) return;

        switch (node.type) {
            case "VariableDeclarator":
                declaredVars.set(node.id.name, node.loc.start.line);
                break;
            case "Identifier":
                usedVars.add(node.name);
                break;
            case "FunctionDeclaration":
                declaredFuncs.set(node.id.name, node.loc.start.line);
                break;
            case "CallExpression":
                if (node.callee.type === "Identifier") {
                    usedFuncs.add(node.callee.name);
                }
                break;
        }

        for (const key in node) {
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(analyze);
            } else if (typeof child === "object" && child !== null) {
                analyze(child);
            }
        }
    }

    analyze(ast);

    console.log("=== DeepScan Report ===");

    // Unused variables
    for (const [name, line] of declaredVars) {
        if (!usedVars.has(name)) {
            console.log(`⚠️  Unused variable '${name}' at line ${line}`);
        }
    }

    // Unused functions
    for (const [name, line] of declaredFuncs) {
        if (!usedFuncs.has(name)) {
            console.log(`⚠️  Unused function '${name}' at line ${line}`);
        }
    }

    console.log("✅ Scan complete.");
}

// Sample code to analyze
const sampleCode = `
function greet() {
    let message = "Hello";
}
let name = "Jyoti";
let age;
function hello() {
    console.log("Hello!");
}
hello();
`;

deepScan(sampleCode);
