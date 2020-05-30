require("dotenv").config();

import http from 'http'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'
import { 
	ApolloServer,
	AuthenticationError
} from 'apollo-server-express'
import DataLoader from 'dataloader'

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'

import loaders from './loaders'

const app = express()

app.use(cors())

const getMe = async req => {
	const token = req.headers['x-token']
	if (token) {
		try{
			return await jwt.verify(token, process.env.SECRET)
		} catch(e) {
			throw new AuthenticationError('Your session expired. Sign in again!!!')
		}
	}
}

const server = new ApolloServer({
	typeDefs: schema,
	resolvers,
	formatError: error => {
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
 
    return {
      ...error,
      message,
    };
  },
	context: async({ req, connection }) => {
		if (connection) {
			return {
				models,
				loaders: {
					user: new DataLoader(keys => loaders.user.batchUsers(keys, models))
				}
			}
		}

		if (req) {
			const me = await getMe(req)

			return {
				models,
				me: me,
				secret: process.env.SECRET,
				loaders: {
					user: new DataLoader(keys => loaders.user.batchUsers(keys, models))
				}
			}
		}
	}
})

server.applyMiddleware({ app, path: '/graphql'})

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

const eraseDatabaseOnSync = true;
sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
	if (eraseDatabaseOnSync) {
	  createUsersWithMessages(new Date())
	}

	httpServer.listen({ port: 3000 }, () => {
		console.log('Apollo Server on http://localhost:3000/graphql')
	})
})

const createUsersWithMessages = async date => {
  await models.User.create(
    {
			username: 'LionKing',
			email: 'fengliu93sun@gmail.com',
			password: 'LionKing123!@#',
			role: 'ADMIN',
      messages: [
        {
					text: 'Published the Road to learn React',
					createAt: date.setSeconds(date.getSeconds() + 1)
        },
      ],
    },
    {
      include: [models.Message],
    },
  )
 
  await models.User.create(
    {
			username: 'DragonWarrior',
			email: 'dragonwarrior920619@gmail.com',
			password: 'DragonWarrior123!@#',
      messages: [
        {
					text: 'Happy to release ...',
					createAt: date.setSeconds(date.getSeconds() + 1)
        },
        {
					text: 'Published a complete ...',
					createAt: date.setSeconds(date.getSeconds() + 1)
        },
      ],
    },
    {
      include: [models.Message],
		}
  )
}
