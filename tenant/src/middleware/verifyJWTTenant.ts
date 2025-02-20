import { Request, Response, NextFunction } from "express";
import { UnauthenticatedResponse } from "../commons/patterns/exceptions";
import { User } from "@src/types/user";


const verifyAdminTokenService = async (token: string) => {
  const response = await fetch(`${process.env.AUTH_MS_URL}/api/verify-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  return response;
}

export const verifyJWTTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).send({ message: "Invalid token" });
    }

    const payload = await verifyAdminTokenService(token);

    if (payload.status !== 200) {
      return res.status(401).send({ message: "Invalid token" });
    }

    const verifiedPayload = (await payload.json()) as { user: User; }

    req.body.user = verifiedPayload.user;
    next();
  } catch (error) {
    return res.status(401).json(
      new UnauthenticatedResponse("Invalid token").generate()
    );
  }
};
