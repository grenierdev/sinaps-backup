module.exports = {

	siteUrl: 'http://dev.grenier.tv/',

	mongodb: false,
	/*mongodb: {
		host: 'localhost',
		port: 27017,
		db: 'greniertv'
	},*/

	session: {
		name: 'greniertv.sid'
	},

	libraries: {
		Movie: 'F:\\Users\\Michael\\Videos\\Movies',
		Shows: 'F:\\Users\\Michael\\Videos\\Shows'
	}

	/*services: {
		facebook: {
			ownerId: '10153101535784230',
			appId: '1568992070029304',
			secret: 'c7d5e7a53ff0e4080a1de291e180d534'
		},
		themoviedb: {
			key: 'decac561561a0f12d571e98de9de6380'
		}
	}*/
}
