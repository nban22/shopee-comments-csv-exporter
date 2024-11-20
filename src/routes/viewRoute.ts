import { Router } from "express";
import * as viewController from "../controllers/viewController";

const viewRouter = Router();

viewRouter.get('/', viewController.getHomePage);

export default viewRouter;