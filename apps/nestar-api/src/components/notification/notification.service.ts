import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { PropertyService } from "../property/property.service";

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel("Notification")
    private readonly notificationModel: Model<Notification>,
    private readonly propertyService: PropertyService,
  ) {}
}
