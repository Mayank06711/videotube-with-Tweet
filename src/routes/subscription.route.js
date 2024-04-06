import { Router } from 'express';
import {
    createChannel,
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/create/c/:user_Id").post(createChannel)
router
    .route("/c/:channel_Id")
    .get(getUserChannelSubscribers)

router.route("/toggle/c/:channel_Id").post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router