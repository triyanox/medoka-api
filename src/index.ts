import express, { NextFunction, Request, Response } from "express";
import routes from "./routes/routes";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "process";
import { production } from "./config/production";

const app = express();

// compression / securing the app from known vulnerabilities
if (env.NODE_ENV === "production") {
  production(app);
}

// middleware
app.use(
  cors({
    origin: env.NODE_ENV === "production" ? env.FRONTEND_URL : "*",
  })
);
app.use(function (req: Request, res: Response, next: NextFunction) {
  res.header(
    "Access-Control-Allow-Origin",
    env.NODE_ENV === "production" ? env.FRONTEND_URL : req.headers.origin
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// routes
app.use(routes);

// server
app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port", process.env.PORT || 5000);
});
