const { ApolloServer, gql } = require("apollo-server-lambda");
const faunadb = require("faunadb");
const query = faunadb.query;

const typeDefs = gql`
  type Bookmark {
    id: ID!
    name: String!
    url: String!
  }

  type Query {
    bookmark: [Bookmark!]
  }

  type Mutation {
    addBookmark(name: String!, url: String!): Bookmark!
    removeBookmark(id: ID!): Bookmark
  }
`;

const resolvers = {
  Query: {
    bookmark: async (root, args, context) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.FAUNA_BOOKMARK_SECRET,
        });

        const data = await client.query(
          query.Map(
            query.Paginate(query.Match(query.Index("all_bookmark"))),
            query.Lambda("x", query.Get(query.Var("x")))
          )
        );

        return data.data.map((d) => {
          return {
            id: d.ref.id,
            name: d.data.name,
            url: d.data.url,
          };
        });
      } catch (error) {
        console.log("Error in fetching Data : ", error);
      }
    },
  },
  Mutation: {
    addBookmark: async (_, { name, url }) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.FAUNA_BOOKMARK_SECRET,
        });

        const result = await client.query(
          query.Create(query.Collection("bookmark"), {
            data: { name: name, url: url },
          })
        );

        console.log("result", result);
        return {
          id: result.ref.id,
          name: result.data.name,
          url: result.data.url,
        };
      } catch (error) {
        console.log("Error in Adding Data : ", error);
      }
    },
    removeBookmark: async (_, { id }) => {
      try {
        const client = new faunadb.Client({
          secret: process.env.FAUNA_BOOKMARK_SECRET,
        });

        const result = await client.query(
          query.Delete(query.Ref(query.Collection("bookmark"), id))
        );

        console.log(result);
        return {
          id: result.ref.id,
          name: result.data.name,
          url: result.data.url,
        };
      } catch (error) {
        console.log("Error in Deleting Data : ", error);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = server.createHandler();

module.exports = { handler };
