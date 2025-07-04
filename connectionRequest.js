const express = require('express');
const connectRequestRouter = express.Router();
const { userAuth } = require('../middleware/auth');
const validator = require('validator');
const ConnectionRequestModel = require('../models/connectionRequest');
const User = require('../models/user');
connectRequestRouter.post(
	'/send/:status/:userId',
	userAuth,
	async (req, res) => {
		const { _id: fromUserId } = req.user;
		const allowedStatus = ['ignore', 'interested'];
		try {
			const { userId: toUserId, status } = req.params;
			if (!validator.isMongoId(toUserId)) {
				throw new Error('enter user id properly');
			}

			const userExist = await User.findById(toUserId);
			console.log(userExist, 'userExist');
			if (!userExist) {
				throw new Error('cant find user');
			}
			if (!allowedStatus.includes(status)) {
				throw new Error('this request is not allowed');
			}
			const requestExist = await ConnectionRequestModel.find({
				$or: [
					{
						toUserId,
						fromUserId,
						status,
					},
					{
						toUserId: fromUserId,
						fromUserId: toUserId,
						status,
					},
				],
			});

			if (requestExist?.length > 0) {
				throw new Error('you have already send request to this user');
			}
			const newConnectionRequest = new ConnectionRequestModel({
				fromUserId,
				toUserId,
				status,
			});
			const response = await newConnectionRequest.save();
			res.json(response);
		} catch (err) {
			return res.status(500).send(err.message);
		}
	},
);
connectRequestRouter.post(
	'/review/:status/:userId',
	userAuth,
	async (req, res) => {
		const { _id: loggedInUserId } = req.user;
		const { status, userId: RequestedId } = req.params;
		const allowedStatus = ['accepted', 'rejected'];
		try {
			if (!validator.isMongoId(RequestedId)) {
				throw new Error('enter user id properly');
			}
			if (!allowedStatus.includes(status)) {
				throw new Error('this request is not allowed');
			}
			const isRequestAvaiable = await ConnectionRequestModel.findOne({
				_id: RequestedId,
				toUserId: loggedInUserId,
				status: 'interested',
			}).exec();
			console.log(isRequestAvaiable, 'isRequestAvaiable');
			if (!isRequestAvaiable) {
				throw new Error('there is no request for you');
			}
			const reviewIsRequestAvaiable =
				await ConnectionRequestModel.findByIdAndUpdate(isRequestAvaiable._id, {
					status,
				});
			res.json({
				reviewIsRequestAvaiable,
				status,
				RequestedId,
			});
		} catch (err) {
			return res.status(500).send(err.message);
		}
	},
);
module.exports = connectRequestRouter;
