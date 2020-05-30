import { combineResolvers } from 'graphql-resolvers'
import { isAuthenticated, isMessageOwner} from './authorization'
import pubsub, { EVENTS } from '../subscription'

import { v4 as uuidv4 } from 'uuid'
import models from '../models'

export default {
	Query: {
		message: async (parent, { id }, { models }) => {
			return await models.Message.findByPk(id)
		},
		messages: async (parent, { offset = 0, limit = 100 }, { models }) => {
			return await models.Message.findAll({
        offset,
        limit
      })
		}
	},
	Mutation: {
		createMessage: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { me, models}) => {
        const message = await models.Message.create({
          text,
          userId: me.id
        })

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message }
        })

        return message
      }
    ),
		deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) => {
        return await models.Message.destroy({ where: { id }})
      }
    ),
		updateMessage: async (parent, { id, text }) => {
      const updateMessage = await models.Message.findByPk(id)

      if (!updateMessage) {
        return false
      }

      updateMessage.update({
        text
      })

      return true
		}
	},
	Message: {
		user: async (message, args, { loaders }) => {
      return await loaders.user.load(message.userId)
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED)
    }
  }
}