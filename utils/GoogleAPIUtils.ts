export const sanitizePlace = (p: any): Record<string, any> => {
    return Object.fromEntries(
        Object.entries(p).filter(([_, v]) => v !== undefined)
    );
}