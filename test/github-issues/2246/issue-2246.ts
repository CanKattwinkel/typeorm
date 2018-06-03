import "reflect-metadata";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {expect} from "chai";
import {ParkingSpotEntity} from "./entity/ParkingSpotEntity";
import {issue2246LastInsertedEntity, issue2246LastUpdatedEntity} from "./subscriber/ParkingSpotEntitySubscriber";

describe("github issues > #2246 EntitySubscriber methods have empty entity", () => {
    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        subscribers: [__dirname + "/subscriber/*{.js,.ts}"],
        schemaCreate: true,
        dropSchema: true
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));


    it("should call beforeUpdate with defined event.entity ", () => Promise.all(connections.map(async connection => {
        const entity = new ParkingSpotEntity();
        entity.position = "Street 1";
        await connection.manager.save(entity);


        await connection.getRepository(ParkingSpotEntity).update(entity.id, {position: "Street 2"});
        const parkingSpot = await connection.manager.findOne(ParkingSpotEntity, 1);

        // Test that the update is really executed
        expect(parkingSpot).not.to.be.empty;
        parkingSpot!.should.be.eql({
            id: 1,
            position: "Street 2"
        });


        // This only verifies that my testing method works (since i don't have a spy a global variable is used)
        expect(issue2246LastInsertedEntity).not.to.be.empty;
        issue2246LastInsertedEntity!.should.be.eql({
            id: 1,
            position: "Street 1"
        });



        // This actually shows the current bug since this value is undefined. The
        // 'beforeUpdate' method is called but the provided 'event.entity' is undefined
        expect(issue2246LastUpdatedEntity).not.to.be.empty;
        issue2246LastUpdatedEntity!.should.be.eql({
            id: 1,
            position: "Street 2"
        });




    })));

});
