import { gql } from 'apollo-server-express'

export default gql`
  extend type Query {
		messages(offset: Int, limit: Int): [Message!]!
		message(id: ID!): Message!
  }

  extend type Mutation {
    createMessage (text: String!) : Message!
		deleteMessage (id: ID!) : Boolean!
		updateMessage (id: ID!, text: String!) : Boolean!
  }

	type Message {
		id: ID!
		text: String!
    createdAt: Date!
		user: User!
	}

	extend type Subscription {
		messageCreated: MessageCreated!
	}

	type MessageCreated {
		message: Message!
	}
`