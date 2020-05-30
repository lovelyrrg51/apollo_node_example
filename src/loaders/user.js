import Sequelize from 'sequelize'

const batchUsers = async (keys, models) => {
	const Op = Sequelize.Op
	const users = await models.User.findAll({
		where: {
			id: {
			  [Op.in]: keys,
			}
		}
	})

	return keys.map(key => users.find(user => user.id === key))
}