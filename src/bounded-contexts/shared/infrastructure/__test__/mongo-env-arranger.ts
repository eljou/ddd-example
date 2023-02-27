import tsValidMongoDb from 'ts-valid-mongodb'

import { EnvironmentArranger } from './arranger'

export class MongoEnvironmentArranger extends EnvironmentArranger {
  constructor(private _client: typeof tsValidMongoDb) {
    super()
  }

  public async arrange(): Promise<void> {
    await this.cleanDatabase()
  }

  protected async cleanDatabase(): Promise<void> {
    const client = this._client
    const collections = await this.collections()

    for (const colName of collections) {
      await client.getDb().collection(colName).deleteMany({})
    }
  }

  private async collections(): Promise<string[]> {
    const client = this._client
    const collections = await client.getDb().listCollections(undefined, { nameOnly: true }).toArray()

    return collections.map(collection => collection.name)
  }

  public async close(): Promise<void> {
    return this._client.disconnect()
  }
}
