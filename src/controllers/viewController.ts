import { Request, Response } from "express"


export const getHomePage = async (req: Request, res: Response) => {
    res.render('home');
}