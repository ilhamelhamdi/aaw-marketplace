import { Request, Response, NextFunction } from "express";
import { UnauthenticatedResponse } from "../commons/patterns/exceptions";
import { User } from "@src/types/user";


const verifyAdminTokenService = async (token: string) => {
  const response = await fetch(`${process.env.AUTH_MS_URL}/api/verify-admin-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  return response;
}


const getTenantService = async (tenantId: string, token: string) => {
  const response = await fetch(`${process.env.TENANT_MS_URL}/api/tenant/${tenantId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response;
};


export const verifyJWTProduct = async (
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

    const verifiedPayload = await payload.json() as {
      user: User;
    }

    const SERVER_TENANT_ID = process.env.TENANT_ID;
    if (!SERVER_TENANT_ID) {
      return res.status(500).send({ message: "Server Tenant ID not found" });
    }
    const tenantPayload = await getTenantService(SERVER_TENANT_ID, token);

    if (tenantPayload.status !== 200) {
      return res.status(500).send({ message: "Server Tenant not found" });
    }

    const verifiedTenantPayload = await tenantPayload.json() as {
      tenants: {
        id: string;
        owner_id: string;
      };
      tenantDetails: {
        id: string;
        tenant_id: string;
        name: string;
      };
    };

    // Check for tenant ownership
    if (verifiedPayload.user.id !== verifiedTenantPayload.tenants.owner_id) {
      return res.status(401).send({ message: "Invalid token" });
    }

    req.body.user = verifiedPayload.user;
    next();
  } catch (error) {
    return res.status(401).json(
      new UnauthenticatedResponse("Invalid token").generate()
    );
  }
};
