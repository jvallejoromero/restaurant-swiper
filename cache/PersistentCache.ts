import * as FileSystem from "expo-file-system";

type Entry<T> = { id: string; data: T; savedAtMs: number };

export class PersistentCache<T> {
    private entries: Entry<T>[] = [];
    private loaded = false;
    private readonly filePath: string;

    private readonly sevenDaysMs = 1000 * 60 * 60 * 24 * 7;
    private readonly ttlMs: number;
    private readonly maxEntries: number;

    constructor(opts?: {
        fileName?: string;
        ttlMs?: number;
        maxEntries?: number;
    }) {
        this.ttlMs = opts?.ttlMs ?? this.sevenDaysMs;
        this.maxEntries = opts?.maxEntries ?? 300;
        const name = opts?.fileName ?? "persistent-cache-v1.json";
        this.filePath = (FileSystem.documentDirectory || "") + name;
    }

    private async init() {
        if (this.loaded) return;
        try {
            const info = await FileSystem.getInfoAsync(this.filePath);
            if (info.exists) {
                const raw = await FileSystem.readAsStringAsync(this.filePath);
                const parsed = JSON.parse(raw) as Entry<T>[];
                const now = Date.now();
                this.entries = (parsed ?? []).filter(e => now - e.savedAtMs <= this.ttlMs);
            }
        } catch {
            this.entries = [];
        } finally {
            this.loaded = true;
        }
    }

    private async persist() {
        const tmp = this.filePath + ".tmp";
        await FileSystem.writeAsStringAsync(tmp, JSON.stringify(this.entries));
        await FileSystem.moveAsync({ from: tmp, to: this.filePath });
    }

    async get(id: string): Promise<T | undefined> {
        await this.init();
        const now = Date.now();

        this.entries = this.entries.filter(e => now - e.savedAtMs <= this.ttlMs);

        const idx = this.entries.findIndex(e => e.id === id);
        if (idx === -1) return undefined;

        const [hit] = this.entries.splice(idx, 1);
        this.entries.unshift(hit);
        return hit.data;
    }

    async add(id: string, data: T): Promise<void> {
        await this.init();
        const now = Date.now();

        const idx = this.entries.findIndex(e => e.id === id);
        if (idx !== -1) this.entries.splice(idx, 1);

        this.entries.unshift({ id, data, savedAtMs: now });
        this.entries = this.entries.slice(0, this.maxEntries);

        await this.persist();
    }

    async clear(): Promise<void> {
        await this.init();
        this.entries = [];
        await this.persist();
    }
}
