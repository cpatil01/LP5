const express = require('express');
const userRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const connectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const USER_SAVE_DATA = [
	'firstName',
	'lastName',
	'age',
	'photoUrl',
	'skills',
	'about',
];
userRouter.get('/requests/received', userAuth, async (req, res) => {
	const { _id: loggedInUserId } = req.user;
	try {
		const findAllRequest = await connectionRequest
			.find({
				toUserId: loggedInUserId,
				status: 'interested',
			})
			.populate('fromUserId', USER_SAVE_DATA);
		if (findAllRequest.length == 0) {
			throw new Error('no request pending');
		}
		return res.json({ findAllRequest });
	} catch (err) {
		return res.status(500).send(err.message);
	}
});
userRouter.get('/connections', userAuth, async (req, res) => {
	const { _id: loggedInUserId } = req.user;
	console.log(loggedInUserId, 'loggedInUserId');
	try {
		const connectionRequests = await connectionRequest
			.find({
				$or: [
					{
						fromUserId: loggedInUserId,
						status: 'accepted',
					},
					{
						toUserId: loggedInUserId,
						status: 'accepted',
					},
				],
			})
			.populate('fromUserId', USER_SAVE_DATA)
			.populate('toUserId', USER_SAVE_DATA);
		const filterConnectionRequests = connectionRequests.map((data) => {
			if (data.fromUserId._id.toString() === loggedInUserId.toString()) {
				return data.toUserId;
			}
			return data.fromUserId;
		});
		return res.json({ filterConnectionRequests });
	} catch (err) {
		return res.status(500).send(err.message);
	}
});
userRouter.get('/feed', userAuth, async (req, res) => {
	const loggedInUserId = req.user && req.user._id;
	let { page = 1, limit = 10 } = req.query;
	page = Math.max(parseInt(page, 10), 1);
	limit = Math.max(parseInt(limit, 10), 1);
	limit = limit > 50 ? 50 : limit;
	try {
		const connections = await connectionRequest
			.find({
				$or: [{ fromUserId: loggedInUserId }, { toUserId: loggedInUserId }],
			})
			.select('fromUserId toUserId');
		const hideUserFromFeed = new Set();
		connections.forEach((request) => {
			hideUserFromFeed.add(request.fromUserId.toString());
			hideUserFromFeed.add(request.toUserId.toString());
		});
		const filterForFeed = {
			$and: [
				{
					_id: {
						$nin: Array.from(hideUserFromFeed),
					},
				},
				{
					_id: {
						$ne: loggedInUserId,
					},
				},
			],
		};
		const feedTotalCount = await User.countDocuments(filterForFeed);
		const totalPages = Math.ceil(feedTotalCount / limit);
		const skip = (page - 1) * limit;
		const feed = await User.find(filterForFeed)
			.sort()
			.skip(skip)
			.limit(limit)
			.select(USER_SAVE_DATA);
		const pagination = {
			feedTotalCount,
			totalPages,
			page,
			limit,
			hasPrevPage: page > 1,
			hasNextPage: page < totalPages,
			prevPage: page > 1 ? page - 1 : null,
			nextPage: page < totalPages ? page + 1 : null,
		};

		res.json({
			pagination,
			data: feed,
		});
	} catch (err) {
		return res.status(500).send(err.message);
	}
});
module.exports = userRouter;
