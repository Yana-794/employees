import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { employeeRouter } from "./employee.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/employees", employeeRouter);
