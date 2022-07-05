import { Router } from "express";
import ManagerController from "../controllers/manger.controller";
import PharmacyController from "../controllers/pharmacy.controller";
import AuthController from "../controllers/auth.controller";
import LogoutController from "../controllers/logout.controller";

const api = Router()
  .use(ManagerController)
  .use(PharmacyController)
  .use(AuthController)
  .use(LogoutController);

export default Router().use("/api", api);
