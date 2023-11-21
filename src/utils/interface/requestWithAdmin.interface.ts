import { Request } from "express";
import { AdminDocument } from "../../admin/schema/admin.schema";

export default interface RequestWithAdmin extends Request {
    user: AdminDocument
}