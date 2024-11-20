import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const extractShopAndItemId = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { url } = req.body;
        const urlPattern = /i\.(\d+)\.(\d+)/;
        const match = url.match(urlPattern);

        if (!match) {
            return next(new AppError(400, "Invalid URL format"));
        }

        const shopId = match[1];
        const itemId = match[2];

        req.body.shopId = shopId;
        req.body.itemId = itemId;

        next();
    }
);

export const crawlAndSaveComments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { shopId, itemId } = req.body;

    const url = `https://shopee.vn/api/v2/item/get_ratings?exclude_filter=1&filter=0&filter_size=0&flag=1&fold_filter=0&itemid=${itemId}&limit=50&offset=1&relevant_reviews=false&request_source=2&shopid=${shopId}&tag_filter=&type=0&variation_filters=`;

    const headers = {
        "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
    };

    const response = await fetch(url, { headers });
    if (!response.ok) {
        return next(new AppError(400, "Error fetching data from Shopee"));
    }

    const data = await response.json();
    if (data.error) {
        return next(new AppError(400, "Error in response data"));
    }

    const comments = extractComments(data);

    const fileId = uuidv4();
    const fileName = `comments-${fileId}.csv`;
    const filePath = path.join("tmp", fileName);



    saveCommentsToCSV(comments, filePath);

    res.status(200).json({
        status: "success",
        data: {
            fileUrl: `/api/v1/crawl/download/${fileId}`,
        },
    });
});

const extractComments = (data: any) => {
    return data.data.ratings.map((item: any) =>
        item.comment.split("\n").filter((line: string) => line.trim() !== "" && !line.includes(":"))
    );
};

const saveCommentsToCSV = (comments: string[], filePath: string) => {
    const csvContent = comments.map((item: string) => `"${item}"`).join("\n");
    fs.writeFileSync(filePath, csvContent);

    setTimeout(() => {
        fs.unlinkSync(filePath);
    }, 5 * 60 * 1000);
}

export const downloadCommentsFile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { fileId } = req.params;
    const fileName = `comments-${fileId}.csv`;
    const filePath = path.join("tmp", fileName);

    if (!fs.existsSync(filePath)) {
        return next(new AppError(404, "File not found"));
    }

    res.download(filePath, (err: any) => {
        if (err) {
            return next(err);
        }

        fs.unlinkSync(filePath);
    });
});
