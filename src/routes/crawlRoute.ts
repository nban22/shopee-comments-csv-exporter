import { Router } from "express";

import * as crawlController from "../controllers/crawlController";

const crawlRoute = Router();

crawlRoute.post("/", crawlController.extractShopAndItemId, crawlController.crawlAndSaveComments);
crawlRoute.get("/download/:fileId", crawlController.downloadCommentsFile);

export default crawlRoute;
