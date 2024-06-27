export const GRAPHQL_API_URL = process.env.NEXT_BUILD
  ? `http://127.0.0.1:${process.env.PORT || 8000}`
  : process.env.NEXT_PUBLIC_SERVER_URL
