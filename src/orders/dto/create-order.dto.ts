export class CreateOrderDto {
    driver: string;
    user: string;
    source_address: string;
    destination_address: string;
    oderTotal: number;

    source_location: {
        lat: number;
        long: number;
    };
    
    destination_location: {
        lat: number;
        long: number;
    };

}
