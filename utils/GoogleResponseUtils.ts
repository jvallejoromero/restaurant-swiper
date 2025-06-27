
export const getStarsFromRating = (rating: number): string => {
    const roundedRating = Math.round(rating);

    let stars = '';
    for (let i = 0; i < 5; i++) {
        if (i < roundedRating) {
            stars += '⭐️';
        } else {
            stars += '';
        }
    }
    return stars;
};

export const getDollarsFromPriceLevel = (price: number): string => {
    let dollars = '';
    for (let i = 0; i < price; i++) {
        dollars += '💵';
    }
    return dollars;
}

export const getStringPriceLevel = (level: number): string => {
    switch (level) {
        case 1:
            return 'Cheap';
        case 2:
            return 'Moderately Priced';
        case 3:
            return 'Expensive';
        case 4:
            return 'Very Expensive';
        default:
            return 'Unknown';
    }
}