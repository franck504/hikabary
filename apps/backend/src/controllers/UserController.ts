import { Request, Response } from "express";
import { userService } from "../services/UserService";

export class UserController {
  private isDockerHopIp(ip: string) {
    return /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(ip);
  }

  private getClientIp(req: Request) {
    const forwarded = req.headers["x-forwarded-for"];
    const forwardedIp = Array.isArray(forwarded)
      ? forwarded[0]
      : typeof forwarded === "string"
        ? forwarded.split(",")[0]?.trim()
        : "";
    const realIp = typeof req.headers["x-real-ip"] === "string" ? req.headers["x-real-ip"] : "";
    return forwardedIp || realIp || req.ip || req.socket.remoteAddress || "unknown";
  }
  
  register = async (req: Request, res: Response) => {
    try {
      const result = await userService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { phone, password } = req.body;
      const ip = this.getClientIp(req);
      const ipType = this.isDockerHopIp(ip) ? "INTERNAL_DOCKER_HOP" : "CLIENT_DEVICE";
      const host = req.headers.host || "-";
      const ua = req.headers["user-agent"] || "-";
      console.log(`\n[BACKEND][AUTH] login attempt phone=${phone} CLIENT_IP=${ip} CLIENT_TYPE=${ipType} SERVER_HOST=${host} ua=${ua}`);

      const result = await userService.login(phone, password);
      
      console.log(`[BACKEND][AUTH] login success phone=${phone} CLIENT_IP=${ip} CLIENT_TYPE=${ipType} SERVER_HOST=${host}`);
      res.json(result);
    } catch (error: any) {
      const ip = this.getClientIp(req);
      const ipType = this.isDockerHopIp(ip) ? "INTERNAL_DOCKER_HOP" : "CLIENT_DEVICE";
      const host = req.headers.host || "-";
      console.error(`[BACKEND][AUTH] login failed phone=${req.body?.phone || "-"} CLIENT_IP=${ip} CLIENT_TYPE=${ipType} SERVER_HOST=${host} error=${error.message}`);
      res.status(401).json({ error: error.message });
    }
  };

  getAllByRole = async (req: Request, res: Response) => {
    try {
      const users = await userService.getUsersByRole(req.params.role);
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  getProfileById = async (req: Request, res: Response) => {
    try {
      const profile = await userService.getProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Tsy hita ity mpikambana ity." });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  updateMyProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Tsy nahitana mpampiasa. Midira aloha." });
      }
      const user = await userService.updateMyProfile(userId, req.body || {});
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}

export const userController = new UserController();
