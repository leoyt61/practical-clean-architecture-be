import 'reflect-metadata';
import config from '@main/config';

import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './schemas';
import resolvers from './resolvers';


const main = async () => {
  await config();

  const port = 8081;

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await startStandaloneServer(server, {
    listen: { port },
  });
  console.log(`GraphQL server running on port: ${port}`);
}

main();