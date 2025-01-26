import type { StoreData } from "./core";

type AnyStoreData = Record<string, Record<string, any>>;

interface MigrationParams {
  toVersion: number;
  run: (data: AnyStoreData) => AnyStoreData;
}

export class Migration {
  toVersion: number;
  _run: (snapshot: AnyStoreData) => AnyStoreData;

  constructor(params: MigrationParams) {
    this.toVersion = params.toVersion;
    this._run = params.run;
  }

  run(snapshot: StoreData<AnyStoreData>): StoreData<AnyStoreData> {
    const nextData = this._run(snapshot.data);
    return {
      data: nextData,
      schemaVersion: this.toVersion,
    };
  }
}

export class Migrations<
  StoreDataType extends StoreData<AnyStoreData> = StoreData<any>
> {
  private migrations: Migration[];

  constructor(migrations: Migration[]) {
    this.migrations = migrations.sort((a, b) => a.toVersion - b.toVersion);
  }

  run(snapshot: StoreData<AnyStoreData>) {
    let current = {
      ...snapshot,
      schemaVersion: snapshot.schemaVersion ?? 0,
    };

    for (const migration of this.migrations) {
      if (current.schemaVersion < migration.toVersion) {
        current = migration.run(current);
      }
    }

    return current as unknown as StoreDataType;
  }
}
