import { getDefinitions } from "../utils/wiktionary";

const definitions = await getDefinitions("appl");

if (!definitions) process.exit(1);

console.dir(definitions, { depth: null });
