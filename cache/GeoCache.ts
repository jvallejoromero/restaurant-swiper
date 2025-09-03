import {haversine, haversineMeters} from "@/utils/LocationUtils";
import * as FileSystem from "expo-file-system";

type GeoCacheEntry<T> = {
    center: { lat: number; lng: number };
    data: T;
    savedAtMs: number;
};

export class GeoCache<T> {
    private entries: GeoCacheEntry<T>[] = [];
    private loaded = false;

    private readonly filePath: string;

    private readonly sevenDaysMs = 1000 * 60 * 60 * 24 * 7;
    private readonly ttlMs: number;
    private readonly thresholdMeters: number;
    private readonly maxEntries: number;
    private readonly mergeMeters: number;

    constructor(opts?: {
        fileName?: string;
        ttlMs?: number;
        thresholdMeters?: number;
        maxEntries?: number;
        mergeMeters?: number;
    }) {
        this.ttlMs = opts?.ttlMs ?? this.sevenDaysMs;
        this.thresholdMeters = opts?.thresholdMeters ?? 2000;
        this.maxEntries = opts?.maxEntries ?? 100;
        this.mergeMeters = opts?.mergeMeters ?? 100;
        const name = opts?.fileName ?? "geo-cache-v1.json";
        this.filePath = (FileSystem.documentDirectory || "") + name;
    }

    private async init() {
        if (this.loaded) return;
        try {
            const info = await FileSystem.getInfoAsync(this.filePath);
            if (info.exists) {
                const raw = await FileSystem.readAsStringAsync(this.filePath);
                const parsed = JSON.parse(raw) as GeoCacheEntry<T>[];
                const now = Date.now();
                this.entries = (parsed ?? []).filter(
                    e => now - e.savedAtMs <= this.ttlMs
                );
            }
        } catch {
            this.entries = [];
        } finally {
            this.loaded = true;
        }
    }

    private async persist() {
        const tmp = this.filePath + ".tmp";
        const payload = JSON.stringify(this.entries);
        await FileSystem.writeAsStringAsync(tmp, payload);
        await FileSystem.moveAsync({ from: tmp, to: this.filePath });
    }

    async get(lat: number, lng: number): Promise<T | undefined> {
        await this.init();
        const now = Date.now();
        this.entries = this.entries.filter(e => now - e.savedAtMs <= this.ttlMs);

        if (this.entries.length === 0) return undefined;

        let best: GeoCacheEntry<T> | undefined;
        let bestDist = Infinity;
        for (const e of this.entries) {
            const d = haversineMeters(lat, lng, e.center.lat, e.center.lng);
            if (d < bestDist) { bestDist = d; best = e; }
        }
        return bestDist <= this.thresholdMeters ? best!.data : undefined;
    }

    async add(lat: number, lng: number, data: T): Promise<void> {
        await this.init();
        const now = Date.now();

        let merged = false;
        for (let i = 0; i < this.entries.length; i++) {
            const e = this.entries[i];
            const d = haversineMeters(lat, lng, e.center.lat, e.center.lng);
            if (d <= this.mergeMeters) {
                this.entries[i] = { center: e.center, data, savedAtMs: now };
                merged = true;
                break;
            }
        }

        if (!merged) {
            this.entries.unshift({ center: { lat, lng }, data, savedAtMs: now });
        }

        this.entries = this.entries
            .filter(e => now - e.savedAtMs <= this.ttlMs)
            .slice(0, this.maxEntries);

        await this.persist();
    }

    async clear(): Promise<void> {
        await this.init();
        this.entries = [];
        await this.persist();
    }
}