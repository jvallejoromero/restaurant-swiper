interface Restaurant {
    name: string;
    description: string;
    distance: number;
    rating: number;
}
interface RestaurantDetails {
    name: string;
    description: string;
    menu_items: string;
    distance: number;
    rating: number;

    reviews: string[];

    background_path: string | null;
    restaurant_url: string | null;
    google_url: string | null;
}

