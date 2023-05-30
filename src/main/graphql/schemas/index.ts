import { readFileSync } from 'fs';
import * as glob from 'glob';

const schemaFiles = glob.sync('./**/*.graphql');

const typeDefs = schemaFiles.map((file) => readFileSync(file, { encoding: 'utf-8' })).join('\n');

export default typeDefs;
