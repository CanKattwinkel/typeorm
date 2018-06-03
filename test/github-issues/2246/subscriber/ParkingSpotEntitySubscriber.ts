import {EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent} from "../../../../src/index";
import {ParkingSpotEntity} from "../entity/ParkingSpotEntity";


// Yeah I'll use this poor approve since I really don't know how to provide a spy for this subscriber
// or even how to get a hold of the instance.

export let issue2246LastInsertedEntity: ParkingSpotEntity;
export let issue2246LastUpdatedEntity: ParkingSpotEntity;

@EventSubscriber()
export class ParkingSpotEntitySubscriber implements EntitySubscriberInterface<ParkingSpotEntity> {


    listenTo() {
        return ParkingSpotEntity;
    }

    async beforeInsert(event: InsertEvent<ParkingSpotEntity>) {
        // assign to a value that is accessible in test
        issue2246LastInsertedEntity = event.entity;
    }

    async beforeUpdate(event: UpdateEvent<ParkingSpotEntity>) {
        // assign to a value that is accessible in test
        issue2246LastUpdatedEntity = event.entity;

        // You probably could test here too but this feels too weird
        // expect(issue2246LastUpdatedEntity).not.to.be.empty;
        // issue2246LastUpdatedEntity!.should.be.eql({
        //     id: 1,
        //     position: "Street 2"
        // });
    }
}
