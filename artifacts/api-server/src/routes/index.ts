import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import compareRouter from "./compare.js";
import serpapiRouter from "./serpapi.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(compareRouter);
router.use(serpapiRouter);

export default router;
