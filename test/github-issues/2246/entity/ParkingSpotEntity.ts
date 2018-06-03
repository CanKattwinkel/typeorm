import {Column, Entity} from "../../../../src/index";
import {PrimaryGeneratedColumn} from "../../../../src";

@Entity()
export class ParkingSpotEntity {
    @PrimaryGeneratedColumn() id: number;
    @Column() position: string;
}
