import "reflect-metadata";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src/connection/Connection";
import {Column, Entity, PrimaryGeneratedColumn} from "../../../src";
import {expect} from "chai";

@Entity({name: "Prices"})
export class PriceEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    timestamp: Date;

    @Column("numeric", {nullable: false, precision: 20, scale: 8})
    price: string;

    @Column("integer")
    base: number;

    @Column("integer")
    quote: number;

}

describe("github issues > #6511 QueryFailedError on 'where (x,y,z) in' select query", () => {

    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        entities: [PriceEntity],
        schemaCreate: true,
        dropSchema: true,
        enabledDrivers: ["postgres"]
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    after(() => closeTestingConnections(connections));

    it("should return results for a multi-field select-in query", () => Promise.all(connections.map(async connection => {
        const repo = connection.getRepository(PriceEntity);
        const prices: Partial<PriceEntity>[] = [
            {
                "timestamp": new Date("2016-04-13 04:00:00.000000"),
                "price": "7.14850000",
                "base": 257,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 05:00:00.000000"),
                "price": "7.26500000",
                "base": 257,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 06:00:00.000000"),
                "price": "7.26950000",
                "base": 257,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 07:00:00.000000"),
                "price": "7.33700000",
                "base": 257,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 08:00:00.000000"),
                "price": "7.34875000",
                "base": 257,
                "quote": 2095
            }, {
                "timestamp": new Date("2016-04-13 04:00:00.000000"),
                "price": "7.14850000",
                "base": 1,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 05:00:00.000000"),
                "price": "7.26500000",
                "base": 1,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 06:00:00.000000"),
                "price": "7.26950000",
                "base": 1,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 07:00:00.000000"),
                "price": "7.33700000",
                "base": 1,
                "quote": 2095
            },
            {
                "timestamp": new Date("2016-04-13 08:00:00.000000"),
                "price": "7.34875000",
                "base": 1,
                "quote": 2095
            }
        ];

        await repo.save(prices);

        const query = repo
            .createQueryBuilder("p")
            .where("(p.base, p.quote, p.timestamp)  IN (:...params)", {
                params: [
                    [1, 2095, new Date("2016-04-13 04:00:00.000000").toJSON()],
                    [257, 2095, new Date("2016-04-13 05:00:00.000000").toJSON()],
                    [1, 2095, new Date("2016-04-13 06:00:00.000000").toJSON()],
                ]
            })
            .select([
                "p.base",
                "p.quote",
                "p.price",
                "p.timestamp",
            ]);


        // let sql = query.getSql();
        // expect(sql).eq('SELECT "p"."timestamp" AS "p_timestamp", "p"."price" AS "p_price", "p"."base" AS "p_base", "p"."quote" AS "p_quote" FROM "Prices" "p" WHERE ("p"."base", "p"."quote", "p"."timestamp")  IN ($1, $2, $3)');
        // 1: The query itself looks good, if I fill in the values and run this locally, it works.
        //    SELECT "p"."timestamp" AS "p_timestamp", "p"."price" AS "p_price", "p"."base" AS "p_base", "p"."quote" AS "p_quote" FROM "Prices" "p" WHERE ("p"."base", "p"."quote", "p"."timestamp")  IN ((1, 2095, '2016-04-13T02:00:00.000Z'), (257, 2095, '2016-04-13T03:00:00.000Z'), (1, 2095, '2016-04-13T04:00:00.000Z'))
        //    returns:  SELECT "p"."timestamp" AS "p_timestamp", "p"."price" AS "p_price", "p"."base" AS "p_base", "p"."quote" AS "p_quote" FROM "Prices" "p" WHERE ("p"."base", "p"."quote", "p"."timestamp")  IN ((1, 2095, '2016-04-13T02:00:00.000Z'), (257, 2095, '2016-04-13T03:00:00.000Z'), (1, 2095, '2016-04-13T04:00:00.000Z')) [2020-08-04 20:01:01] 3 rows retrieved starting from 1 in 5 s 887 ms (execution: 5 s 830 ms, fetching: 57 ms)

        const result = await query
            .getMany();

        expect(result.length).eq(3);
        // 2. But this actually errors with: QueryFailedError: input of anonymous composite types is not implemented

    })));

});
