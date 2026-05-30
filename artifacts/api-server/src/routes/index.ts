import { Router, type IRouter } from "express";
import healthRouter from "./health";
import iapRouter from "./iap";
import liveKitRouter from "./livekit";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(iapRouter);
router.use(liveKitRouter);
router.use(stripeRouter);

export default router;
