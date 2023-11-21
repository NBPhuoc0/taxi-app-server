import { Request } from "express";
import { DriverDocument } from "../../drivers/schemas/driver.schema";

export default interface RequestWithDriver extends Request {
    user: DriverDocument
}